# Mars Base Adventure

**A Junior Astronaut Mission Trainer.** A free browser card game where kids aged 7–12 run a Mars base with 4 astronauts and learn real mission trade-offs: life support, radiation shielding, power, food and communication delay. Every choice costs something.

Made by **Team Nova Knights** for the **NASA Space Apps Challenge 2026** (Cairo), challenge *"Build a Junior Astronaut Mission Trainer"*.

> Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data.

- **Play:** `https://<user>.github.io/mars-base-adventure/` *(the live URL is added once the repo is on GitHub)*
- No download, no login, no tracking. Works on phones and classroom projectors.

## Real NASA data
- **DONKI** space-weather database (CCMC): real solar flares, particle storms and solar clouds, including the May 2024 storms. Archived snapshots are labelled *"ARCHIVED – fetched on <date>"*.
- Curiosity RAD radiation measurements; Opportunity, Spirit, InSight, Phoenix and Perseverance (MOXIE) mission results; NASA OSDR biology data.
- Every fact in the game has a source tag `[S#]`. The full list is on the in-game *"Where our data comes from"* screen and in [`events-and-actions.md` §11](events-and-actions.md).

## Develop
Needs Node 22+.
```bash
npm ci
npm run dev            # local dev server
npm run typecheck      # tsc --noEmit
npm test               # vitest (engine rules + content checks)
npm run build          # production build (base = /mars-base-adventure/)
npm run spec:extract   # events-and-actions.md → src/content/generated/spec.json
npm run check:content  # content checks
```
Rules for humans and AI agents: [`CLAUDE.md`](CLAUDE.md) · plan: [`PLAN.md`](PLAN.md) · shared state: [`PROGRESS.md`](PROGRESS.md).
Game design source of truth: [`events-and-actions.md`](events-and-actions.md) (rules, numbers, sources) and [`mars-adventure-kids-guide.md`](mars-adventure-kids-guide.md) (kid-facing text).

## Credits and licences
- Code and docs: [MIT](LICENSE) © 2026 Nova Knights.
- Icons: [Twemoji](https://github.com/jdecked/twemoji) by Twitter, Inc. and other contributors, licensed [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Font: [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) by the Braille Institute of America, [SIL Open Font License 1.1](public/fonts/OFL.txt).
- NASA images (when added) carry their own credit lines.
- AI use: built with help from Claude (Anthropic) coding agents; the team reviewed and decided everything. Details are in the submission's AI-use disclosure.
