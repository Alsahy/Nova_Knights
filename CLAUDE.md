# CLAUDE.md: rules for every agent working on this repo

**Project:** *Mars Base Adventure*, a browser card game where kids aged 7–12 run a Mars outpost and learn real mission trade-offs (life support, radiation shielding, power, food, communication delay).
**Team:** Nova Knights · NASA Space Apps Challenge 2026, Cairo · Challenge: "Build a Junior Astronaut Mission Trainer"
**Hackathon:** Sat 14 Nov 2026 09:00 → **Sun 15 Nov 23:59 Cairo time (EET, UTC+2)**. Our own target: **code freeze Sun 16:00, submit by Sun 20:00.**

You can act as lead game designer, senior engineer, science-accuracy reviewer or pitch coach, depending on the lane you're given.

---

## 1. Read these first, in this order
1. `PROGRESS.md`: the current phase, who is doing what, decisions, pending proposals, the latest handoff note. **This is the shared state.**
2. `PLAN.md`: read **only the phase you were told to run** (§6), plus §3 (MVP scope) and §5 (spec issues) when relevant.
3. The source-of-truth docs your task touches (below).

## 2. Sources of truth (in order of precedence)
| File | It decides |
|---|---|
| `events-and-actions.md` (the "spec") | **All game logic and numbers**: rules, stats, roles, tasks, effect notation, DONKI mapping, the 60 events and their cards, the 9 missions, deck and draw rules, TS shapes, sources `[S#]` |
| `mars-adventure-kids-guide.md` | Tone of voice, kid-facing text, "True story" lines, glossary |
| `challenge.txt` | What judges expect (scope, audience, data, pitfalls) |
| `PROGRESS.md → Decisions` | Approved changes (`D-###`). They take priority over the spec text until the spec is updated, which must happen in the same commit |

**Never invent** events, numbers or facts. If the spec is unclear, wrong or unbalanced:
1. Add a proposal row to `PROGRESS.md → Proposals` (`P-###` or an existing `A-xx`): problem → proposed fix → what it affects.
2. Keep working on everything that's clear. If code needs a value now, use the proposed default as a named constant in `src/engine/config.ts`, comment it `// PENDING P-###`, and **don't edit the `.md` files**.
3. After the lead approves: update the `.md` file(s) (bump the version, add to the "What changed" box), regenerate content, update the code, record `D-###`, all **in one commit**.

**Every science fact shown in the game keeps its `[S#]` source.** If a fact has no source, it doesn't ship.

## 3. How we work: phases
- The lead writes **`GO PHASE N`**. Do **only** phase N from `PLAN.md` §6.
- **Start** by restating the phase goal and its Definition of Done (short), then claim your tasks in `PROGRESS.md → Task board`.
- Give complete, runnable files with their paths. Prefer the simplest thing that works.
- Say so (politely, with the reason) if a request would hurt our judging score or break the rules.
- **End** every phase (or work session) with the **Phase report** and **Handoff note** (§10), paste the handoff note into `PROGRESS.md → Handoff`, then **stop and wait**.

## 4. Working in parallel with other agents
- **Claim before you work:** set the task row in `PROGRESS.md → Task board` to 🟡 with your lane, agent name and branch. Don't take a 🟡 task someone else owns.
- **Stay in your lane's files** (§5). To change another lane's file, add a row under `PROGRESS.md → Requests` and let that lane do it, unless the lead says otherwise.
- **The contract is `src/engine/types.ts` + the API in `src/engine/index.ts`** (owned by lane E). Any change gets logged under `PROGRESS.md → Contract changes` (what changed, why, who must adapt).
- **Branches/worktrees:** `lane/engine`, `lane/ui`, `lane/content`, or `p<N>-<lane>-<topic>`. Merge to `main` at least every 2 h. **`main` must always pass `npm run typecheck && npm test && npm run build`.**
- **Commits:** `[P<N>][<lane>] <what> (<A-xx/D-###/P-### if any>)`, e.g. `[P2][engine] power budget with dust floors (A-02)`.
- **PROGRESS.md edits:** change only your own rows and sections. Add log entries **at the top** of the Session log. Never delete someone else's entry. If there's a merge conflict in PROGRESS.md, keep both sides.
- Before you finish: pull/rebase, run the checks, push, update PROGRESS.

## 5. File ownership
| Lane | Owns |
|---|---|
| **L** (Lead) | `PLAN.md`, `PROGRESS.md` (structure), `README.md`, merges, approvals, the final submission |
| **E** (Engine) | `src/engine/**`, `src/sim/**`, `scripts/simulate.ts`, `tests/engine/**`, `tests/sim/**`, `docs/balance-report.*` |
| **U** (UI) | `src/ui/**`, `src/main.tsx`, `index.html`, `public/icons/**`, `public/fonts/**`, `vite.config.ts`, `.github/workflows/**` |
| **S** (Content & science) | `events-and-actions.md` + `mars-adventure-kids-guide.md` (**only to apply approved decisions**), `src/content/**`, `data/**`, `scripts/spec-extract.ts`, `scripts/fetch-donki.ts`, `scripts/build-donki-timeline.ts`, `scripts/check-content.ts`, `tests/content/**`, `docs/data-sources.md` |
| **P** (Pitch & design) | `docs/submission/**`, `docs/teacher-guide.md`, `docs/playtest-notes.md`, `public/img/**` + credits |
| Shared | `package.json` (add a dependency only with a note in PROGRESS), `src/content/generated/**` (**generated; never hand-edit**) |

## 6. Tech stack and commands
Vite + TypeScript (strict) + Preact · pure TS engine with a seeded PRNG · Vitest · tsx for scripts · plain CSS custom properties · SVG icon subset (Twemoji, CC-BY 4.0) · self-hosted Atkinson Hyperlegible (OFL) · GitHub Pages via Actions · no backend, no login, no analytics.

Commands (they exist from Phase 1 on):
```
npm run dev            # local dev server
npm run typecheck      # tsc --noEmit
npm test               # vitest run (engine rules + content checks + sim smoke)
npm run build          # production build (base = /<repo>/)
npm run spec:extract   # events-and-actions.md → src/content/generated/spec.json
npm run check:content  # no-free-lunch, sources, notation, word limits, MVP coverage
npm run donki:fetch    # DONKI snapshot → data/donki/*.json ({fetchedAt, source, data}), ≤ 60 days per request
npm run sim -- --mission M3 --tier cadet --games 1000 --bot all   # balance report → docs/balance-report.md
```
DONKI base URL: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/<type>?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` (no key, at most 60 days per request). The old `api.nasa.gov/DONKI` no longer works. The Mars Rover Photos API is archived, so bundle images locally with credits.

## 7. Engine rules (lane E, binding for everyone)
- `src/engine/**` is **pure TypeScript**: no DOM, no `fetch`, no `Math.random`, no `Date`. All randomness comes from `state.rng`. The state is JSON-serialisable. `reduce(state, cmd)` returns a new state.
- **The same seed gives the same game.** That's tested.
- Every tunable number lives in `src/engine/config.ts` with a comment citing `spec §x.y` or `D-###` / `PENDING P-###`.
- Card effects use the spec's notation (§3 of the spec), parsed by `notation.ts`. Prose cells are handled by named hooks in `hooks.ts`, mapped in `src/content/overrides.ts`.
- Tasks are planned in step 3 and resolved at night (A-01, if approved).

## 8. Content and science rules (lane S, binding for everyone)
- Content is **generated from the spec**. To change a card, change the `.md` (after approval) and run `npm run spec:extract`. Never hand-edit `generated/`.
- **No free lunch:** every action card has a cost now, a negative "later" effect, or a lost chance. `check:content` enforces this.
- Every displayed fact has an `[S#]` that resolves in `src/content/sources.ts`. Prefer NASA/JPL primary sources over news re-posts. Log any source swap as a proposal.
- **Honesty labels:** archived data says `ARCHIVED – fetched on <date>` (never "live" unless it really is fetched live). DONKI events seen from Earth say so (spec §5 wording). Show the "game-scaled ×15" note. Storm doses are game-exaggerated (A-08), so say that too.
- Don't present a game value as a real measurement. Mark it "game value".

## 9. Kid UX rules (lane U, binding for everyone)
- Ages 7–12. **Cadet (7–9)** sees 2 cards (★), kid risk words ("1 in 3"), 3 core meters (life support, power, shield) + ⭐; everything else is one tap away. **Commander (10–12)** sees 3 cards, percentages and all numbers.
- **Costs first** (red chips), then effects (green), then ⏳ / risk. At most 12 words per card line. Explain each science word with a tooltip the first time it appears.
- **Nothing scary.** No one dies. Failure = *"Mission Control brings the crew home safely."* Every ending teaches: what happened → which choice caused it → what real NASA does.
- Accessibility: tap targets ≥ 48 px, body text ≥ 18 px (projector mode ≥ 24 px), contrast ≥ 4.5:1, never colour alone, keyboard operable, `prefers-reduced-motion`.
- Performance: JS ≤ 150 KB gzipped, first load ≤ 500 KB, smooth at 360×640 on a throttled low-end profile.
- All kid-facing UI strings go in `src/content/copy.ts` (keeps translation possible).

## 10. Rules from the event (non-negotiable)
- **No minors' faces, names or voices** in any submission material (video, slides, photos, project page, repo).
- **No NASA logo or insignia; no implied NASA endorsement.** The disclaimer *"Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data."* appears in the game footer, README, video end card and last slide.
- **Open source:** MIT licence; credit third-party assets (Twemoji CC-BY 4.0, Atkinson Hyperlegible OFL, NASA image credit lines).
- Disclose AI use in the submission (check the 2026 Submission Guide for the exact rule).
- Kids' privacy: no accounts, no tracking, no personal data collected.

## 11. Templates

### Phase report (end of every phase)
```
## Phase N report: <name>
**Done:** bullet list, each with file paths
**Not done / moved:** what, why, where it went
**Risks:** top 3, each with a mitigation
**Proposed spec changes:** P-### rows added to PROGRESS (one line each)
**Demo-able now:** exact steps or URL to show it
**Time:** planned <hh:mm–hh:mm> · actual <hh:mm–hh:mm> · delta <±h>
**Checks:** typecheck ✔/✖ · tests ✔/✖ (n passed) · build ✔/✖ · check:content ✔/✖
```

### Handoff note (paste into PROGRESS → Handoff and into a new chat if needed)
```
HANDOFF <date time Cairo> · from <lane/agent> · Phase N <status>
Repo: <url> · Live: <url> · Branch: <name> · Last commit: <sha short>
State: <2–3 lines: what works end to end right now>
Next: <the next 3 concrete tasks, each with file paths>
Blocked on: <decisions/questions, with IDs>
Watch out: <gotchas, e.g. contract changes, flaky test>
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase <N or N+1>
```

## 12. Don'ts
- Don't start the next phase without `GO PHASE N`.
- Don't add libraries "just in case". Every dependency costs bundle size on cheap phones.
- Don't change numbers to "feel better" without a proposal. Use the simulator.
- Don't remove a `[S#]`, label or disclaimer to save space.
- Don't commit secrets (there shouldn't be any: DONKI needs no key).
- Don't commit, push or deploy unless your lane's task says so or the lead asks.
