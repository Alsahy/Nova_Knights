# PLAN.md: Mars Base Adventure, from design docs to a winning submission

**Team:** Nova Knights · **Event:** NASA Space Apps Challenge 2026, Cairo local event
**Challenge:** Build a Junior Astronaut Mission Trainer (see `challenge.txt`)
**Plan version:** 1.0 · written Fri 13 Nov 2026 · all times are **Cairo time (EET, UTC+2)**
**Working title:** *Mars Base Adventure: a Junior Astronaut Mission Trainer* (title of the kids guide; change it in Phase 0 if you like)

> **How to use this file**
> - Each phase (§6) is a **complete prompt**. When the lead writes `GO PHASE N`, the agent reads `CLAUDE.md` → `PROGRESS.md` → **only phase N of this file**, restates the goal and Definition of Done, and does that phase and nothing else.
> - Shared state (who is doing what, decisions, approvals, the handoff note) lives in `PROGRESS.md`, not here. This file changes only when the plan changes. Log every plan change in PROGRESS → Decisions.
> - Game logic and numbers come from `events-and-actions.md` (the spec). Items marked **A-xx** in §5 are proposed spec fixes that **wait for the lead's approval**.

---

## 1. Timeline at a glance

| Phase | Name | Time box (Cairo) | Main lanes | Gate at the end |
|---|---|---|---|---|
| **0** | Pre-flight & spec freeze (no game code) | **Fri 13 Nov 19:00 → 23:30** (spill-over: Sat 08:00–09:00) | L, S, P | **G0**: blocking A-items decided, repo exists, toolchains work |
| **1** | Skeleton, contracts & live URL | **Sat 09:00 → 11:00** | U, E, S | **G1**: CI green, live URL on a phone, `types.ts` v1 merged |
| **2** | Engine core (headless game) | **Sat 11:00 → 17:00** | E | **G2**: M1 Cadet plays to an ending from a seed in the terminal |
| **3** | Content & real data | **Sat 11:00 → 16:00** (parallel with 2) | S | content check green for 37 MVP events; DONKI snapshot committed |
| **4** | Playable M1 (UI + integration) | **Sat 11:00 → 23:00** (shell to 17:00, then integration) | U (+E, S from 17:00) | **G3**: M1 playable end to end on the live URL on a phone |
| — | Sleep in shifts | Sat 23:00 → Sun 07:00 | everyone | at least 5 h each |
| **5** | Real-data mission (M3) + balance | **Sun 07:00 → 12:00** | E, S, U | **G4**: M3 playable with real DONKI; balance report committed |
| **6** | Playtest, polish & code freeze | **Sun 12:00 → 16:00** | U, S, L | **G5**: tag `v1.0` at 16:00, no P0/P1 bugs |
| **7** | Submission package | **Sun 10:00 (drafts) → 20:00 (submitted)** | P, L | **G6**: submitted, all links checked while logged out |
| **8** | Live pitch *(only if Cairo has live judging; see Q2)* | TBD | P, L | rehearsed twice |
| — | Buffer | Sun 20:00 → 23:59 | — | the official deadline is 23:59 |

**Critical path:** types contract (Sat 11:45) → engine runs a headless game (17:00) → UI integration (23:00) → M3 + balance (Sun 12:00) → freeze (16:00) → video from the frozen build (18:00) → submit (20:00).

**If pre-event coding is allowed** (the lead is checking): run Phase 1 on Friday night after Phase 0. Every later phase gets about 2 h more slack. Don't move anything else earlier.

**Cut triggers (decide at each gate, don't drift):**
- G2 missed by more than 1 h → drop all **Should** items now. The UI keeps working against fixtures, and integration starts as soon as the engine runs.
- G3 missed → Sunday morning finishes M1 + M3 Cadet only. No Commander, no M2. The simulator runs as a smoke test only.
- G4 missed → M3 ships with the balance tuned so far. Write down the deviations honestly in `docs/balance-report.md`.
- 16:00 Sunday is a **hard freeze**. After that, fix crashes only.

---

## 2. Team roles (lanes) and Claude agents

| Lane | Role | Owns | Typical agent |
|---|---|---|---|
| **L** | Lead / integrator / timekeeper | PLAN.md, PROGRESS.md, approvals, merges, README, final submit | the lead's own Claude Code session |
| **E** | Engine developer | `src/engine/**`, `src/sim/**`, `scripts/simulate.ts`, `tests/engine/**`, `tests/sim/**` | Claude Code (worktree `lane-engine`) |
| **U** | UI developer | `src/ui/**`, `src/main.tsx`, `index.html`, `public/**` (except `public/img` credits), CI/deploy workflows | Claude Code (worktree `lane-ui`) |
| **S** | Content & science reviewer | the two spec `.md` files (only after approval), `src/content/**`, `data/**`, `scripts/spec-extract.ts`, `scripts/fetch-donki.ts`, `scripts/build-donki-timeline.ts`, `scripts/check-content.ts`, `docs/data-sources.md`, `tests/content/**` | Claude Code (worktree `lane-content`) |
| **P** | Pitch & design | `docs/submission/**`, `docs/teacher-guide.md`, `public/img/**` + credits, design tokens (U implements them) | Claude chat or Claude Code |

**If the team is smaller:** 4 people → P + L merge. 3 people → L+P, E, U+S. 2 people → (L+P+S), (E+U), and **Commander mode and M2 move from Should to Could**. 1 person → the Must list only. *(Q1 below decides this.)*

**Agents in parallel:** one Claude Code session per lane, each in its own git worktree and branch (`lane/engine`, `lane/ui`, `lane/content`). Merge to `main` at least every 2 h. `main` must always build and deploy. The file-ownership rules are in `CLAUDE.md`.

---

## 3. MVP scope

**Rule of thumb:** ship **37 events and 2 missions that work and are honest** rather than 60 events that half work. In the pitch, say "37 events playable today, 60 designed".

### 3.1 Missions
| Priority | Missions | Why |
|---|---|---|
| **Must** | **M1 First Steps** (Cadet, 8 sols, 6 SP) · **M3 Storm from the Sun** (Cadet, 10 sols, 8 SP + no red badges) | M1 teaches the loop. M3 links shielding decisions to **real DONKI space weather**, which is the challenge's first "stand-out" idea. |
| **Should** | **M3 in Commander mode** (20 sols) · **M2 Dust Season, Cadet** (adds only PW-04 + a dust timer every 3 sols) | Commander covers ages 10–12. M2 is a cheap way to show power vs dust with real Opportunity numbers. |
| **Could** | M6 Air Makers (Cadet) · M9 Free Play (+ "Today's Sun" with daily DONKI) | Both are cheap once the engine is done. Free Play reaches all 60 events. |
| **Won't (this weekend)** | M4, M5, M7, M8 as separate missions | Their events can still show up in Free Play if it ships. |

### 3.2 Events
**Must = every Cadet-reachable event in M1 + M3 (37 events):**
- Setup: `FD-04`, `FD-01`
- Space weather: `SW-01`, `SW-02`, `SW-03`, `SW-04`, `SW-05`, `SW-07`
- Power: `PW-01`, `PW-02`, `PW-03`, `PW-07`, `PW-08`
- Life support: `LS-01`, `LS-02` (Cadet: a plain 2-card event, no puzzle; see A-15), `LS-03`, `LS-04`, `LS-05`, `LS-07`, `LS-09`
- Food: `FD-05`, `FD-06`
- Crew: `CR-01`, `CR-02`, `CR-03`, `CR-04`, `CR-05`, `CR-06`, `CR-07`
- Research: `RS-01`, `RS-03`, `RS-04`, `RS-05`, `RS-06`
- Comms: `CM-02`
- Mission: `MG-02`, `MG-03`

**Should (+10 events, plus the third card "c" of every Must event):** `SW-06`, `SW-08`, `SW-09`, `SW-10`, `CM-03`, `MG-04`, `LS-08`, `CR-08`, `FD-02` (Commander layer of M3) and `PW-04` (M2 Cadet).
**Could (the remaining 13):** `PW-05`, `PW-06`, `PW-09`, `PW-10`, `LS-06`, `LS-10`, `LS-11`, `FD-03`, `FD-07`, `RS-02`, `RS-07`, `CM-01`, `MG-01`.

**Daily tasks (Must, 16 of 18):** T-REST, T-EXER, T-MAINT-LS, T-MAINT-LAB, T-GARDEN, T-LAB, T-EVA-SCI, T-SHIELD, T-WATERWALL, T-PANELS, T-MED, T-TREAT, T-PLAN, T-PEP, T-CALL, T-SEND. (T-ICE and T-MOXIE are Could; they come with LS-10 and LS-11.)

### 3.3 Features
| Must | Should | Could | Won't |
|---|---|---|---|
| Cadet tier · the full sol loop (morning report, power plan with on/off toggles, crew tasks, event, night log) · costs shown before effects · Cadet risk words ("1 in 3") · dose badge colours · 3 endings + debrief (choice → cause → what NASA does) · Sick Bay / Indoor-only · M1 tips (each card's Lesson line) · glossary tooltips for science words · **DONKI May 2024 snapshot with an "ARCHIVED – fetched on <date>" label** · M3 storm replay labels · "Where our data comes from" screen with every [S#] · "How this game uses real data" (×15 note + honesty table) · "Not affiliated with or endorsed by NASA" · seeded games (seed shown, replay) · works on phones + projector mode · live URL · MIT licence · README · `docs/data-sources.md` · content checker (no-free-lunch, sources, notation) · simulator with 4 bots for M1/M3 | Commander tier (M3) · M2 Cadet · offline (PWA) · 4–6 real NASA Mars photos with credits · teacher one-pager · best-move-bot card coverage check · "play this seed again" link | M6 · M9 Free Play · Today's Sun (daily DONKI refresh by GitHub Action, labelled with its fetch date) · Arabic for M1 · signal-travel animation for "Ask Earth" · sound (off by default) · class-vote projector mode | Logins, a backend, analytics, multiplayer, drag-and-drop power tokens, the LS-02 puzzle, M4/M5/M7/M8 as standalone missions |

---

## 4. Tech stack and repo structure

### 4.1 Stack (one-line reasons)
| Choice | Why |
|---|---|
| **Vite + TypeScript (strict)** | Fast dev server, static build, and type errors catch content mistakes before kids do. |
| **Preact** (React-compatible API) | About 4 KB of runtime keeps cheap phones fast; anyone who knows React can work in it. |
| **Pure TS engine, no DOM, seeded PRNG (mulberry32)** | Deterministic and unit-testable. The same code runs the browser game and the Node balance simulator. |
| **Content generated from the spec `.md`** (`scripts/spec-extract.ts` → `src/content/generated/spec.json`) + hand-written `overrides.ts` for prose cells | The docs and the code can't drift apart: change the `.md`, regenerate, and the tests show what broke. |
| **Effect strings kept in the spec's own notation** (§3 of the spec), parsed by `src/engine/notation.ts` | Authors copy straight from the spec. The parser plus the content checker enforce the rules. |
| **Vitest** | Shares Vite's config. Runs the rule tests, the content checks and a balance smoke test. |
| **tsx** for scripts | Runs TypeScript scripts (simulate, fetch-donki, spec-extract) in Node without a build step. |
| **Plain CSS with custom properties**, no UI kit | Costs nothing in the bundle, and gives full control over large text, contrast and projector mode. |
| **SVG icon subset** (Twemoji, CC-BY 4.0, ~25 icons) instead of system emoji | Older Android phones show 🫁 (Emoji 13) and 🫧 (Emoji 14) as empty boxes. |
| **Self-hosted Atkinson Hyperlegible** (SIL OFL) | Built for legibility, and works offline in classrooms. |
| **GitHub Pages + GitHub Actions** | Free hosting, a public repo meets the open-source rule, and every push to `main` deploys. |
| **localStorage** (wrapped in try/catch) for settings and resume | No login and no server; the game still works if storage is blocked. |
| *(Should)* **vite-plugin-pwa** | Offline play when classroom Wi-Fi is bad. |
| **No backend, no analytics, no cookies** | Protects kids' privacy, and that's a good line for the pitch. |

### 4.2 Repo structure
```
mars-base-adventure/
├── CLAUDE.md · PLAN.md · PROGRESS.md · README.md · LICENSE (MIT)
├── challenge.txt · events-and-actions.md · mars-adventure-kids-guide.md   ← design source of truth (stay at root)
├── docs/
│   ├── data-sources.md        ← for judges: which NASA datasets, why, honesty table
│   ├── balance-report.md      ← generated by `npm run sim`
│   ├── playtest-notes.md
│   ├── teacher-guide.md       ← (Should)
│   └── submission/            ← video-script.md, slides.md, project-page.md, ai-disclosure.md, checklist.md
├── data/donki/                ← raw snapshots {fetchedAt, source, data}, never hand-edited
├── scripts/                   ← spec-extract.ts, fetch-donki.ts, build-donki-timeline.ts, check-content.ts, simulate.ts
├── src/
│   ├── engine/                ← pure TS: types, config, rng, notation, who, state, power, radiation, crew,
│   │                            greenhouse, deck, tasks, events, night, endings, debrief, hooks, reduce, selectors, index
│   ├── content/               ← generated/spec.json (do not edit), overrides.ts, missions.ts, sources.ts,
│   │                            stories.ts, glossary.ts, copy.ts, donki/m3-may2024.json, index.ts
│   ├── sim/                   ← bots.ts, run.ts, metrics.ts
│   ├── ui/                    ← App.tsx, screens/, components/, hooks/, styles/, fixtures/
│   └── main.tsx
├── public/                    ← icons/ (SVG subset), img/ (credited NASA images), fonts/
├── tests/                     ← engine/, content/, sim/
└── .github/workflows/         ← ci.yml, deploy.yml
```

---

## 5. Spec issues found (proposed fixes wait for approval)

**Process:** each item gets **Approve / Modify / Reject** in `PROGRESS.md → Proposals`. Once it's approved, lane S updates `events-and-actions.md` (and the kids guide if wording changes), bumps the version, adds a line to the "What changed" box, regenerates content, and records a `D-###` entry, all in the same commit as the code change. All proposed numbers are **starter values** that live in `src/engine/config.ts`, and the simulator will tune them.

### 5.1 Blocking: the engine can't be built correctly without a decision
| ID | Problem in the spec | Proposed fix |
|---|---|---|
| **A-01** | **Task timing.** Crew tasks happen in step 3, but events in step 4 cancel or change them (SW-01.a "LOST: today's EVA tasks", SW-02.a, SW-05.c, CR-05.a…). Night order is only partly defined. | Tasks are **planned** in step 3 and **resolved** at the start of Night, after the event choice. Night order: resolve tasks → settle power → upkeep (eat, drink, oxygen maker H2O, AIR, sleep) → ⏳ delayed effects → greenhouse → wear / dust / background-dose timers → tick down modifiers → Sick Bay / Indoor-only checks → ending checks → "What happened today" log. |
| **A-02** | **Power counted twice.** §2.1 lists "Lab 1 (lab days)" and "Comms 1" as daily needs, but T-LAB and T-SEND also cost `PWR-1`. Solar × dust multipliers gives fractions (4 × 0.6 = 2.4). | Base need = LS 2 + recycler 1 + greenhouse 1 (if growing) + heaters (from events). Lab and comms power is paid **only** through task and card costs. Solar = `floor(4 × multiplier) − dust stacks`, minimum 0, then + reactor 2. Budget = today's PWR + BAT. |
| **A-03** | **PW-08 placement.** As an event it takes the single event slot, but a shortage is already known while planning power. | PW-08 **is** the Power Plan step's shortage mode: when need > supply, the plan screen shows PW-08's cards (unplug lab / greenhouse / turn down LS). It doesn't use the event slot. If an event later in the same sol adds a need, the battery covers it; if the battery can't, LS is unpowered that night (LS −2). |
| **A-04** | **Event-slot starvation (kills replayability).** With 1 event per sol in Cadet, the timers (CR-01 every 3 sols, RS-04 every 4, PW-02 every 4), FD-01 re-planting, chains and M3's 4 scripted beats fill almost every sol. M3 Cadet would get **0–1 random draws per game**. | (1) **Morning Briefing slot:** timer events (RS-04, CR-01) and FD-01 re-planting show up in the Morning Report as a briefing card with the same cards and costs, at most one per sol, and don't count against the event cap. If FD-01 is bumped, the same crop is replanted automatically. (2) Dust stacks are added automatically (shown in the morning report); PW-02 is played as an event only when a stack is added and the slot is free. (3) Slot priority: scripted > DONKI > MG-02 > SW-02 > LS/air chains and conditions > other chains and conditions > quiet > deck. A displaced chain or condition waits 1 sol, then is dropped and logged. (4) Condition events have a 3-sol cooldown. |
| **A-05** | **Science points.** Only T-LAB says its SP is "pending until sent". It's unclear whether event SP is pending and whether unsent SP counts at the end. | All SP (from tasks and events) starts **pending**. Only **banked** SP counts toward the goal. RS-04 also fires on the **last sol**. Pending SP is lost if LAB reaches 0. Cadet UI: "⭐ collected" vs "⭐ sent to Earth". |
| **A-06** | **Roles.** The MGR superpower "peek once per sol, free" duplicates T-PLAN (costs EN). Pep Talk = T-PEP. It's unclear which cards ENG's "repair −1 EN" applies to, and whether RES ×2 applies to event SP. | Superpowers **are** the role-exclusive tasks and cards (no extra free actions). Listed costs are already the specialist's price; anyone else uses the fallback (+1 EN, 50 % chance, costs paid even if it fails). RES ×2 applies **only** to tasks marked "RES ×2" (T-LAB, T-EVA-SCI). Add a `repair` tag to cards for MG-02.b and PW-10.c. |
| **A-07** | **Shield tiers make "+2 shield" cards useless.** Cadet starts at SH 4 (tier 1); +2 gives 6, still tier 1. SW-02.b, SW-03.a and SW-06.c then change nothing, which breaks rule 3 (every card must be the best pick somewhere). | Tier = `floor(SH / 3)`: 0–2 → 0 · 3–5 → 1 · 6–8 → 2 · 9–10 → 3. Background dose every 12 sols at tier ≥ 2. *(Alternative: keep the tiers and make SW-02.b "+1 tier for this storm".)* |
| **A-08** | **Storm-dose honesty (Validity risk).** The honesty table maps May 2024's 8,100 µGy (≈ 8 mGy) to "+2 to +4 DOSE", and at 1 pip ≈ 60 mSv that's 120–240 mSv. Even after converting Gy to Sv, the real dose is well under one pip, so the game value is about 10× or more too high, and the table doesn't say so. A judge could catch this. | Keep the game values, but fix the label: *"Storms are made bigger in the game so shields matter. The real May 2024 storm at Mars was about 8 mGy, like 30 chest X-rays [S6]. The game's worst storm (+4) is close to NASA's 250 mSv single-event limit [S9]."* Update §2.6 and the in-game honesty screen. |
| **A-09** | **M3 replay vs the DONKI calendar.** §5's rule (sol = days since start + 1) puts May 2024's big events on sols 8–20, but M3 scripts SW-01 on sol 2 … SW-02 on sol 7 in a 10-sol game. | M3 is a **compressed storm replay**: each scripted beat is tied to a specific real DONKI record and shows its **real date** plus "replay, sped up". The calendar rule is used only in Free Play / Today's Sun. |
| **A-10** | **M3 goal vs badge colours.** The goal is "every DOSE ≤ 7", but SW-07 says the badge turns red at 7 and the kids guide says "keep every badge out of the red". Badge colour thresholds aren't defined. | Badge colours: green 0–3 · yellow 4–6 · red 7–10. M3 goal becomes **every DOSE ≤ 6 (no red badges)**. |
| **A-11** | **Sick Bay & CR-07.** CR-07 fires at EN 0, but EN 0 already sends the astronaut to Sick Bay. An astronaut who comes back with the same stat still at 0 goes straight back in. | CR-07 fires at **EN ≤ 1** (a warning before trouble, rule 7). On leaving Sick Bay, the stat that hit 0 is set to 2. |
| **A-12** | **Open-ended effects & stuck states.** "until fixed", "still broken tomorrow", "⏳ less food later" (no N). If both Cadet ★ cards are unaffordable (e.g. LS-03 with PARTS 0 and O2T 0), the player is stuck. | (1) "Until fixed" becomes a `broken:<system>` flag, cleared by that event's repair card or by T-MAINT-LS (+PARTS-1). While `broken:o2maker`: LS −1 each night and no H2O used. (2) A ⏳ with no N means ⏳1. The content lane logs each one it normalises. (3) If no shown card is affordable, reveal card c. If c is unaffordable too, show "We can't fix it today": the system stays broken and the event comes back next sol. |
| **A-13** | **Missing numbers the engine needs.** | Starter values: EVA mishap: on a sol with ≥ 1 EVA planned, 15 % chance the event slot becomes CR-05 or CR-06 (50/50, on an EVA astronaut); CR-04 chains next sol after an EVA with 20 % chance. FD-04.c science kit = 2 one-time "Kit experiment" tasks (`ME.EN-1` → `SP+2`, no power). MG-02 fires when 2+ of {LS, LAB, BAT} ≤ 2 or 2+ astronauts are in Sick Bay, with a 3-sol cooldown. T-GARDEN: a crop never tended during its growth is 1 sol late. T-WATERWALL gives at most +2 SH. Cadet risk words: 15 % "small chance", 20 % "1 in 5", 30 % "1 in 3", 40 % "2 in 5", 50 % "1 in 2", 70 % "very likely". |
| **A-14** | **Peppers.** In 8-sol M1, peppers (⏳9) never get harvested, so Cadet card ★b is a trap. Cadet never sees FD-02, so the pepper harvest size is undefined. | In 8-sol missions, FD-01 shows lettuce vs radishes. Cadet pollination is automatic: harvest `FOOD+8` as written in FD-01.b. |
| **A-15** | **LS-02 in Cadet** asks for a "shape-matching puzzle", which is a separate mini-game. Cadet still needs LS-02, because both LS-01 ★ cards cost PARTS. | Cadet shows LS-02 as a normal 2-card event (★a, ★b). The puzzle moves to Could. |

### 5.2 Non-blocking: fix during content and polish
| ID | Issue | Proposed fix |
|---|---|---|
| N-01 | "Commander" means three things: the player ("Hello, Commander!"), the 10–12 tier, and the NASA name for the Manager. Cadet players get greeted as "Commander". | Change the UI greeting to "Hello, Mission Leader!" and keep the tier names. |
| N-02 | Rule 5 says ≤ 12 words per line, but §10 says lessons are ≤ 10 words, and many kid texts are 14–20 words. | Checker: card titles and lessons ≤ 12 words; event text ≤ 20 words (warning). Long "Real science" goes behind a "For grown-ups" toggle. |
| N-03 | Each event has two kid texts (spec "Kid text" and guide "What happens"). | In the game: event text = the spec's Kid text (trimmed). "True story" = the guide line + the event's [S#]. Full Real science sits in the grown-ups panel. |
| N-04 | Kids-guide "True story" lines have no [S#], and some guide titles differ from the spec (e.g. "Marsquake!" vs "The Ground Is Shaking!"). | Add invisible `<!-- SW-01 -->` ID comments to the guide headings so they map by ID. Each true story takes its event's sources. |
| N-05 | Source quality. The S18 URL slug (`mars-quake-surprising-source-insight-lander`) doesn't look like an article about dusty panels. The S51 slug (`most-powerful-marsquake…`) may not cover the ≈ 150 m impact craters. S8, S15, S30, S32, S38 and S50 are news re-posts where NASA/JPL originals exist. S54 says 3–21 min while the text says 3–22 (from S44). | Phase 3 source audit: verify each URL, swap in NASA/JPL originals, and log each swap as a proposal. |
| N-06 | Emoji 🫁 / 🫧 show as empty boxes on older Android. | SVG icon subset (§4.1). |
| N-07 | LS-09.c only works if LS-10 happened, so it's a dead card outside M4/M9. SW-03's computed warning can be 0 sols, which breaks rule 7. | Hide LS-09.c until LS-10 has happened. Make SW-03's warning at least 1 sol. |
| N-08 | It's unknown whether the new CCMC DONKI API sends CORS headers. That decides whether "Today's Sun" can fetch from the browser. | Phase 0 checks the headers. If there's no CORS, a daily GitHub Action refreshes a snapshot labelled "fetched on <date>", never "live". |

---

## 6. The phases (each section is a complete prompt)

> **Common to every phase** (also in CLAUDE.md): start by restating the goal and DoD. Claim your tasks in PROGRESS.md. Stay inside your lane's files. Never invent facts or numbers. When something's unclear, add a proposal to PROGRESS and keep going on what's clear. End with the **phase report** + **handoff note** (templates in CLAUDE.md), then stop and wait.

---

### PHASE 0: Pre-flight & spec freeze
**Time box:** Fri 13 Nov 19:00 → 23:30 (spill-over Sat 08:00–09:00) · **Depends on:** nothing · **Lanes:** L (lead), S, P, with E/U on setup

**Read first:** `CLAUDE.md`, this file §1–§5, `PROGRESS.md`, `challenge.txt`, `events-and-actions.md`, `mars-adventure-kids-guide.md`.

**Goal:** By 09:00 Saturday every decision that blocks code is made, the docs match those decisions, the repo exists, and everyone's toolchain works. **No game code** unless the local lead confirmed pre-event coding is allowed.

**Tasks**
1. **L:** Ask the Cairo local lead and record the answers in PROGRESS → Open questions: (a) is pre-event coding allowed? (b) is there live judging or a pitch (when, how long, projector)? (c) is the local deadline earlier than Sun 23:59? (d) is every team member registered on the Space Apps site, with the team page created?
2. **L:** Paste the **2026 Project Submission Guide** into the chat. The agent then updates §8 (submission checklist) and Phase 7 to match it exactly (demo format and limits, required fields, AI-use disclosure, media rules), and flags anything that conflicts with this plan.
3. **L:** For each of A-01…A-15 (and N-01…N-08), write Approve / Modify / Reject in PROGRESS → Proposals. **A-01…A-07 must be decided tonight** (the engine needs them). Answer Q1–Q3 (§10). Assign people to lanes in PROGRESS → Team.
4. **Agent (S lane) after the approvals:** edit `events-and-actions.md` → version **0.3**, add a "What changed from v0.2" box listing the D-IDs, and change only the approved sections. Edit the kids guide where kid-facing wording changes (e.g. A-10, and A-04 if the "Morning Briefing" needs a kid sentence). If N-04 is approved, add `<!-- ID -->` comments. Keep every [S#]. Record `D-###` entries.
5. **E + U:** install Node 22 LTS or newer, git and Claude Code. Create a **public** GitHub repo (suggested name `mars-base-adventure`) with an MIT licence, and turn on Pages with "GitHub Actions" as the source. `git init` locally, commit the docs, PLAN, CLAUDE and PROGRESS, and push. No app scaffold unless pre-event coding is allowed.
6. **S:** check the DONKI API with `curl` (research only, no scripts committed): for each of `FLR`, `SEP`, `CME`, `WSAEnlilSimulations` and `notifications`, call `https://ccmc.gsfc.nasa.gov/DONKI-API/get/<type>?startDate=2024-05-01&endDate=2024-05-31`. Record the HTTP status, the number of records, and the **real field names** compared with spec §5 (`classType`, `peakTime`, `linkedEvents`, `impactList[].location`, `arrivalTime`, `isGlancingBlow`, `cmeAnalyses[].speed`…). Record the CORS header with `curl -sI -H "Origin: https://example.github.io" "<url>" | grep -i access-control`. Note the ENLIL runs with a Mars impact and any SEP records for 2024-05-20. Write the findings into PROGRESS → Data notes.
7. **P:** confirm the game name. Pick a high-contrast, colour-blind-safe palette (5 tokens + dark mode). Choose 4 gender-neutral astronaut call-signs (not real people, not team members). Draft the 30-second video storyboard v0 (§6 Phase 7). List 4–6 candidate NASA Mars images (images.nasa.gov / JPL Photojournal) with their exact credit lines. **No NASA logo or insignia** may appear in any image.
8. *(Optional, 20 min, all)* Paper playtest: print 6 M1 event cards and play 3 Cadet sols. Note the confusing moments in `docs/playtest-notes.md`. Don't photograph faces.

**Deliverables:** updated `events-and-actions.md` v0.3 (+ kids guide if needed) · PROGRESS (decisions, team, data notes, answers) · public repo with the docs · storyboard v0 + palette + call-signs in `docs/submission/` (if pre-event work is allowed there; otherwise in PROGRESS notes).

**Definition of Done**
- [ ] A-01…A-07 decided; A-08…A-15 decided or explicitly "use the proposed default"
- [ ] The `.md` files match every approved decision, and the version is bumped
- [ ] Q1–Q3 answered; lanes assigned
- [ ] Repo public, MIT licence, docs pushed, Pages enabled
- [ ] DONKI check recorded (status, field names, CORS)
- [ ] Submission guide pasted and checklist updated, or explicitly marked "guide pending"
- [ ] Every lane's machine runs `node -v`, `git` and Claude Code

**Demo by the end:** none needed (optional: paper-playtest notes).
**Cut if late:** paper playtest → skip; image hunt → Phase 6; storyboard → Phase 7. **Never cut** the A-01…A-07 decisions.
**Judging boost:** Validity (A-08 honesty fix, source plan) · Relevance (scope covers all 5 challenge pillars) · Presentation (storyboard early).

---

### PHASE 1: Skeleton, contracts & live URL
**Time box:** Sat 09:00 → 11:00 · **Depends on:** Phase 0 (repo, approved stack, A-01…A-07) · **Lanes:** U (lead), E, S

**Read first:** `CLAUDE.md`, `PROGRESS.md` (decisions, team), this phase, §4 of this file, spec §10.

**Goal:** a deployed, tested skeleton with the agreed folders and the **engine ↔ content ↔ UI contracts** in place, so three lanes can work in parallel from 11:00.

**Tasks**
1. **U:** scaffold Vite + Preact + TS in the repo root (template `preact-ts`), keeping the existing docs.
   - `tsconfig` strict (`"strict": true`, `"noUncheckedIndexedAccess": true`), Prettier.
   - `package.json` scripts: `dev`, `build`, `preview`, `typecheck` (`tsc --noEmit`), `test` (vitest run), `check:content`, `sim`, `spec:extract`, `donki:fetch` (the last four call `tsx scripts/*.ts`; stubs are fine for now).
   - `vite.config.ts` with `base: '/<repo-name>/'`, plus a Vitest config (node environment for engine and content tests).
   - `.github/workflows/ci.yml` runs typecheck, test and build on pushes and PRs. `.github/workflows/deploy.yml` builds and deploys to Pages on push to `main`.
   - The app shows a title screen with the game name, **Play** (disabled), **Where our data comes from** (placeholder), **Settings** (placeholder), and a footer: *"Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data."*
   - `src/ui/styles/tokens.css`: colour, spacing and type-scale tokens (body ≥ 18 px), a `.projector` class that scales type by 1.4×, `prefers-reduced-motion` support, and a dark theme.
   - Self-host Atkinson Hyperlegible (woff2, Latin subset). Add an `<Icon name>` component with 5 SVG icons to start (LS, SH, PWR, SP, DOSE). Note the Twemoji credit in README.
2. **E:** within the first 45 minutes, push **contract v1**:
   - `src/engine/types.ts` (spec §10 refined: `GameState`, `Astronaut`, `Command`, `EventDef`, `ActionDef`, `TaskDef`, `Effect`, `Delayed`, `Modifier`, `Mission`, `CardView`, `TaskOption`, `PowerBudget`, `LogEntry`, `ChoiceRecord`, `Ending`, `Debrief`).
   - `src/engine/rng.ts` (mulberry32: `next()`, `int(n)`, `chance(p)`, `shuffle(arr)`, with state stored in `GameState`) + tests.
   - `src/engine/config.ts`: every number from spec §1.3, §2.1, §2.2 and §2.6, plus the approved A-decisions, each with a comment such as `// spec §2.6` or `// A-07 (D-004)`.
   - `src/engine/index.ts` exporting `newGame`, `reduce` and the selectors as **stubs that return a fixture state**, so the UI can integrate straight away.
   - Record "Contract v1" in PROGRESS → Contract changes.
3. **S:** `scripts/spec-extract.ts` v0 parses spec §6 (the event index table) and §11 (sources) into `src/content/generated/spec.json` (`events[]` with id, name, system, deck, missions, tier; `sources[]` with id, title, url). Add `tests/content/extract.test.ts` asserting exactly **60** events, unique IDs, and that every `[S#]` mentioned in the spec exists in the sources list.
4. **L:** merge, confirm that CI is green and the URL works, and write the live URL in PROGRESS → Now.

**Deliverables:** the scaffold, the workflows, `types.ts`, `rng.ts`, `config.ts`, `index.ts` stubs, `spec-extract.ts` v0, `spec.json` v0, tests, the live URL.

**Definition of Done**
- [ ] `npm ci && npm run typecheck && npm test && npm run build` pass locally **and** in CI
- [ ] The live URL shows the title screen on a real phone (and at 1280×720)
- [ ] Contract v1 is merged on `main` and logged in PROGRESS
- [ ] `spec.json` has 60 events and all sources; tests are green
- [ ] No console errors; Lighthouse mobile performance ≥ 90 on the title screen

**Demo by the end:** open the live URL on a phone.
**Cut if late:** Prettier, Lighthouse, icons (use emoji temporarily), projector class (moves to Phase 4).
**Judging boost:** Impact (a no-login URL from hour 2) · Presentation (a demo is always available) · Validity (a test pipeline from the start).

---

### PHASE 2: Engine core (headless game)
**Time box:** Sat 11:00 → 17:00 · **Depends on:** Phase 1 (contract v1), decisions A-01…A-07 · **Lane:** E (works alongside S and U)

**Read first:** `CLAUDE.md`, `PROGRESS.md` (Decisions, Contract changes), spec §1–§5, §8.3, §10, and §5 of this file.

**Goal:** a **pure, deterministic, tested** TypeScript engine that plays a complete **M1 Cadet** game from a seed without any UI, implements the spec plus the approved decisions, and exposes everything the UI needs.

**Public API (keep it stable; any change is logged as a Contract change)**
```ts
newGame(opts: { missionId: MissionId; tier: Tier; seed: number; content: Content }): GameState
reduce(state: GameState, cmd: Command): GameState   // pure, returns a new state, never throws on a legal command
// Commands: START_SETUP · CHOOSE_CARD{cardId, picks?} · SET_POWER{consumer, on} · CONFIRM_POWER
//           ASSIGN_TASK{role, taskId, target?} · CONFIRM_TASKS · CHOOSE_BRIEFING{cardId} · END_NIGHT
// Selectors (pure):
powerBudget(s) → {supply, battery, need, shortBy, consumers[]}
availableTasks(s, role) → TaskOption[] (with disabledReason)
shownCards(s) → CardView[] (costs first, affordability + reason, Cadet risk words, who → astronaut names)
hud(s) → {cadet: 3 core meters + ⭐ banked/pending/goal, commander: everything}
doseBadge(dose) → 'green'|'yellow'|'red'            // A-10
nightLog(s) → LogEntry[] for the sol that just ended
debrief(s) → {ending, top3: [{choice, caused, whatNasaDoes, sources}], stats}
```

**Modules and rules to implement (with spec references)**
- `notation.ts`: parse the effect notation from spec §3: `TARGET.STAT±N`, `SUPPLY±N`, `⏳N:`, `p=0.3:`, `+FLAG:`/`-FLAG:`, `→ EVT-ID`, `LOST:` text, `[Name]` → `NAME`, the phrase "EVA dose" → token `EVA_DOSE`, and `EN-2 each`. Anything it can't parse is returned as `{kind:'prose', text}`, which **must** have an override (the content checker enforces this). Test table: **at least 40 real strings** copied from the spec, e.g. `ENG.EN-2; PARTS-1`, `p=0.4:`, `⏳2: FOOD+3`, `EVA.EN-1`, `+FLAG:shelterReady`, `p=0.3: → CM-02`, `EN-3 each; PWR-2`, `ALL.ENMAX-1`.
- `who.ts`: parse "Who" values: `MGR`, `ENG + ANY`, `RES + ANY (EVA)`, `2× ANY (EVA)`, `ANY + MED`, `ENG + MGR`, `MGR + RES`, `[Name]`, `ANY + [Name]`, `PICK`, `EVA crew`. Cadet auto-picks (highest EN; for EVA, lowest DOSE among those not Indoor-only). Commander gets `picks` from the command.
- `power.ts`: A-02 (solar floor × multiplier − dust stacks, reactor 2, base needs, battery charge and discharge, BATMAX 10 or 7 after PW-01's POP). A-03 shortage mode. LS unpowered → LS −2.
- `radiation.ts`: A-07 tiers. Storm dose inside = max(0, S − tier), sheltered = max(0, S − tier − 2), on EVA = S. EVA dose: 50 % chance of +1. Background +1 every 6 sols (every 12 at tier ≥ 2). Flags `shelterReady` and `prepared`. DOSE caps at 10 → Indoor only.
- `crew.ts`: spec §2.2 upkeep. Sick Bay (2 sols, T-TREAT → back next sol, A-11 exit rule). Fallback rule (A-06). EN capped at ENMAX.
- `greenhouse.ts`: crops (lettuce ⏳2 +3, radishes ⏳4 +4, peppers ⏳9 +8, then FD-05), tending (A-13), paused / delayed, auto-replant (A-04), A-14.
- `tasks.ts`: the 16 MVP tasks from spec §4, **planned** in step 3 and **resolved** at night (A-01); RES ×2; EVA tasks get EVA dose; Indoor-only blocks EVA.
- `deck.ts`: deck = this tier's Core events + this mission's 🎯 events; seeded shuffle; draw order per spec §8.3 + A-04 (priorities, the Morning Briefing slot, the displacement rule, cooldowns); max 1 event per sol (Cadet) or 2 (Commander); quiet sols 30 % / 15 %; played 🟢/🎯 events removed unless repeatable; weights.
- `events.ts` + `hooks.ts`: resolve a card: check affordability (A-12) → pay `costNow` → apply effects → queue `later` → roll chances → set or clear flags → queue chain events → record a `ChoiceRecord` with resource deltas. Named hooks cover prose cells, e.g. `labOff(n)`, `greenhouseOff(n)`, `cropDelay(n)`, `roomClosed(n)`, `batteryUnusable(1)`, `batteryMax(7)`, `powerHalved(untilFixed)`, `solarMult(x, n)`, `dustStacks(±n)`, `cancelEvaTasks`, `skipTask(name, n)`, `broken(system)`, `askEarth(answerNextSol)`, `unlockTask(id)`, `scienceKit(2)`.
- `night.ts`: the exact order from A-01. `endings.ts`: spec §2.5. `debrief.ts`: score every choice (`|Δ key resources|` + 3 if it caused a chain or condition + 5 if it's linked to the ending cause) and take the top 3. Each one gets "what real NASA does" from the event's Real science line and its [S#].
- `reduce.ts`: the phase machine `setup → morning → power → tasks → event → night → (next sol | ended)`.
- **Determinism:** all randomness goes through `state.rng`. No `Math.random` and no `Date` inside `src/engine`. The state is JSON-serialisable.
- `src/sim/run.ts` + a random bot: `npm run sim -- --mission M1 --tier cadet --seed 42 --verbose` prints a sol-by-sol log and the ending.

**Tests (in `tests/engine/`)**
rng and shuffle stability · the notation table (≥ 40) · who parsing · power (clear sol, 1–3 dust stacks, every multiplier, battery cap, shortage) · radiation (tiers, inside/sheltered/EVA, background timers) · upkeep (food, water with recycler on and off, oxygen maker H2O, AIR by LS, sleep) · Sick Bay entry and exit, Indoor only · each ending trigger · deck rules (Cadet excludes Commander-tier, mission-only events, chains, conditions, briefings, cooldowns, events-per-sol cap) · affordability and the stuck rule · **50 seeds of M1 Cadet each reach an ending without throwing** · **same seed → identical log** (snapshot).

**Deliverables:** `src/engine/*`, `src/sim/run.ts`, `tests/engine/*`, contract updates logged, PROGRESS updated.

**Definition of Done**
- [ ] All the tests above pass in CI
- [ ] `npm run sim -- --mission M1 --seed 42 --verbose` plays to an ending and prints a readable log
- [ ] Two runs with the same seed give byte-identical logs
- [ ] Every value in `config.ts` cites a spec section or a decision ID
- [ ] Any still-pending A-item runs on its proposed default in config and is marked **PENDING** in PROGRESS (the `.md` files are not changed)
- [ ] The UI lane has confirmed it can call `newGame`, `reduce` and the selectors

**Demo by the end:** a terminal run of a full M1 game (good for a slide later: "every game is reproducible from its seed").
**Cut if late:** Commander rules (2 events per sol, picks, MG-04) → Phase 5; debrief scoring → simply "last 3 choices that had ⏳ or chain effects"; the hooks needed only by Should events.
**Judging boost:** Validity (faithful, tested rules) · Creativity (seeded deck engine, replayable) · Relevance (the trade-off mechanics are real code).

---

### PHASE 3: Content & real data
**Time box:** Sat 11:00 → 16:00 (parallel with Phase 2) · **Depends on:** Phase 1 (`spec-extract` v0, contract v1), decisions · **Lane:** S

**Read first:** `CLAUDE.md`, `PROGRESS.md`, spec §4–§8 and §11, the kids guide, and §3 and §5 of this file.

**Goal:** all **37 Must events** (and the data for Should events where it's cheap), the 16 tasks, missions M1 and M3 (and M2), sources, kid stories and the glossary exist as **validated data generated from the spec**, and M3's beats are tied to a **real DONKI May 2024 snapshot** with honest labels.

**Tasks**
1. **Finish `scripts/spec-extract.ts`.** Parse every `#### ID · Title` section in spec §7: the deck/tier line, Kid text, Real science (text + `[S#]` list), Engine notes, and the card table (Card with ★, Who, Cost now, Effect, Later/risk, Lesson). Keep notation in backticks as raw strings. Also parse the §4 tasks table and the §1.3 starter values. Write `src/content/generated/spec.json` (it carries a header saying it's generated and must not be hand-edited).
2. **`src/content/overrides.ts`:** for every prose cell the engine needs (e.g. PW-01.c "Battery unusable today", PW-07.b "Lab and greenhouse rooms go cold", SW-06.a "Next EVAs go to the lowest-DOSE astronaut"), map the card ID to engine hooks. Display-only prose is marked `display: true`.
3. **`src/content/missions.ts`:** M1, M3 (and M2 if time allows) from spec §8.2 + decisions: sols, goal, mission events, scripted beats, start overrides, DONKI window, special rules, site + [S#].
4. **`src/content/sources.ts`:** S1…S60 with `{id, title, url, publisher, isNasaPrimary, verifiedAt?, note?}`. Run a **source audit** for every source used by the Must events: open each URL (WebFetch), check that it supports the claim, and record `verifiedAt` or a problem note. Pay special attention to S18, S51 and the news re-posts (N-05). Log each replacement as a proposal. Don't silently swap sources.
5. **`src/content/stories.ts`:** kids-guide "True story" lines mapped by event ID (using the `<!-- ID -->` comments if N-04 was approved), each with that event's `[S#]`. **`glossary.ts`:** the guide's "Word helper" table plus first-use tooltips (sol, dose, CME, CO₂, tau, perchlorate, flare, rover, lander…).
6. **`scripts/fetch-donki.ts`:** for each type in FLR, SEP, CME, CMEAnalysis, WSAEnlilSimulations and notifications, fetch `https://ccmc.gsfc.nasa.gov/DONKI-API/get/<type>?startDate=…&endDate=…` (refuse windows longer than 60 days) and write `data/donki/<type>_<start>_<end>.json` as `{fetchedAt, source, data}`. Run it for 2024-05-01 → 2024-05-31 and commit the output.
7. **`scripts/build-donki-timeline.ts`:** from the snapshot, choose the real records for M3's scripted beats (A-09): SW-01 (a flare, classType → S using spec §5), SW-03 → SW-04 (an ENLIL run with `location` = Mars, `arrivalTime`; glancing blow → S−1), and SW-02 (an SEP). Write `src/content/donki/m3-may2024.json`: `[{sol, eventId, S, realDate, recordId, label, sourceUrl}]`. Labels follow spec §5: *"Real event: X1.1 flare on 2024-05-14 (NASA DONKI). It was seen from Earth; in this game we imagine it also reached your base."* and *"NASA's model predicted this cloud would reach Mars on <date>."* Add "Replay, sped up" (A-09). **Use only values that are actually in the JSON.** If a needed record type doesn't exist, report it and propose an alternative.
8. **`scripts/check-content.ts`** (also run as `tests/content/*.test.ts`), which fails on: a duplicate ID; an event without 2–3 cards; Cadet ★ count ≠ 2; **a card with no cost** (`costNow` empty AND no negative `later` AND no `lostChance`); a notation string that doesn't parse; prose with neither an override nor `display`; an event or story without ≥ 1 `[S#]`; an `[S#]` that isn't in sources; a chain target that doesn't exist; a Must event that's missing. It **warns** on: a card title or lesson > 12 words; event text > 20 words; an unaudited source.
9. **`docs/data-sources.md` v1** (for judges): the datasets used (DONKI with the endpoint, window, fetch date and the record IDs used; Curiosity RAD; Opportunity/Spirit/InSight power; Phoenix; MOXIE; the OSDR mice dataset [S40]), why each one is used, the honesty table (spec §2.6 + A-08), and "archived, not live".
10. **Science review (S):** for every Must event, check that every number shown matches its source. Log the result in PROGRESS → Science review (event ID ✔ / ✖ + note).

**Deliverables:** `spec.json`, `overrides.ts`, `missions.ts`, `sources.ts`, `stories.ts`, `glossary.ts`, `data/donki/*.json`, `m3-may2024.json`, `check-content.ts`, `docs/data-sources.md`, content tests, the science review log.

**Definition of Done**
- [ ] `npm run check:content` passes for all 37 Must events + 16 tasks (warnings listed in PROGRESS)
- [ ] Every fact the game displays has at least one `[S#]` that resolves to a source with a URL
- [ ] DONKI snapshot committed with `fetchedAt` + `source`; M3 beats tied to real record IDs; labels written
- [ ] Source audit done for every source the Must events use; problems logged as proposals
- [ ] `docs/data-sources.md` v1 committed
- [ ] Regenerating from the `.md` gives no diff (docs and code are in sync)

**Demo by the end:** the content-check report, plus a printed M3 timeline showing the real dates.
**Cut if late:** Should-event overrides; glossary beyond the Must words; full audit (do the Must events' sources only); the M2 mission file.
**Judging boost:** Validity (a source on every card, audited, honest labels) · Relevance (DONKI + OSDR + Mars mission data) · Presentation (`data-sources.md` is ready for judges).

---

### PHASE 4: Playable M1 (UI + integration)
**Time box:** Sat 11:00 → 23:00 (shell against fixtures until 17:00, then integration; E and S join for fixes from 17:00) · **Depends on:** Phase 1; Phases 2 and 3 for integration · **Lane:** U (+E, S)

**Read first:** `CLAUDE.md` (Kid UX rules), `PROGRESS.md`, spec §1.1, §1.2, §2.4 and §2.5, the kids guide (tone), and §3 of this file.

**Goal:** a 7–9-year-old can play **M1 Cadet from start to finish** on a cheap phone and on a classroom projector at the live URL, and every choice shows its cost before its effect.

**Screens (in `src/ui/screens/`)**
1. **Title**: Play · How to play (3 short panels) · Where our data comes from · Settings · disclaimer footer.
2. **Mission select**: cards for M1 and M3 (and M2), each showing the site, goal and "what it teaches" (from the kids guide), plus a Cadet/Commander toggle (Commander greyed out until Phase 5).
3. **Meet the crew**: 4 role cards with their superpowers (kids-guide text), skippable.
4. **Setup**: FD-04 Pack the Cargo → FD-01 What Should We Plant? (Commander adds MG-04).
5. **Sol screen**:
   - **HUD**: Sol X/Y, ⭐ sent/goal (+ collected), and **only 3 big meters in Cadet**: 🫁 Life support, ⚡ Power (today + battery), 🛡️ Shield. Supplies and the lab sit in a "Base" drawer one tap away.
   - **Morning Report**: Sun/DONKI line with the ARCHIVED or replay label, dust stacks, messages from Earth, and **at most one Morning Briefing card** (A-04).
   - **Power Plan**: on/off toggles (life support always on, recycler, greenhouse, heaters) and a supply-vs-need bar. When short, PW-08 shortage mode appears (A-03).
   - **Crew Tasks**: 4 astronaut cards (Cadet bars: 🍽️ 💧 ⚡, AIR only during EVA, a dose badge with colour **and** icon **and** word). Tap an astronaut, then a task: suggested tasks first, the rest under "More…". Disabled tasks say why.
   - **Event**: icon, title, kid text, then 2 action cards (3 in Commander). Each card shows **red cost chips first**, then green effect chips, then ⏳/risk chips with Cadet risk words, then who does it (avatar + name). In M1, a 💡 Tip (the card's Lesson). A "True story" button flips the card to the story with tappable `[S#]`.
   - **Night**: a "What happened today" log, 3–6 lines with icons (aria-live), then Next sol.
6. **Ending + Debrief**: badge (🏆 Mission Success / 🟡 Safe Return / 🔴 Brought Home Early, always *"Mission Control brings the crew home safely"*), the **3 biggest choices → what they caused → what real NASA planners do [S#]**, then Play again (same seed / new seed).
7. **Where our data comes from**: the sources used, grouped (real NASA data / facts / images / icons and fonts), the DONKI snapshot date and URL, a link to "How this game uses real data" (×15 note + honesty table + A-08 text), and the disclaimer.
8. **Settings**: tier, projector mode (large text), reduce motion, sound (off), reset progress.

**Implementation notes**
- A single `useGame()` hook holds the `GameState`, dispatches `Command`s to `reduce`, and saves to localStorage (wrapped in try/catch) so a game can be resumed.
- Components: `Meter`, `Chip`, `ActionCard`, `EventCard`, `AstronautCard`, `DoseBadge`, `PowerPlan`, `TaskPicker`, `NightLog`, `GlossaryTerm` (tooltip on first use), `SourceTag`, `Icon`.
- Until 17:00, build against `src/ui/fixtures/*.ts` (states typed by `types.ts`), then swap in the real engine.
- All kid-facing UI strings go in `src/content/copy.ts` (so Arabic stays possible later).

**Budgets and accessibility**
Tap targets ≥ 48 px · body text ≥ 18 px (projector ≥ 24 px) · contrast ≥ 4.5:1 · nothing shown by colour alone · fully keyboard-operable · visible focus · respects `prefers-reduced-motion` · JS ≤ 150 KB gzipped · first load ≤ 500 KB · no layout breaks at 360×640, 768×1024, 1024×768 or 1280×720.

**Definition of Done**
- [ ] M1 Cadet plays from Title to Debrief on the live URL with no console errors
- [ ] Every rule in spec §1.1 is visible where it applies (costs first, risk words, warnings, no scary words, teach on failure)
- [ ] Two people outside the lane (adults) finished M1 without help; their notes are in `docs/playtest-notes.md`
- [ ] It works at 360×640 (throttled: "Low-tier mobile" CPU + Fast 3G) and at 1024×768 in projector mode
- [ ] The Sources screen lists every `[S#]` M1 can show
- [ ] PROGRESS has the demo status and known bugs (P0/P1/P2)

**Demo by the end:** a full M1 run on a phone and a projector from the live URL (**G3**).
**Cut if late (in this order):** meet-the-crew screen → animations → the Base drawer details → glossary on everything except sol, dose, CME and CO₂ → resume-from-storage. **Never cut:** costs-first cards, the debrief, the Sources screen, the disclaimer.
**Judging boost:** Impact (kid-usable, phone + projector, no login) · Presentation (clear, polished loop) · Relevance (the trade-off is visible on every card).

---

### PHASE 5: Real-data mission (M3) + balance
**Time box:** Sun 07:00 → 12:00 · **Depends on:** G3 (M1 playable), Phase 3's DONKI timeline · **Lanes:** E (simulator), S (M3 science), U (M3 UI), L (approvals)

**Read first:** `CLAUDE.md`, `PROGRESS.md`, spec §1.4, §2.6, §5 and §8.2 (M3), and A-08…A-10.

**Goal:** M3 "Storm from the Sun" is playable with real DONKI beats and honest labels, and the simulator **shows with numbers** that every choice has a cost and no strategy dominates.

**Tasks**
1. **E: simulator.** `src/sim/bots.ts` with `random`, `maxShield`, `maxScience` (never repairs), `balanced` (heuristic value function with danger thresholds), and `bestMove` (1-step lookahead greedy). `scripts/simulate.ts` with `--mission --tier --games --bot all --seed-start` writes `docs/balance-report.md` + `docs/balance-report.json`. The report contains:
   - win / safe-return / brought-home rates per bot per mission
   - average SP, DOSE and ending causes
   - events seen per game (target: Cadet 8–12)
   - variety (≥ 70 % of the mission deck appears across 100 games; no two games have the same event list)
   - card coverage (every card chosen by `bestMove` at least once)
   - the static no-free-lunch result
   Also produce two simple charts (SVG) for the slides: win rate by strategy, and DOSE by strategy in M3.
2. **E + L: tuning loop.** Targets from spec §1.4: no strategy > 80 % · balanced 60–75 % · max-science loses most games. Change **only** `config.ts` values and card numbers. Batch every change into **one proposal table** (old → new, why, before/after win rates) in PROGRESS for the lead to approve. After approval, S updates the `.md` files + regenerates. Stop tuning at 11:30 whatever happens.
3. **S: M3 content.** Check every M3 label against its DONKI record. Write the "storm replay" intro screen text (real dates, *"seen from Earth; in this game we imagine it reached your base"*, A-08 dose note). Science-review SW-01…SW-07.
4. **U: M3 UI.** DONKI label chip (ARCHIVED · fetched <date> · replay), a storm warning countdown (≥ 1 sol, rule 7), dose badges, a storm visual (respects reduced motion), and the "How this game uses real data" screen made final.
5. *(Should, only if G4 is on track at 10:00)* Commander mode for M3 (3 cards, all numbers, MG-04 + the Commander events from §3.2) and M2 Cadet (PW-04 + dust timer every 3 sols).

**Definition of Done**
- [ ] M3 Cadet plays end to end on the live URL; every DONKI card shows its real date and label
- [ ] `docs/balance-report.md` committed for M1 + M3 Cadet with 1,000 games per bot
- [ ] Targets met, **or** each miss is listed with a reason and approved by the lead
- [ ] Every approved tuning change is reflected in the `.md` files; regeneration gives no diff
- [ ] No-free-lunch check: 100 % of shipped cards pass

**Demo by the end:** play M3 sols 2–7 (flare → cloud warning → hit → radiation storm, with real dates), then show the balance chart (**G4**).
**Cut if late:** Commander, M2, the `bestMove` coverage check (keep the static cost check), charts (use the table).
**Judging boost:** Relevance (shielding decisions linked to real space weather, the challenge's stand-out #1) · Validity (balance proven by simulation, honest scaling) · Creativity (a real 2024 storm replayed as a game).

---

### PHASE 6: Playtest, polish & code freeze
**Time box:** Sun 12:00 → 16:00 (**hard freeze 16:00**) · **Depends on:** G4 · **Lanes:** U (fixes), S (final science pass), L (playtests, freeze), P (images, teacher guide)

**Read first:** `CLAUDE.md`, `PROGRESS.md` (bug list), `docs/playtest-notes.md`.

**Goal:** a robust, accessible, fast and honest build, frozen and tagged `v1.0` at 16:00.

**Tasks**
1. **L: playtests** with at least 3 people (12:00–13:00). Each plays M1 then M3 while you note where they hesitate, what they mis-tap, what they say, and how long each sol takes. If any children play, have a parent present, and don't record or keep their faces, names or voices; none of it goes into submission material. Log the results in `docs/playtest-notes.md` and turn them into P0/P1/P2 bugs.
2. **U:** fix P0/P1, then the top P2 items.
   - Device matrix: a cheap Android in Chrome, iPhone Safari, a laptop + projector or 1024×768, Slow 3G throttling, and offline (if the PWA ships).
   - Lighthouse mobile: performance ≥ 90, accessibility ≥ 95.
   - Check the bundle against the budgets.
   - *(Should)* the PWA offline cache.
3. **S: final science pass.** Every fact on screen has an `[S#]`. The ×15 note and the A-08 storm note are visible. ARCHIVED labels are correct. No number appears in the UI without a source or a "game value" tag. The disclaimer is on the title and sources screens.
4. **P:** *(Should)* 4–6 NASA Mars photos as WebP ≤ 80 KB each, with credit lines on the Sources screen. *(Should)* `docs/teacher-guide.md`: one page covering how to run it in class on a projector, 3 discussion questions per mission, and which NASA science each event teaches.
5. **L:** finish the README (what it is, live URL, how to play, how to run locally, NASA data used → `docs/data-sources.md`, licences: MIT code, Twemoji CC-BY 4.0, Atkinson Hyperlegible OFL, image credits; AI-use note; disclaimer). At 16:00, merge, tag `v1.0`, and write "FROZEN" in PROGRESS.

**Definition of Done**
- [ ] No open P0/P1 bugs
- [ ] Lighthouse mobile performance ≥ 90 and accessibility ≥ 95 on the sol screen
- [ ] Playable at 360×640 and readable from the back of a room at 1024×768 in projector mode
- [ ] The science pass checklist is fully ticked in PROGRESS
- [ ] README complete; licence and credits present; no NASA logo anywhere in the repo or UI
- [ ] `v1.0` tagged and deployed; the live URL matches the tag

**Demo by the end:** the frozen live URL, plus the playtest quotes (anonymous) for the pitch.
**Cut if late:** PWA, photos, teacher guide (cut in that order). **Never cut** the science pass or the freeze.
**Judging boost:** Impact (accessible, works offline, classroom-ready, teacher guide) · Presentation (polish) · Validity (final fact check).

---

### PHASE 7: Submission package
**Time box:** drafts Sun 10:00 → 16:00 (P, alongside the others); production 16:00 → 19:00; **submit by 20:00**; buffer to 23:59 · **Depends on:** the 16:00 freeze for recording; the pasted Submission Guide · **Lanes:** P, L

**Read first:** `CLAUDE.md` (rules), `PROGRESS.md`, §8 of this file (checklist, updated from the 2026 guide), `docs/data-sources.md`, `docs/balance-report.md`.

**Goal:** a complete submission that follows the rules, sent at least 4 h before the deadline, with every link checked from a logged-out browser.

**Tasks**
1. **Demo video (≤ 30 s, English subtitles burned in)**: a screen recording of the frozen build only. **No faces, names or voices of minors.** The voice-over is an adult team member or text-to-speech; or skip the voice and use captions plus CC0 music, credited. Storyboard:
   - 0–3 s: "Can you keep 4 astronauts safe on Mars?" (title + live game)
   - 3–10 s: a choice with costs first: "Shield or science? Every choice costs something."
   - 10–18 s: the M3 DONKI card: "This storm really happened: NASA DONKI, May 2024 (archived data)."
   - 18–24 s: the consequence and debrief: "What real NASA planners do."
   - 24–30 s: "Free, no login, any phone or classroom projector. Mars Base Adventure, by Nova Knights" + URL + "Not affiliated with or endorsed by NASA."
   Export 1080p MP4, check the length (≤ 30.0 s), and upload it where the guide allows (public, no login needed).
2. **Slide deck (≤ 7 slides)**, required or as a backup per the guide, in `docs/submission/slides.md`, then exported:
   1. The problem (the challenge gap)
   2. Our game in one sol (the loop diagram)
   3. No free choice (a card with costs first + the no-free-lunch check)
   4. Real NASA data (DONKI, Curiosity RAD, Opportunity/Spirit/InSight, Phoenix, MOXIE, OSDR) + the honesty table
   5. Proof: balance simulation chart + playtest quotes
   6. Impact: ages 7–12, classrooms, cheap phones, offline, no login, open source
   7. Try it: URL + QR, team name, disclaimer
3. **Project page text** (`docs/submission/project-page.md`): title, a high-level summary, the detailed description (what it does, how it works, benefits, what we hope to achieve, tools and languages), NASA data used (with links), other references, and the **AI-use disclosure** (`docs/submission/ai-disclosure.md`: which tools, what for, that a human reviewed everything, and how AI-generated media is labelled if the guide requires it). Match every field and character limit to the pasted guide.
4. **L: final checks** (the §8 checklist): repo public, licence, README, live URL, video and slides links all opened in a **logged-out / incognito** browser.
5. **L: submit by 20:00.** Screenshot the confirmation into PROGRESS. If the guide allows edits until the deadline, submit a complete version at 18:00 and refine it afterwards.

**Definition of Done**
- [ ] Every item in the §8 checklist is ticked
- [ ] Video ≤ 30 s with English subtitles, or a deck ≤ 7 slides, per the guide
- [ ] Submitted; confirmation captured; all links work logged out
- [ ] PROGRESS: "SUBMITTED <time>"

**Demo by the end:** the submitted project page.
**Cut if late:** music, fancy transitions, the slides (if the video satisfies the guide), the second language.
**Judging boost:** Presentation (a tight 30-s story) · Validity (data-sources doc + honesty) · Impact (who it reaches and how).

---

### PHASE 8 (conditional): Live pitch
**Only if** the Cairo event has live judging (Q2). **Time box:** set after Q2, usually 2 h before the judging slot.
**Goal:** a 3-minute pitch with a live demo and a backup video, and ready answers to science questions.
**Tasks:**
- Script: hook → problem → 60-s live demo (M3 sols 2–7) → real data and honesty → proof (balance chart) → impact → ask.
- Rehearse twice with a timer.
- Q&A prep: "Is the data live?" → "Archived snapshot, labelled, fetched <date>." "Why ×15?" → "Slow processes sped up, ratios kept." "Is the storm dose real?" → the A-08 answer. "How do you know it's balanced?" → the simulator. "What about 60 events?" → "37 playable, 60 designed."
- Projector test, and a phone hotspot as backup.
**DoD:** two timed rehearsals ≤ 3:00, backup video on a laptop, a one-line answer for each likely question.

---

## 7. How each phase raises our score

| Phase | Impact | Creativity | Validity | Relevance | Presentation |
|---|---|---|---|---|---|
| 0 Pre-flight | | | ●● honesty fix (A-08), source plan | ●● scope covers all 5 challenge pillars | ● storyboard early |
| 1 Skeleton | ●● no-login URL from hour 2 | | ● tests from day one | | ●● a demo is always live |
| 2 Engine | | ●● seeded, replayable decks | ●●● faithful, tested rules | ●● trade-offs are real mechanics | |
| 3 Content & data | | ● real-record labels | ●●● [S#] on every card, audited sources | ●●● DONKI + OSDR + Mars mission data | ● data-sources doc |
| 4 Playable M1 | ●●● kids 7–12, phone + projector | ●● cost-first card design, debrief | ● teach on failure | ●● trade-off visible every turn | ●●● clear UI |
| 5 M3 + balance | ● | ●●● a real 2024 storm, replayed | ●●● simulation proof, honest scale | ●●● shielding ↔ real space weather | ● charts for slides |
| 6 Polish | ●●● accessible, offline, teacher guide | | ●● final fact check | | ●● polish |
| 7 Submission | ●● story of who it reaches | ● | ●● datasets explained | ● | ●●● 30-s video / 7 slides |

---

## 8. Submission checklist *(update from the 2026 guide when it's pasted; items marked [VERIFY] come from past years)*
- [ ] Demo: **video ≤ 30 s with English subtitles** OR **≤ 7 slides**, per the guide [VERIFY exact limits, format and hosting]
- [ ] Final project link: public GitHub repo + live URL
- [ ] Open-source licence (MIT) in the repo; third-party licences credited (Twemoji CC-BY 4.0, Atkinson Hyperlegible OFL, NASA image credits)
- [ ] No faces, names or voices of minors in any submission material (video, slides, photos, project page)
- [ ] No NASA logo or insignia anywhere; no implied endorsement; the disclaimer appears in the game, README, video end card and last slide
- [ ] NASA data listed with links (DONKI CCMC endpoint + snapshot date, the OSDR dataset, mission data pages)
- [ ] AI-use disclosure [VERIFY: past Space Apps guides asked teams to disclose AI tools and to label AI-generated images, video or audio]
- [ ] No static data presented as live ("ARCHIVED – fetched on <date>")
- [ ] Every link opened in a logged-out browser
- [ ] Submitted by 20:00, confirmation screenshot in PROGRESS

---

## 9. Risk register

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | Scope creep (60 events, 9 missions) | High | MVP freeze (§3), gates with cut triggers (§1) |
| R2 | Prose effects blow up the engine work | High | Overrides + named hooks; default to the simplest reading and log a proposal |
| R3 | Saturday-night integration crunch | Med | Contract-first types, UI built on fixtures, merges every 2 h, G2 at 17:00 |
| R4 | DONKI endpoint, fields or CORS differ from the spec | Med | Phase 0 curl check; snapshot early; never claim "live" |
| R5 | Science error spotted by a judge | Med | A-08 fix, source audit, science pass in Phase 6, honesty screen |
| R6 | Balance feels unfair or trivial | Med | Simulator by Sunday morning; tunable `config.ts`; batch approvals |
| R7 | Slow on cheap phones / broken emoji | Med | Preact, SVG icons, budgets, throttled tests |
| R8 | Rule violation (minors, logo, endorsement, AI disclosure) | Low | The §8 checklist, reviewed by two people |
| R9 | Agents overwrite each other's work | Med | File ownership, task claims in PROGRESS, worktrees, small PRs |
| R10 | Fatigue errors on Sunday | High | Sleep shifts, hard freeze at 16:00, submit at 20:00 |
| R11 | Deploy breaks at the last minute | Low | Deploy from hour 2; `main` always green; tag `v1.0` |

---

## 10. Open questions for the lead (answers change the plan)
- **Q1: Team.** How many people, who takes which lane (L/E/U/S/P), and who has Claude Code vs chat only? *(This decides lane merging and whether Commander/M2 stay Should.)*
- **Q2: Cairo judging.** Is there a live pitch or demo at the venue (when, how long, projector)? Is the local deadline earlier than Sun 23:59? *(This adds Phase 8 and may move the freeze and submit times earlier.)*
- **Q3: Arabic.** Should the game have an Arabic version for Cairo classrooms, and can a teammate write or check kid-level Arabic? *(If yes: right-to-left (RTL) layout support from Phase 1, and Arabic M1 becomes a Should.)*
