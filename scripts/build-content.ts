/**
 * build-content (lane S): parse the spec's card notation ONCE at build time (not in the browser),
 * so the game loads fast on cheap phones. Writes src/content/generated/content.json (never hand-edit).
 *   npm run spec:extract   (runs spec-extract, then this)
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContentData, UNPARSED } from '../src/content/build';

export const CONTENT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/content/generated/content.json',
);

export function renderContent(): string {
  return JSON.stringify(buildContentData()) + '\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  writeFileSync(CONTENT_PATH, renderContent());
  console.log(
    `content.json written (${UNPARSED.length} prose cells without overrides, all outside the Must events)`,
  );
}
