import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTimeline } from '../../scripts/build-donki-timeline';
import { daysBetween, donkiUrl } from '../../scripts/fetch-donki';

describe('DONKI snapshot (Phase 3)', () => {
  it('every snapshot file has fetchedAt, source and data', () => {
    for (const t of ['FLR', 'SEP', 'CME', 'CMEAnalysis', 'WSAEnlilSimulations', 'notifications']) {
      const f = JSON.parse(readFileSync(`data/donki/${t}_2024-05-01_2024-05-31.json`, 'utf8'));
      expect(f.fetchedAt).toMatch(/^\d{4}-\d\d-\d\dT/);
      expect(f.source).toBe(donkiUrl(t, '2024-05-01', '2024-05-31'));
      expect(Array.isArray(f.data)).toBe(true);
    }
  });
  it('windows are counted inclusively (≤ 60 days per request)', () => {
    expect(daysBetween('2024-05-01', '2024-05-31')).toBe(31);
    expect(daysBetween('2024-05-01', '2024-06-29')).toBe(60);
  });
  it('regenerating the M3 timeline gives the committed file (no drift)', () => {
    const committed = JSON.parse(readFileSync('src/content/donki/m3-may2024.json', 'utf8'));
    expect(buildTimeline()).toEqual(committed);
  });
  it('beat strengths come from the records (spec §5)', () => {
    const t = buildTimeline();
    expect(t.beats.map((b) => b.S)).toEqual([3, 3, 2]); // X3.9 → 3 · 1263 km/s ENLIL hit → 2+1 · SEP after M6.6 → 2
    expect(t.beats[1]!.warningSols).toBe(2);
  });
});
