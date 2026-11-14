# PROGRESS.md: shared state for humans and agents

> **Rules:** read this before you start. Update it before you stop. Edit only your own rows. Add new log entries **at the top**. Never delete someone else's entry. Times are Cairo (EET, UTC+2).
> Statuses: ⬜ not started · 🟡 in progress · ✅ done · ⛔ blocked · ✂️ cut · ⏳ awaiting approval

---

## Now
- **Current phase:** Phase 6 🟡 **live-action game, four feedback rounds applied by the agent (14 Nov)**: rounds 4–6 (D-031…D-049) + round 7 = Casual / Survival modes with a high-score board, oxygen and shield that wear down, useful health check, 26 skills shown once, Nova's voice, separate sound switches, hover tick, title "Nova Knights Adventure" (D-050…D-058, spec v0.11). Not committed yet (lead to review). **Still needs people**: kid playtests, real phones, GitHub deploy, `v1.0` freeze. The claude.ai preview link still shows the OLD card game.
- **Language:** English only (lead, 13 Nov), so no RTL work. Q3 closed
- **Big change:** D-017 shared crew stats (lead, 13 Nov): one crew card (FUL/HYD/AIR/EN pools 0–20, one DOSE badge). Spec v0.4.
- **Next gate:** G0, Fri 13 Nov 23:30 (blocking A-items decided ✅, repo exists ⬜ (local only), toolchains work 🟡)
- **Pre-event coding:** **allowed** (Q4), so Phase 1 can run tonight after `GO PHASE 1`
- **Repo:** local git only (no remote yet) · **Live URL:** https://nova-knights-hazel.vercel.app/ (Vercel production, public, deployed by the lead 14 Nov from the working tree; redeploy with `npx vercel --prod`) · old preview (card game): https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio · **Latest tag:** —
- **Last updated:** 2026-11-14 05:00 by Claude (lead feedback round 7)

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
| 2 Engine core | ✅ | E | Sat 11:00–17:00 | Fri 17:55 | Fri 18:37 | local; CI pending the push |
| 3 Content & real data | ✅ | S | Sat 11:00–16:00 | Fri 18:50 | Fri 19:07 | 112 tests; check:content ✔ |
| 4 Playable M1 | 🟡 | U | Sat 11:00–23:00 | Fri 18:40 | | simplified per lead feedback (D-018…D-020); automated checks green; needs 2 adult playtests + real phone |
| 5 M3 + balance | ✅ | E | Sun 07:00–12:00 | Fri 19:35 | Fri 20:35 | lead asked for a harder game → D-030 (goal 14); report regenerated. Miss: best move 82 % (> 80 % by 2) — skilful play rewarded; lead to accept |
| 6 Playtest, polish, freeze | 🟡 | L | Sun 12:00–16:00 | Fri 20:30 | | agent part done; human playtests + deploy + `v1.0` tag open |
| 7 Submission package | ⬜ | P | Sun 10:00–20:00 | | | |
| 8 Live pitch (conditional) | ⬜ | P | TBD (Q2) | | | |

## Task board (active phase)
| ID | Task | Lane | Owner / agent | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|
| 1.1 | Scaffold Vite + Preact + TS strict, scripts, Prettier, vite/vitest config, workflows, title screen, tokens, font, Icon | U | Claude (lead session) | ✅ | main (local) | Vite 8.3, Preact 11.2, TS 7.0, Vitest 5.1. JS 14.7 KB gz. Lighthouse mobile: perf 95 · a11y 100 · BP 100 · SEO 100. 360×640 + 1280×720 checked headless, no console errors |
| 1.2 | Contract v1: `types.ts`, `rng.ts` (+ tests), `config.ts`, `index.ts` stubs (+ `fixture.ts`) | E | Claude (lead session) | ✅ | main (local) | logged under Contract changes |
| 1.3 | `spec-extract.ts` v0 → `spec.json` (60 events, 61 sources) + `tests/content/extract.test.ts` | S | Claude (lead session) | ✅ | main (local) | also stubs: `check-content.ts` (v0 real checks), `fetch-donki.ts`, `simulate.ts` |
| 1.4 | Merge, CI green, live URL in Now | L | lead | ⛔ | — | **blocked on GitHub login**: two device-code logins expired unapproved. `gh` 2.104 is downloaded (scratchpad); run the login, then the agent creates the repo + pushes |
| 3.1 | `fetch-donki.ts` + May 2024 snapshot (6 types, 778 records) in `data/donki/` | S | Claude (lead session) | ✅ | main (local) | `{fetchedAt, source, data}`, ≤ 60 days, 3 retries |
| 3.2 | `build-donki-timeline.ts` → `src/content/donki/m3-may2024.json`; M3 uses it | S | Claude (lead session) | ✅ | main (local) | sol 2 FLR X3.9 (05-10) · sol 4 ENLIL 30726/1 → Mars 05-13 · sol 7 SEP 05-13; labels per spec §5 + "Replay, sped up" + "ARCHIVED – fetched on" |
| 3.3 | Source audit (43 sources of the Must events + honesty table) → `sourceAudit.ts`, `sources.ts` (publisher, NASA-primary, verifiedAt) | S | Claude (lead session) | ✅ | main (local) | 37 ok · 5 problems (P-008) · 3 blocked to scripts |
| 3.4 | `stories.ts` (60 kids-guide True stories by ID + [S#]) · `glossary.ts` (23 Word-helper words + aliases) · in-game tap-to-explain terms | S | Claude (lead session) | ✅ | main (local) | guide mapped by section + order (N-04 not applied) |
| 3.5 | Full `check-content` (`src/content/check.ts`) + content/DONKI tests | S | Claude (lead session) | ✅ | main (local) | 0 errors · 115 warnings (107 non-Must prose cells, 8 source flags) |
| 3.6 | `docs/data-sources.md` v1 | S | Claude (lead session) | ✅ | main (local) | datasets, M3 records, honesty table, audit |
| 3.7 | Science review of the 37 Must events | S | Claude (lead session) | ✅ | — | see Science review log |
| 4.x | Playable cockpit UI (design canvas) + preview link | U | Claude (lead session) | ✅ | main (local) | asked by the lead ahead of Phase 4 |
| 4.1 | D-018 kid scope (10 events), D-019 4 jobs per astronaut, D-020 no morning/power screens → engine `Mission.events/setup/jobs`, spec v0.5 §8.4 | E/S | Claude (lead session) | ✅ | main (local) | chains out of scope never happen or show |
| 4.2 | UI rebuilt for ages 7–12: resources board on the LEFT, short text, 2 big cards, jobs one astronaut at a time on phones, night report with "You learned", short debrief | U | Claude (lead session) | ✅ | main (local) | 27 clicks per M1 game (was 46) |
| 4.3 | Settings: projector, less movement, start over · Sources: DONKI archive line · How to play: 4 lines + word helper | U | Claude (lead session) | ✅ | main (local) | meet-the-crew screen cut (first on the cut list) |
| 4.4 | Perf: card notation parsed at build time (`content.json`) | S/U | Claude (lead session) | ✅ | main (local) | Lighthouse perf 86 → 93 |
| 4.5 | Automated checks: 1280×800, 360×640, 1024×768 projector, 4× CPU + Fast 3G, Lighthouse | U | Claude (lead session) | ✅ | — | see `docs/playtest-notes.md` |
| 4.6 | Two adult playtests of the game without help → `docs/playtest-notes.md` | L/P | people | ⬜ | — | needs humans |
| 4.7 | Lead feedback round 2: D-021 one game (no difficulty choice) · D-022 guided first sol (highlights, only the taught button works) · D-023 base LEFT / crew RIGHT · D-024 jobs one astronaut at a time | U | Claude (lead session) | ✅ | main (local) | tutorial verified headless on laptop + phone |
| 4.8 | Kid critique (7–12) → D-025 fixes: lettuce vs radishes in the 10-sol game (pepper trap), pepper fallback food, "badge went up" lines, badge "turns red at 7" + yellow/red morning warnings, broken-machine fix hints, debrief "Next time" tip, no repeated ending words, kid dates, "a sol is a day on Mars" | U/E/S | Claude (lead session) | ✅ | main (local) | |
| 5.1 | Bots: random, maxShield, maxScience (never repairs), balanced, bestMove (1-step lookahead) | E | Claude (lead session) | ✅ | main (local) | `src/sim/bots.ts` |
| 5.2 | `npm run sim -- --report` → `docs/balance-report.md` + `.json` + `docs/charts/winrate.svg`, `dose.svg` (1,000 games per bot, M3 + M1) | E | Claude (lead session) | ✅ | main (local) | |
| 5.3 | Tuning experiments (goal 12, reactor 1, both) → proposal P-010 | E/L | Claude (lead session) | ⏳ | — | **lead to decide** |
| 5.4 | M3 UI: particle warning in the morning (rule 7), storm glow (respects less movement), storm-replay honesty line in the briefing | U/S | Claude (lead session) | ✅ | main (local) | |
| 5.6 | Lead feedback round 3 → D-026 14 challenges / one per day / no planting · D-027 surprise first + 10 s timer (worst card on timeout; 20 s/off setting) · D-028 3 big jobs · D-029 fewer words, "?" science, hover previews, no night screens, day-by-day story · D-030 goal 14 | E/U/S | Claude (lead session) | ✅ | main (local) | 1,000 games: random 31 % · balanced 77 % · best move 82 % · max shield 70 % · greed 8 % |
| 6.1 | Playtests with 3 people → `docs/playtest-notes.md` | L | people | ⬜ | — | needs humans |
| 6.2 | Device matrix: headless 1280×860, 360×640, 1024×768 projector, 4× CPU + Fast 3G ✅ · real cheap Android, iPhone Safari ⬜ | U | Claude + people | 🟡 | — | |
| 6.3 | Lighthouse mobile (idle CPU): performance 96 · accessibility 100 · best practices 100. Accessibility: axe-core WCAG A/AA on title, briefing, surprise, jobs, debrief → 0 violations · keyboard: all native buttons, focus rings, Esc closes menus, timer adjustable | U | Claude (lead session) | ✅ | — | |
| 6.4 | Science pass (checklist below) | S | Claude (lead session) | ✅ | — | 2 items for people (P-008 links) |
| 6.5 | `docs/teacher-guide.md` (projector, class vote, 3 questions, science table with [S#]) | P | Claude (lead session) | ✅ | main (local) | |
| 6.6 | README complete (how to play, teacher guide, data, licences, AI note, disclaimer) | L | Claude (lead session) | ✅ | main (local) | |
| 6.7 | PWA offline · NASA photos (P-009) | U/P | — | ✂️ | — | cut per the Phase 6 cut list (PWA first, photos second) |
| 6.8 | Freeze: merge, tag `v1.0`, deploy | L | lead | ⬜ | — | agent tagged `v1.0-rc1` locally; real `v1.0` after playtests + GitHub |
| 5.5 | M3 labels checked against DONKI records (generated from the snapshot, tests) · science review SW-01, SW-02 | S | Claude (lead session) | ✅ | — | see Science review log |
| 2.1 | D-017 shared crew stats → spec v0.4 + kids guide | S | Claude (lead session) | ✅ | main (local) | §1.2, §1.3, §2.2 rewritten; SW-07, CR-07 adjusted; P-005 for SW-06/MG-04 |
| 2.2 | spec-extract: §7 card tables + §4 tasks → spec.json | S | Claude (lead session) | ✅ | main (local) | 60 details, 18 tasks; needed by the engine (pulled forward from Phase 3) |
| 2.3 | `overrides.ts` (all 37 MVP events + tasks), `missions.ts` (M1 + draft M3), `content/index.ts`, `copy.ts` log/chip/reason text, `format.ts` | S | Claude (lead session) | ✅ | main (local) | 0 MVP prose cells left; 107 non-MVP cells → Phase 3 |
| 2.4 | Engine: notation, who, state, effects, hooks, power, radiation, crew, greenhouse, tasks, deck, events, night, endings, debrief, reduce, selectors, `createEngine` | E | Claude (lead session) | ✅ | main (local) | contract v2 |
| 2.5 | Sim: random + balanced bots, `npm run sim` | E | Claude (lead session) | ✅ | main (local) | M1 seed 42 log is byte-identical across runs |
| 2.6 | Tests: notation (70 real strings), who, power, radiation, upkeep, Sick Bay, endings, deck, stuck rule, 50 seeds, determinism, purity, content | E | Claude (lead session) | ✅ | main (local) | 102 passing |
| 0.1 | Ask the local lead: pre-event coding, live judging, local deadline, registration | L | lead | 🟡 | — | (a) pre-event coding **allowed** ✅ · (b) live judging, (c) local deadline, (d) registration still open |
| 0.2 | Paste the 2026 Submission Guide; agent updates PLAN §8 + Phase 7 | L | lead | ⬜ | — | **guide pending** (Q5) |
| 0.3 | Decide A-01…A-15 and N-01…N-08 (Proposals table below) | L | lead | ✅ | — | A-01…A-15 approved; N-01…N-07 use proposed default; N-08 closed |
| 0.4 | Answer Q1–Q3; fill in the Team table | L | lead | 🟡 | — | Q1 ✅ (5 people); Q2, Q3 open; names open |
| 0.5 | Apply approved decisions to the `.md` files (v0.3) + D-### entries | S | Claude (lead session) | ✅ | main (local) | spec v0.3 + kids guide; D-001…D-016 |
| 0.6 | Toolchains + public repo + Pages + first push of the docs | E/U | Claude (local part) | 🟡 | main (local) | local `git init`, MIT LICENSE, .gitignore, first commit ✅. **GitHub repo + Pages + push: needs a human** (no `gh` CLI on this machine). Lead machine: node v24.18.0 · npm 11.16.0 · git 2.34.1 · Claude Code (VS Code) ✅; other lanes ⬜ |
| 0.7 | DONKI curl check (status, fields, CORS) → Data notes | S | Claude (lead session) | ✅ | — | see Data notes; P-001, P-004 raised |
| 0.8 | Name, palette, call-signs, storyboard v0, image candidates + credits | P | | ⬜ | — | |
| 0.9 | *(optional)* paper playtest of 3 M1 sols | all | | ⬜ | — | |
| 6.9 | **Live-action rebuild** (lead feedback round 4): dollhouse scene, tools + mini-games, moods, sound, rewards, Training room (D-031…D-034) | U + S | Claude (lead session) | ✅ (awaiting lead review + commit) | main (working tree) | spec v0.8; 132 tests; JS 98 KB gz; headless phone + desktop runs clean |

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
| P-001 | ~~Superseded (Phase 3): M3's SW-02 beat uses a real DONKI SEP record (2024-05-13), so no special label is needed; the 20 May surge stays as a fact in SW-02's science text and in data-sources.md~~ **M3's big Mars storm (2024-05-20) has no DONKI SEP record and no ENLIL run with a Mars impact.** DONKI has it only as CME `2024-05-20T05:36:00-CME-001` (far side, O-type, ~1,927 km/s; notification `20240520-AL-001`). Proposed fix: tie M3's SW-02 beat (sol 7) to that CME record + [S6] for the Curiosity measurement. Label: *"NASA DONKI saw this cloud leave the far side of the Sun on 2024-05-20. Curiosity measured the radiation jump on Mars [S6]. Replay, sped up."* | M3 content (Phase 3/5), SW-02 label | ⏳ | |
| P-002 | **Morning Briefing collisions** (D-004 says "at most one per sol" but not which wins). Proposed: RS-04 > FD-01 > CR-01. A bumped RS-04 moves to the next sol (never bumped on the last sol); a bumped FD-01 auto-replants (as D-004 says); a bumped CR-01 is skipped and logged. `config.ts` default until approved | Engine | ⏳ | |
| P-003 | **`repair` tag card list** (D-006 adds the tag but not the set). Proposed: LS-01.a, LS-02.a, LS-03.a, LS-05.a, LS-07.a, LS-08.b, PW-09.a, PW-09.b, RS-03.a, RS-03.b, SW-10.a, CM-02.a, T-MAINT-LS, T-MAINT-LAB | Content, engine | ⏳ | |
| P-005 | **D-017 follow-up: SW-06 and MG-04 assume one badge per astronaut.** SW-06.a "take turns outside" and .b "send the expert" lose their meaning with one crew badge; MG-04 sets the crew's starting DOSE (fine) but its note says "per astronaut". Proposed: SW-06.a "Short trips only: EVA tasks −1 SP, EVA dose chance 50 % → 25 %" · .b "Long trips: EVA tasks +1 SP, badge climbs faster" · .c unchanged; MG-04 wording → "the crew's badge". Commander-only (Should) | Spec SW-06, MG-04 | ⏳ | |
| P-006 | **Phase 2 engine assumptions** (where the spec is silent; all are named constants in `config.ts` marked ASSUMPTION): (1) T-EXER since the last CR-01 skips that CR-01 ("counts for CR-01") · (2) T-SEND = `PWR-2`, banks all pending SP · (3) FD-06.a rationing lasts 3 sols; FD-06.b extra lights 2 sols · (4) CM-02.c: the antenna problem returns after 2 sols · (5) CR-02.c "random repair event" = LS-03 / LS-05 / RS-03 · (6) T-MAINT-LAB + PARTS-1 fixes a broken lab / backup-tools mode · (7) CR-07.b under D-017 = `PICK.EN-1` + `EN+2` (others cover) · (8) LS-05: the event stops the recycler for today; b/c cover today's drinking · (9) SW-07.a "inside jobs only" = no EVAs for 3 sols · (10) a pool at 0 resets to 4 · (11) role tasks done by another role use the fallback (+1 EN, 50 %) · (12) storms bring EVA crews inside | Engine, content | ⏳ | |
| P-007 | **Balance.** *Update after D-018:* the lead wants a game kids can win, so the spec's 60–75 % target for balanced play may no longer fit; kid-scope sims: M1 random bot 94 %, balanced 100 %; M3 random 63 %, balanced 92 %. Decide the target before Phase 5. *Original:* **M1 Cadet is too easy.** 300 games: balanced bot 100 % success, random bot 71 % (target: balanced 60–75 %, no strategy > 80 %, spec §1.4). M3 draft: balanced 91 %, random 43 %. Proposed for Phase 5: tune via the simulator (e.g. M1 SP goal, starting EN pool, quiet-sol rate) and report in `docs/balance-report.md` | config.ts, spec §1.3/§8.2 | ⏳ | |
| P-008 | **Source fixes from the Phase 3 audit.** *D-065 applied S2, S6, S42, S55 (+ S44, S54). Still open: S16, S23, S25, S26, which are not used by the 24 playable events.* Original text: S2 → cite DONKI record WSA-ENLIL/30726/1 (kauai host down) · S6 → NASA JPL original "NASA Watches Mars Light Up During Epic Solar Storm" (same 8,100 µGy / 30 chest X-rays) · S16 → find the JPL page for Opportunity's June 2018 power (468 Wh no longer on the page) · S23 → LS-02 cites S24 until the right Apollo Flight Journal page is found · S25 → replace (link redirects to the APPEL home page) · S26, S42, S55 → check by hand in a browser | Spec §11, sources | ⏳ | |
| P-009 | ~~Done in D-065: the picture is removed.~~ **Background picture shows a big round Moon in the Mars sky.** Mars's moons are tiny and lumpy; a judge could call it a science error. It is also AI-generated. Proposed: replace it with a credited real panorama (Curiosity/Perseverance, images.nasa.gov) in Phase 6, or crop the moon out; keep "AI-generated illustration" in the credits until then | UI, credits | ⏳ | |
| P-010 | ~~Superseded by D-030 (the lead asked for a harder game).~~ **Phase 5 tuning (batch for the lead).** 1,000 games per strategy, M3 (the one game): random 59 % · max shield 79 % · max science 8 % · balanced 54 % · best move 52 % (`docs/balance-report.md`). Spec §1.4 targets: none > 80 % ✔ · greed loses ✔ · variety 90 % ✔ · 96/100 different games ✔ · no-free-lunch 30/30 ✔ · balanced 60–75 % ✖ (54 %: the "balanced" bot still walks outside a lot; the winning lesson is *stay safe*, which is the point of M3) · card coverage 15/20 ✖ (never best: FD-01.c radishes, PW-03.a, PW-08.a/b (power is never short), LS-05.b). Experiments (200 games): SP goal 8→12: random 38 %, max shield 77 %, balanced 59 % (science starts to matter but kids lose more) · reactor 2→1: little change. **Recommendation: no number changes now** (the lead wants kids to succeed; random play wins 59 %); accept the two misses with these reasons. Optional later: make power matter (PW-08 never fires) and give PW-03.a / FD-01.c a reason to be picked | config.ts, spec §1.4 | ⏳ | |
| P-011 | **Which two tools a Cadet sees.** `Game_Mechanics.md` gives every problem 2 active tools and makes "do nothing" the timeout only (e.g. Hot Machine: hose + off switch; Dusty Panels: brush + tilt handle; Water in the Helmet: door code + grab the rock; Shiny Rock: jet pack + robot). The spec's ★ cards differ for PW-01 (a = leave it), PW-02 (b = wait for wind), CR-05 and RS-01. The rebuild keeps the spec's ★ cards (so balance and tests hold) and shows "leave it / wait" as a no-skill tool. Proposed: move the ★ to the doc's pairs for PW-01 (b, c), PW-02 (a, c), CR-05 (a, c), RS-01 (a, c), then re-run the simulator | Content, balance | ⏳ | |
| P-012 | **Timeout penalty per problem.** `Game_Mechanics.md` lists a special penalty for each ignored problem (battery pops, lab frozen, crew asleep…). The engine keeps D-027 (the crew does the worst affordable card), which already gives PW-01's pop. Proposed: keep D-027 for the hackathon; the special penalties need new numbers and sources | Engine, content | ⏳ | |
| P-013 | **Arabic.** The four feedback documents are in Arabic; the game is English only (lead, 13 Nov). All strings are in `src/content/copy.ts`, but the 60 events' text comes from the spec and the layout is not RTL-tested. Proposed: stay English for the submission; say so in the pitch | UI, content | ⏳ | |
| P-014 | **Balance after D-031.** With 20 events (1,000 games each): random 31 % · max shield 51 % · greed 13 % · balanced 82 % · best move 89 % (was 77 % / 82 %). The six added events are milder than the storm set, so careful play wins more often than the §1.4 targets (balanced 60–75 %, nothing over 80 %). The bots also never fail a mini-game; real kids will, and each miss is a worst-card timeout. Proposed: wait for kid playtests before touching numbers; if still too easy, raise the M3 goal from 14 to 16 stars and re-run the simulator | Balance | ⏳ | |
| P-017 | **Rename everywhere?** D-058 changed the title on screen only. Proposed: the lead decides whether CLAUDE.md, PLAN.md, the guides, the repo name and the submission use "Nova Knights Adventure" too | Docs, submission | ⏳ | |
| P-015 | **Careful play is still too safe** (Casual after D-051: random 8 % · max shield 9 % · science-only 56 % · balanced 86 % · best move 93 %; earlier D-043 numbers follow). 1,000 games: random 8 % · max shield 14 % · science-only 67 % · balanced 89 % · best move 97 %. A shorter mission also lets the science-only bot win more often, because radiation has less time to add up. The tighter stores hurt careless play, but the balanced and best-move bots still win far above the §1.4 target (60–75 %) because hunger and thirst only cost crew bars, never the mission. The bots also never lose a mini-game. Proposed: decide after kid playtests; if needed, make an empty food or water store end the day's jobs, or raise the goal to 18 | Balance | ⏳ | |
| P-016 | ~~Done in D-051 (each storm wears the shield by 1).~~ **Shield never goes down.** The lead asked that everything on screen can be used up and won back. Shield only rises (soil wall, cards); nothing wears it. Proposed: a storm night (SW-02 / SW-04) wears the shield by 1, simulated first. Not done in round 6 because it needs a new number | Engine, balance | ⏳ | |
| P-018 | **Judging self-check (14 Nov), biggest gaps.** (1) OSDR is named in the challenge but none of the 20 playable events cites it (S40, S58 are only on out-of-scope cards). (2) Communication delay, one of the 5 challenge topics, shows in one event (RS-04). (3) Survival storms are not tied to DONKI records. (4) Of the 26 sources the playable events cite, S2 is dead and S6, S42, S55 are news re-posts or non-NASA sites (see P-008). (5) Science-only play wins 57 % of Casual games. (6) No child has played it. Proposed order: fix sources, add one OSDR fact and one comms-delay event to the scope, playtest | Relevance, validity | ⏳ | |
| P-019 | ~~Decided 14 Nov: option (c) Piper; clips regenerated (D-067).~~ **A nicer voice for Nova.** The eSpeak clips are robotic. Options, all drop-in (same 10 file names): (a) an adult team member records the lines (best, no AI disclosure, no minors' voices); (b) an AI voice service (uses credits, must be disclosed); (c) the open-source Piper voice engine (needs permission to install it on this PC) | Presentation | ⏳ | |
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
| D-017 | 2026-11-13 18:00 | **Shared crew stats**: one crew card for all 4 astronauts. FUL/HYD/AIR/EN are pools 0–20 (4 × 5; start 16/16/20/16, ENMAX 20), DOSE is one crew badge 0–10. `ALL`/`EVA`/`each` targets scale by headcount; DOSE effects apply once. A pool at 0 → one astronaut to Sick Bay, pool → 4. Badge full → whole crew Indoor only. CR-07 at crew EN ≤ 4; SW-07 for the crew badge (a = no EVAs 3 sols) | lead (chat) | spec v0.4 §1.2, §1.3, §2.2, §2.3, §3, §6, SW-06, SW-07, CR-07; kids guide; engine types v2 | P2 commit |
| D-018 | 2026-11-13 19:15 | **Kid scope**: the playable game uses only 10 easy events (M1: FD-01, PW-02, PW-03, PW-08, LS-03, LS-05, RS-01, RS-04; M3 adds SW-01, SW-02 from real DONKI). Setup = FD-01. Out-of-scope chains never happen and never show. All 60 events stay in the spec as the full design | lead (chat feedback) | spec v0.5 §8.4; `missions.ts`; engine deck/effects/selectors; M3 timeline (2 beats, SW-02 on sol 6); data-sources.md | P4 commit |
| D-019 | 2026-11-13 19:15 | **4 jobs per astronaut**, all their own (no stand-in rule in the kid game): MGR Rest/Pep/Garden/Send · ENG Rest/Maintain LS/Panels/Shield · MED Rest/Treat-or-Check-up/Garden/Lab · RES Rest/Lab/Rock walk/Garden | lead | spec §8.4; `KID_JOBS`; engine `jobsFor` | P4 commit |
| D-020 | 2026-11-13 19:15 | **Simpler screens**: resources board on the LEFT; no separate morning or power-plan screens (PW-08 shows as a card when short); less text per screen | lead | spec §2.4 note, §8.4; UI | P4 commit |
| D-021 | 2026-11-13 19:40 | **One game**: no mission select, no difficulty levels; Play → briefing → M3 Storm from the Sun (Cadet). M1 stays in the design and in tests | lead | spec v0.6 §8.4; `App.tsx` | P5 commit |
| D-022 | 2026-11-13 19:40 | **Guided first sol**: tutorial highlights base, stars, crew, cards, chips, jobs, buttons; only the highlighted part works; skippable; replay from How to play | lead | `Tutorial.tsx`, copy | P5 commit |
| D-023 | 2026-11-13 19:40 | **Base resources LEFT, crew (with the shared bars) RIGHT** | lead | `Panels.tsx`, CSS | P5 commit |
| D-024 | 2026-11-13 19:40 | **Jobs one astronaut at a time** ("Nova's turn", progress avatars, summary) | lead | `Phases.tsx` | P5 commit |
| D-025 | 2026-11-13 19:50 | **Kid-critique fixes**: ≤ 10-sol missions plant lettuce vs radishes (extends D-014); pepper harvest = FOOD+8 when FD-05 is out of scope; EVA dose logged; badge hints; fix hints; debrief tips | lead ("criticize as a kid") | spec v0.6 FD-01 note; `config.ts` SHORT_MISSION_SOLS 10; greenhouse; radiation; copy | P5 commit |
| D-026 | 2026-11-13 20:15 | **14 easy challenges, one every day**; no planting choice (lettuce auto-planted, auto-replant); real DONKI beats SW-01 sol 2, SW-03 sol 4 → SW-04 sol 6, SW-02 sol 8 | lead | spec v0.7; `missions.ts`; engine (`startCrop`, `quietChance`, SW-05 in deck) | P6 commit |
| D-027 | 2026-11-13 20:15 | **Surprise first, then jobs; 10-second timer** — timeout = the worst affordable card (state value); cancel-type cards block jobs for the day; flare particles hit later EVAs; timer 10/20/off in Settings | lead | spec v0.7; engine `eventFirst`, `timeoutChoice`; UI | P6 commit |
| D-028 | 2026-11-13 20:15 | **3 big jobs per astronaut** | lead | `KID_JOBS` | P6 commit |
| D-029 | 2026-11-13 20:15 | **Fewer words**: no title icons; science behind "?"; hover previews on cards and jobs; no night screens (bars flash changes); day-by-day story at the end; Tutorial on title + menu | lead | UI | P6 commit |
| D-030 | 2026-11-13 20:30 | **Harder balance**: M3 goal 8 → 14 SP (lead: "too easy, give me an option to lose"); balanced bot improved | lead | `config.ts`; spec v0.7; balance report | P6 commit |
| D-031 | 2026-11-14 01:00 | **Live-action base, 20 events.** The game screen is a cut-away base (surface + 7 rooms); trouble shows in its room and the camera zooms there. Scope = D-026 set + FD-06, CR-02, CR-04, CR-05, RS-03, MG-03 (all 14 problems of the lead's `Game_Mechanics.md` map to spec events). No card numbers changed | lead (`Current_Feedback.md`, `Game_Theater.md`, `Game_Mechanics.md`) | spec v0.8 §8.4; `missions.ts`; `src/ui/game/**`, `screens/Game.tsx`; kids guide; teacher guide; README | not committed |
| D-032 | 2026-11-14 01:00 | **Tools + mini-games.** Each card = a tool (drag onto the base, or tap); the card takes effect when its mini-game is won; running out of time in the alarm or the mini-game = the D-027 timeout. 16 mini-game types, one per card (`tools.ts`). A mini-game never changes a card's cost or effect. "Do nothing" cards have no mini-game. Settings: Mini-games off (one tap). Training room on the title screen | lead (`Game_Mechanics.md`) | spec v0.8; `src/ui/game/minis.tsx`, `tools.ts`, `screens/Practice.tsx`, `settings.ts` | not committed |
| D-033 | 2026-11-14 01:00 | **Show, don't tell + sound.** Crew faces/moods from the shared bars and the current alarm; dust, battery, lights, plants and shield shown in the scene; flying numbers, screen shake, red edge in the last 3 s; stars fly to the counter; sound made in code (Web Audio, on/off) | lead (`Current_Feedback.md`, `reward_system_and_visuals.md` §1) | `Scene.tsx`, `Avatar.tsx`, `Hud.tsx`, `sfx.ts`, `game.css` | not committed |
| D-034 | 2026-11-14 01:00 | **Rewards that last.** Star bank on the device: all stars sent after a win, half (rounded up) otherwise; shop with decorations only (5 suits, 4 light sets, robot dog, flag, party lights); 9 space badges. No account, no personal data | lead (`reward_system_and_visuals.md` §2) | spec v0.8; `src/ui/meta.ts`, `screens/Shop.tsx`, `Debrief.tsx`, `Title.tsx` | not committed |
| D-035 | 2026-11-14 02:10 | **Resources matter more** (lead: "I don't feel any challenge to balance them"). Cadet start FOOD 40 → 28, H2O 18 → 12, BAT 6 → 5; LS wear every 3 → 2 sols; M3 goal 14 → 16 SP. Red warning pills + screen-edge pulse + warning sound (tummy growl for food) when a bar is in the danger zone; food and water stores now sit in the HUD | lead (feedback round 5) | spec v0.9 §1.3, §2.1, §8.2, §8.4; `config.ts`; `rules.test.ts`; `Game.tsx`, `Hud.tsx`; kids guide; balance report | not committed |
| D-036 | 2026-11-14 02:10 | **The trouble grabs the eye**: everything but the problem room dims, a ring pulses and a red "!" bounces on the exact spot; the stage edge pulses; the alert names the room | lead | `Scene.tsx`, `tools.ts` (`at`), `game.css` | not committed |
| D-037 | 2026-11-14 02:10 | **Faster, less repetitive mini-games**: 4 new types (memory lights, tap the sparks, catch in a basket, find the pair) = 20; most tools have a second mini-game picked at random; shorter goals (2 crank turns, 10 taps, 2 s holds); mini-game clock = the alarm clock (10 s, was 12); results show for 1.9 s (was 2.6) | lead | `minis.tsx`, `tools.ts`, `Practice.tsx` | not committed |
| D-038 | 2026-11-14 02:10 | **Badges during play that pay stars**: 17 badges (2–10 stars each); a corner notification with a bell the moment one is earned; stars go straight to the bank | lead | `meta.ts`, `Game.tsx`, `Shop.tsx`, `Debrief.tsx` | not committed |
| D-039 | 2026-11-14 02:10 | **Guided first day** (replaces the one-line hint): Nova points at the goal, the 3 bars to keep up, the badge to keep down, the crew bars, then walks through alarm → tool → mini-game → what changed → jobs → start the day → night. No timer until it ends; skippable; "Tutorial" button on the title | lead | `Coach.tsx`, `Game.tsx`, copy | not committed |
| D-040 | 2026-11-14 02:10 | **One true story at the end**, tied to a choice the player made, a different one each mission (last 12 remembered). It says "you made the same choice as the real crew" only for 6 cards where the event's sourced text supports it; otherwise "real crews faced this too" | lead | `Debrief.tsx`, `copy.endStory`, `live.test.ts` | not committed |
| D-041 | 2026-11-14 02:10 | **More sounds** (all made in code): Sun roar, wind, Geiger clicks, hiss, drips, frost, zap, cough, sneeze, tummy growl, radio static, footsteps, tool whoosh, warning, badge bell; each alarm repeats its own sound | lead | `sfx.ts`, `Game.tsx` | not committed |
| D-042 | 2026-11-14 02:10 | **Simple title**: the base fills the screen, one big START, Continue under it, small corner buttons (Tutorial, Settings, NASA data · Training, Shop). Tools are picked with one tap and fly to the trouble (dragging removed) | lead | `Title.tsx`, `App.tsx`, `Game.tsx` | not committed |
| D-043 | 2026-11-14 03:10 | **7 sols, simpler resources, water you can win back.** M3 Cadet 10 → 7 sols, goal 14 SP; DONKI beats SW-01 sol 2, SW-03 sol 3 (→ SW-04 sol 5), SW-02 sol 6; start FOOD 24, H2O 10. One Food bar + one Water bar on screen (stores; crew hunger/thirst pulse on them); O2T, PARTS, MEDKIT start at 20 and are hidden with crew AIR; supplies menu removed. New 4th Engineer job **Dig up ice** (T-ICE; mission starts with LS-10 unlocked) | lead (feedback round 6: "no way to gain water", "ignore supplies", "only 7 sols", "food packs vs food") | spec v0.10 §1.3, §8.2, §8.4; `config.ts`, `types.ts` (`Mission.unlocks`), `reduce.ts`, `missions.ts`, `build-donki-timeline.ts` + timeline JSON; `Hud.tsx`, `Chips.tsx`; tests; guides | not committed |
| D-044 | 2026-11-14 03:10 | **Power costs show a battery icon**; the bolt now means crew energy only | lead | `Chips.tsx` | not committed |
| D-045 | 2026-11-14 03:10 | **Faster alarms**: 8 s default for the alarm and the mini-game (Settings: 5 / 8 / 15 / off; settings key v2) | lead ("5 to 8 seconds") | `settings.ts`, `Settings.tsx`, copy | not committed |
| D-046 | 2026-11-14 03:10 | **Choices change the theatre**: full-screen moods (ice + snow, flames, radiation, dust, bad air) from the alarm and from what the last card left behind (`AFTER` in `tools.ts`); broken lab / oxygen maker / recycler stay visibly broken; water tubes, food crates and plant count follow the stores; Phobos, shooting star, far dust devil, craters, rover tracks | lead | `Scene.tsx`, `tools.ts`, `Game.tsx`, `game.css` | not committed |
| D-047 | 2026-11-14 03:10 | **Training room redesign**: one card per problem, big round tools, a "?" on every tool (the problem, what the tool does + its lesson, the real story with sources) and 9 real NASA pictures (2 published in 2026), bundled, credited, labelled ARCHIVED; no people, no logos | lead | `Practice.tsx`, `src/content/nasaImages.ts`, `public/img/nasa/*`, `docs/data-sources.md`, README | not committed |
| D-048 | 2026-11-14 03:10 | **Background sound, no music**: looping wind with gusts over a low Sun hum, on the title and in the game; follows the Sound setting; stops when the tab is hidden | lead | `sfx.ts`, `App.tsx` | not committed |
| D-049 | 2026-11-14 03:10 | **Polish**: "?" pop-ups are placed against the window so nothing clips them; title = plain Mars horizon + Nova + START; end story is a pop-up (More details / Close) with a button to reopen it in the report; tutorial texts halved and the bubble parks on the base, never on the choices; 4 new mini-game mechanics (turn the pipes, sort left/right, find the odd one, swap into order) = 24 | lead | `InfoTip.tsx`, `Title.tsx`, `Debrief.tsx`, `Coach.tsx`, `minis.tsx`, copy | not committed |
| D-050 | 2026-11-14 04:20 | **Survival mode + high scores.** Mode picker after START: Casual (M3) or Survival (M9 Cadet, cap 99 sols, no star goal). Survival: storms in the deck from day one, deck reshuffled when empty, the base ages (1 more oxygen and food lost per night every 6 sols), clock shrinks from 8 s to 4 s on sol 16. Score = 10 × sols + stars; top 10 per mode kept on the device; all stars sent are paid | lead (feedback round 7) | spec v0.11; `config.ts`, `types.ts` (`Mission.endless`), `deck.ts`, `night.ts`, `reduce.ts`, `missions.ts`; `Modes.tsx`, `App.tsx`, `Game.tsx`, `Hud.tsx`, `Debrief.tsx`, `meta.ts` | not committed |
| D-051 | 2026-11-14 04:20 | **Oxygen, shield, food, water can run out.** LS (shown as Oxygen) wears every sol; each storm wears the shield by 1; FOOD 20, H2O 8; a hungry or thirsty night also costs 2 crew energy each. Answers P-016 | lead ("oxygen and shields don't affect the game", "I couldn't zero water or food") | spec v0.11 §1.3, §2.1; `config.ts`, `radiation.ts`, `crew.ts`; tests | not committed |
| D-052 | 2026-11-14 04:20 | **Health check gives value**: crew energy +2 and the next radiation hit is 1 weaker (once) | lead ("health check gives no value") | spec v0.11 §4 T-MED; `hooks.ts`, `radiation.ts`, copy chip | not committed |
| D-053 | 2026-11-14 04:20 | **End screen has a Main menu button** | lead | `Debrief.tsx`, `App.tsx` | not committed |
| D-054 | 2026-11-14 04:20 | **Three sound switches**: event sounds, background sound, Nova's voice (the HUD button mutes or unmutes the first two together) | lead | `settings.ts`, `Settings.tsx`, `sfx.ts`, `App.tsx` | not committed |
| D-055 | 2026-11-14 04:20 | **Nova speaks**: the tutorial lines are read by the device's text-to-speech (no audio files; silent where the browser has no voice), her mouth moves while she talks and a gloved hand points at the thing she explains | lead | `sfx.ts` (`speak`), `Coach.tsx`, `Avatar.tsx` | not committed |
| D-056 | 2026-11-14 04:20 | **Training room never repeats**: 26 skills, each shown exactly once (new mechanics: count, reflex); the tools' real stories + NASA pictures moved to their own list below | lead ("never repeat a training") | `Practice.tsx`, `tools.ts` (`SKILLS`), `minis.tsx` | not committed |
| D-057 | 2026-11-14 04:20 | **Hover tick** on every button (mouse only); "?" pop-ups open next to the pointer and are drawn at page level | lead | `App.tsx`, `InfoTip.tsx` | not committed |
| D-058 | 2026-11-14 04:20 | **Game title "Nova Knights Adventure"** in the game, the browser tab and the README headline. Other docs (CLAUDE.md, PLAN.md, teacher guide, repo name) still say Mars Base Adventure | lead | copy, `index.html`, README | not committed |
| D-059 | 2026-11-14 05:30 | **Empty battery blocks electric work**: jobs and cards with a power cost are unavailable at BAT 0 | lead (feedback round 8) | spec v0.12; `tasks.ts`, `events.ts`, copy; test | not committed |
| D-060 | 2026-11-14 05:30 | **Survival ends at empty**: FOOD, H2O or oxygen at 0, or a red badge, ends the run at once; Survival starts with FOOD 44, H2O 14 | lead (feedback round 8) | spec v0.12; `endings.ts`, `config.ts`, `reduce.ts`, `Hud.tsx`, copy; test | not committed |
| D-061 | 2026-11-14 06:10 | **The trade is impossible to miss**: every tool shows COSTS (red), GIVES (green), LATER (yellow) lines; after each choice a scene shows the tool and the same three lines big for 2.4 s | self-check (P-018: kids skip the small chips) | `Game.tsx`, `game.css`, copy | not committed |
| D-062 | 2026-11-14 06:10 | **Animated intro and endings** (no video files): launch → landing → crew; endings: stars reach Earth (win), the crew flies home (not won / early), Survival. Drawn in code, about 9 s and 6 s, tap or key to skip | lead (feedback round 9) | `Cutscene.tsx`, `App.tsx`, copy | not committed |
| D-063 | 2026-11-14 06:10 | **24 events in play, goal 18**: adds CR-03 and CM-02 (communication delay) and CR-01 and RS-05 (NASA OSDR [S40]); Casual goal 14 → 18 because they hand out stars. Answers P-018 (1) and (2) | self-check | spec v0.13; `missions.ts`, `tools.ts`, `config.ts`, copy; tests | not committed |
| D-064 | 2026-11-14 07:00 | **Trade-off holds in the numbers**: Cadet LS starts at 6, LS 0 ends the mission that night, Casual goal 20. Science-only play wins 0 %; balanced play is back inside the §1.4 target. Answers P-015 and P-018 (5) | lead ("fix the weaknesses") | spec v0.14 §1.3, §2.5, §8; `config.ts`; tests; balance report | not committed |
| D-065 | 2026-11-14 07:00 | **Data and honesty fixes**: S2, S6, S42, S44, S54, S55 swapped for NASA originals, facts aligned (signal delay now "4 to 20 minutes", sleep "about 6 hours"); Survival storms replay the real DONKI records; game-only rules named on the data screen; AI background picture removed (plain CSS dusk); radiation warning from 5; tutorial 11 → 9 steps; the 3 core bars drawn bigger. Answers P-008 (S2, S6, S42, S55), P-009, P-018 (3), (4) | lead ("fix the weaknesses") | spec v0.14 §7, §11; kids guide; teacher guide; `sourceAudit.ts`, `deck.ts`, `types.ts`, `missions.ts`, `Game.tsx`, CSS; `public/img/cockpit-*.webp` deleted | not committed |
| D-066 | 2026-11-14 07:40 | **More to collect, reasons to come back**: 32 shop decorations (new kinds: dome paint, rover paint; robot cat, helper drone, telescope, rug, plant, poster, trophy; 3 more suits, 2 more light sets); ranks from lifetime stars (0 / 25 / 70 / 150 / 300) shown on the title, in the shop and as "Rank up!" at the end, with 6 rank-locked items; badges Collector (10 items) and Master Decorator (20). Decorations only | lead (feedback round 11) | `meta.ts`, `Shop.tsx`, `Scene.tsx`, `Title.tsx`, `Debrief.tsx`, copy; tests | not committed |
| D-067 | 2026-11-14 08:50 | **Nova's voice is recorded clips, not the browser's voice.** Browser text-to-speech was silent on the lead's PC in Chrome and Brave and poor in Firefox, so each tutorial step plays `public/audio/nova/<step>.mp3` (10 clips, 324 KB, loaded only in the tutorial); the browser voice is only a fallback when a clip fails. The clips are made with **Piper** (open-source neural text-to-speech) and its `en_US-ljspeech-high` voice (public-domain LJ Speech recordings), chosen by the lead on 14 Nov (P-019 option c); `scripts/make-voice.py` rebuilds them. A first eSpeak NG set was too robotic. "Test the voice" button and the "no voice" note removed at the lead's request | lead (feedback) | `sfx.ts`, `Coach.tsx`, `Game.tsx`, `Settings.tsx`, `scripts/make-voice.py`, `public/audio/nova/*`, copy; test | not committed |
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
| v2.3 | 2026-11-14 04:20 | `Mission.endless?: { extra: string[] }` (Survival: reshuffle the deck, add these events, age the base); mission `M9` is now defined for Cadet | D-050 | nobody (optional field) |
| v2.2 | 2026-11-14 03:10 | `Mission.unlocks?: string[]` (discoveries a mission starts with; `newGame` sets `unlock:<id>` flags) | D-043: T-ICE as a job without playing LS-10 | nobody (optional field) |
| v2.1 | 2026-11-13 19:00 | `DonkiRef` gains optional `sourceUrl` and `fetchedAt` (shown as "ARCHIVED – fetched on …") | Phase 3 honesty labels | U shows them on DONKI cards (done) |
| v2 | 2026-11-13 18:30 | **Real engine.** `import { createEngine } from 'src/engine'` + `CONTENT` from `src/content` → `engine.newGame({mission, tier, seed})`, `engine.reduce(s, cmd)`, `shownCards`, `availableTasks(s, id)`, `hud`, `powerBudget`, `nightLog`, `debrief`, `peek`; plus `doseBadge`, `shieldTier`, `riskWords`, `CALL_SIGNS`. State v2: shared `crew` card (D-017), astronauts keep only role state; `queue`, `scheduled`, `modifiers`, `timers`. `Effect` gains `power`, `sp`, `evaDose`, `chance`; hooks take arg arrays. `Chip` = {icon, tone, amount?, label? (copy key 'chip.*' or spec text), params?, inSols?}; `CardView.who` = tokens. Commands unchanged except END_MISSION removed (MG-02.a does it). Fixture removed | D-017 + Phase 2 | **U**: render chips via `src/content/format.ts` (`chipText`, `formatLog`, `reasonText`); show `who` tokens as call-signs. **S**: overrides use the clean notation in `src/engine/notation.ts` |
| v1 | 2026-11-13 17:50 | First contract. `src/engine/types.ts` (GameState, Astronaut, Command, EventDef, ActionDef, TaskDef, Effect, Delayed, ScheduledEffect, Modifier, Mission, Pending, DonkiRef, CardView, Chip, TaskOption, PowerBudget, LogEntry, ChoiceRecord, Ending, Debrief) + `index.ts` API: `newGame(opts)`, `reduce(state, cmd)`, `selectMeters`, `selectCards`, `selectTaskOptions`, `selectPowerBudget`, `selectLog`, `shieldTier`, `badgeColour`, `riskWords`. `newGame`/`reduce`/`selectCards`/`selectTaskOptions` are **stubs** over `fixture.ts` (the stub `reduce` only walks the phase loop). Commands: CHOOSE, CONTINUE, SET_POWER, CONFIRM_POWER, PLAN_TASK, CONFIRM_TASKS, END_MISSION. Log entries carry a `copy.ts` key + params, not text | Phase 1 | U builds screens on the selectors; S emits `EventDef`/`ActionDef` in Phase 3; E replaces the stubs in Phase 2 (keep the signatures) |

## Requests between lanes
| From → To | File | Request | Status |
|---|---|---|---|
| U → P | `src/ui/styles/tokens.css` | Palette v0 is a placeholder (Mars orange #B5420F, cost red #B3261E, effect green #1B6E35, info blue #1F5FA8, dark theme). P: confirm or replace it in task 0.8 | open |
| E → P | `src/engine/fixture.ts` | Placeholder call-signs Nova / Bolt / Echo / Sky (MGR / ENG / MED / RES). P: confirm 4 gender-neutral call-signs (task 0.8) | open |

## Science review log
| Event / screen | Reviewer | ✔ / ✖ | Note |
|---|---|---|---|
| SW-01, SW-04, SW-05, SW-07, PW-01, PW-02, PW-03, PW-07, PW-08, LS-01, LS-05, LS-07, LS-09, FD-01, FD-04, FD-05, FD-06, CR-01, CR-03, CR-04, CR-05, CR-06, RS-01, RS-04, RS-05, RS-06, CM-02, MG-02, MG-03 | Claude (audit 13 Nov) | ✔ | every figure found on its source page (see `sourceAudit.ts`) |
| SW-02 | Claude | ✔ | 8,100 µGy / 30 chest X-rays confirmed on the NASA JPL original; current S6 link is a re-post (P-008) |
| SW-03 | Claude | ✔ | S2 host down; the M3 ENLIL record shows the same Mars-arrival prediction (P-008) |
| LS-02 | Claude | ✖ (link) | story is right (S24 confirms); S23 link broken (P-008) |
| LS-03, LS-04 | Claude | ✖ (link) | S25 now redirects; S26 blocked to scripts. Facts not yet re-confirmed (P-008) |
| CR-02, CR-07 | Claude | ? | S42 blocked to scripts; check by hand |
| RS-03 | Claude | ? | S55 blocked to scripts; check by hand |
| RS-04 / CM-02 | Claude | ✔ | 3–21 min [S54] + up to 22 min [S44] (N-05 wording note) |
| SW-01 (M3 sol 2) | Claude | ✔ | label = FLR `2024-05-10T06:27:00-FLR-001` X3.9, peak 06:54Z; "seen from Earth" wording (spec §5); 10× rule [S3] ✔ |
| SW-02 (M3 sol 6) | Claude | ✔ | label = SEP `2024-05-13T14:00:00-SEP-001` after an M6.6 flare; S 2 from the linked flare; Curiosity 8,100 µGy fact ✔ (JPL original) |
| Honesty table | Claude | ✔ | S8, S9, S13, S15, S17, S20, S21, S27, S33, S34 confirmed; S16 problem (P-008) |

## Bugs
| ID | Severity (P0/P1/P2) | Where | Description | Owner | Status |
|---|---|---|---|---|---|
| B-001 | P2 | background | AI picture shows a big round Moon in the Mars sky (P-009) | P | open |
| B-002 | P2 | kids guide | `mars-adventure-kids-guide.md` still describes 9 missions and all 60 surprises; the game now plays the D-018 scope | S | fixed (one game, 14 surprises, timer) |
| B-003 | P2 | debrief | "Big choices" can include the sol-0 planting choice | U | fixed (D-026: no planting choice) |
| B-005 | P2 | tests | `50 seeds of M1 Cadet` hit vitest's 5 s limit when the whole suite runs in parallel (more events → slower games) | E | fixed (`testTimeout` 20 s in `vitest.config.ts`) |
| B-004 | P2 | jobs | after "Rest sol" times out, the jobs screen said "Everyone has a job!" with nobody listed | U | fixed ("Everyone rests today.") |

## Science pass (Phase 6)
- [x] Every fact on screen has an `[S#]`: each surprise's "?" shows its kid True story + sources; debrief "?" shows the Real science + sources
- [x] The ×15 note and the A-08 storm label are on "Where our data comes from" → "How this game uses real data"
- [x] ARCHIVED labels: every DONKI card says "Real NASA data · <date>" with "Replay, sped up · ARCHIVED – fetched on 2026-11-13" behind "?"; nothing says "live"
- [x] Numbers on cards are game values (stated on the data screen); no real measurement is shown as a game number
- [x] Disclaimer on every screen (footer) incl. title and sources
- [ ] P-008: fix the 5 broken/redirected source links (S2, S6, S16, S23, S25) and hand-check S26, S42, S55 (people)
- [ ] P-009: the AI background shows a big Moon in the Mars sky (credited as AI-generated; replace with a NASA photo if time)

## Risks (live)
- R1 scope creep · R3 Saturday-night integration crunch · R5 science error spotted by a judge (A-08 pending) · R10 fatigue. Full register: `PLAN.md §9`.

## Demo status
| What | Where | Works? | Last checked |
|---|---|---|---|
| **Live game (public)** | https://nova-knights-hazel.vercel.app/ | ✅ headless Chromium, 14 Nov: no login, title → first day → jobs on phone and desktop, NASA picture loads, 0 failed requests, 0 console errors | 14 Nov 08:10 |
| **Live-action game** (D-031…D-034): title → alarm → mini-game → jobs → night → debrief → shop | local: `BASE=./ npm run build && npx vite preview --base ./` | ✅ headless Chromium: full 10-sol missions at 390×760, 360×640, 1180×700, 1280×720 with 0 console errors; a bot won all 50 mini-games in the Training room | 14 Nov 01:35 |
| OLD card game (before the rebuild) | https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio | ✅ (headless 1280/360/1024 projector/throttled) | 13 Nov 19:30 |
| Title screen + data sources + settings (projector mode) | local `npm run dev` / `npm run preview` → http://localhost:4173/mars-base-adventure/ | ✅ | 13 Nov 17:55 |
| Live URL | GitHub Pages | ⬜ (needs the repo) | — |

## Time used vs plan
| Phase | Planned h | Actual h | Delta | Note |
|---|---|---|---|---|
| Planning (this session) | — | — | — | PLAN / CLAUDE / PROGRESS written |
| 0 Pre-flight | 4.5 | 0.5 | −4.0 | agent-run; repo/Pages still open |
| 1 Skeleton | 2.0 | 0.5 | −1.5 | local only until the push |
| 2 Engine core | 6.0 | 0.7 | −5.3 | incl. D-017 + the content needed to play |
| 3 Content & data | 5.0 | 0.5 | −4.5 | + playable UI (0.3 h) |
| 4 Playable | 12.0 | 0.4 | −11.6 | + 2 rounds of lead feedback |
| 5 Balance | 5.0 | 0.7 | −4.3 | report incl. ~11 min of simulation |

---

## Handoff (latest only; older ones move into the Session log)
```
HANDOFF 2026-11-14 05:00 Cairo · from Claude (lead session) · Phase 6 🟡 live-action game, feedback rounds 4–7 · NOT committed · deploy ⛔
Repo: — (local git, main, last commit 33e61cd; all of this is in the working tree) · Live: https://nova-knights-hazel.vercel.app/ (Vercel, public)
State: Title "Nova Knights Adventure" → START → Casual (7 sols, 14 stars) or Survival (no last day, clock 8 s → 4 s by sol 16,
       ageing base, score = 10 × sols + stars, high-score board). Guided first day read aloud by Nova. Each sol: alarm with
       spotlight, sound and screen mood → tap a tool → mini-game (26 mechanics) → jobs → night. Oxygen drops every sol,
       storms wear the shield, food 20 / water 8 can run out (ice job, garden). Badges pay stars; shop; Training room
       (26 skills once + real stories with NASA pictures).
       Casual, 1,000 games: random 8 % · max shield 9 % · science-only 56 % · balanced 86 % · best move 93 % · Survival, 40 runs: random ~14 sols, science-only 8, balanced 16.
       Round 11: shop 32 items, ranks from lifetime stars, collection badges (D-066). 144 tests, JS 117 KB gz.
       Round 10: balance inside targets (LS 6, oxygen 0 = home, goal 20), 6 NASA-original sources, real storms in Survival (D-064, D-065).
       Casual, 1,000 games after D-064: random 2 % · max shield 0 % · science-only 0 % · balanced 74 % · best move 66 % · Survival, 40 runs: random 8 sols, science-only 6, balanced 12 (up to 14).
       Round 9: animated intro + endings, cost/gives/later lines, 24 events (OSDR + comms delay), Casual goal 18 (D-061…D-063).
       Round 8: empty battery blocks electric work; Survival ends at empty food/water/oxygen or a red badge (D-059, D-060).
       Typecheck, 140 tests, build (JS 112 KB gz), check:content green. Headless: tutorial, Casual and Survival runs, 0 errors.
Next: (1) Lead reviews, then commit: `[P6][all] live-action base, Casual + Survival, tutorial, badges (D-031…D-058)`
      (2) Kid playtests → docs/playtest-notes.md (is 8 s / 4 s fair? does Nova's voice work on the school's devices?)
      (3) Decide P-011…P-017; re-run axe + Lighthouse on the new screens
      (4) GitHub repo + Pages, republish the preview link, tag v1.0
Blocked on: lead review; playtesters; GitHub login
Watch out: Nova's voice is the browser's text-to-speech: it differs per device and is silent where none is installed.
           Settings key `mba.settings.v2`; scores `mba.scores.v1`. Survival rules: `Mission.endless` in `missions.ts` + `night.ts`.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 7
```

### Previous handoff (round 6, 04:00)
```
HANDOFF 2026-11-14 04:00 Cairo · from Claude (lead session) · Phase 6 🟡 live-action game, feedback rounds 4–6 · NOT committed · deploy ⛔
Repo: — (local git, main, last commit 33e61cd; all of this is in the working tree) · Live: — (the claude.ai link is the old game)
State: 7-sol mission, goal 14 stars. Title = Mars horizon + Nova + START. Guided first day. Each sol: alarm (8 s) with spotlight,
       its own sound and a full-screen mood → tap a tool → mini-game (24 mechanics) → result → jobs (Engineer can dig ice
       for water) → night. HUD: stars, air, power, shield, radiation, energy, food, water. Badges pay stars; shop;
       Training room with "why" cards + 9 NASA pictures; wind-and-Sun background sound; true-story pop-up at the end.
       1,000 games: random 8 % · max shield 14 % · science-only 67 % · balanced 89 % · best move 97 %
       Typecheck, 133 tests, build (JS 108 KB gz), check:content green. Headless: tutorial + full missions, phone + desktop, 0 errors.
Next: (1) Lead reviews, then commit: `[P6][all] live-action base, 7 sols, tutorial, badges, Training room (D-031…D-049)`
      (2) Kid playtests → docs/playtest-notes.md (8 s enough? tutorial length? which mini-games frustrate?)
      (3) Decide P-011…P-016; re-run axe + Lighthouse on the new screens
      (4) GitHub repo + Pages, republish the preview link, tag v1.0
Blocked on: lead review; playtesters; GitHub login
Watch out: settings key is now `mba.settings.v2`. Mini-game per card + alternatives + screen moods: `src/ui/game/tools.ts`.
           NASA pictures: `src/content/nasaImages.ts` (add credit + ID for any new one). `app.css` still holds unused cockpit rules.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 7
```

### Previous handoff (round 5, 03:00)
```
HANDOFF 2026-11-14 03:00 Cairo · from Claude (lead session) · Phase 6 🟡 live-action game, feedback rounds 4 + 5 · NOT committed · deploy ⛔
Repo: — (local git, main, last commit 33e61cd; all of this is in the working tree) · Live: — (the claude.ai link is the old game)
State: Title = the base + one START. First game = Nova's guided day (what to keep up / down, one full day). Each sol: alarm with
       spotlight + "!" + its own sound (10 s) → tap a tool, it flies in → mini-game (20 types, most tools have 2) → result →
       jobs in the base → night. Badges pop with a bell and pay stars; shop; red warnings when bars run low; a true story
       tied to one of the player's choices at the end. Spec v0.9: FOOD 28, H2O 12, BAT 5, LS wear every 2 sols, goal 16.
       1,000 games: (superseded by round 6)
       Typecheck, tests, build (JS 104 KB gz), check:content green. Headless: guided day + full missions, phone + desktop, 0 errors.
Next: (1) Lead reviews, then commit: `[P6][ui/engine/content] live-action base, tutorial, badges, tighter resources (D-031…D-042)`
      (2) Kid playtests → docs/playtest-notes.md: is 10 s enough per mini-game? does the tutorial hold a 7-year-old?
      (3) Decide P-011…P-015; re-run axe + Lighthouse on the new screens
      (4) GitHub repo + Pages, republish the preview link, tag v1.0
Blocked on: lead review; playtesters; GitHub login
Watch out: `copy.play` = live-action strings (the old button label is `copy.playBtn`). Mini-game per card: `tools.ts` (`alt` = the
           second game). Badges: `meta.ts → BADGE_DEFS`. `app.css` still holds unused cockpit rules.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 7
```

### Previous handoff (round 4, 01:40)
```
HANDOFF 2026-11-14 01:40 Cairo · from Claude (lead session) · Phase 6 🟡 live-action rebuild (D-031…D-034) · NOT committed · deploy ⛔
Repo: — (local git, main, last commit 33e61cd; the rebuild is in the working tree) · Live: — (the claude.ai link is the old game)
State: The game is now a cut-away Mars base. Each sol: an alarm in one room (10 s) → drag/tap one of 2 tools → win its mini-game
       (16 types, 60+ cards mapped) → crew cheers, numbers fly → send each astronaut to a job spot → night → next sol.
       Same engine, same cards, same numbers; scope 20 events. Star bank + shop + 9 badges + Training room. Sound in code.
       1,000-game balance (20 events): random 31 % · max shield 51 % · greed 13 % · balanced 82 % · best move 89 % (best move is 9 points over the 80 % target → P-014).
       132 tests, typecheck, build (JS 98 KB gz), check:content green. Headless full missions on phone + desktop: 0 errors.
Next: (1) Lead reviews, then commit: `[P6][ui/content] live-action base, tools + mini-games, rewards (D-031…D-034)`
      (2) Kid playtests of the mini-games (are 12 s enough? which ones frustrate?) → docs/playtest-notes.md → tune `tools.ts` params
      (3) Decide P-011 (★ cards = the doc's 2 active tools), P-012, P-013; re-run axe + Lighthouse on the new screens
      (4) GitHub repo + Pages, republish the preview link, tag v1.0
Blocked on: lead review; playtesters; GitHub login
Watch out: `copy.play` is now the live-action strings (the old button label is `copy.playBtn`). `Phases.tsx`, `Panels.tsx`,
           `Tutorial.tsx` are gone; `app.css` still holds their unused rules. Mini-game text lives in `copy.mini`/`copy.mech`.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 7
```

### Previous handoff (Phase 6, before the rebuild)
```
HANDOFF 2026-11-13 20:40 Cairo · from Claude (lead session) · Phase 6 🟡 (agent part done, rc1 tagged locally) · deploy ⛔
Repo: — (local git, main, tag v1.0-rc1) · Live (preview): https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio
State: One harder kid game: 14 challenges, one per day, surprise first with a 10 s timer (worst card on timeout), 3 big jobs,
       hover previews, science behind "?", day-by-day story at the end, tutorial on title/menu. Real DONKI beats sols 2/4/6/8.
       1,000-game balance: random 31 % · balanced 77 % · best move 82 % · max shield 70 % · greed 8 %.
       125 tests, typecheck, build, check:content green; axe 0 violations; Lighthouse 96/100/100.
Next: (1) 3 playtests (adults or kids with a parent; no faces/names) → docs/playtest-notes.md → bugs
      (2) Real phones (cheap Android, iPhone Safari) + a real projector
      (3) GitHub repo + Pages, then merge, tag v1.0, write FROZEN here (Phase 6 DoD)
      (4) P-008 source links (people), optional P-009 NASA photo
Blocked on: playtesters; GitHub login; lead OK on the best-move 82 % miss
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 7
```

### Previous handoff (Phase 5)
```
HANDOFF 2026-11-13 20:05 Cairo · from Claude (lead session) · Phase 5 🟡 (report done; tuning P-010 waits for the lead) · Phase 1 deploy ⛔
Repo: — (local git, main) · Live (preview): https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio · Last commit: `git log -1`
State: ONE kid game (M3 Storm from the Sun, D-021) with a guided first sol (D-022), base LEFT / crew RIGHT (D-023), jobs one
       astronaut at a time (D-024), kid-critique fixes (D-025). Real DONKI beats on sols 2 and 6 with honest labels.
       Balance report (1,000 games × 5 bots × M3/M1) + 2 SVG charts in docs/. 120 tests, typecheck, build, check:content green.
Next: (1) Lead: decide P-010 (recommended: no tuning) and P-007; then Phase 6 (playtest, polish, freeze)
      (2) Two adults play from the link → docs/playtest-notes.md
      (3) GitHub: approve a device login or push yourself → Pages
Blocked on: lead decisions P-002…P-010; playtesters; GitHub login
Watch out: `npm run sim -- --report` takes ~11 min for 1,000 games (bestMove does a lookahead per card).
           Tutorial steps live in src/ui/components/Tutorial.tsx (selectors must match the UI classes).
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 6
```

### Previous handoff (Phase 4)
```
HANDOFF 2026-11-13 19:31 Cairo · from Claude (lead session) · Phase 4 🟡 (code done; human playtests open) · Phase 1 deploy ⛔
Repo: — (local git, main) · Live (preview): https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio · Last commit: `git log -1`
State: Kid-simplified game (D-018…D-020): 10 easy surprises, 4 jobs per astronaut, resources on the left, short text.
       M1 + M3 play title → debrief on laptop, phone and projector with no console errors. 117 tests, typecheck, build,
       check:content green. JS 72 KB gz, first load ~141 KB, Lighthouse 93/100/100.
Next: (1) Two adults play M1 from the link and fill docs/playtest-notes.md (Phase 4 DoD)
      (2) GitHub: approve a device login or push yourself → Pages (Phase 1 DoD)
      (3) Phase 5: decide the win-rate target (P-007), then tune; kids guide update (B-002)
Blocked on: playtesters; GitHub login; P-002…P-009
Watch out: content.json is generated: after any spec/overrides edit run `npm run spec:extract` (a test fails if stale).
           The engine still supports all 60 events (tests use a full-scope mission); the kid scope lives in missions.ts.
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 5
```

### Previous handoff (Phase 3)
```
HANDOFF 2026-11-13 19:07 Cairo · from Claude (lead session) · Phase 3 ✅ · Phase 4 🟡 (UI playable) · Phase 1 deploy ⛔
Repo: — (local git, main) · Live (preview): https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio · Last commit: `git log -1`
State: M1 and M3 Cadet play end to end in the browser (cockpit design from the lead's canvas). M3 replays 3 real DONKI
       May 2024 records with honest labels. Every Must event has a kid True story + [S#]; glossary tooltips; sources audited.
       112 tests, typecheck, build, check:content (0 errors) all green. JS 73 KB gz.
Next: (1) Human: approve a GitHub login (or create the repo + push yourself), then Pages → GitHub Actions; the agent can push
      (2) Phase 4 finish: real-phone + projector test, keyboard pass, first-use-only glossary, Commander hidden
      (3) Phase 5: balance (P-007: M1 too easy), more bots, docs/balance-report.md
Blocked on: GitHub login; lead decisions P-002…P-009
Watch out: to refresh the preview link: `BASE=./ npx vite build --outDir <scratch>/site`, update the entry page's asset names, republish.
           Background image has a Moon in the Mars sky (P-009). Non-Must events still have 107 prose cells (warnings only).
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 4 / 5
```

### Previous handoff (Phase 2)
```
HANDOFF 2026-11-13 18:37 Cairo · from Claude (lead session, lane E + S support) · Phase 2 ✅ (local), Phase 1 deploy ⛔
Repo: — (local git, branch main) · Live: — · Branch: main · Last commit: see `git log -1`
State: The engine plays full M1 Cadet games headless from a seed (and a draft M3). D-017 shared crew stats are in spec v0.4,
       the kids guide and the engine. All 37 MVP events are fully parsed (overrides.ts). 102 tests green; typecheck, build,
       check:content green. `npm run sim -- --mission M1 --seed 42 --verbose` prints a readable sol-by-sol log + debrief.
Next: (1) Human: finish the GitHub login (see the final chat message), then the agent creates `mars-base-adventure`, pushes, enables Pages
      (2) U, Phase 4: build the screens on createEngine(CONTENT) + format.ts (setup → morning → power → tasks → event → night → debrief)
      (3) S, Phase 3: DONKI snapshot + M3 real records (P-001), the 107 non-MVP prose cells, full check-content, source audit (N-05)
      (4) E, Phase 5: balance (P-007: M1 is too easy), more bots, docs/balance-report.md
Blocked on: GitHub login (1.4); P-001…P-007 decisions; Q2; Submission Guide (Q5)
Watch out: Commander rules are only partly done (2nd event per sol and MG-04 not yet; SW-06/MG-04 wait for P-005).
           Engine assumptions are listed in P-006 and marked ASSUMPTION in config.ts/hooks.ts.
           spec.json now holds the card tables: re-run `npm run spec:extract` after any spec edit (a test checks it).
Read first: CLAUDE.md → PROGRESS.md → PLAN.md §6 Phase 3 / 4 / 5 (per lane)
```

### Previous handoff (Phase 1)
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
| 2026-11-14 08:20–08:55 | Claude (lead session, U) | Nova's voice: fixed browser-speech timing, then moved to bundled clips (D-067) after the lead reported it silent on PC; P-019 | `src/ui/**`, `scripts/make-voice.py`, `public/audio/nova/*`, tests |
| 2026-11-14 08:00–08:10 | Claude (lead session, U + L) | `vercel.json` (build at the site root); the lead deployed to Vercel; live link checked and recorded | `vercel.json`, `PROGRESS.md`, `README.md`, `docs/submission/project-description.md` |
| 2026-11-14 07:25–07:50 | Claude (lead session, U) | Lead feedback round 11 → D-066 (shop 32 items, ranks, 2 badges); second judging self-check given to the lead in chat | `src/ui/**`, copy, `tests/ui/live.test.ts` |
| 2026-11-14 06:30–07:10 | Claude (lead session, S + E + U + P) | "Fix the weaknesses" → D-064, D-065: balance inside targets, six NASA-original sources (verified by fetching the pages), real DONKI records in Survival, honesty labels, AI picture removed, earlier radiation warning, shorter tutorial, core bars bigger; spec v0.14; draft project description | `src/**`, `tests/**`, `events-and-actions.md`, guides, `docs/submission/project-description.md`, `docs/balance-report.*` |
| 2026-11-14 05:50–06:20 | Claude (lead session, U + S + E) | Lead feedback round 9 → D-061…D-063: cost/gives/later lines + decision scene, animated intro and 3 endings, 4 events for OSDR and comms delay, goal 18; spec v0.13 | `src/ui/**`, `src/content/**`, `src/engine/config.ts`, tests, `events-and-actions.md`, guides |
| 2026-11-14 05:15–05:40 | Claude (lead session, E + S) | Lead feedback round 8 → D-059, D-060; spec v0.12; link check of the 26 sources used in play; judging self-check → P-018 | `src/engine/**`, `src/ui/game/Hud.tsx`, copy, tests, `events-and-actions.md` |
| 2026-11-14 04:05–05:00 | Claude (lead session, U + E + S) | Lead feedback round 7 → D-050…D-058: Survival mode + scores, oxygen/shield/food/water wear, health check, main-menu button, 26 unique skills, Nova's voice + talking + pointing, 3 sound switches, hover tick, "?" at the pointer, new title; spec v0.11; P-017 | `src/**`, `tests/**`, `events-and-actions.md`, `index.html`, guides, `README.md`, `docs/balance-report.*` |
| 2026-11-14 03:05–04:00 | Claude (lead session, U + E + S) | Lead feedback round 6 → D-043…D-049: 7 sols + re-timed real storm beats, one food/water bar, ice job, hidden supplies, 8 s alarms, screen moods + state visuals, Training room + 9 NASA pictures, ambient sound, 4 new mechanics, title, story pop-up, "?" fix; spec v0.10; P-016 | `src/**`, `public/img/nasa/*`, `scripts/build-donki-timeline.ts`, `tests/**`, `events-and-actions.md`, guides, `docs/data-sources.md`, `README.md` |
| 2026-11-14 02:05–03:00 | Claude (lead session, U + E + S) | Lead feedback round 5 → D-035…D-042: guided first day, spotlight, 4 new mini-game types + alternatives + faster, live badges with stars, harder stores/goal + warnings, end story, 15 new sounds, new title; spec v0.9; tests 137; P-015 | `src/ui/**`, `src/engine/config.ts`, `src/content/copy.ts`, `tests/**`, `events-and-actions.md`, guides, `README.md`, `docs/balance-report.*` |
| 2026-11-14 00:45–01:40 | Claude (lead session, U + S + L) | Lead feedback round 4 (`Current_Feedback.md`, `Game_Mechanics.md`, `Game_Theater.md`, `reward_system_and_visuals.md`) → D-031…D-034: dollhouse scene, tools + 16 mini-game types, moods, sound, floaters, star bank/shop/badges, Training room; old cockpit screens removed; scope 14 → 20 events; spec v0.8; balance report regenerated; 7 new tests; P-011…P-013 | `src/ui/**`, `src/content/copy.ts`, `src/content/missions.ts`, `tests/ui/live.test.ts`, `vitest.config.ts`, `events-and-actions.md`, `mars-adventure-kids-guide.md`, `docs/**`, `README.md` |
| 2026-11-13 20:06–20:40 | Claude (lead session) | Lead feedback round 3 → D-026…D-030 (14 challenges/day, surprise first + timer, 3 jobs, fewer words + "?" + hover previews + no night screens, goal 14); spec v0.7; kids guide; Phase 6: axe/Lighthouse/throttle checks, science pass, teacher guide, README; balance report (1,000 games); rc1 tag | `src/**`, `tests/**`, `events-and-actions.md`, `mars-adventure-kids-guide.md`, `docs/**`, `README.md`, `PROGRESS.md` |
| 2026-11-13 19:32–20:05 | Claude (lead session) | Lead feedback round 2 (D-021 one game, D-022 tutorial, D-023 crew right, D-024 jobs in a row); kid critique → D-025; spec v0.6; Phase 5: 5 bots, balance report + charts, tuning experiments → P-010; M3 storm warning/glow/replay text | `src/**`, `scripts/simulate.ts`, `docs/balance-report.*`, `docs/charts/*`, `events-and-actions.md`, `README.md`, `PROGRESS.md` |
| 2026-11-13 19:08–19:31 | Claude (lead session) | Lead feedback → D-018 kid scope, D-019 4 jobs, D-020 simpler screens; spec v0.5; UI rebuilt (resources left, one astronaut at a time on phones, short texts); settings; build-time content.json; projector/throttle/Lighthouse checks; playtest-notes template | `events-and-actions.md`, `src/**`, `scripts/build-content.ts`, `tests/**`, `docs/**`, `PROGRESS.md` |
| 2026-11-13 18:40–19:07 | Claude (lead session) | Playable cockpit UI from the lead's design canvas + claude.ai preview link; Phase 3: DONKI snapshot, M3 real timeline, source audit, stories, glossary, full check-content, data-sources.md, science review; P-008, P-009; P-001 superseded | `src/ui/**`, `src/content/**`, `scripts/**`, `data/donki/**`, `docs/data-sources.md`, `tests/**`, `public/**`, `PROGRESS.md` |
| 2026-11-13 17:55–18:37 | Claude (lead session, E + S) | D-017 shared stats → spec v0.4 + kids guide; spec-extract §7/§4; overrides for 37 MVP events; engine core (18 modules, contract v2); sim + bots; 102 tests; P-005…P-007. GitHub device login tried twice (expired) | `events-and-actions.md`, `mars-adventure-kids-guide.md`, `scripts/**`, `src/engine/**`, `src/content/**`, `src/sim/**`, `tests/**`, `PROGRESS.md` |
| 2026-11-13 17:35–18:00 | Claude (lead session, U+E+S) | Phase 1: scaffold, workflows, title/sources/settings screens, tokens, font, icons; contract v1 (types, rng + tests, config, index stubs, fixture); spec-extract v0 + spec.json + extract tests; script stubs; README. Q3 → English only | `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, `src/**`, `scripts/**`, `tests/**`, `public/**`, `.github/workflows/**`, `README.md`, `PROGRESS.md` |
| 2026-11-13 17:20–17:50 | Claude (lead session, L+S) | Phase 0: DONKI curl check → Data notes; lead approved A-01…A-15 (N = defaults, N-08 closed); applied D-001…D-016 → spec v0.3 + kids guide; raised P-001…P-004, Q6; local git init + MIT LICENSE + .gitignore + first commit | `events-and-actions.md`, `mars-adventure-kids-guide.md`, `PROGRESS.md`, `LICENSE`, `.gitignore` |
| 2026-11-13 | Claude (planning) | Read challenge + spec v0.2 + kids guide; wrote the phase plan, MVP scope, stack, 15 blocking + 8 non-blocking spec issues, agent rules, shared state | `PLAN.md`, `CLAUDE.md`, `PROGRESS.md` |
