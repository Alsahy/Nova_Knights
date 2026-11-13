/**
 * fetch-donki (lane S): save NASA DONKI records as archived snapshots.
 *   npm run donki:fetch -- --start 2024-05-01 --end 2024-05-31
 * Writes data/donki/<type>_<start>_<end>.json = { fetchedAt, source, data } (never hand-edited).
 * Endpoint: https://ccmc.gsfc.nasa.gov/DONKI-API/get/<type> (no key; ≤ 60 days per request, spec §5 [S1]).
 * Retries 3× with backoff (DNS was flaky in the Phase 0 check).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DONKI_MAX_DAYS_PER_REQUEST } from '../src/engine/config';

export const DONKI_BASE = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get';
export const DONKI_TYPES = [
  'FLR',
  'SEP',
  'CME',
  'CMEAnalysis',
  'WSAEnlilSimulations',
  'notifications',
] as const;

export function daysBetween(start: string, end: string): number {
  return (
    Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1
  );
}

export function donkiUrl(type: string, start: string, end: string): string {
  return `${DONKI_BASE}/${type}?startDate=${start}&endDate=${end}`;
}

async function fetchJson(url: string): Promise<unknown> {
  let last: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw last;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (k: string, d: string): string => {
    const i = args.indexOf(`--${k}`);
    return i >= 0 && args[i + 1] ? args[i + 1]! : d;
  };
  const start = get('start', '2024-05-01');
  const end = get('end', '2024-05-31');
  const days = daysBetween(start, end);
  if (!(days >= 1 && days <= DONKI_MAX_DAYS_PER_REQUEST))
    throw new Error(
      `window ${start}..${end} is ${days} days; DONKI allows 1–${DONKI_MAX_DAYS_PER_REQUEST} per request`,
    );
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = resolve(root, 'data/donki');
  mkdirSync(dir, { recursive: true });
  for (const type of DONKI_TYPES) {
    const source = donkiUrl(type, start, end);
    const data = await fetchJson(source);
    const out = { fetchedAt: new Date().toISOString(), source, data };
    writeFileSync(
      resolve(dir, `${type}_${start}_${end}.json`),
      JSON.stringify(out, null, 1) + '\n',
    );
    console.log(`${type}: ${Array.isArray(data) ? data.length : '?'} records`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error('donki:fetch failed:', e);
    process.exit(1);
  });
}
