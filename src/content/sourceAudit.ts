/**
 * Source audit (Phase 3, 13 Nov 2026): every source used by the 37 Must events + the honesty table.
 * Method: fetched each URL and checked that the page contains the exact figures the game quotes.
 * ok = verified · problem = needs a fix (logged as proposal P-008) · unverified = the site blocks automated checks.
 * Swaps are NOT applied here: they wait for the lead's approval (CLAUDE.md §8).
 */
export type AuditStatus = 'ok' | 'problem' | 'unverified';
export interface Audit {
  status: AuditStatus;
  note?: string;
}

const OK = (note?: string): Audit => (note ? { status: 'ok', note } : { status: 'ok' });

export const AUDIT_DATE = '2026-11-13';

export const SOURCE_AUDIT: Record<string, Audit> = {
  S1: OK(),
  S2: {
    status: 'problem',
    note: 'kauai.ccmc host unreachable. Proposed: cite the DONKI record used in M3 (WSA-ENLIL/30726/1, Mars arrival 2024-05-13) (P-008).',
  },
  S3: OK('X-class, each letter 10×'),
  S4: OK('minutes / days travel times'),
  S5: OK('seven CMEs; strongest storm to reach Earth in two decades'),
  S6: {
    status: 'problem',
    note: 'EurekAlert re-post blocks checks. NASA JPL original has the same figures ("8,100 micrograys — equivalent to 30 chest X-rays"): jpl.nasa.gov/news/nasa-watches-mars-light-up-during-epic-solar-storm (P-008).',
  },
  S7: OK('1 sol = 24 h 39 min'),
  S8: OK('.64 mSv/day surface; 1.8 cruise; 0.66 Sv round trip'),
  S9: OK('600 mSv career; 250 mSv per event (NASA PDF)'),
  S10: OK('stowage-bag shelter'),
  S11: OK('shelter within 30 minutes'),
  S12: OK('HERA sensors; crew dosimeters'),
  S13: OK('586 vs 1361 W/m²; −89 to −31 °C (Viking 1)'),
  S15: OK('21 Wh, tau 10.8, −97 %'),
  S16: {
    status: 'problem',
    note: 'Page no longer shows the 468 Wh figure. Find the JPL original for the June 2018 power numbers (P-008).',
  },
  S17: OK('25 % sunlight; ~210 → ~240 Wh; ~180 needed'),
  S20: OK('3,035 kcal/day; 2.5 L/day (NASA PDF)'),
  S21: OK('O₂ 0.84 kg, CO₂ 1.0 kg per person per day'),
  S22: OK('2.8–4.5 mmHg headaches; keep under 3 mmHg'),
  S23: {
    status: 'problem',
    note: 'URL now lands on the Apollo journals index, not the CO₂ adapter story. LS-02 can cite S24 (NASA SP-350) until the right AFJ page is found (P-008).',
  },
  S24: OK('"A Square Peg in a Round Hole"'),
  S25: {
    status: 'problem',
    note: 'appel.nasa.gov/?p=279500 now redirects to the APPEL home page. Find a NASA page on oxygen candles / the 1997 Mir fire (P-008).',
  },
  S26: { status: 'unverified', note: 'Site blocks automated checks; check in a browser.' },
  S27: OK('93–94 % → 98 % with the Brine Processor'),
  S28: OK('electrolysis'),
  S29: OK('Soyuz MS-22 coolant leak'),
  S33: OK('lettuce, 33 days'),
  S34: OK('peppers, 137 days'),
  S35: OK('tacos, 12 peppers returned, fans + hand pollination, radishes'),
  S38: OK('perchlorate 0.5–1 %'),
  S39: OK('1–1.5 % bone per month; ~2 h exercise a day; ~70 % eye changes'),
  S40: OK('OSDR dataset: mice, 33 days, myostatin'),
  S41: OK('most changes returned to normal within months'),
  S42: {
    status: 'unverified',
    note: 'EurekAlert blocks automated checks; check in a browser or cite the Lancet Neurology paper directly.',
  },
  S43: OK('378 days'),
  S44: OK('delays up to 22 minutes; limited resources'),
  S45: OK('simulated spacewalks, robots, maintenance, exercise, crops'),
  S46: OK('Parmitano, EVA 23'),
  S47: OK('1–1.5 L; 6.5 h'),
  S48: OK('lunar hay fever'),
  S54: OK('3–21 min one way (text says 3–22 from S44: N-05)'),
  S55: { status: 'unverified', note: 'Site blocks automated checks; check in a browser.' },
  S56: OK('launch window every 26 months (news site, not NASA primary)'),
};
