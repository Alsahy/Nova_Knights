/**
 * Missions (spec §8.2 + D-018 kid scope + D-019 jobs).
 * D-018: about 10 easy surprises only; M1 uses 8 of them, M3 adds the 2 real storm beats.
 * M3's beats come from the real DONKI May 2024 snapshot (scripts/build-donki-timeline.ts, D-009).
 */
import timeline from './donki/m3-may2024.json';
import type { Mission, MissionId, Role } from '../engine/types';

export const M3_TIMELINE = timeline;

/** D-018: the kid scope. */
export const KID_EVENTS_CALM = [
  'FD-01',
  'PW-02',
  'PW-03',
  'PW-08',
  'LS-03',
  'LS-05',
  'RS-01',
  'RS-04',
];
export const KID_EVENTS_STORM = [...KID_EVENTS_CALM, 'SW-01', 'SW-02'];

/** D-019: 4 jobs per astronaut, all their own. 'A|B' = A when possible, else B. */
export const KID_JOBS: Record<Role, string[]> = {
  MGR: ['T-REST', 'T-PEP', 'T-GARDEN', 'T-SEND'],
  ENG: ['T-REST', 'T-MAINT-LS', 'T-PANELS', 'T-SHIELD'],
  MED: ['T-REST', 'T-TREAT|T-MED', 'T-GARDEN', 'T-LAB'],
  RES: ['T-REST', 'T-LAB', 'T-EVA-SCI', 'T-GARDEN'],
};

export const MISSIONS: Partial<Record<MissionId, Mission>> = {
  M1: {
    id: 'M1',
    name: 'First Steps',
    site: 'Gale Crater',
    goal: {},
    events: KID_EVENTS_CALM,
    setup: ['FD-01'],
    jobs: KID_JOBS,
    missionEvents: ['PW-03'],
    scripted: [],
    donki: 'quiet', // spec §8.2: DONKI forced quiet (calm Sun)
    specialRules: ['tips'],
  },
  M3: {
    id: 'M3',
    name: 'Storm from the Sun',
    site: 'Gale Crater',
    goal: { maxDose: 6 }, // D-010
    events: KID_EVENTS_STORM,
    setup: ['FD-01'],
    jobs: KID_JOBS,
    missionEvents: ['PW-03'],
    scripted: timeline.beats.map((b) => ({
      sol: b.sol,
      event: b.eventId,
      severity: b.S,
      donki: {
        type: b.recordType,
        id: b.recordId,
        date: b.realDate,
        label: b.label,
        sourceUrl: b.sourceUrl,
        fetchedAt: timeline.fetchedAt,
      },
    })),
    donki: 'scripted',
    specialRules: ['stormReplay'],
  },
};
