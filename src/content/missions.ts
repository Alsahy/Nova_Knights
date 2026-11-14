/**
 * Missions (spec §8.2/§8.4). The kid game is ONE mission (D-021): M3 Storm from the Sun.
 * D-026: 14 easy challenges, one every day, no planting choice; real NASA DONKI beats on sols 2, 4 (→ 6) and 8.
 * D-027: the day's surprise comes first; D-028: 3 jobs per astronaut.
 */
import timeline from './donki/m3-may2024.json';
import type { Mission, MissionId, Role } from '../engine/types';

export const M3_TIMELINE = timeline;

/**
 * D-031: the live-action scope. The 14 problems of the mini-game design (flash on the Sun, radiation storm,
 * hot battery, dusty panels, freezing night, stuffy air, clogged recycler, food low, can't sleep, dust sneezes,
 * water in the helmet, shiny rock, broken lab, crew disagreement), plus the D-026 events that carry the real
 * May 2024 storm story (SW-03 → SW-04), the lucky wind, the quiet Sun day, the oxygen maker and "send your data home".
 */
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
  'FD-06',
  'CR-02',
  'CR-04',
  'CR-05',
  'RS-01',
  'RS-03',
  'RS-04',
  'MG-03',
  // D-063: the two challenge topics the review found thin
  'CR-03', // communication delay: a video home, the reply comes a sol later
  'CM-02', // communication: the antenna must point at Earth
  'CR-01', // NASA OSDR: bodies get weaker in low gravity
  'RS-05', // NASA OSDR: the space-biology experiment
];
/** M1 (design reference since D-021): the same set without the real storm beats. */
export const KID_EVENTS_CALM = KID_EVENTS.filter(
  (id) => !['SW-01', 'SW-02', 'SW-03', 'SW-04'].includes(id),
);

/** D-028: 3 big jobs per astronaut, all their own. 'A|B' = A when possible, else B. */
export const KID_JOBS: Record<Role, string[]> = {
  MGR: ['T-REST', 'T-SEND', 'T-GARDEN'],
  ENG: ['T-MAINT-LS', 'T-PANELS', 'T-SHIELD', 'T-ICE'], // D-043: digging ice is the way to get water back
  MED: ['T-REST', 'T-TREAT|T-MED', 'T-LAB'],
  RES: ['T-LAB', 'T-EVA-SCI', 'T-REST'],
};

/** D-050: Survival. The same base and problems, no last day: how many sols can the crew last? */
const SURVIVAL_EXTRA = ['SW-01', 'SW-02', 'SW-03'];

export const MISSIONS: Partial<Record<MissionId, Mission>> = {
  M9: {
    id: 'M9',
    name: 'Survival',
    site: 'Gale Crater',
    goal: {},
    events: KID_EVENTS,
    setup: [],
    jobs: KID_JOBS,
    eventFirst: true,
    quietChance: 0,
    startCrop: 'lettuce',
    unlocks: ['LS-10'],
    endless: {
      extra: SURVIVAL_EXTRA,
      real: Object.fromEntries(
        timeline.beats.map((b) => [
          b.eventId,
          {
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
          },
        ]),
      ),
    },
    missionEvents: ['PW-03'],
    scripted: [],
    donki: 'quiet',
    specialRules: ['survival'],
  },
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
    unlocks: ['LS-10'], // D-043: the ice is already found, so the Engineer can dig it up (T-ICE)
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
