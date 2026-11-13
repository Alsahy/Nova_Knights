/**
 * Missions (spec §8.2/§8.4). The kid game is ONE mission (D-021): M3 Storm from the Sun.
 * D-026: 14 easy challenges, one every day, no planting choice; real NASA DONKI beats on sols 2, 4 (→ 6) and 8.
 * D-027: the day's surprise comes first; D-028: 3 jobs per astronaut.
 */
import timeline from './donki/m3-may2024.json';
import type { Mission, MissionId, Role } from '../engine/types';

export const M3_TIMELINE = timeline;

/** D-026: the 14 challenges. 5 from the Sun (4 tied to real May 2024 records), 9 everyday base problems. */
export const KID_EVENTS = [
  'SW-01',
  'SW-02',
  'SW-03',
  'SW-04',
  'SW-05',
  'PW-01',
  'PW-02',
  'PW-03',
  'PW-07',
  'LS-01',
  'LS-03',
  'LS-05',
  'RS-01',
  'RS-04',
];
/** M1 (design reference since D-021): the same set without the real storm beats. */
export const KID_EVENTS_CALM = KID_EVENTS.filter(
  (id) => !['SW-01', 'SW-02', 'SW-03', 'SW-04'].includes(id),
);

/** D-028: 3 big jobs per astronaut, all their own. 'A|B' = A when possible, else B. */
export const KID_JOBS: Record<Role, string[]> = {
  MGR: ['T-REST', 'T-SEND', 'T-GARDEN'],
  ENG: ['T-MAINT-LS', 'T-PANELS', 'T-SHIELD'],
  MED: ['T-REST', 'T-TREAT|T-MED', 'T-LAB'],
  RES: ['T-LAB', 'T-EVA-SCI', 'T-REST'],
};

export const MISSIONS: Partial<Record<MissionId, Mission>> = {
  M1: {
    id: 'M1',
    name: 'First Steps',
    site: 'Gale Crater',
    goal: {},
    events: KID_EVENTS_CALM,
    setup: [],
    jobs: KID_JOBS,
    eventFirst: true,
    quietChance: 0,
    startCrop: 'lettuce',
    missionEvents: ['PW-03'],
    scripted: [],
    donki: 'quiet',
    specialRules: ['tips'],
  },
  M3: {
    id: 'M3',
    name: 'Storm from the Sun',
    site: 'Gale Crater',
    goal: { maxDose: 6 }, // D-010
    events: KID_EVENTS,
    setup: [],
    jobs: KID_JOBS,
    eventFirst: true,
    quietChance: 0,
    startCrop: 'lettuce',
    missionEvents: ['PW-03'],
    scripted: timeline.beats.map((b) => ({
      sol: b.sol,
      event: b.eventId,
      severity: b.S,
      ...(b.warningSols !== undefined ? { warningSols: b.warningSols } : {}),
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
