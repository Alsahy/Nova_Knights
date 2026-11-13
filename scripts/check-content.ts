/**
 * check-content (lane S). v0 STUB: Phase 3 adds no-free-lunch, sources, notation, word limits, MVP coverage.
 * For now it re-checks the extracted index so `npm run check:content` already means something.
 */
import { readFileSync } from 'node:fs';
import { citedSourceIds, parseSpec, SPEC_PATH } from './spec-extract';

const md = readFileSync(SPEC_PATH, 'utf8');
const spec = parseSpec(md);
const ids = new Set(spec.sources.map((s) => s.id));
const errors: string[] = [];
if (spec.events.length !== 60) errors.push(`expected 60 events, found ${spec.events.length}`);
for (const id of citedSourceIds(md))
  if (!ids.has(id)) errors.push(`[${id}] is cited but not listed in §11`);

if (errors.length) {
  console.error('check:content ✖\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(
  `check:content ✔ (v0 stub: ${spec.events.length} events, ${spec.sources.length} sources; full checks arrive in Phase 3)`,
);
