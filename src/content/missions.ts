/**
 * Missions (spec §8.2). Phase 2 ships M1 (Must) and a DRAFT M3 so scripted beats are tested;
 * M3's real DONKI records and the timeline land in Phase 5 (D-009, PENDING P-001).
 */
import type { Mission, MissionId } from '../engine/types';

export const MISSIONS: Partial<Record<MissionId, Mission>> = {
  M1: {
    id: 'M1',
    name: 'First Steps',
    site: 'Gale Crater',
    goal: {},
    missionEvents: ['PW-03'],
    scripted: [],
    donki: 'quiet', // spec §8.2: DONKI forced quiet (calm Sun)
    specialRules: ['tips', 'noCommanderEvents'],
  },
  M3: {
    id: 'M3',
    name: 'Storm from the Sun',
    site: 'Gale Crater',
    goal: { maxDose: 6 }, // D-010
    missionEvents: ['SW-08', 'SW-09', 'SW-10', 'CM-03'],
    // spec §8.2 scripted beats. Severities/records are DRAFT until Phase 5 (data notes in PROGRESS).
    scripted: [
      {
        sol: 2,
        event: 'SW-01',
        severity: 3,
        donki: {
          type: 'FLR',
          id: '2024-05-14 X1.7',
          date: '2024-05-14',
          label: 'donki.flareEarthSide',
        },
      },
      {
        sol: 4,
        event: 'SW-03',
        severity: 2,
        warningSols: 2,
        donki: {
          type: 'WSAEnlilSimulations',
          id: 'WSA-ENLIL/30726/1',
          date: '2024-05-13',
          label: 'donki.enlilMars',
        },
      },
      {
        sol: 7,
        event: 'SW-02',
        severity: 3,
        donki: {
          type: 'CME',
          id: '2024-05-20T05:36:00-CME-001',
          date: '2024-05-20',
          label: 'donki.may20',
        }, // PENDING P-001
      },
    ],
    donki: 'scripted',
    specialRules: ['stormReplay'],
  },
};
