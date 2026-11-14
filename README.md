# Nova Knights Adventure

*(working title until 14 Nov: Mars Base Adventure; the repo and some docs still use it)*

**A Junior Astronaut Mission Trainer.** A free browser game where kids aged 7–12 run a Mars base with 4 astronauts and learn real mission trade-offs: life support, radiation shielding, power, food and communication delay. Every choice costs something.

Made by **Team Nova Knights** for the **NASA Space Apps Challenge 2026** (Cairo), challenge *"Build a Junior Astronaut Mission Trainer"*.

> Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data.

- **Play:** `https://<user>.github.io/mars-base-adventure/` *(the live URL is added once the repo is on GitHub)*
- No download, no login, no tracking. Works on phones and classroom projectors.
- **Two modes:** *Casual* (7 Mars days, send 20 stars) and *Survival* (no last day, alarms get faster every day down to 4 seconds, high-score board).
- **Casual, about 10 minutes:** *Storm from the Sun*. You see the base cut open like a dollhouse. Each day an alarm goes off in one room (8-second timer): tap one of two tools and win its mini-game, then send each astronaut to a job. The crew's faces, the lights and the dust on the panels show how the base is doing.
- **Rewards that last:** stars sent to Earth fill a star bank for base decorations and 17 space badges that pay bonus stars (saved on the device only). A **Training room** lets kids practise every tool with no timer. Win by sending 20 science stars home **and** keeping the radiation badge out of the red. Real solar storm records from May 2024 (NASA DONKI archive).
- **Teachers:** [`docs/teacher-guide.md`](docs/teacher-guide.md) (projector mode, class vote, discussion questions).
- **Balance proof:** `npm run sim -- --report` plays thousands of games with 5 strategies → [`docs/balance-report.md`](docs/balance-report.md).

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
- Headings font: [Orbitron](https://github.com/theleagueof/orbitron), [SIL Open Font License 1.1](public/fonts/OFL-Orbitron.txt).
- Art: the base, crew, tools and scenes are drawn in code (SVG) by the team. No AI-generated pictures are used.
- Sound effects and the wind-and-Sun background: synthesised in code with the Web Audio API (no audio files, no music).
- Training-room pictures: NASA image library ([images.nasa.gov](https://images.nasa.gov)), credits in [`docs/data-sources.md`](docs/data-sources.md) and under each picture in the game.
- AI use: built with help from Claude (Anthropic) coding agents; the team reviewed and decided everything. Details are in the submission's AI-use disclosure.
