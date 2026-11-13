/**
 * Debrief (spec §1.1 rule 10, §2.5): the 3 biggest choices → what they caused → what real NASA does.
 * Score = |Δ key resources| + 3 per chain caused + 5 if linked to the ending cause (PLAN Phase 2).
 */
import type { ChoiceRecord, Content, Debrief, GameState } from './types';

const CAUSE_KEYS: Record<string, string[]> = {
  'end.lsZero': ['LS'],
  'end.noPower': ['BAT', 'PWR', 'LS'],
  'end.sickBay': ['EN', 'FUL', 'HYD', 'AIR'],
  'end.highDose': ['DOSE'],
  'end.lowScience': ['SP', 'SPbanked'],
  'end.success': ['SP', 'SPbanked'],
};

export function linkedToEnding(c: ChoiceRecord, reason: string): boolean {
  const keys = CAUSE_KEYS[reason] ?? [];
  return keys.some((k) => (c.deltas[k] ?? 0) !== 0);
}

export function debrief(s: GameState, content: Content): Debrief | null {
  if (!s.ending) return null;
  const reason = s.ending.reason;
  const scored = s.choices
    .filter((c) => !c.actionId.endsWith('.wait'))
    .map((c) => ({ c, score: c.score + (linkedToEnding(c, reason) ? 5 : 0) }))
    .sort((a, b) => b.score - a.score || a.c.sol - b.c.sol)
    .slice(0, 3);
  return {
    ending: s.ending,
    top3: scored.map(({ c }) => {
      const ev = content.events[c.eventId]!;
      const act = ev.actions.find((x) => x.id === c.actionId);
      return {
        choice: c,
        eventTitle: ev.title,
        actionTitle: act?.title ?? c.actionId,
        lesson: act?.lesson ?? '',
        nasa: ev.realScience.text,
        sources: ev.realScience.sources,
      };
    }),
    stats: {
      spBanked: s.sp.banked,
      spPending: s.sp.pending,
      spGoal: s.sp.goal,
      dose: s.crew.DOSE,
      sols: s.sol,
    },
  };
}
