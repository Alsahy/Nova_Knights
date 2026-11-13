/**
 * build-donki-timeline (lane S): M3 "Storm from the Sun" = a compressed replay of real May 2024 DONKI records (D-009).
 * Reads data/donki/*_2024-05-01_2024-05-31.json and writes src/content/donki/m3-may2024.json.
 * The RECORD CHOICES below are editorial; every number written to the JSON is computed from the snapshot.
 *   npm run donki:timeline
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CME_FAST_KMS, flareSeverity, SEP_MIN_S } from '../src/engine/config';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WINDOW = '2024-05-01_2024-05-31';

/** Which real records drive M3's scripted beats (spec §8.2 sols). */
export const M3_CHOICES = {
  SW01: { sol: 2, flrPeak: '2024-05-10T06:54Z' }, // X3.9 flare
  SW03: { sol: 4, simulationID: 'WSA-ENLIL/30726/1' }, // model run with a Mars hit. D-018: not used in the kid game (kept for data-sources)
  SW02: { sol: 6, sepEventTime: '2024-05-13T14:00Z' }, // GOES >10 MeV particle event (D-018: sol 6)
} as const;
/** ASSUMPTION (Phase 3, spec §5 is silent): an ENLIL Mars hit starts at S 2; fast CME +1, glancing −1 (spec §5). */
export const ENLIL_BASE_S = 2;

interface Snapshot<T> {
  fetchedAt: string;
  source: string;
  data: T[];
}
interface Flr {
  flrID: string;
  classType: string;
  peakTime: string;
  link: string;
  sourceLocation: string;
}
interface Sep {
  sepID: string;
  eventTime: string;
  link: string;
  instruments: { displayName: string }[];
  linkedEvents: { activityID: string }[] | null;
}
interface Enlil {
  simulationID: string;
  link: string;
  modelCompletionTime: string;
  estimatedShockArrivalTime: string | null;
  cmeInputs: { CMEID: string; speed: number; isMostAccurate: boolean }[];
  impactList: { location: string; arrivalTime: string; isGlancingBlow: boolean }[] | null;
}

export interface Beat {
  sol: number;
  eventId: string;
  S: number;
  warningSols?: number;
  realDate: string; // YYYY-MM-DD
  recordType: string;
  recordId: string;
  label: string;
  sourceUrl: string;
}
export interface Timeline {
  mission: 'M3';
  modelRun: Beat;
  window: string;
  fetchedAt: string;
  note: string;
  beats: Beat[];
}

function load<T>(type: string): Snapshot<T> {
  return JSON.parse(
    readFileSync(resolve(ROOT, `data/donki/${type}_${WINDOW}.json`), 'utf8'),
  ) as Snapshot<T>;
}

export function buildTimeline(): Timeline {
  const flr = load<Flr>('FLR');
  const sep = load<Sep>('SEP');
  const enlil = load<Enlil>('WSAEnlilSimulations');
  const beats: Beat[] = [];

  // SW-01: a real flare, classType → S (spec §5).
  const f = flr.data.find((x) => x.peakTime === M3_CHOICES.SW01.flrPeak);
  if (!f) throw new Error('timeline: SW-01 flare not in snapshot');
  beats.push({
    sol: M3_CHOICES.SW01.sol,
    eventId: 'SW-01',
    S: flareSeverity(f.classType),
    realDate: f.peakTime.slice(0, 10),
    recordType: 'FLR',
    recordId: f.flrID,
    label: `Real event: ${f.classType} flare on ${f.peakTime.slice(0, 10)} (NASA DONKI). It was seen from Earth; in this game we imagine it also reached your base.`,
    sourceUrl: f.link,
  });

  // SW-03 → SW-04: an ENLIL run with a Mars arrival (spec §5).
  const e = enlil.data.find((x) => x.simulationID === M3_CHOICES.SW03.simulationID);
  const hit = e?.impactList?.find((i) => i.location === 'Mars');
  if (!e || !hit) throw new Error('timeline: SW-03 ENLIL run with a Mars impact not in snapshot');
  const cme = e.cmeInputs.find((c) => c.isMostAccurate) ?? e.cmeInputs[0];
  const sEnlil = Math.max(
    1,
    ENLIL_BASE_S + ((cme?.speed ?? 0) >= CME_FAST_KMS ? 1 : 0) - (hit.isGlancingBlow ? 1 : 0),
  );
  const warning = Math.max(
    1,
    Math.round((Date.parse(hit.arrivalTime) - Date.parse(e.modelCompletionTime)) / 86_400_000),
  ); // N-07: ≥ 1
  beats.push({
    sol: M3_CHOICES.SW03.sol,
    eventId: 'SW-03',
    S: sEnlil,
    warningSols: warning,
    realDate: e.modelCompletionTime.slice(0, 10),
    recordType: 'WSAEnlilSimulations',
    recordId: e.simulationID,
    label: `NASA's model predicted this cloud would reach Mars on ${hit.arrivalTime.slice(0, 10)}. (CME speed about ${cme?.speed ?? '?'} km/s.)`,
    sourceUrl: e.link,
  });

  // SW-02: a real particle event; S = linked flare's S (min 2), or 2 if not linked (spec §5).
  const sp = sep.data.find((x) => x.eventTime === M3_CHOICES.SW02.sepEventTime);
  if (!sp) throw new Error('timeline: SW-02 SEP not in snapshot');
  const linked = (sp.linkedEvents ?? [])
    .map((l) => flr.data.find((x) => x.flrID === l.activityID))
    .filter((x): x is Flr => !!x);
  const sSep = Math.max(SEP_MIN_S, ...linked.map((x) => flareSeverity(x.classType)));
  const biggest = linked.sort((a, b) => flareSeverity(b.classType) - flareSeverity(a.classType))[0];
  beats.push({
    sol: M3_CHOICES.SW02.sol,
    eventId: 'SW-02',
    S: sSep,
    realDate: sp.eventTime.slice(0, 10),
    recordType: 'SEP',
    recordId: sp.sepID,
    label: `Real event: a solar particle storm on ${sp.eventTime.slice(0, 10)} (NASA DONKI${biggest ? `, after ${/^[MX]/.test(biggest.classType) ? 'an' : 'a'} ${biggest.classType} flare` : ''}). It was measured near Earth; in this game we imagine it also reached your base.`,
    sourceUrl: sp.link,
  });

  // D-018 kid scope: M3 plays only SW-01 and SW-02; the ENLIL record stays documented in modelRun.
  const modelRun = beats.find((b) => b.eventId === 'SW-03')!;
  return {
    mission: 'M3',
    modelRun,
    window: '2024-05-01 to 2024-05-31',
    fetchedAt: flr.fetchedAt,
    note: 'Compressed replay (D-009): real records, real dates, sped up to fit 10 sols.',
    beats: beats.filter((b) => b.eventId !== 'SW-03').sort((a, b) => a.sol - b.sol),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const t = buildTimeline();
  writeFileSync(
    resolve(ROOT, 'src/content/donki/m3-may2024.json'),
    JSON.stringify(t, null, 2) + '\n',
  );
  for (const b of t.beats)
    console.log(
      `sol ${b.sol}  ${b.eventId}  S=${b.S}${b.warningSols ? ` warning=${b.warningSols}` : ''}  ${b.realDate}  ${b.recordId}\n         ${b.label}`,
    );
}
