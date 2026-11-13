/**
 * Missions (spec §8.2). M1 (Must) and M3 (Must); M3's scripted beats come from the real DONKI
 * May 2024 snapshot via scripts/build-donki-timeline.ts (D-009).
 */
import timeline from './donki/m3-may2024.json';
import type { Mission, MissionId } from '../engine/types';

export const M3_TIMELINE = timeline;

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
