import { describe, expect, it } from 'vitest';
import { CONTENT, MVP_EVENTS } from '../../src/content';
import { buildContentData, UNPARSED } from '../../src/content/build';
import { readFileSync } from 'node:fs';
import { CONTENT_PATH, renderContent } from '../../scripts/build-content';
buildContentData();
import type { ActionDef } from '../../src/engine/types';

const hasCost = (a: ActionDef): boolean =>
  a.costNow.length > 0 ||
  a.later.some(
    (d) =>
      d.chance !== undefined ||
      d.effects.some(
        (e) =>
          ('delta' in e && e.delta < 0) ||
          e.kind === 'trigger' ||
          e.kind === 'lost' ||
          e.kind === 'hook',
      ),
  );

describe('content build', () => {
  it('builds all 60 events and the MVP tasks', () => {
    expect(Object.keys(CONTENT.events)).toHaveLength(60);
    for (const t of ['T-REST', 'T-LAB', 'T-SEND', 'T-EVA-SCI', 'T-MAINT-LS', 'T-TREAT', 'T-KIT'])
      expect(CONTENT.tasks[t]).toBeDefined();
  });
  it('every MVP card and task is fully parsed (no prose left)', () => {
    const mvp = new Set<string>(MVP_EVENTS);
    expect(UNPARSED.filter((u) => mvp.has(u.id.slice(0, 5)) || u.id.startsWith('T-'))).toEqual([]);
  });
  it('no free lunch: every MVP card has a cost now, a later cost, a risk or a lost chance', () => {
    for (const id of MVP_EVENTS)
      for (const a of CONTENT.events[id]!.actions) {
        if (id === 'SW-07' && a.letter === 'c') continue; // cost is the later DOSE+1 (checked below)
        expect(hasCost(a), a.id).toBe(true);
      }
    expect(CONTENT.events['SW-07']!.actions[2]!.later[0]!.effects[0]).toMatchObject({
      stat: 'DOSE',
      delta: 1,
    });
  });
  it('every MVP event keeps its [S#] sources', () => {
    for (const id of MVP_EVENTS)
      expect(CONTENT.events[id]!.realScience.sources.length, id).toBeGreaterThan(0);
  });
  it('Cadet sees 2 ★ cards per MVP event', () => {
    for (const id of MVP_EVENTS)
      expect(CONTENT.events[id]!.actions.filter((a) => a.cadet).length, id).toBe(2);
  });
});

import { checkContent } from '../../src/content/check';
import { STORIES } from '../../src/content/stories';
import { GLOSSARY, markTerms } from '../../src/content/glossary';
import { SOURCES } from '../../src/content/sources';
import { M3_TIMELINE } from '../../src/content/missions';

describe('Phase 3 content checks', () => {
  it('check-content has no errors', () => {
    expect(checkContent().errors).toEqual([]);
  });
  it('every event has a kid True story from the guide, with sources', () => {
    for (const id of Object.keys(CONTENT.events)) {
      expect(STORIES[id], id).toBeDefined();
      expect(STORIES[id]!.sources.length, id).toBeGreaterThan(0);
    }
  });
  it('the glossary has the guide words and marks terms in kid text', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(20);
    const parts = markTerms('A bright solar flare! The CME reaches Mars in 2 sols.');
    expect(
      parts.filter((p) => typeof p !== 'string').map((p) => (p as { word: string }).word),
    ).toEqual(['Solar flare', 'Sun cloud (CME)', 'Sol']);
  });
  it('every source used by a Must event was audited', () => {
    const must = new Set(MVP_EVENTS.flatMap((id) => CONTENT.events[id]!.realScience.sources));
    for (const s of SOURCES.filter((x) => must.has(x.id)))
      expect(s.audit, s.id).not.toBe('not-audited');
  });
  it('M3 beats are real DONKI records with real dates and honest labels (D-009)', () => {
    expect(M3_TIMELINE.beats.map((b) => [b.sol, b.eventId])).toEqual([
      [2, 'SW-01'],
      [6, 'SW-02'],
    ]);
    for (const b of M3_TIMELINE.beats) {
      expect(b.recordId).toMatch(/FLR|SEP/);
      expect(b.realDate).toMatch(/^2024-05-\d\d$/);
      expect(b.sourceUrl).toMatch(/^https:\/\/ccmc\.gsfc\.nasa\.gov\/DONKI\//);
    }
    expect(M3_TIMELINE.beats[0]!.label).toContain('seen from Earth');
    expect(M3_TIMELINE.beats[1]!.label).toContain('measured near Earth');
    expect(M3_TIMELINE.modelRun.label).toContain("NASA's model predicted");
  });
});

describe('generated content.json', () => {
  it('is up to date with the spec + overrides (run `npm run spec:extract`)', () => {
    expect(readFileSync(CONTENT_PATH, 'utf8')).toBe(renderContent());
  });
});
