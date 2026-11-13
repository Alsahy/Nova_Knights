import { describe, expect, it } from 'vitest';
import { CONTENT, MVP_EVENTS, UNPARSED } from '../../src/content';
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
