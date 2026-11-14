# Nova Knights Adventure: project description (draft)

*Team Nova Knights · NASA Space Apps Cairo 2026 · Challenge: Build a Junior Astronaut Mission Trainer*
*Draft for the team to edit. Fill in the links marked TODO before submitting.*

## The problem
Space content for children is either posters and facts, or simulators too hard for a 9-year-old. Few tools let a child feel the trade-offs a Mars crew lives with: every choice that saves one thing costs another.

## What we built
A free browser game for ages 7–12. The child runs a Mars base that is drawn cut open, like a dollhouse. Each Mars day:

1. An alarm goes off in one room (a hot battery, a solar storm, a clogged water recycler…), with 8 seconds to act.
2. The child picks one of two tools. Each tool shows what it **costs**, what it **gives** and what may happen **later**.
3. A short skill mini-game applies the tool. Running out of time means the crew picks for you.
4. The child gives each of the 4 astronauts a job (lab work, refill the oxygen, dig up ice, rest…), then night falls.

Two modes: **Casual** (7 days, send 20 science stars to Earth and keep the radiation badge out of the red) and **Survival** (no last day, alarms speed up, high-score board). No download, no login, no data collected. Works on phones and classroom projectors.

## The trade-off, in the rules
- Oxygen is used every day; storms wear the shield; food and water run out unless the crew gardens and digs ice.
- Science earns stars, but only upkeep keeps the crew on Mars. In 1,000 simulated games a crew that only does science never wins; careful play wins about three games in four.
- No tool is free: a content check fails the build if a card has no cost.

## NASA data we use, and how
| Data | Where it is in the game |
|---|---|
| **DONKI** space-weather database: three real records from May 2024 (an X3.9 flare, a model run predicting a Mars arrival, a particle event) | They are the storms of both modes, shown with their real dates and a link to the record. Labelled as an archived replay, never as live |
| **Curiosity RAD**: the 20 May 2024 surge of 8,100 micrograys | The radiation-storm event and its end-of-mission true story |
| **NASA OSDR**: mice lost muscle and bone in 33 days on the ISS | The exercise event and the experiment-results event |
| **NASA mission pages** (Spirit, InSight, Phoenix, Perseverance/MOXIE, CHAPEA, ISS reports) | The fact behind each of the 24 problems, each with a numbered source the player can open |
| **NASA image library**: 9 pictures (2 published in 2026) | "Why this tool matters" cards in the Training room, each with its credit and NASA ID |

Game numbers are game values: slow processes run 15 times faster and storm doses are made bigger so shields matter. The game says so on its data screen, and names the three rules that are game rules rather than NASA facts.

## Evidence that it works
- 145 automated tests on the rules, the content and the rewards; the same seed always gives the same game.
- A simulator plays thousands of games with five strategies; the report is in `docs/balance-report.md`.
- TODO: notes from playtests with children (none run yet).

## Use of AI (disclosure)
- The code, the game text and this draft were written with the help of an AI coding assistant (Claude Code), directed and reviewed by the team.
- All art is drawn in code. No AI-generated images, video or music are in the game. Sound effects are synthesised in the browser. Nova's voice in the tutorial and the voice-over of the highlights video are computer speech from Piper, an open-source neural text-to-speech engine, using a voice trained on public-domain recordings; it is not a recorded person.
- TODO: check this wording against the official 2026 submission guide.

## Links
- Play: https://nova-knights-hazel.vercel.app/ · Code: TODO · Video: TODO

*Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data.*
