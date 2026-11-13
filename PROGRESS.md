# PROGRESS.md: shared state for humans and agents

> **Rules:** read this before you start. Update it before you stop. Edit only your own rows. Add new log entries **at the top**. Never delete someone else's entry. Times are Cairo (EET, UTC+2).
> Statuses: ⬜ not started · 🟡 in progress · ✅ done · ⛔ blocked · ✂️ cut · ⏳ awaiting approval

---

## Now
- **Current phase:** Phase 1 🟡 code done and green locally; **waiting for the GitHub repo + push** to get CI and the live URL. (Phase 0 leftovers: GitHub repo + Pages, Q2, Submission Guide, P-lane 0.8)
- **Language:** English only (lead, 13 Nov), so no RTL work. Q3 closed
- **Next gate:** G0, Fri 13 Nov 23:30 (blocking A-items decided ✅, repo exists ⬜ (local only), toolchains work 🟡)
- **Pre-event coding:** **allowed** (Q4), so Phase 1 can run tonight after `GO PHASE 1`
- **Repo:** local git only (no remote yet; name assumed `mars-base-adventure`, the Vite base depends on it) · **Live URL:** — (expected `https://<user>.github.io/mars-base-adventure/`) · **Latest tag:** —
- **Last updated:** 2026-11-13 18:00 by Claude (Phase 1, lanes U+E+S in the lead session)

## Clock
| Milestone | Planned (Cairo) | Actual |
|---|---|---|
| G0 spec freeze | Fri 13 Nov 23:30 | spec v0.3 frozen 17:45 (repo/Pages still open) |
| G1 live skeleton | Sat 14 Nov 11:00 | |
| G2 headless M1 game | Sat 14 Nov 17:00 | |
| G3 M1 playable on live URL | Sat 14 Nov 23:00 | |
| G4 M3 + balance report | Sun 15 Nov 12:00 | |
| G5 code freeze (`v1.0`) | Sun 15 Nov 16:00 | |
| G6 submitted | Sun 15 Nov 20:00 | |
| Official deadline | Sun 15 Nov 23:59 | — |

## Team
| Lane | Person | Tools (Claude Code / chat) | Notes |
|---|---|---|---|
| L Lead | (lead) | Claude Code | Team = **5 people, one per lane** (Q1). Names: lead to fill in |
| E Engine | ? | ? | |
| U UI | ? | ? | |
| S Content & science | ? | ? | |
| P Pitch & design | ? | ? | |

---

## Phase board
| Phase | Status | Owner | Planned | Actual start | Actual end | Notes |
|---|---|---|---|---|---|---|
| 0 Pre-flight & spec freeze | 🟡 | L | Fri 19:00–23:30 | 17:20 | | started early; see task board |
| 1 Skeleton, contracts, live URL | 🟡 | U | **Fri night** (was Sat 09:00–11:00) | 17:35 | | code ✅ locally; CI + live URL wait for the GitHub push |
| 2 Engine core | ⬜ | E | Sat 11:00–17:00 | | | |
| 3 Content & real data | ⬜ | S | Sat 11:00–16:00 | | | |
| 4 Playable M1 | ⬜ | U | Sat 11:00–23:00 | | | |
| 5 M3 + balance | ⬜ | E | Sun 07:00–12:00 | | | |
| 6 Playtest, polish, freeze | ⬜ | L | Sun 12:00–16:00 | | | |
| 7 Submission package | ⬜ | P | Sun 10:00–20:00 | | | |
| 8 Live pitch (conditional) | ⬜ | P | TBD (Q2) | | | |

## Task board (active phase)
| ID | Task | Lane | Owner / agent | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|
| 1.1 | Scaffold Vite + Preact + TS strict, scripts, Prettier, vite/vitest config, workflows, title screen, tokens, font, Icon | U | Claude (lead session) | ✅ | main (local) | Vite 8.3, Preact 11.2, TS 7.0, Vitest 5.1. JS 14.7 KB gz. Lighthouse mobile: perf 95 · a11y 100 · BP 100 · SEO 100. 360×640 + 1280×720 checked headless, no console errors |
| 1.2 | Contract v1: `types.ts`, `rng.ts` (+ tests), `config.ts`, `index.ts` stubs (+ `fixture.ts`) | E | Claude (lead session) | ✅ | main (local) | logged under Contract changes |
| 1.3 | `spec-extract.ts` v0 → `spec.json` (60 events, 61 sources) + `tests/content/extract.test.ts` | S | Claude (lead session) | ✅ | main (local) | also stubs: `check-content.ts` (v0 real checks), `fetch-donki.ts`, `simulate.ts` |
| 1.4 | Merge, CI green, live URL in Now | L | lead | ⛔ | — | **blocked on the GitHub repo** (no `gh` on this machine): create the repo, push, Pages → GitHub Actions |
| 0.1 | Ask the local lead: pre-event coding, live judging, local deadline, registration | L | lead | 🟡 | — | (a) pre-event coding **allowed** ✅ · (b) live judging, (c) local deadline, (d) registration still open |
| 0.2 | Paste the 2026 Submission Guide; agent updates PLAN §8 + Phase 7 | L | lead | ⬜ | — | **guide pending** (Q5) |
| 0.3 | Decide A-01…A-15 and N-01…N-08 (Proposals table below) | L | lead | ✅ | — | A-01…A-15 approved; N-01…N-07 use proposed default; N-08 closed |
| 0.4 | Answer Q1–Q3; fill in the Team table | L | lead | 🟡 | — | Q1 ✅ (5 people); Q2, Q3 open; names open |
| 0.5 | Apply approved decisions to the `.md` files (v0.3) + D-### entries | S | Claude (lead session) | ✅ | main (local) | spec v0.3 + kids guide; D-001…D-016 |
| 0.6 | Toolchains + public repo + Pages + first push of the docs | E/U | Claude (local part) | 🟡 | main (local) | local `git init`, MIT LICENSE, .gitignore, first commit ✅. **GitHub repo + Pages + push: needs a human** (no `gh` CLI on this machine). Lead machine: node v24.18.0 · npm 11.16.0 · git 2.34.1 · Claude Code (VS Code) ✅; other lanes ⬜ |
| 0.7 | DONKI curl check (status, fields, CORS) → Data notes | S | Claude (lead session) | ✅ | — | see Data notes; P-001, P-004 raised |
| 0.8 | Name, palette, call-signs, storyboard v0, image candidates + credits | P | | ⬜ | — | |
| 0.9 | *(optional)* paper playtest of 3 M1 sols | all | | ⬜ | — | |

---

## Proposals awaiting approval
Write **Approve / Modify (how) / Reject** in the Decision column. Full text: `PLAN.md §5`.

| ID | Summary | Blocks | Status | Decision (lead) |
|---|---|---|---|---|
| A-01 | Tasks planned in step 3, resolved at night after the event; fixed night order | Engine | ✅ | **Approve** → D-001 |
| A-02 | Power: base need = LS 2 + recycler 1 + greenhouse 1 (+ heaters); lab/comms paid only via task/card costs; solar = floor(4 × mult) − dust stacks | Engine | ✅ | **Approve** → D-002 |
| A-03 | PW-08 is the Power Plan's shortage mode (doesn't use the event slot) | Engine, UI | ✅ | **Approve** → D-003 |
| A-04 | Morning Briefing slot for timers (RS-04, CR-01) + FD-01 replant; automatic dust stacks; slot priority; 3-sol condition cooldown | Engine, replayability | ✅ | **Approve** → D-004 |
| A-05 | All SP starts pending; only banked SP counts; RS-04 also on the last sol | Engine, UI | ✅ | **Approve** → D-005 |
| A-06 | Superpowers = role-exclusive tasks/cards; listed cost = specialist price; RES ×2 only on tasks marked so; `repair` tag | Engine | ✅ | **Approve** → D-006 |
| A-07 | Shield tier = floor(SH/3), so +2 shield cards matter | Engine, balance | ✅ | **Approve** → D-007 |
| A-08 | Storm dose is ~10× real: keep values, add an honest "game-exaggerated" label (May 2024 ≈ 8 mGy at Mars) | Science, UI | ✅ | **Approve** → D-008 |
| A-09 | M3 = compressed storm replay; beats tied to real DONKI records with real dates | Content | ✅ | **Approve** → D-009 (see P-001) |
| A-10 | Badge colours 0–3 / 4–6 / 7–10; M3 goal = every DOSE ≤ 6 | Content, UI | ✅ | **Approve** → D-010 |
| A-11 | CR-07 at EN ≤ 1; the stat that hit 0 resets to 2 on leaving Sick Bay | Engine | ✅ | **Approve** → D-011 |
| A-12 | "Until fixed" = `broken:<system>` flag; ⏳ with no N = ⏳1; rule for when no card is affordable | Engine, content | ✅ | **Approve** → D-012 |
| A-13 | Missing numbers (EVA mishap 15 %, CR-04 20 %, science kit, MG-02 trigger, T-GARDEN, water-wall cap, risk words) | Engine | ✅ | **Approve** → D-013 |
| A-14 | 8-sol missions: lettuce vs radishes; Cadet pepper harvest = FOOD+8 automatically | Content | ✅ | **Approve** → D-014 |
| A-15 | LS-02 in Cadet = plain 2-card event (puzzle cut) | Content | ✅ | **Approve** → D-015 |
| N-01 | Greeting "Hello, Mission Leader!" (Cadet players aren't Commanders) | UI copy | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-02 | Word limits: titles/lessons ≤ 12, event text ≤ 20 (warnings) | Content | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-03 | Which kid text goes where (spec Kid text / guide True story / grown-ups panel) | Content, UI | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-04 | Add `<!-- ID -->` comments to kids-guide headings for mapping | Content | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-05 | Source audit (S18, S51 slugs; replace news re-posts with NASA originals; 3–21 vs 3–22 min) | Science | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-06 | SVG icon subset instead of system emoji | UI | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-07 | Hide LS-09.c until LS-10; SW-03 warning ≥ 1 sol | Content | 🟢 | **Use the proposed default**; apply in Phase 3/6 (formal approval later) |
| N-08 | If DONKI has no CORS: daily GitHub Action snapshot for "Today's Sun" (labelled with its date) | Data | ✅ | **Closed, not needed** → D-016 (GET sends `Access-Control-Allow-Origin: *`) |
| P-001 | **M3's big Mars storm (2024-05-20) has no DONKI SEP record and no ENLIL run with a Mars impact.** DONKI has it only as CME `2024-05-20T05:36:00-CME-001` (far side, O-type, ~1,927 km/s; notification `20240520-AL-001`). Proposed fix: tie M3's SW-02 beat (sol 7) to that CME record + [S6] for the Curiosity measurement. Label: *"NASA DONKI saw this cloud leave the far side of the Sun on 2024-05-20. Curiosity measured the radiation jump on Mars [S6]. Replay, sped up."* | M3 content (Phase 3/5), SW-02 label | ⏳ | |
| P-002 | **Morning Briefing collisions** (D-004 says "at most one per sol" but not which wins). Proposed: RS-04 > FD-01 > CR-01. A bumped RS-04 moves to the next sol (never bumped on the last sol); a bumped FD-01 auto-replants (as D-004 says); a bumped CR-01 is skipped and logged. `config.ts` default until approved | Engine | ⏳ | |
| P-003 | **`repair` tag card list** (D-006 adds the tag but not the set). Proposed: LS-01.a, LS-02.a, LS-03.a, LS-05.a, LS-07.a, LS-08.b, PW-09.a, PW-09.b, RS-03.a, RS-03.b, SW-10.a, CM-02.a, T-MAINT-LS, T-MAINT-LAB | Content, engine | ⏳ | |
| P-004 | **Spec §5 field notes from the real snapshot:** add ENLIL `impactList[].isMinorImpact`; `impactList` can be `null` (35/128 runs); FLR `linkedEvents` can be `null` (129/181); "no impact to Earth" = `estimatedShockArrivalTime == null` (plus `isEarthGB`, `isEarthMinorImpact`); CME speed type letters S/C/O/R/ER; `notifications.messageType` values FLR, CME, SEP, GST, Report, IPS, MPC, RBE. Also fix the §0 note: old `api.nasa.gov/DONKI` now returns **404 JSON**, not HTML. Add "CORS ✔ (GET)" to §5 | Spec §5 text, parser | ⏳ | |

## Decisions log (approved)
| D-### | Date / time | Decision | From | Files updated | Commit |
|---|---|---|---|---|---|
| D-001 | 2026-11-13 17:40 | Tasks planned in step 3, resolved at the start of Night; fixed 10-step night order | A-01 | spec §2.4, §4 | P0 first commit |
| D-002 | 2026-11-13 17:40 | Base power need = LS 2 + recycler 1 + greenhouse 1 (+ heaters); lab/comms only via costs; solar = floor(4 × mult) − stacks, + reactor 2; budget = PWR + BAT | A-02 | spec §2.1 | P0 first commit |
| D-003 | 2026-11-13 17:40 | PW-08 = Power Plan shortage mode, no event slot; later need → battery, else LS unpowered (LS −2) | A-03 | spec §2.1, §2.4, PW-08, §6, §8.3 | P0 first commit |
| D-004 | 2026-11-13 17:40 | Morning Briefing slot (RS-04, CR-01, FD-01 re-plant); automatic dust stacks; slot priority; displaced chain waits 1 sol; 3-sol condition cooldown | A-04 | spec §2.4, PW-02, FD-01, CR-01, RS-04, §8.3, §10; kids guide | P0 first commit |
| D-005 | 2026-11-13 17:40 | All SP starts pending; only banked SP counts; RS-04 also on the last sol; MG-02.a counts banked SP | A-05 | spec §2.5, RS-04, MG-02 | P0 first commit |
| D-006 | 2026-11-13 17:40 | Superpowers = role-exclusive tasks/cards; listed cost = specialist price; fallback pays costs even on failure; RES ×2 only on marked tasks; `repair` tag | A-06 | spec §2.3, §3, §10; kids guide | P0 first commit |
| D-007 | 2026-11-13 17:40 | Shield tier = floor(SH/3); background halved at tier ≥ 2. Side effect: Commander start SH 3 is now tier 1 | A-07 | spec §2.6 | P0 first commit |
| D-008 | 2026-11-13 17:40 | Storm doses labelled game-exaggerated; honesty label text (≈ 8 mGy real, 30 chest X-rays [S6]; +4 ≈ 250 mSv limit [S9]) | A-08 | spec §2.6 | P0 first commit |
| D-009 | 2026-11-13 17:40 | M3 = compressed storm replay with real record dates; calendar rule only for Free Play / Today's Sun | A-09 | spec §5, §8.2 | P0 first commit |
| D-010 | 2026-11-13 17:40 | Badge colours 0–3 / 4–6 / 7–10; M3 goal every DOSE ≤ 6 | A-10 | spec §1.2, §2.6, §8.2; kids guide | P0 first commit |
| D-011 | 2026-11-13 17:40 | CR-07 at EN ≤ 1; stat that hit 0 resets to 2 on leaving Sick Bay | A-11 | spec §2.2, CR-07, §6; kids guide | P0 first commit |
| D-012 | 2026-11-13 17:40 | `broken:<system>` flags; ⏳ with no N = ⏳1; reveal c / "We can't fix it today" | A-12 | spec §3, §4 | P0 first commit |
| D-013 | 2026-11-13 17:40 | EVA mishap 15 %; CR-04 20 %; science kit tasks; MG-02 trigger + 3-sol cooldown; T-GARDEN late rule; water wall ≤ +2; Cadet risk words | A-13 | spec §3, §4, FD-04, CR-04/05/06, MG-02, §6 | P0 first commit |
| D-014 | 2026-11-13 17:40 | 8-sol missions: lettuce vs radishes; Cadet pepper pollination automatic (FOOD+8) | A-14 | spec FD-01 | P0 first commit |
| D-015 | 2026-11-13 17:40 | LS-02 is a plain 2-card Cadet event; puzzle → Could | A-15 | spec LS-02, §6; kids guide | P0 first commit |
| D-016 | 2026-11-13 17:40 | N-08 closed: DONKI GET sends `Access-Control-Allow-Origin: *`, so Today's Sun may fetch in the browser. Still say LIVE only when it really is fetched live | N-08 | PROGRESS (spec text via P-004) | P0 first commit |

## Open questions
| ID | Question | Asked | Answer |
|---|---|---|---|
| Q1 | Team size, lane per person, Claude Code vs chat only? | 13 Nov | **5 people, one per lane.** Names and tools: lead to fill in the Team table |
| Q2 | Live pitch/demo at Cairo (when, length, projector)? Local deadline earlier than Sun 23:59? | 13 Nov | |
| Q3 | Arabic version wanted, and can a teammate write/check kid-level Arabic? | 13 Nov | **No: the game is English only** (lead, 13 Nov) |
| Q6 | `general-theme.jpeg` shows the **NASA logo** and `inside-game-theme.jpg` shows realistic AI faces. Both are kept out of git (`.gitignore`). Keep them as private mood boards only? | 13 Nov | |
| Q4 | Pre-event coding allowed? (lead checking with the local lead) | 13 Nov | **Yes, allowed** (lead, 13 Nov 17:40) |
| Q5 | 2026 Project Submission Guide: pasted? | 13 Nov | Not yet. **Guide pending** |

## Data notes (DONKI and other datasets)
**DONKI check, 2026-11-13 17:25 Cairo** (curl; window 2024-05-01 → 2024-05-31; raw JSON kept outside the repo, nothing committed)

| Endpoint | HTTP | Records | Real fields (vs spec §5) |
|---|---|---|---|
| `FLR` | 200 JSON | 181 (155 M, 21 X, 5 C) | `classType` ✔ `peakTime` ✔ `linkedEvents` ✔ (**null in 129/181**), also `beginTime`, `endTime`, `sourceLocation`, `activeRegionNum`, `flrID`, `instruments[].displayName` |
| `SEP` | 200 JSON | 14 | `eventTime` ✔ `linkedEvents` ✔ (never null here) `instruments` ✔ (`[{displayName}]`), `sepID` |
| `CME` | 200 JSON | 144 | `cmeAnalyses[].speed` ✔ `.isMostAccurate` ✔, plus `.type` (S/C/O/R/ER), `.latitude/.longitude`, `.halfAngle`, `.enlilList[]` (nested ENLIL runs) |
| `CMEAnalysis` | 200 JSON | (110 KB) | not parsed (CME has the analyses embedded) |
| `WSAEnlilSimulations` | 200 JSON | 128 | `impactList[].location` ✔ `.arrivalTime` ✔ `.isGlancingBlow` ✔, plus **`.isMinorImpact`**; `impactList` **null in 35/128**; Earth arrival = `estimatedShockArrivalTime` (null = no Earth impact), `isEarthGB`, `isEarthMinorImpact`, `cmeInputs[]`, `modelCompletionTime`, `simulationID` |
| `notifications` | 200 JSON | 172 | `messageType` ✔ `messageIssueTime` ✔ `messageBody` ✔, plus `messageID`, `messageURL`. Types: FLR 72, CME 51, SEP 16, GST 15, Report 6, IPS 5, MPC 5, RBE 2 |
| `GST` / `IPS` | 200 JSON | 5 / 14 | not used for Mars (spec §5). Field is `allKpIndex` |

- **CORS ✔:** `GET` with `Origin: https://example.github.io` → `Access-Control-Allow-Origin: *`. A preflight `OPTIONS` → `ACAO: *`, `Allow-Methods: GET`. ⚠️ The plan's `curl -sI` (HEAD) shows **no** ACAO header, only `Vary: Origin`, so test with GET. → D-016.
- **60-day limit confirmed:** a longer range returns HTTP 400 `"API Error: Date range cannot exceed 60 days. You requested 106 days."`
- **Old endpoint:** `api.nasa.gov/DONKI/FLR` → **404 JSON** (spec says "HTML page"; see P-004).
- DNS for `ccmc.gsfc.nasa.gov` was flaky during the check (a few "could not resolve host" errors that worked on retry). `fetch-donki.ts` should retry 3× with a backoff.
- **ENLIL runs with a Mars impact: 33** (18 not glancing). Good M3 candidates (model run → predicted Mars arrival):
  - `WSA-ENLIL/30726/1` completed 05-11 13:57Z → Mars **05-13 17:42Z**, not glancing (≈ 2-sol warning) ← suits SW-03 → SW-04
  - `WSA-ENLIL/30783/1` 05-12 15:46Z → Mars 05-13 23:50Z; `30801/1` 05-13 00:35Z → Mars 05-14 06:18Z (both not glancing)
  - CMEs of 2024-05-15 08:36Z / 08:48Z / 10:00Z → Mars **05-17 14:19Z** (weekly report `20240522-7D-001`; runs `30925/1` etc.)
  - Glancing: `30367/1`, `30364/1` → Mars 05-05 16:00Z; `31014/1`, `31015/1` → Mars 05-21 18:00Z
- **Biggest flares (FLR):** X8.7 2024-05-14 16:51Z · X5.8 05-11 01:23Z · X4.5 05-06 06:35Z · X3.9 05-10 06:54Z · X3.4 05-15 08:37Z. Spec map: ≥X5 → S=4, X1–X4 → S=3.
- **SEP records:** 14, on 05-09, 05-10, 05-11 and 05-13 (GOES, SOHO, ACE models, STEREO A). **None on 2024-05-20.**
- **2024-05-20 (Curiosity's big surge, [S6]):** DONKI has **no SEP and no ENLIL run with a Mars impact**. It has CME `2024-05-20T05:36:00-CME-001`: a "fast halo, believed backsided" CME, most-accurate speed 1,927 km/s (O-type; another analysis 2,678 km/s), direction lon 176° (the far side of the Sun from Earth, toward Mars). Notification `20240520-AL-001` (15:52Z) predicts hits at Solar Orbiter and Juno only. The FLR list shows no ≥M5 flare that day (the flare was on the far side). → **P-001**.
- **For the honesty labels:** every May 2024 FLR/SEP record is seen from Earth's side (GOES/SOHO/ACE/STEREO A), so spec §5 wording applies ("seen from Earth; in this game we imagine…"). ENLIL Mars arrivals are model predictions: "NASA's model predicted…".

## Contract changes (`src/engine/types.ts` / public API)
| Version | Time | Change | Why | Who must adapt |
|---|---|---|---|---|
| v1 | 2026-11-13 17:50 | First contract. `src/engine/types.ts` (GameState, Astronaut, Command, EventDef, ActionDef, TaskDef, Effect, Delayed, ScheduledEffect, Modifier, Mission, Pending, DonkiRef, CardView, Chip, TaskOption, PowerBudget, LogEntry, ChoiceRecord, Ending, Debrief) + `index.ts` API: `newGame(opts)`, `reduce(state, cmd)`, `selectMeters`, `selectCards`, `selectTaskOptions`, `selectPowerBudget`, `selectLog`, `shieldTier`, `badgeColour`, `riskWords`. `newGame`/`reduce`/`selectCards`/`selectTaskOptions` are **stubs** over `fixture.ts` (the stub `reduce` only walks the phase loop). Commands: CHOOSE, CONTINUE, SET_POWER, CONFIRM_POWER, PLAN_TASK, CONFIRM_TASKS, END_MISSION. Log entries carry a `copy.ts` key + params, not text | Phase 1 | U builds screens on the selectors; S emits `EventDef`/`ActionDef` in Phase 3; E replaces the stubs in Phase 2 (keep the signatures) |

## Requests between lanes
| From → To | File | Request | Status |
|---|---|---|---|
| U → P | `src/ui/styles/tokens.css` | Palette v0 is a placeholder (Mars orange #B5420F, cost red #B3261E, effect green #1B6E35, info blue #1F5FA8, dark theme). P: confirm or replace it in task 0.8 | open |
| E → P | `src/engine/fixture.ts` | Placeholder call-signs Nova / Bolt / Echo / Sky (MGR / ENG / MED / RES). P: confirm 4 gender-neutral call-signs (task 0.8) | open |

## Science review log
| Event / screen | Reviewer | ✔ / ✖ | Note |
|---|---|---|---|
| — | | | |

## Bugs
| ID | Severity (P0/P1/P2) | Where | Description | Owner | Status |
|---|---|---|---|---|---|
| — | | | | | |

## Risks (live)
- R1 scope creep · R3 Saturday-night integration crunch · R5 science error spotted by a judge (A-08 pending) · R10 fatigue. Full register: `PLAN.md §9`.

## Demo status
| What | Where | Works? | Last checked |
|---|---|---|---|
| Title screen + data sources + settings (projector mode) | local `npm run dev` / `npm run preview` → http://localhost:4173/mars-base-adventure/ | ✅ | 13 Nov 17:55 |
| Live URL | GitHub Pages | ⬜ (needs the repo) | — |

## Time used vs plan
| Phase | Planned h | Actual h | Delta | Note |
|---|---|---|---|---|
| Planning (this session) | — | — | — | PLAN / CLAUDE / PROGRESS written |
| 0 Pre-flight | 4.5 | 0.5 | −4.0 | agent-run; repo/Pages still open |
| 1 Skeleton | 2.0 | 0.5 | −1.5 | local only until the push |

---

## Handoff (latest only; older ones move into the Session log)
```
HANDOFF 2026-11-13 18:00 Cairo · from Claude (lead session, lanes U+E+S) · Phase 1 🟡 (code done, deploy blocked)
Repo: — (local git, branch main) · Live: — · Branch: main · Last commit: see `git log -1`
State: Vite 8 + Preact 11 + TS strict skeleton. Title screen (Play disabled), "Where our data comes from" (all 61 [S#]
       from spec.json + credits), Settings (projector mode), NASA disclaimer footer, light/dark tokens, Atkinson font, 5 Twemoji icons.
       Contract v1 (types/rng/config/index stubs) + spec-extract v0. typecheck ✔ · 28 tests ✔ · check:content ✔ · build ✔ (14.7 KB gz JS).
Next: (1) Human: create the public GitHub repo `mars-base-adventure` (if the name differs, change `base` in vite.config.ts),
         `git remote add origin … && git push -u origin main`, Settings → Pages → Source "GitHub Actions"; confirm CI green + URL on a phone
      (2) E, Phase 2: replace the stubs in src/engine/index.ts (notation.ts, power, night order D-001, deck §8.3/D-004)
      (3) S, Phase 3: extend scripts/spec-extract.ts to the §7 card tables + §4 tasks; fetch-donki.ts; full check-content.ts
      U, Phase 4: build screens on the selectors in src/engine/index.ts (fixture-backed now)
Blocked on: the GitHub repo (1.4); P-001…P-004; Q2; Submission Guide (Q5); P-lane palette + call-signs (Requests)
Watch out: the stub reduce() only walks phases, it applies NO rules. Log entries use copy.ts keys.
           spec.json is generated (a test fails if it's stale → run `npm run spec:extract`).
           CORS must be tested with GET. Never commit general-theme.jpeg (NASA logo).
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 2 / 3 / 4 (per lane)
```

### Previous handoff (Phase 0)
```
HANDOFF 2026-11-13 17:50 Cairo · from Claude (lead session, lanes L+S) · Phase 0 🟡 (core done, setup items open)
Repo: — (local git only, branch main) · Live: — · Branch: main · Last commit: see `git log -1`
State: Spec frozen at events-and-actions.md v0.3 (D-001…D-015 applied, every [S#] kept) + kids guide updated.
       DONKI checked: all endpoints 200 JSON, CORS ✔ on GET, real field names + M3 candidates in Data notes.
       Lead machine toolchain OK (node 24.18, npm 11.16, git 2.34, Claude Code). Pre-event coding ALLOWED.
Next: (1) Human: create public GitHub repo `mars-base-adventure`, add remote, `git push -u origin main`,
         Settings → Pages → Source "GitHub Actions" (task 0.6)
      (2) Lead: decide P-001…P-004; answer Q2 (live pitch/deadline), Q3 (Arabic), Q6 (theme images); fill in Team names;
          paste the 2026 Submission Guide (0.2)
      (3) P lane: task 0.8 (palette, call-signs, storyboard v0, image credits) → docs/submission/ (allowed now)
      Then `GO PHASE 1` (tonight, since pre-event coding is allowed).
Blocked on: P-001 (M3 SW-02 beat record), P-002 (briefing collisions, engine can use the default), Q2, Q3, Q5.
Watch out: D-007 makes Commander start at shield tier 1 (was 0). CORS must be tested with GET, not HEAD.
           The theme images (one has the NASA logo) are .gitignored; never commit them.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 1
```

## Session log (newest on top)
| When (Cairo) | Lane / agent | What changed | Files |
|---|---|---|---|
| 2026-11-13 17:35–18:00 | Claude (lead session, U+E+S) | Phase 1: scaffold, workflows, title/sources/settings screens, tokens, font, icons; contract v1 (types, rng + tests, config, index stubs, fixture); spec-extract v0 + spec.json + extract tests; script stubs; README. Q3 → English only | `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, `src/**`, `scripts/**`, `tests/**`, `public/**`, `.github/workflows/**`, `README.md`, `PROGRESS.md` |
| 2026-11-13 17:20–17:50 | Claude (lead session, L+S) | Phase 0: DONKI curl check → Data notes; lead approved A-01…A-15 (N = defaults, N-08 closed); applied D-001…D-016 → spec v0.3 + kids guide; raised P-001…P-004, Q6; local git init + MIT LICENSE + .gitignore + first commit | `events-and-actions.md`, `mars-adventure-kids-guide.md`, `PROGRESS.md`, `LICENSE`, `.gitignore` |
| 2026-11-13 | Claude (planning) | Read challenge + spec v0.2 + kids guide; wrote the phase plan, MVP scope, stack, 15 blocking + 8 non-blocking spec issues, agent rules, shared state | `PLAN.md`, `CLAUDE.md`, `PROGRESS.md` |
