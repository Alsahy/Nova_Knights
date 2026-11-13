/**
 * check-content (lane S): spec + content + sources + DONKI timeline checks (PLAN Phase 3 task 8).
 *   npm run check:content          → errors fail, warnings are listed
 */
import { readFileSync } from 'node:fs';
import { checkContent } from '../src/content/check';
import { citedSourceIds, GUIDE_PATH, parseSpec, SPEC_PATH, OUT_PATH, render } from './spec-extract';

const md = readFileSync(SPEC_PATH, 'utf8');
const spec = parseSpec(md, readFileSync(GUIDE_PATH, 'utf8'));
const ids = new Set(spec.sources.map((s) => s.id));
const { errors, warnings } = checkContent();
if (spec.events.length !== 60) errors.push(`expected 60 events, found ${spec.events.length}`);
for (const id of citedSourceIds(md))
  if (!ids.has(id)) errors.push(`[${id}] is cited but not listed in §11`);
if (readFileSync(OUT_PATH, 'utf8') !== render(spec))
  errors.push('spec.json is stale: run `npm run spec:extract`');

const byKind = (prefix: string) => warnings.filter((w) => w.includes(prefix)).length;
console.log(
  `check:content · spec v${spec.specVersion} · ${spec.events.length} events · ${spec.sources.length} sources`,
);
console.log(
  `warnings: ${warnings.length} (prose in non-Must events: ${byKind('prose without')}, word limits: ${byKind('words')}, sources: ${byKind('[S')})`,
);
if (process.argv.includes('--verbose')) for (const w of warnings) console.log('  ⚠ ' + w);
if (errors.length) {
  console.error(
    `check:content ✖ ${errors.length} error(s)\n` + errors.map((e) => '  ✖ ' + e).join('\n'),
  );
  process.exit(1);
}
console.log('check:content ✔ no errors');
