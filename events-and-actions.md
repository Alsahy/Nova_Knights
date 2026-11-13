# Junior Astronaut Mission Trainer: Mars Events & Action Cards

**Version 0.5 (Mars only, kid scope) · 13 Nov 2026 · NASA Space Apps 2026 (Cairo)**
This is the logic sketch for a card game where kids (7–12) run a **Mars outpost** with 4 astronauts and 4 systems. The theme and art will come later. The file lists every event, every choice, what each choice costs, and the real NASA fact behind it.

> **What changed from v0.4** (lead decisions after the first playtest of the UI, 13 Nov 2026)
> - **D-018 Kid scope.** The playable game uses only **10 easy surprises** a 7–12-year-old can face and win: FD-01, PW-02, PW-03, PW-08, LS-03, LS-05, RS-01, RS-04 (M1 *First Steps*) + SW-01, SW-02 from real May 2024 DONKI data (M3 *Storm from the Sun*). Setup is FD-01 only. Chains to events outside the scope never happen and are not shown on cards. All 60 events stay in this file as the full design (§8.4).
> - **D-019 Four jobs per astronaut.** Each role has exactly 4 daily jobs, all its own (no stand-in rule in the kid game) (§8.4).
> - **D-020 Simpler sol.** No separate morning or power-plan screen for kids: the game skips them; PW-08 still appears as a card when power runs short (§2.4, §8.4).

> **What changed from v0.3** (lead decision, 13 Nov 2026)
> - **D-017 Shared crew stats.** The crew shares **one** set of stats instead of one card per astronaut: 🍽️ FUL, 💧 HYD, 🫁 AIR and ⚡ EN are crew pools (0–20, i.e. 4 astronauts × 5) and ☢️ DOSE is one crew badge (0–10). Roles still decide who can play a card and who is in Sick Bay. Rules in §2.2; targets in §3; SW-07 and CR-07 adjusted. SW-06 and MG-04 (Commander) wait for a rework (P-005).

> **What changed from v0.2** (lead decisions, 13 Nov 2026; full text in `PROGRESS.md → Decisions`)
> - **D-001 (A-01) Task timing:** tasks are *planned* in step 3 and *resolved* at the start of Night, after the event. Fixed night order (§2.4).
> - **D-002 (A-02) Power:** base need = LS 2 + recycler 1 + greenhouse 1 (+ heaters). Lab and comms power is paid only through task/card costs. Solar = `floor(4 × multiplier) − dust stacks` (§2.1).
> - **D-003 (A-03) PW-08** is the Power Plan's shortage mode and doesn't use the event slot (§2.1, PW-08).
> - **D-004 (A-04) Morning Briefing slot** for timers (RS-04, CR-01) and FD-01 re-planting; automatic dust stacks; slot priority; 3-sol condition cooldown (§2.4, §8.3).
> - **D-005 (A-05) Science points:** all SP starts *pending*; only *banked* SP counts; RS-04 also fires on the last sol (RS-04, §2.5).
> - **D-006 (A-06) Roles:** superpowers *are* the role-exclusive tasks and cards; listed cost = specialist price; RES ×2 only on tasks marked so; new `repair` tag (§2.3, §3).
> - **D-007 (A-07) Shield tier** = `floor(SH / 3)` (§2.6).
> - **D-008 (A-08) Storm-dose honesty label:** storm doses are *game-exaggerated*; the real May 2024 Mars dose was ≈ 8 mGy (§2.6).
> - **D-009 (A-09) M3** is a *compressed storm replay*: each scripted beat shows its real DONKI record and date (§5, §8.2).
> - **D-010 (A-10) Badge colours** green 0–3 · yellow 4–6 · red 7–10; M3 goal = every DOSE ≤ 6 (§1.2, §2.6, §8.2).
> - **D-011 (A-11) CR-07** fires at EN ≤ 1; leaving Sick Bay sets the stat that hit 0 to 2 (§2.2, CR-07).
> - **D-012 (A-12)** `broken:<system>` flags; ⏳ with no N = ⏳1; rule for when no card is affordable (§3).
> - **D-013 (A-13)** Missing numbers filled: EVA mishap, CR-04 chance, science kit, MG-02 trigger, T-GARDEN, water-wall cap, Cadet risk words (§3, §4, FD-04, CR-04/05/06, MG-02).
> - **D-014 (A-14)** 8-sol missions plant lettuce vs radishes; Cadet pepper pollination is automatic (FD-01).
> - **D-015 (A-15)** LS-02 is a plain 2-card Cadet event; the puzzle is cut to Could (LS-02).
> - All numbers stay **starter values** for the simulator. No `[S#]` was removed.

> **What changed from v0.1**
> - **Mars only.** Moon events were removed or rewritten for Mars. Four Mars events are new: SW-08 *Earth Is Safe, Mars Is Not*, PW-06 *Power Fading Slowly* (InSight), RS-07 *Space Rock Hits Mars!*, MG-04 *The Long Trip*. FD-04 became *Pack the Cargo*.
> - **Missions and decks (§8).** There are 8 Mars missions plus Free Play. **One game never uses all 60 events.** Each game builds its own deck: Cadet players meet about **8–12 events**, Commander players about **15–22**. Play again → new surprises.
> - A kid-friendly companion file, **mars-adventure-kids-guide.md**, explains all of this in simple words.

> **How to read this file**
> - Every event has an ID like `SW-02`. Every action card inside it is numbered `SW-02.a`, `.b`, `.c`.
> - Every card has a **cost now** and/or a **cost later (⏳)** or a **lost chance**. No card is free. That's the core lesson.
> - Every event has a **Real science** line with a source tag like `[S12]`. All sources are listed in §11.
> - Numbers in the cards are **starter values for balancing**. Tune them with the simulator (§1.4).
> - ★ = card shown in **Cadet mode (7–9)**, which shows 2 cards. **Commander mode (10–12)** shows all 3.
> - **Deck tags** (§8.1): 🟢 Core · 🎯 Mission · 🔗 Chain · ⚠️ Condition · 📅 Timer · ☀️ DONKI · 🚀 Setup.

> **Data status (checked 12–13 Nov 2026)**
> - The challenge **Resources tab** could not be fetched by my tools (the site blocks robots), so the data choices follow the challenge text (DONKI, OSDR, Mars surface mission data) and api.nasa.gov.
> - **DONKI has moved.** Since 30 Sep 2026 it lives at `https://ccmc.gsfc.nasa.gov/DONKI-API/get/<type>`. Same parameters and JSON, **no API key needed**. The old `api.nasa.gov/DONKI` returns an HTML page instead [S1].
> - The **Mars Rover Photos API on api.nasa.gov is archived** [S57]. Bundle card images locally instead, with a credit line on each.

---

## Table of contents
1. Kid-balance rules
2. Game model (systems, astronaut cards, roles, a sol, how missions end, real→game scale)
3. Effect notation (for programmers)
4. Daily task cards (always available)
5. DONKI → event mapping (Mars)
6. Event index
7. Events in detail
   - 7.1 Space weather & radiation (SW)
   - 7.2 Power (PW)
   - 7.3 Life support (LS)
   - 7.4 Food & greenhouse (FD)
   - 7.5 Crew health (CR)
   - 7.6 Research (RS)
   - 7.7 Communication (CM)
   - 7.8 Mission & leadership (MG)
8. Mars missions & decks (not every event in every game)
9. Coverage check vs the challenge
10. Data structures (TypeScript)
11. Sources

---

## 1. Kid-balance rules (ages 7–12)

### 1.1 Ten rules every card must follow
1. **2–3 choices per event.** Cadet sees 2 (★). Commander sees 3.
2. **No free lunch.** Every card has a cost now, a cost later (⏳), or a lost chance. The checker in §1.4 enforces this.
3. **No always-best card.** Each card must be the best pick in at least one game situation. Test this with the simulator.
4. **Show costs before effects.** The UI shows the red cost icons first, then the green effect icons.
5. **Short words.** At most 12 words per card line. Explain each science word with a one-line tooltip the first time it appears (sol, dose, CME, tau, CO₂, perchlorate…).
6. **Risks in kid words.** Cadet sees "Maybe (1 in 3)". Commander sees "30%".
7. **Warnings before big trouble.** Dust storms and CME clouds always give at least 1 sol of warning. The **one exception is SW-02 Radiation Storm**: real solar particles arrive in minutes, so the lesson is "prepare before it happens".
8. **Room to recover.** An emergency gives 1 sol to fix it before the mission ends.
9. **Nothing scary.** No one dies. A failed mission ends with *"Mission Control brings the crew home safely"*. Fire is "smoke and coughing". A machine "breaks with a loud POP".
10. **Teach on failure.** Every ending shows: what happened → which choice caused it → what real NASA planners do.

### 1.2 Cadet vs Commander

| Setting | Cadet (7–9) | Commander (10–12) |
|---|---|---|
| Mission length | 8–10 sols | 16–20 sols |
| Science goal | 6–8 SP (set by mission) | 14–18 SP (set by mission) |
| Events per sol | 0–1 (30% of sols are quiet) | 1 (15% quiet), +1 if DONKI has a real event that sol |
| Events seen per game | ~8–12 of 60 | ~15–22 of 60 |
| Choices shown | 2 (★) | 3 |
| Crew stats shown (shared, D-017) | 🍽️ Food, 💧 Water, ⚡ Energy bars (🫁 Air only during EVA). Dose as one crew badge: green 0–3 · yellow 4–6 · red 7–10 (D-010) | All 5 as numbers |
| Commander-only events | hidden | shown |

### 1.3 Starter values (missions can change these, see §8)

| Thing | Cadet | Commander | Notes |
|---|---|---|---|
| 🫁 LS Life Support | 8 | 7 | 0–10 |
| 🛡️ SH Shield | 4 | 3 | 0–10 |
| 🔬 LAB Lab readiness | 8 | 7 | 0–10 |
| 🔋 BAT Battery | 6 | 5 | max 10 |
| 🥫 FOOD | 40 | 70 | 1 = one astronaut's food for one sol |
| 💧 H2O | 18 | 25 | 1 = one astronaut's drinking water for one sol |
| 🫧 O2T Oxygen tanks | 3 | 2 | emergency air |
| 🔩 PARTS Spare parts | 4 | 3 | |
| 🩹 MEDKIT | 3 | 2 | |
| Crew stats (shared, D-017) | FUL 16, HYD 16, AIR 20, EN 16 (max 20), DOSE 0 | same, but DOSE from MG-04 (2–3) | pools 0–20 (4 astronauts × 5), DOSE 0–10 |

### 1.4 Balance targets (for the simulator)
Run 1,000 seeded games per **mission** and strategy: *max-shield*, *max-science*, *balanced*, *random*.
- No single strategy wins more than **80%** of games.
- Balanced play wins **60–75%**.
- Pure greed (max-science, never repairs) **loses most** games.
- Automated checks: every action card has a cost (`costNow` not empty, or `later` contains a negative effect, or `lostChance` is set), and every card is chosen by the "best-move" bot in at least one state.
- Variety check: across 100 games of one mission, at least **70%** of that mission's deck appears at least once, and no two games show the exact same event list.

---

## 2. Game model

### 2.1 The 4 systems + supplies

| System | Icon | What it means | Needs each sol | Goes down when… |
|---|---|---|---|---|
| **Life Support (LS)** | 🫁 | Air (O₂ in, CO₂ out), water recycling, temperature | ⚡2 to run (includes the oxygen maker). The oxygen maker also uses 💧1 per sol (it makes air from water) | Unpowered: LS −2. Wear: −1 every 3 sols unless maintained. Breakdown events |
| **Radiation Shield (SH)** | 🛡️ | Soil walls, water walls, storm shelter | nothing | Rarely. Drops if a water wall is used up (see T-WATERWALL) |
| **Power** | ⚡ | Today's power tokens (PWR) + battery (BAT) | — | Dust, cold, broken cables, worn-out panels |
| **Research (LAB + SP)** | 🔬 | LAB = how ready the lab is; SP = science points (the mission goal) | nothing fixed: lab power is paid by the task cost (T-LAB `PWR-1`) | LAB −1 every 4 sols (wear). Breakdown events |

**Supplies:** 🥫 FOOD · 💧 H2O · 🫧 O2T (oxygen tanks) · 🔩 PARTS · 🩹 MEDKIT.

**Daily power on Mars (game values):**

| Source | Value |
|---|---|
| Solar, clear sky | 4 |
| Solar in dust (tau 1–2 / 2–5 / >5) | ×0.6 / ×0.3 / ×0.05 |
| Dust stacking on panels | −1 per stack (a new stack every 4 sols until cleaned) |
| Small reactor (default) | +2 every sol (PW-10 can change this) |

**Today's power (D-002):** solar = `floor(4 × dust multiplier) − dust stacks` (minimum 0), then + reactor 2. **Budget** = today's PWR + BAT.

**Daily power needs (D-002):** base need = LS 2 · Water recycler 1 · Greenhouse 1 (only while a crop is growing) · Heaters (only when a cold event adds them). Lab and comms power is **not** a daily need: it is paid **only** through task and card costs (e.g. T-LAB, T-SEND, T-CALL `PWR-1`), so it is never counted twice. Leftover power fills the battery.

**Shortage (D-003):** if the need is bigger than today's power plus the battery, the **Power Plan** step switches to **PW-08's shortage mode** and shows PW-08's cards (unplug the lab / the greenhouse / turn down LS). It does **not** use the event slot. If an event later in the same sol adds a need, the battery covers it; if the battery can't, LS is unpowered that night (`LS-2`).

### 2.2 Crew card (shared by the whole crew, D-017)

The 4 astronauts share **one** crew card. Each pool is the sum of what 4 people would have (4 × 0–5 = 0–20), so the card costs keep their size. Roles still matter: they decide who can play a card or do a task (§2.3), and each astronaut can be in Sick Bay on their own.

| Stat | Icon | Scale | Sol upkeep (automatic at night) |
|---|---|---|---|
| Fullness (hunger) | 🍽️ FUL | 0–20 | Each astronaut eats 1 FOOD → FUL stays. For each astronaut with no food → FUL −1 |
| Hydration (thirst) | 💧 HYD | 0–20 | Recycler ON: the crew drinks without using stock (see the recycler loss rule). Recycler OFF: H2O −1 per astronaut. For each astronaut with no water → HYD −1 |
| Air | 🫁 AIR | 0–20 | Inside: LS ≥4 → AIR refills to 20. LS 1–3 → AIR −4. LS 0 → AIR −8 (−1 / −2 per astronaut). EVA suits use AIR from the pool |
| Energy | ⚡ EN | 0–20 (cap ENMAX 20) | +1 per astronaut from sleep each night (+4). The *Rest* task gives +3 instead of working |
| Radiation dose | ☢️ DOSE | 0–10 (never goes down) | **One crew badge.** Trip (MG-04) + background + EVA + storms (§2.6) |

**How card targets hit the shared pools (D-017):**
- `ME`, `PICK`, `[Name]` and role targets (`ENG.EN-2`) change the pool **once** (`ENG.EN-2` → crew EN −2).
- `ALL` changes the pool **once per astronaut not in Sick Bay** (`ALL.EN-1` → −1 × 4 = −4). `EVA` changes it once per astronaut outside today. `EN-2 each` = once per named astronaut.
- **DOSE** is one badge: any DOSE effect is applied **once**, whatever the target (`ALL.DOSE+2` → badge +2).
- `[Name]` events still name one astronaut for the story and for who skips tasks (e.g. CR-02 "[Name] skips first task tomorrow").

- **A pool (FUL/HYD/AIR/EN) reaches 0** → one astronaut (seeded pick among those not in Sick Bay) goes to **Sick Bay** (no tasks for 2 sols), and that pool is reset to **4** so the crew can recover (D-017, replaces D-011's per-astronaut reset). MED's *Treat* task brings them back next sol.
- **DOSE reaches 10** → the **whole crew** is "Indoor only" for the rest of the mission (no EVAs). This is the career-limit lesson.

### 2.3 The 4 roles
These match the real roles in NASA's year-long Mars-habitat test (CHAPEA): Commander, Flight Engineer, Medical Officer, Science Officer [S43].

| ID | Your name | NASA analog name | Superpower | Unique cards |
|---|---|---|---|---|
| `MGR` | Manager | Commander | **Plan Ahead** (= T-PLAN): peek at the next event. **Pep Talk** (= T-PEP): spend 1 EN to give another astronaut +2 EN | Ration orders, Ask Earth, end/continue mission, power plan |
| `ENG` | Engineer | Flight Engineer | **Fixer**: repair cards list the engineer's (lower) price; anyone else pays the fallback | Install upgrades, splice cables, build shields |
| `MED` | Medical | Medical Officer | **Doctor**: sees exact dose numbers (T-MED); *Treat* returns Sick Bay astronauts next sol | Treat, check-ups, sleep plans, vitamins |
| `RES` | Researcher | Science Officer | **Scientist**: tasks marked "RES ×2" give ×2 SP; +1 FOOD on each harvest they tended | Experiments, soil tests, hand pollination |

**Superpowers are cards, not extra actions (D-006).** Each superpower *is* that role's exclusive tasks and cards; there are no extra free actions. MGR's *Plan Ahead* = T-PLAN and *Pep Talk* = T-PEP (both cost `MGR.EN-1`). ENG's *Fixer*: the costs listed on repair cards are **already** the engineer's price. RES's ×2 SP applies **only** to tasks marked "RES ×2" (T-LAB, T-EVA-SCI), not to event SP. MED's exact dose numbers come from T-MED and SW-07.b.

**Fallback rule:** if the right role can't play a card (Sick Bay, or Indoor-only for an EVA card), **anyone** can try it for **+1 EN** with a **50% chance** to work. The costs are paid even if it fails (D-006). This keeps the game playable and teaches why specialists matter.

### 2.4 One sol (turn)
A Mars day ("sol") is 24 hours 39 minutes long [S7].
1. **Morning report** – Sun and space weather (DONKI), dust level (tau) and any new dust stack (added automatically, D-004), messages from Earth. Plus at most **one Morning Briefing card** (D-004): a due timer event (RS-04, CR-01) or FD-01 re-planting, with its normal cards and costs. The briefing doesn't count against the event cap.
2. **Power plan** – plug systems into today's ⚡ (drag tokens). If need > PWR + BAT, this step shows PW-08's cards (D-003). *Kid game (D-020): no power-plan screen; everything stays plugged in and PW-08 shows as a card only when power is short.*
3. **Crew tasks** – each astronaut **plans** 1 task from §4, or rests (D-001). Tasks are resolved at night.
4. **Event** – follow the draw order in §8.3.
5. **Choose** – pick 1 action card. An event can cancel or change planned tasks (e.g. SW-01.a "LOST: today's EVA tasks").
6. **Night** (fixed order, D-001):
   1. resolve the planned tasks that are still allowed
   2. settle power (need vs PWR + BAT; leftover → battery)
   3. upkeep: eat, drink, oxygen maker H2O, AIR, sleep (§2.2)
   4. ⏳ delayed effects that are due
   5. greenhouse growth and harvests
   6. wear, dust and background-dose timers
   7. tick down modifiers (flags with a duration)
   8. Sick Bay / Indoor-only checks
   9. ending checks (§2.5)
   10. show the "What happened today" mini-log

### 2.5 How a mission ends
- 🏆 **Mission Success**: reach the last sol and meet the mission goal (§8.2). Only **banked** SP (sent to Earth) counts toward the goal (D-005).
- 🟡 **Safe Return**: reach the last sol, or choose MG-02, without meeting the goal. Still a celebration, plus a debrief.
- 🔴 **Brought Home Early**: LS = 0 for 2 sols in a row, OR 3 astronauts in Sick Bay at once, OR the battery is empty and LS has had no power for 2 sols.
- Every ending shows the **debrief**: your 3 biggest choices → what they caused → what real NASA does.

### 2.6 Real → game scale (the honesty table)
**Principle:** *keep real ratios, shrink sizes.* Slow processes (dose build-up, crop growth, body weakening) run **×15 faster** (`TIME_SCALE = 15`) so kids can see them in a short game. Say this on the "How this game uses real data" screen.

| Real fact | Game value | Source |
|---|---|---|
| Career radiation limit 600 mSv | DOSE 10 = "Indoor only" (1 pip ≈ 60 mSv) | [S9] |
| Limit for one solar particle event 250 mSv | Worst storm = +4 DOSE | [S9] |
| Mars surface ≈ 0.64 mSv/day; deep-space cruise ≈ 1.8 mSv/day | Background +1 DOSE every **6** sols (with TIME_SCALE); the trip gives a starting DOSE (MG-04) | [S8] |
| May 2024: Curiosity's biggest radiation surge since 2012, 8,100 µGy (≈ 8 mGy) | A big storm = +2 to +4 DOSE unsheltered. **Game-exaggerated** (D-008): that is 120–240 mSv in game units, about 10× or more the real dose. See the label below | [S6][S9] |
| Mars gets 586 W/m² of sunlight vs Earth's 1,361 (43%) | Solar 4 tokens on a clear sol | [S13] |
| Opportunity: 468 Wh at tau ≈1 → 21 Wh at tau 10.8 (−97%) | Dust multipliers ×0.6 / ×0.3 / ×0.05 | [S16][S15] |
| Water recovery 93–94% → 98% with the Brine Processor | 4 crew lose 1 H2O every **4** sols → every **12** sols after the upgrade | [S27] |
| ~0.8 kg O₂ per person per day, made by splitting water | Oxygen maker uses 💧1 per sol (game-simplified; the real amount is higher) | [S21][S28] |
| ≈3,035 kcal/day per astronaut; ≥2.5 L drinking water/day | 1 FOOD and 1 H2O per astronaut per sol | [S20] |
| Lettuce seed→salad 33 days; peppers 137 days | Lettuce ⏳2 sols, peppers ⏳9 sols (TIME_SCALE) | [S33][S34] |
| Earth–Mars signal delay ≈ 3–22 min each way | "Ask Earth" answers arrive *after* the current event (too late for emergencies) | [S54][S44] |
| Mars gravity ≈ 38% of Earth's | Flavor + CR-06 | [S13] |

**Storm honesty label (D-008)**, shown on the "How this game uses real data" screen and next to storm doses:
> *"Storms are made bigger in the game so shields matter. The real May 2024 storm at Mars was about 8 mGy, like 30 chest X-rays [S6]. The game's worst storm (+4) is close to NASA's 250 mSv single-event limit [S9]."*

**Radiation math (simple):**
- **Shield tier (D-007):** tier = `floor(SH / 3)` → SH 0–2 → tier 0 · SH 3–5 → tier 1 · SH 6–8 → tier 2 · SH 9–10 → tier 3. (So a +2 shield card lifts a Cadet base from SH 4 to SH 6 = tier 2.)
- **Storm dose (inside, not sheltered)** = max(0, S − tier). **Sheltered** = max(0, S − tier − 2). **Outside on EVA** = S (no shield).
- **Background:** +1 DOSE every 6 sols. Shield tier ≥ 2 → every 12 sols.
- **Dose badge colours (D-010):** green 0–3 · yellow 4–6 · red 7–10.
- **EVA dose:** +1 with a 50% chance per EVA (Mars' air and the planet itself block some radiation, so the surface dose is lower than in space [S8]).

---

## 3. Effect notation (for programmers)

Effects are written as `TARGET.STAT ±N` or `SUPPLY ±N`, joined by `;`.

| Token | Meaning |
|---|---|
| `LS`, `SH`, `LAB`, `BAT`, `PWR`, `SP` | systems / today's power / science points |
| `FOOD`, `H2O`, `O2T`, `PARTS`, `MEDKIT` | supplies |
| `ALL`, `ME`, `MGR`, `ENG`, `MED`, `RES`, `EVA`, `PICK` | targets (`ME` = whoever plays the card; `EVA` = astronauts outside today; `PICK` = player picks one). Stats are shared crew pools: see §2.2 for how each target counts (D-017) |
| `.FUL`, `.HYD`, `.AIR`, `.EN`, `.DOSE`, `.ENMAX` | astronaut stats (`.ENMAX` = max energy cap) |
| `⏳N:` | happens N sols later |
| `p=0.3:` | 30% chance (Cadet text: "maybe, 1 in 3") |
| `+FLAG:name` / `-FLAG:name` | set or clear a game flag |
| `→ EVT-ID` | triggers another event |
| `LOST:` | lost chance (counts as a cost), e.g. `LOST: lab SP today` |
| `+FLAG:broken:<system>` | a system is broken "until fixed" (D-012), e.g. `broken:o2maker` |
| tag `repair` | marks a repair card (D-006). MG-02.b ("repairs work double") and PW-10.c ("repairs cost 1 EN less") apply only to cards with this tag |

Example: `ENG.EN-2; PARTS-1` (cost now) → `LS+3` (effect).

**Open-ended effects (D-012):**
- **"Until fixed" / "still broken tomorrow"** becomes a `broken:<system>` flag. It is cleared by that event's repair card, or by T-MAINT-LS paying an extra `PARTS-1`. While `broken:o2maker`: `LS-1` each night, and the oxygen maker uses no H2O.
- **A ⏳ with no number** means **⏳1**. The content lane logs each one it normalises.
- **No affordable card:** if no shown card can be paid for, reveal card c. If c can't be paid either, show *"We can't fix it today"*: the system stays broken and the event comes back next sol.

**Cadet risk words (D-013)** for `p=`: 15% "small chance" · 20% "1 in 5" · 30% "1 in 3" · 40% "2 in 5" · 50% "1 in 2" · 70% "very likely". Commander sees the percentage.

---

## 4. Daily task cards (always available)
Each astronaut plans one task per sol in step 3; tasks are resolved at the start of Night (D-001). An event can cancel a planned task.

| ID | Task | Who | Cost | Effect | Lesson |
|---|---|---|---|---|---|
| T-REST | Rest | ANY | `LOST: today's task` | `ME.EN+3` | Rest is a resource |
| T-EXER | Exercise | ANY | `ME.EN-1` | Counts for CR-01; prevents weakness | Bodies need daily care |
| T-MAINT-LS | Maintain life support | ENG (others +1 EN) | `ME.EN-1` | `LS+1`; resets the LS wear timer. With an extra `PARTS-1`: clears a `broken:` life-support flag (D-012) | Small fixes prevent big ones |
| T-MAINT-LAB | Maintain lab | ENG or RES | `ME.EN-1` | `LAB+1` | Tools need care too |
| T-GARDEN | Care for plants | ANY (RES bonus) | `ME.EN-1` | Crops stay on schedule; RES: `+1 FOOD` at harvest. A crop **never** tended during its growth is 1 sol late (D-013) | Gardens need gardeners |
| T-LAB | Lab experiment | ANY (RES ×2) | `ME.EN-2; PWR-1`; needs LAB ≥3 | `SP+1` (RES `SP+2`) → pending until sent (RS-04) | Science needs power and people |
| T-EVA-SCI | Rock-study walk | ANY (RES ×2) | `ME.EN-2; ME.AIR-1`; EVA dose | `SP+1` (RES `SP+2`) | Field work = dose |
| T-SHIELD | Pile soil bags | ANY (2 people = double) | `ME.EN-2`; EVA dose | `SH+1` per person | Thick walls block rays |
| T-WATERWALL | Water-bag wall | ANY | `ME.EN-1` | `SH+1` while H2O ≥10; the bonus disappears if H2O drops below 10. Water walls give at most `SH+2` in total (D-013) | Water blocks radiation, but you also drink it |
| T-PANELS | Clean solar panels | ANY | `ME.EN-2; ME.AIR-1`; EVA dose | Dust stack = 0 | Dust steals power |
| T-ICE | Mine ice (after LS-10) | ENG + ANY | `EN-3 each; PWR-2`; EVA dose | `H2O+6` | Live off the land |
| T-MOXIE | Run the oxygen machine (Air Makers / after LS-11) | ANY | `PWR-2` | `O2T+1` | Energy can become air |
| T-MED | Check-up | MED | `MED.EN-1` | One stat +1 for one astronaut; shows exact doses | Measure, then decide |
| T-TREAT | Treat in Sick Bay | MED | `MED.EN-1; MEDKIT-1` | Astronaut returns next sol | Medicine saves time |
| T-PLAN | Plan tomorrow | MGR | `MGR.EN-1` | Peek at the next event; re-plan power | Leaders look ahead |
| T-PEP | Pep talk | MGR | `MGR.EN-1` | `PICK.EN+2` | Teams lift each other |
| T-CALL | Send a video home | ANY | `PWR-1` | `ME.EN+1`; reply arrives next sol (`+1` more) | Distance changes how we talk |
| T-SEND | Send data | ANY | `PWR-1` (all = `PWR-2`) | Banks pending SP (RS-04) | Science counts when shared |

---

## 5. DONKI → event mapping (Mars)

**Endpoint:** `https://ccmc.gsfc.nasa.gov/DONKI-API/get/{FLR|SEP|CME|CMEAnalysis|WSAEnlilSimulations|notifications}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`. No key. One request can cover **60 days at most** [S1]. Save a snapshot JSON (with the fetch date and source URL) and show **LIVE** or **ARCHIVED – fetched on <date>** in the game.

**Why Mars needs care:** most DONKI flares and particle events are measured from Earth's side of the Sun. The **WSA-ENLIL** model runs, however, list *when a CME reaches Mars*, sometimes even when Earth is missed [S2]. Use ENLIL for Mars CME timing, and label Earth-side events honestly.

| DONKI type | Key fields (check against a real snapshot) | Game mapping | Event |
|---|---|---|---|
| `FLR` | `classType` (e.g. "M2.3", "X1.1"), `peakTime`, `linkedEvents` | C → fun-fact popup only. M1–M4 → S=1 · M5–M9 → S=2 · X1–X4 → S=3 · ≥X5 → S=4 | SW-01 (and CM-03 if ≥X1) |
| `SEP` | `eventTime`, `linkedEvents`, `instruments` | Radiation storm. S = linked flare's S (min 2), or 2 if not linked | SW-02 |
| `WSAEnlilSimulations` | `impactList[].location` == "Mars", `arrivalTime`, `isGlancingBlow` | Warning = days until `arrivalTime`. A glancing blow → S −1. If Earth shows "no impact" but Mars has one → SW-08 | SW-03 → SW-04, SW-08 |
| `CME` / `CMEAnalysis` | `cmeAnalyses[].speed` (km/s), `isMostAccurate` | Only as backup if no ENLIL run: speed sets S (≥1000 km/s → S+1) | SW-03 |
| `notifications` | `messageType`, `messageIssueTime`, `messageBody` | Show a simplified forecaster message | SW-09 (Commander) |
| *(nothing)* | No FLR ≥M, SEP or Mars-bound CME in the last 3 days | Calm sol | SW-05 |
| `GST` (Kp) | — | **Not used in the Mars version** (it describes storms at Earth) | — |

**M3 is a compressed storm replay (D-009):** M3's scripted beats don't follow the calendar rule. Each beat is tied to one specific real DONKI record and shows that record's **real date** plus *"replay, sped up"*.
**Calendar rule (Free Play / Today's Sun only, D-009):** sol 1 = the mission's DONKI start date; each record goes on sol = (days since start + 1). Game sols and Earth days are treated as 1:1 for the calendar (a sol is only 39 minutes longer than an Earth day [S7]).
**Honesty label on the card:** *"Real event: X1.1 flare on 2024-05-14 (NASA DONKI). It was seen from Earth; in this game we imagine it also reached your base."* For ENLIL Mars hits: *"NASA's model predicted this cloud would reach Mars on <date>."*

```js
// snapshot script sketch (Node 18+)
const BASE = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get';
const TYPES = ['FLR','SEP','CME','WSAEnlilSimulations','notifications'];
for (const t of TYPES) {
  const url = `${BASE}/${t}?startDate=${start}&endDate=${end}`; // ≤60 days
  const data = await (await fetch(url)).json();
  write(`data/donki-${t}.json`, { fetchedAt: new Date().toISOString(), source: url, data });
}
```

---

## 6. Event index

Deck tags: 🟢 Core (any mission, random draw) · 🎯 Mission (only in the missions listed) · 🔗 Chain (only after another event) · ⚠️ Condition (only when a number gets too low/high) · 📅 Timer (every N sols) · ☀️ DONKI (only if real data has it) · 🚀 Setup (start of the game). Mission codes M1–M8 are in §8.2.

| ID | Name | System | Deck | Missions | Tier |
|---|---|---|---|---|---|
| SW-01 | Flash on the Sun! | Radiation | ☀️ | all (if DONKI) | Cadet |
| SW-02 | Radiation Storm! | Radiation | 🔗 after SW-01 / ☀️ SEP | all | Cadet |
| SW-03 | Storm Cloud Coming | Radiation/Power | ☀️ (ENLIL) | all | Cadet |
| SW-04 | The Storm Cloud Hits | Radiation/Comms | 🔗 after SW-03 | all | Cadet |
| SW-05 | Quiet Sun Day | Research | 🟢 (when DONKI is quiet) | all | Cadet |
| SW-06 | Rays Add Up | Radiation | ⚠️ crew DOSE ≥4 | all | Commander |
| SW-07 | Dose Badge Turning Red | Crew | ⚠️ crew DOSE ≥7 | all | Cadet |
| SW-08 | Earth Is Safe, Mars Is Not | Radiation | ☀️ (ENLIL) | M3, M9 | Commander |
| SW-09 | Forecasters' Message | Radiation | ☀️ notifications | M3, M9 | Commander |
| SW-10 | Radiation Sensor Glitch | Radiation | 🎯 | M3, M8, M9 | Commander |
| PW-01 | Hot Machine! | Power | 🟢 | all | Cadet |
| PW-02 | Dusty Solar Panels | Power | 📅 dust timer | all | Cadet |
| PW-03 | Lucky Wind! | Power | 🔗 after PW-02.b / 🎯 | M1, M2, M9 | Cadet |
| PW-04 | Dust Storm on the Way | Power | 🎯 | M2, M9 | Cadet |
| PW-05 | Planet-Wide Dust Storm | Power | 🔗 after PW-04 | M2 | Commander |
| PW-06 | Power Fading Slowly | Power/Research | 🎯 | M2, M5 | Commander |
| PW-07 | Freezing Night | Power/LS | 🟢 (×2 in M4) | all | Cadet |
| PW-08 | Not Enough Power! | Power | ⚠️ need > supply (Power Plan, no event slot) | all | Cadet |
| PW-09 | Cut Cable | Power | 🔗 after RS-02 / RS-07 | M5, M9 | Cadet |
| PW-10 | Pick Your Power Plant | Power | 🚀 | M9 (Commander setup) | Commander |
| LS-01 | Stuffy Air (CO₂) | Life support | 🟢 / ⚠️ LS ≤4 | all | Cadet |
| LS-02 | Square Filter, Round Hole | Life support | 🔗 LS-01 with PARTS = 0 | all | Cadet |
| LS-03 | Oxygen Maker Stopped | Life support | 🟢 (×2 in M6) | all | Cadet |
| LS-04 | Smoke! | Life support | 🔗 after LS-03.b | all | Cadet |
| LS-05 | Water Recycler Clogged | Life support | 🟢 | all | Cadet |
| LS-06 | Upgrade: Brine Processor | Life support | 🎯 | M4, M7, M9 | Commander |
| LS-07 | Tiny Leak | Life support | 🟢 / 🔗 after a quake | all | Cadet |
| LS-08 | Cooling Loop Leak | Life support | 🟢 | all | Commander |
| LS-09 | Air or Water? | Life support | ⚠️ H2O ≤6 | all | Cadet |
| LS-10 | Ice Found! | Life support | 🎯 | M4, M9 | Cadet |
| LS-11 | Make Air from Mars Air | Life support | 🎯 | M6, M9 | Cadet in M6 / Commander |
| FD-01 | What Should We Plant? | Food | 🚀 + when the greenhouse is empty | all | Cadet |
| FD-02 | Flowers Need Help | Food | 🔗 peppers growing | all | Commander |
| FD-03 | Old Food Losing Vitamins | Food/Crew | 📅 mid-mission | M7, M8, M9 | Commander |
| FD-04 | Pack the Cargo | Supplies | 🚀 | all | Cadet |
| FD-05 | Taco Night! | Food/Crew | 🔗 pepper harvest | all | Cadet |
| FD-06 | Food Running Low | Food | ⚠️ FOOD ≤ crew×3 | all | Cadet |
| FD-07 | Plants in Mars Soil? | Food | 🎯 | M4, M7, M9 | Commander |
| CR-01 | Exercise or Experiment? | Crew | 📅 every 3 sols | all | Cadet |
| CR-02 | Can't Sleep | Crew | 🟢 | all | Cadet |
| CR-03 | Missing Home | Crew/Comms | 🟢 (×2 in M8) | all | Cadet |
| CR-04 | Dust Sneezes | Crew/LS | 🔗 after an EVA (20%) | all | Cadet |
| CR-05 | Water in the Helmet! | Crew | 🔗 during an EVA (mishap 15%) | all | Cadet |
| CR-06 | Slip on a Rock | Crew | 🔗 during an EVA (mishap 15%) | all | Cadet |
| CR-07 | Too Tired to Work | Crew | ⚠️ crew EN ≤ 4 | all | Cadet |
| CR-08 | Blurry Vision | Crew | 🟢 | all | Commander |
| RS-01 | Shiny Rock Far Away | Research | 🟢 | all | Cadet |
| RS-02 | The Ground Is Shaking! | Research/Power | 🎯 (repeatable in M5) | M5, M9 | Cadet |
| RS-03 | Lab Machine Broken | Research | 🟢 / ⚠️ LAB ≤3 | all | Cadet |
| RS-04 | Send Your Data Home | Research/Comms | 📅 every 4 sols | all | Cadet |
| RS-05 | Experiment Results! | Research | 🔗 after 3 lab tasks | all | Cadet |
| RS-06 | Earth Wants More Science | Research | 🟢 | all | Cadet |
| RS-07 | Space Rock Hits Mars! | Research | 🎯 | M5, M9 | Cadet |
| CM-01 | The Sun Is Between Us | Comms | 🎯 scripted | M8 | Commander |
| CM-02 | Antenna Off Target | Comms | 🔗 after a storm or quake | all | Cadet |
| CM-03 | Garbled Message | Comms | ☀️ FLR ≥X1 | M3, M8, M9 | Commander |
| MG-01 | Choose Your Base | Mission | 🚀 | M9 (Free Play) | Cadet |
| MG-02 | Go Home Early? | Mission | ⚠️ critical state (2+ of LS/LAB/BAT ≤ 2, or 2+ in Sick Bay) | all | Cadet |
| MG-03 | Crew Disagreement | Mission | 🟢 | all | Cadet |
| MG-04 | The Long Trip | Mission/Radiation | 🚀 | all (Commander) | Commander |

---

## 7. Events in detail

**Card table columns:** Card · Who · Cost now · Effect · Later ⏳ / risk · Lesson

### 7.1 ☀️ Space weather & radiation (SW)

#### SW-01 · Flash on the Sun! ☀️⚡
`deck: ☀️ DONKI FLR (class M or X) · warning: this IS the warning · tier: Cadet · systems: SH, DOSE`
- **Kid text:** "A bright flash on the Sun! Fast particles might follow soon."
- **Real science:** Flares are graded A, B, C, M, X. Each letter is 10× stronger than the last [S3]. Flare light reaches Earth in ~8 minutes, and fast particles can follow ~20–30 minutes later [S4].
- **Engine:** if `linkedEvents` includes an SEP → SW-02 fires. Otherwise SEP chance by S: 1→20%, 2→30%, 3→50%, 4→70%.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Everyone inside now | MGR | `LOST: today's EVA tasks` | Nobody outside if particles come | — | Safety first costs time |
| ★ b. Finish the outside job fast | EVA crew | `EVA.EN-1` | EVA task completes as planned | If SEP fires: `EVA.DOSE+S` | Racing a storm is a gamble |
| c. Get the shelter ready | ENG | `ENG.EN-1; PWR-1` | `+FLAG:shelterReady` (next storm counts as sheltered) | — | Prepare before danger |

#### SW-02 · Radiation Storm! ☢️
`deck: 🔗 after SW-01 / ☀️ DONKI SEP · warning: none · tier: Cadet · systems: SH, DOSE, SP`
- **Kid text:** "Invisible particles from the Sun are here! Hide in the shelter or keep working?"
- **Real science:** Particles from big solar eruptions arrive within tens of minutes [S4]. In May 2024, Curiosity's radiation detector on Mars recorded its biggest surge since 2012: 8,100 micrograys, like 30 chest X-rays [S6]. Orion crews make a shelter by stacking stowage bags around themselves [S10] within about 30 minutes of an alert [S11]. NASA limits one storm's dose to 250 mSv [S9].
- **Dose rule:** §2.6 (storm dose; sheltered = −2).

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Everyone to the shelter | MGR | `LOST: all tasks today (SP+0)` | `ALL` take the *sheltered* dose | — | Shelters trade work for safety |
| ★ b. Build a water-bag wall | ENG + ANY | `ENG.EN-2; PICK.EN-1` | `SH+2` until the storm ends; inside tasks continue | ⏳1: `ENG.EN-1` (put the bags back) | Water stops radiation too |
| c. Keep working at stations | MGR | — | Inside tasks continue (normal SP) | `ALL.DOSE +` unsheltered dose | Science vs health |

#### SW-03 · Storm Cloud Coming 🌪️
`deck: ☀️ DONKI WSA-ENLIL Mars impact (CME speed as backup) · warning: N sols (computed) · tier: Cadet · systems: SH, BAT, SP`
- **Kid text:** "The Sun threw a giant cloud. It reaches Mars in [N] sols! How do we get ready?"
- **Real science:** A coronal mass ejection (CME) is a huge cloud from the Sun that takes ~1–3 days to reach Earth [S4]. NASA's DONKI models also predict when CMEs reach Mars [S2].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Pile soil on the roof | ENG + ANY (EVA) | `ENG.EN-2; PICK.EN-2`; EVA dose | `SH+2` (permanent) | — | Thick walls block radiation |
| ★ b. Rush science before it hits | RES | `RES.EN-2` | `SP+3` now | Shield unchanged when it arrives | Use the calm before the storm |
| c. Charge every battery | MGR | Greenhouse off until arrival | `BAT+3` | ⏳ crops 1 sol late | Store energy for hard days |

#### SW-04 · The Storm Cloud Hits 💥
`deck: 🔗 arrival from SW-03 / SW-08 · tier: Cadet · systems: comms, SH`
- **Kid text:** "The cloud is here! Radios crackle and shields get tested."
- **Real science:** In May 2024, at least seven CMEs reached Earth and made the strongest geomagnetic storm in over 20 years [S5]. That same month, Curiosity measured a record radiation jump on Mars [S6].
- **Auto effects:** if shield tier = 0 → 30% chance of SW-02.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Hunker down, radios off | MGR | `LOST: Ask Earth & data today` | Electronics protected | — | Sometimes you wait it out |
| ★ b. Keep radios on | ANY | `PWR-1` | Can send to Earth / send data | `p=0.3: → CM-02` | Storms scramble radio |
| c. Measure the storm for science | RES | `RES.EN-1; PWR-1` | `SP+2` | `p=0.3: LAB-1` (sensor zapped) | Storms are science too |

#### SW-05 · Quiet Sun Day 😎
`deck: 🟢 (only when DONKI shows nothing in the last 3 days) · tier: Cadet · systems: SP, SH, LS`
- **Kid text:** "The Sun is calm today. A great sol to go outside!"
- **Real science:** Even on calm days, cosmic rays keep coming. Curiosity measured about 0.64 mSv a day on Mars' surface, about a third of the ~1.8 mSv a day during the flight to Mars [S8].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Big science walk | RES + ANY (EVA) | `EVA.EN-2; EVA.AIR-2` | `SP+4` | EVA dose | Calm days are for big trips |
| ★ b. Fix things outside | ENG (EVA) | `ENG.EN-2; PARTS-1` | `LS+1; SH+1`; panels cleaned | EVA dose | Maintenance keeps you alive |
| c. Rest sol | MGR | `LOST: all tasks today` | `ALL.EN+2` | — | Rest is a resource too |

#### SW-06 · Rays Add Up 📈
`deck: ⚠️ crew DOSE reaches 4 · tier: Commander · systems: DOSE` *(cards a and b assume one badge per astronaut; rework pending P-005)*
- **Kid text:** "Space rays add up a little every sol. Who goes outside next?"
- **Real science:** Curiosity measured ~0.64 mSv/day on the Martian surface [S8]. NASA's career limit is 600 mSv [S9].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Take turns outside | MGR | Next EVAs go to the lowest-DOSE astronaut (maybe not the expert: −1 SP per EVA) | Dose shared evenly | — | Sharing risk protects everyone |
| ★ b. Send the expert again | MGR | — | EVA tasks +1 SP | Expert's DOSE climbs fastest → SW-07 sooner | The best person isn't always the safest choice |
| c. Add another soil layer | ENG + ANY (EVA) | `ENG.EN-2; PICK.EN-2`; EVA dose | `SH+2` | — | Shields help every day |

#### SW-07 · Dose Badge Turning Red 🔴
`deck: ⚠️ crew DOSE ≥7 (D-017) · tier: Cadet · systems: DOSE`
- **Kid text:** "The crew's radiation badge is almost full!"
- **Real science:** Artemis crews wear personal radiation badges [S12]. The 600 mSv career limit decides how long an astronaut can fly [S9].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Inside jobs only | MGR | No EVAs for 3 sols (D-017) | DOSE stops climbing (except storms) | — | Limits protect long-term health |
| ★ b. Medical check-up | MED | `MED.EN-1` | Exact dose shown; `+FLAG:medWatch` (warnings 1 sol earlier) | — | Measure before you decide |
| c. One last important trip | PICK | — | Key EVA done: `SP+3` | `DOSE+1` (may hit 10 → Indoor only) | Some risks aren't worth it |

#### SW-08 · Earth Is Safe, Mars Is Not 🌍✅🔴⚠️
`deck: ☀️ DONKI WSA-ENLIL run with "no impact to Earth" but a Mars arrival · warning: N sols · tier: Commander · systems: SH, comms`
- **Kid text:** "Mission Control says Earth is fine… but the solar cloud is heading for Mars!"
- **Real science:** NASA's DONKI model runs sometimes report "no or little impact to Earth" while still predicting a CME arrival time at Mars [S2]. Earth and Mars are in different places, so a storm can miss one and hit the other.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Trust the Mars forecast, prepare | MGR | `MGR.EN-1`; `LOST: 1 EVA` | `+FLAG:shelterReady` | — | Earth's space weather isn't Mars' space weather |
| ★ b. "Earth is fine, so are we" | MGR | — | No work lost | On arrival: unprepared (no shelter flag) | Check whose forecast you're reading |
| c. Ask Mars orbiters to measure | RES | `RES.EN-1; PWR-1` | Shows the exact storm strength S; `SP+1` | — | Measure locally |

#### SW-09 · Forecasters' Message 📨
`deck: ☀️ DONKI notifications · tier: Commander`
- **Kid text:** "Real space-weather forecasters sent a message. Read it and decide."
- **Real science:** DONKI messages come from NASA's Moon to Mars Space Weather Analysis Office [S2].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Follow the forecast | MGR | Cancel 1 planned EVA | `+FLAG:prepared` (next SW event: DOSE −1) | — | Listen to experts |
| ★ b. Keep our schedule | MGR | — | No lost SP | Next SW event: `EVA.DOSE+1` | Ignoring warnings can cost |
| c. Ask Earth what it means | ANY | `PWR-1` | Answer arrives next sol (`SP+1` for learning) | Too late if a storm comes today | Distance slows help |

#### SW-10 · Radiation Sensor Glitch 📟
`deck: 🎯 M3, M8, M9 · tier: Commander`
- **Kid text:** "Our radiation sensor stopped. We can't see storms coming!"
- **Real science:** Orion carries HERA radiation sensors that warn the crew when to take shelter [S12].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Fix the sensor | ENG | `ENG.EN-2; PARTS-1` | Sensor works | — | Warnings need working tools |
| ★ b. Use Earth's forecasts | MGR | `PWR-1` per sol | Warnings arrive, but one step late (signal delay) | Storms may hit before the warning | Help from Earth is slow at Mars |
| c. Stay inside more | MGR | EVA tasks −1 SP each until fixed | Safe | — | Not knowing = play it safe |

---

### 7.2 ⚡ Power (PW)

#### PW-01 · Hot Machine! 🌡️ *(your engine example)*
`deck: 🟢 (×2 weight if PWR >8 was used) · tier: Cadet · systems: BAT, H2O`
- **Kid text:** "The battery box is overheating while it charges! What do we do?"
- **Real science:** Spacecraft carry heat away with liquid cooling loops and radiators. In 2022 a tiny hole emptied a Soyuz spacecraft's cooling loop [S29].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Leave it running | MGR | — | Normal power today | `p=0.4:` ⏳1 loud POP! Max battery 10 → 7 for the rest of the mission (no one hurt) | Ignoring warnings is a gamble |
| ★ b. Cool it with water | ENG | `ENG.EN-1; H2O-2` | Temperature safe | — | Water is precious: everything costs |
| c. Switch it off to cool | ENG | Battery unusable today (only today's sun power) | Safe; no water used | Tonight may run short → PW-08 | Turning off is safe but slows you |

#### PW-02 · Dusty Solar Panels 🟫
`deck: 📅 dust timer (every 4 sols: PWR −1 per sol, stacks) · tier: Cadet`
- **Slot rule (D-004):** dust stacks are added **automatically** and shown in the Morning Report. PW-02 is played as an event only on a sol when a stack is added **and** the event slot is free.
- **Kid text:** "Mars dust is covering our solar panels. Less power each sol!"
- **Real science:** By 2009, dust on rover Spirit's panels let only 25% of sunlight through [S17].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Go out and brush them | ANY (EVA) | `ME.EN-2; ME.AIR-1` | Dust stack cleared | EVA dose | Cleaning costs time and dose |
| ★ b. Wait for a lucky wind | MGR | Dust keeps stacking | 20% chance per sol of PW-03 | If 3 stacks build up → PW-06 (in M2, M5) | Luck is not a plan |
| c. Tilt panels from inside | ENG | `ENG.EN-1; PWR-1` | Half the dust stack removed | — | Clever fixes beat hard work |

#### PW-03 · Lucky Wind! 🌪️✨
`deck: 🔗 after PW-02.b / 🎯 M1, M2, M9 · tier: Cadet`
- **Kid text:** "A whirlwind blew the dust off our panels! Extra power today!"
- **Real science:** In Feb 2009, Martian wind cleaned Spirit's panels: power rose from ~210 to ~240 watt-hours a day. The rover needed ~180 to survive [S17].
- **Engine:** dust stack = 0, **+3 ⚡ bonus today** → choose how to use it.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Charge the batteries | MGR | `LOST: bonus science` | `BAT+3` | — | Save for a rainy day |
| ★ b. Power a big experiment | RES | `RES.EN-2` | `SP+3` | — | Use luck to get ahead |
| c. Extra greenhouse light | ANY | `ME.EN-1` | Crops 1 sol faster | — | Energy can become food |

#### PW-04 · Dust Storm on the Way 🌫️
`deck: 🎯 M2 (scripted), M9 (random) · warning: 2 sols · tier: Cadet`
- **Kid text:** "Orbiters see a dust storm coming. In 2 sols, sunlight drops a lot."
- **Real science:** Normal dust haze ("tau") at Opportunity's site was about 0.5. The rover needed tau below 2 to recharge [S14].
- **On arrival:** solar ×0.3 for 3 sols.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Fill the batteries now | MGR | Lab off for 2 sols (`LOST: lab SP`) | `BAT` → 10 | — | Prepare before trouble |
| ★ b. Finish outdoor jobs first | 2× ANY (EVA) | `EVA.EN-2` each | `SP+2`; panels clean | EVA dose | Work outside while you can |
| c. Keep the normal schedule | MGR | — | No lost science now | Storm sols: PW-08 likely | Not preparing pushes problems later |

#### PW-05 · Planet-Wide Dust Storm 🌑
`deck: 🔗 after PW-04 in M2 · warning: 1 sol · tier: Commander`
- **Kid text:** "The dust storm covers the whole planet! Day looks like night."
- **Real science:** In June 2018 the dust haze reached a record tau of 10.8. Opportunity's power fell 97%, to 21 watt-hours, and the rover never woke up [S15].
- **Effect:** solar ×0.05 for 5 sols (a reactor still works).

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Sleep mode | MGR | `LOST: all science during the storm` | Power need drops to 3/sol | ⏳ CR-03 twice as likely | Survive first, science later |
| ★ b. Reactor powers life support only | ENG | `ENG.EN-1`; greenhouse + lab unplugged | LS always powered | ⏳ crops 3 sols late | Steady power saves missions |
| c. Keep one experiment running | RES | `RES.EN-1; BAT-1` per sol | `SP+1` per sol (study the storm!) | If the battery hits 0: `LS-2` | Is the science worth the risk? |

#### PW-06 · Power Fading Slowly 📉
`deck: 🎯 M2, M5 (or 🔗 after 3 dust stacks) · tier: Commander`
- **Kid text:** "Dust keeps piling up. Every sol there's a bit less power. Which machines stay on?"
- **Real science:** Dust slowly covered the solar panels of NASA's InSight lander. The team had to run it part-time to save power, and the mission ended in December 2022 [S18].
- **Effect:** max solar −1 for the rest of the mission (unless card b).

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Keep only the most important instrument | MGR | `LOST: lab SP` except one chosen task type | Power need −1 every sol | — | Choose what matters most |
| ★ b. Big cleaning walk (2 people) | 2× ANY (EVA) | `EN-2` each; EVA dose | Max solar restored; dust stack 0 | — | Hard work can reset a slow problem |
| c. Part-time mode | MGR | Lab runs every other sol (half SP) | Power need −1 every other sol | — | Slow and steady can last longer |

#### PW-07 · Freezing Night 🥶
`deck: 🟢 (×2 weight in M4) · tier: Cadet`
- **Kid text:** "Tonight is super cold! Pipes and batteries hate the cold."
- **Real science:** NASA's Viking 1 lander measured Mars air from −89 °C at night to −31 °C by day [S13].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Turn heaters up | ANY | `PWR-2` tonight | All safe | — | Warmth costs power |
| ★ b. Everyone in one room | MGR | Lab and greenhouse rooms go cold | Only `PWR-1` | `LOST: lab SP tomorrow`; `p=0.3:` crops 1 sol late | Sharing heat saves energy |
| c. Wrap the pipes | ENG | `ENG.EN-1; PARTS-1` | Only `PWR-1`; nothing lost | — | Insulation is smart engineering |

#### PW-08 · Not Enough Power! 🔌
`deck: ⚠️ today's need > PWR + BAT · Power Plan shortage mode, does not use the event slot (D-003) · tier: Cadet · the core trade-off (can repeat)`
- **Kid text:** "We need more power than we have. Something must be unplugged!"
- **Real science:** Mars gets only 43% of the sunlight Earth gets: 586 vs 1,361 watts per square meter [S13].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Unplug the lab | MGR | `LOST: lab science today` | Need −1 | — | Science waits when power is short |
| ★ b. Unplug greenhouse lights | MGR | Crops paused 1 sol | Need −1 | ⏳ less food later | Today's power vs tomorrow's food |
| c. Turn down life support | MGR | — | Need −2 | `LS-2`; AIR may drop | Never cheap: air is life |

#### PW-09 · Cut Cable ✂️
`deck: 🔗 after RS-02 / RS-07 (M5, M9) · tier: Cadet`
- **Kid text:** "A cable to the solar panels got cut. Power is down by half!"
- **Real science:** In May 2022, NASA's InSight lander felt a magnitude 4.7 marsquake that kept the ground shaking for hours [S49].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Splice it outside | ENG (EVA) | `ENG.EN-2; PARTS-1`; EVA dose | Full power today | — | Repairs need parts and people |
| ★ b. Swap in the spare cable | ANY | `PARTS-2` | Full power today | Fewer spares later | Spares are insurance |
| c. Live on half power | MGR | `PWR ÷2` until fixed | No parts used | PW-08 likely | Delaying fixes adds up |

#### PW-10 · Pick Your Power Plant ⚛️☀️
`deck: 🚀 setup in M9 (Commander). Other missions use the default (solar 4 + reactor 2) · tier: Commander`
- **Kid text:** "How will your Mars base get its power?"
- **Real science:** NASA's Fission Surface Power reactor aims for 40 kW for 10 years. If it works on the Moon, the design may be updated for Mars [S19]. NASA also sets a separate small dose limit for radiation from nuclear power systems [S9].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Big solar farm, no reactor | MGR | Cargo space: no extra science kit (science goal +2) | Solar 5, reactor 0 | Dust storms hit hard | Free sunlight isn't always there |
| ★ b. Bigger reactor + solar | MGR | Cargo space: `PARTS-2` | Solar 4 + steady reactor 3 | — | Steady power costs cargo |
| c. Reactor close to the base | ENG | — | Repairs cost 1 EN less | `ALL.DOSE+1` every 6 sols | Convenience vs safe distance |

---

### 7.3 🫁 Life support (LS)

#### LS-01 · Stuffy Air 😮‍💨
`deck: 🟢 / ⚠️ LS ≤4 · tier: Cadet`
- **Kid text:** "The air feels stuffy and people have headaches. CO₂ is building up!"
- **Real science:** Each astronaut breathes out about 1 kg of CO₂ a day [S21]. On the ISS, headaches start at 2.8–4.5 mmHg of CO₂, so NASA keeps it under 3 mmHg [S22].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Fix the CO₂ scrubber | ENG | `ENG.EN-2; PARTS-1` | `LS+3` | — | Fix the cause, not the symptom |
| ★ b. Use spare filter cans | ANY | `PARTS-1` | `LS+1` for 2 sols | ⏳2: problem returns if not fixed | Spares buy time |
| c. Everyone rests, breathes less | MGR | `LOST: all tasks today` | `ALL.EN+1`; CO₂ rises slower | `LS-1` anyway | Less activity = less CO₂ |
*If PARTS = 0 → LS-02.*

#### LS-02 · Square Filter, Round Hole 🔲⭕
`deck: 🔗 LS-01 when PARTS = 0 · tier: Cadet (Cadet sees ★a and ★b as a normal 2-card event; the shape-matching puzzle is cut to Could, D-015)`
- **Kid text:** "Our spare filters are the wrong shape! Can we build an adapter?"
- **Real science:** On Apollo 13, the square filters from the command module didn't fit the lunar module's round holder. Mission Control designed an adapter from bags, tape and a flight-plan cover [S23].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Build an adapter together | ENG + MGR | `ENG.EN-2; MGR.EN-2` | `LS+3` (it works!) | — | Teamwork + creativity solve problems |
| ★ b. Ask Mission Control for a plan | MGR | `PWR-1` | The plan arrives next sol → `LS+3` for `ENG.EN-1` | Tonight: `LS-1` while waiting | At Mars, help from Earth is slow |
| c. Use oxygen tanks to freshen air | ANY | `O2T-2` | `LS+1` | Tanks gone for later emergencies | Emergency supplies run out |

#### LS-03 · Oxygen Maker Stopped 🫧
`deck: 🟢 (×2 weight in M6) · tier: Cadet`
- **Kid text:** "The machine that makes oxygen from water stopped!"
- **Real science:** Each person needs about 0.8 kg of oxygen a day [S21]. Backup "oxygen candles" each make enough oxygen for one person for one day [S25].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Repair it | ENG | `ENG.EN-2; PARTS-1` | Oxygen maker back | — | Repair = long-term fix |
| ★ b. Light an oxygen candle | ANY | `O2T-1` | Air safe for 1 sol | `p=0.15: → LS-04` | Backups have their own risks |
| c. Breathe from stored tanks | ANY | `O2T-2` | Air safe for 1 sol; no fire risk | — | The safer backup costs more |

#### LS-04 · Smoke! 💨🔥
`deck: 🔗 after LS-03.b · tier: Cadet (kid-safe)`
- **Kid text:** "Smoke alarm! A backup oxygen candle is sparking!"
- **Real science:** In Feb 1997, an oxygen candle caught fire on the Mir space station [S25]. The crew wore masks, used extinguishers, and no one was hurt [S26].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Masks on, extinguisher! | ANY + MED | `ALL.EN-1; LS-2` (smoke clean-up) | Fire out; MED checks everyone | — | Practice makes emergencies calmer |
| ★ b. Close that room's hatch | MGR | Lose that room for 3 sols (lab or greenhouse: the game shows which) | Fire starved of air; only `LS-1` | — | Isolate a problem to save the rest |

#### LS-05 · Water Recycler Clogged 🚰
`deck: 🟢 · tier: Cadet`
- **Kid text:** "The water recycler is clogged. No clean water from it today!"
- **Real science:** The ISS recycles water from crew sweat, breath and urine into clean drinking water [S27].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Swap the filter | ENG | `ENG.EN-1; PARTS-1` | Recycler back | — | Spare parts keep water flowing |
| ★ b. Drink from the reserve | MGR | `H2O-4` | Everyone drinks | ⏳ still broken tomorrow | Reserves shrink fast |
| c. Ration water today | MGR | `ALL.HYD-1` | Stock saved | ⏳1: `ALL.EN-1` (thirsty) | Saving water costs comfort |

#### LS-06 · Upgrade: Brine Processor 🔧💧
`deck: 🎯 M4, M7, M9 (or the FD-04 parts crate) · tier: Commander`
- **Kid text:** "We can install a gadget that squeezes more water out of waste!"
- **Real science:** Adding a Brine Processor raised ISS water recovery from 93–94% to 98% [S27].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Install it now | ENG | `ENG.EN-3; PARTS-1; PWR-1` | Water loss: 1 per 12 sols (was 1 per 4) | — | Small upgrades add up |
| ★ b. Skip it, do science | RES | `LOST: the upgrade` | `SP+2` | Water stays leakier | Long-term vs short-term |
| c. Install slowly (2 sols) | ENG | `ENG.EN-1` for 2 sols | Same upgrade, from sol +2 | — | Spreading work spreads the cost |

#### LS-07 · Tiny Leak 🎈
`deck: 🟢 / 🔗 after RS-02 or RS-07 · tier: Cadet`
- **Kid text:** "Hiss! Air is slowly leaking out of the habitat."
- **Real science:** Tiny space rocks or debris can punch small holes. In Dec 2022 one drained the coolant from a Soyuz spacecraft's outer loop [S29].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Find and patch it | ENG + ANY | `ENG.EN-2; PICK.EN-1; PARTS-1` | Leak fixed | — | Fast teamwork stops leaks |
| ★ b. Close off that module | MGR | Lose that module for 3 sols | Leak stopped | — | Closing doors saves the rest |
| c. Top up air and wait | ANY | `O2T-1` per sol | Air OK | `LS-1` per sol until fixed | Treating symptoms isn't a cure |

#### LS-08 · Cooling Loop Leak ❄️💦
`deck: 🟢 · tier: Commander`
- **Kid text:** "The cooling liquid is leaking. The base will slowly get too hot inside!"
- **Real science:** In Dec 2022, a tiny hole let all the coolant leak out of Soyuz MS-22's outer radiator loop in about 18 hours [S29].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Turn off non-vital machines | MGR | Lab off 2 sols | Less heat; time to plan | — | Less power = less heat |
| ★ b. Spacewalk repair | ENG + ANY (EVA) | `EN-2` each; `PARTS-1`; EVA dose | Loop fixed | — | Some fixes need outside work |
| c. Run hot and hope | MGR | — | No lost work | ⏳1: `LS-2; LAB-2` (electronics overheat) | Heat quietly damages gear |

#### LS-09 · Air or Water? ⚖️
`deck: ⚠️ H2O ≤6 · tier: Cadet`
- **Kid text:** "Our oxygen comes from splitting water. Water is low. Which matters more?"
- **Real science:** Space stations make oxygen by splitting water (electrolysis) [S28]. Each astronaut also needs at least 2.5 L of drinking water a day [S20].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Keep making oxygen | MGR | `H2O-1` per sol continues | Air safe | Drinking water runs out sooner | Air needs water |
| ★ b. Pause it, use tanks | MGR | `O2T-1` per sol | Saves 1 H2O per sol | Tanks run out | Trade one supply for another |
| c. Go mine ice | ANY (EVA) | `ME.EN-3; ME.AIR-2`; EVA dose | ⏳1: `H2O+6` (only if LS-10 happened) | — | Living off the land |

#### LS-10 · Ice Found! 🧊
`deck: 🎯 M4 (scripted sol 2), M9 · tier: Cadet`
- **Kid text:** "We found ice under the dust! It can become water and even air."
- **Real science:** In 2008, NASA's Phoenix lander found and tested ice in the soil of Mars' far north, proving there is water there [S30]. Water can be split into oxygen by electrolysis [S28].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Dig and melt it | ENG + ANY (EVA) | `EN-2` each; `PWR-2`; EVA dose | `H2O+8`; unlocks T-ICE | — | Local stuff saves rocket trips |
| ★ b. Study it for science | RES | `RES.EN-2` | `SP+3` (old ice holds history) | No water gained | Science vs supplies |
| c. Mark it for later | MGR | — | Can dig on a later sol | Later digging costs `PWR+1` more (dust covers it) | Waiting can cost more |

#### LS-11 · Make Air from Mars Air 🔴🫧
`deck: 🎯 M6 (scripted sol 1, Cadet), M9 (Commander) · tier: see deck`
- **Kid text:** "Mars air is mostly CO₂. A machine can pull oxygen out of it!"
- **Real science:** Mars' thin air is about 96% carbon dioxide [S32]. Perseverance's MOXIE made 122 g of oxygen in all, about what a small dog breathes in 10 hours [S31]. At its best it made 12 g per hour [S31b].
- **Engine:** after this event, T-MOXIE becomes a daily task.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Run the oxygen machine | ANY | `PWR-2` | `O2T+1` | — | Energy can become air |
| ★ b. Save power for the lab | RES | `LOST: oxygen` | `SP+1` | — | Every watt has many uses |
| c. Test it for science | RES | `RES.EN-1; PWR-1` | `SP+2` (tech demo) | — | Testing today helps future crews |

---

### 7.4 🌱 Food & greenhouse (FD)

#### FD-01 · What Should We Plant? 🌱
`deck: 🚀 setup + whenever the greenhouse is empty · tier: Cadet`
- **Kid text:** "Pick seeds for the greenhouse!"
- **Real science:** Astronauts grew red romaine lettuce from seed to salad in 33 days [S33]. Chile peppers grew for 137 days on the ISS [S34], and radishes were grown there too [S35].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Lettuce (fast) | ANY | `ME.EN-1`; greenhouse `PWR 1`/sol | ⏳2: `FOOD+3` | — | Fast food, small harvest |
| ★ b. Chile peppers (slow) | RES | `RES.EN-1`; greenhouse `PWR 1`/sol | ⏳9: `FOOD+8` → FD-05 | Needs help to pollinate (FD-02) | Big rewards take patience |
| c. Radishes (medium) | ANY | `ME.EN-1`; greenhouse `PWR 1`/sol | ⏳4: `FOOD+4` (game timing) | — | Middle choices exist too |

*8-sol missions (D-014):* peppers (⏳9) can't ripen, so FD-01 shows **lettuce (a) vs radishes (c)** instead; in Cadet these are the two shown cards. *Cadet pollination (D-014):* Cadet never sees FD-02, so pepper pollination is automatic and the harvest is `FOOD+8` as in FD-01.b.
*Morning Briefing (D-004):* re-planting FD-01 appears as the Morning Briefing card. If it is bumped by another briefing, the same crop is replanted automatically.

#### FD-02 · Flowers Need Help 🐝
`deck: 🔗 pepper sol 5 · tier: Commander`
- **Kid text:** "No bees on Mars! The pepper flowers need help to make peppers."
- **Real science:** For the ISS peppers, the team ran fans to spread pollen, and astronauts also pollinated some flowers by hand [S35].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Hand-pollinate | RES | `RES.EN-1` | Full harvest (`FOOD+8`) | — | People can do nature's jobs |
| ★ b. Turn the fans up | ANY | `PWR-1` for 2 sols | `FOOD+6` | — | Machines help, but cost power |
| c. Skip it | MGR | `LOST: half the harvest` | Energy saved | Harvest `FOOD+4` | Skipping care shrinks results |

#### FD-03 · Old Food Losing Vitamins 🥫⏳
`deck: 📅 after half the mission (M7, M8, M9) · tier: Commander`
- **Kid text:** "Packed food slowly loses vitamins. The crew feels a bit tired."
- **Real science:** Food for Mars needs a 5-year shelf life [S36]. Packed space food loses most of its vitamin C after about a year [S37].
- **Effect:** `ALL.ENMAX-1` until fixed.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Eat fresh greens | ANY | Next harvest gives 2 less FOOD | Max energy back | — | Fresh food = vitamins |
| ★ b. Doctor's vitamin plan | MED | `MED.EN-1; MEDKIT-1` | Max energy back | — | Medicine supports food |
| c. Ignore it | MGR | — | — | `ALL.ENMAX-1` stays | Small problems grow |

#### FD-04 · Pack the Cargo 📦
`deck: 🚀 setup (all missions) · tier: Cadet`
- **Kid text:** "Rockets to Mars can only leave every 26 months. Pick ONE extra crate!"
- **Real science:** Launch windows to Mars open only about every 26 months [S56], so a Mars crew must live with what it brought.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Food crate | MGR | `LOST: parts & science kit` | `FOOD+15` | — | Eat now or fix later? |
| ★ b. Spare-parts crate | MGR | `LOST: food & science kit` | `PARTS+4; MEDKIT+1` (Commander: unlocks LS-06 early) | — | Spares prevent future trouble |
| c. Science-kit crate | MGR | `LOST: food & parts` | Unlocks 2 one-time *Kit experiment* tasks (`ME.EN-1` → `SP+2`, no power) (D-013) | — | Science needs supplies too |

#### FD-05 · Taco Night! 🌮🌶️
`deck: 🔗 pepper harvest · tier: Cadet`
- **Kid text:** "The peppers are ripe! Have a feast or save them?"
- **Real science:** In 2021, ISS astronauts made tacos with space-grown chile peppers and sent 12 peppers back to Earth for study [S35].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Taco party! | MGR | Harvest eaten now (no FOOD stored) | `ALL.EN+2` (happy crew) | — | Happy crews work better |
| ★ b. Save them | ANY | `LOST: party` | `FOOD+8` | — | Saving keeps you safe longer |
| c. Send samples to scientists | RES | Only `FOOD+4` | `SP+3` (samples wait for the next ship home) | — | Your food is also an experiment |

#### FD-06 · Food Running Low 🍽️⚠️
`deck: ⚠️ FOOD ≤ crew × 3 · tier: Cadet`
- **Kid text:** "Only a few sols of food left!"
- **Real science:** An astronaut needs about 3,035 kcal a day on average [S20]. On Mars, no delivery can arrive quickly [S56].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Smaller meals | MGR | `ALL.FUL-1`; `ALL.ENMAX-1` while rationing | FOOD use halves | — | Rationing buys time, costs energy |
| ★ b. Speed up the greenhouse | ANY | Need `PWR+1` per sol (extra lights) | Crops 1 sol faster | — | Power can turn into food |
| c. Open the emergency food box | MGR | `-FLAG:reserve` (no backup left) | `FOOD+6` | If food runs low again → MG-02 sooner | Emergency stock is for emergencies |

#### FD-07 · Plants in Mars Soil? 🔴🌱
`deck: 🎯 M4, M7, M9 · tier: Commander`
- **Kid text:** "Free soil outside! But is it safe for plants and people?"
- **Real science:** Mars soil contains about 0.5–1% perchlorate, a salt that's toxic to people because it affects the thyroid [S38].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Test it first | RES | `RES.EN-2; PWR-1` | `SP+2`; learn it's unsafe → unlocks a "Wash the soil" task | — | Test before you trust |
| ★ b. Keep the plant pillows | MGR | `LOST: soil bonus` | Safe crops | — | Safe and slow can win |
| c. Plant in it now | ANY | `ME.EN-1` | ⏳3: `FOOD+5` | `p=0.5: ALL.EN-2` (crew feels sick) | Unknown dirt is a risk |

---

### 7.5 🧑‍🚀 Crew health (CR)

#### CR-01 · Exercise or Experiment? 🏋️🔬
`deck: 📅 every 3 sols · Morning Briefing card (D-004) · tier: Cadet`
- **Kid text:** "Muscles and bones get weaker in low gravity. Exercise or do science?"
- **Real science:** In weightlessness, astronauts lose about 1–1.5% of their bone density per month, so ISS crews exercise about 2 hours a day [S39]. Mice flown to the ISS lost muscle and bone in 33 days (NASA OSDR data) [S40]. Mars has only 38% of Earth's gravity [S13].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Everyone exercises | MGR | `ALL.EN-1`; `LOST: 1 task (SP-1)` | Strong bodies: no penalty | — | Health is a daily job |
| ★ b. Skip it for science | MGR | — | `SP+2` | ⏳3: `ALL.ENMAX-1` (weaker) | Skipping health costs later |
| c. Doctor plans short workouts | MED | `MED.EN-1` | No penalty and no SP lost | — | Smart planning saves time |

#### CR-02 · Can't Sleep 😴
`deck: 🟢 (more likely after storms) · tier: Cadet`
- **Kid text:** "[Name] can't sleep. Tomorrow they'll be very tired."
- **Real science:** NASA schedules 8.5 hours of sleep for astronauts, but they average only about 6 hours [S42].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Let them sleep in | MGR | [Name] skips first task tomorrow | `[Name].EN+3` | — | Rest makes people safer |
| ★ b. Doctor's sleep routine | MED | `MED.EN-1` | `[Name].EN+2`; next CR-02 less likely | — | Good habits prevent problems |
| c. Work anyway | MGR | — | Normal tasks | `[Name].EN-2`; `p=0.2:` a mistake → random repair event | Tired people make mistakes |

#### CR-03 · Missing Home 🏠💬
`deck: 🟢 (×2 in M8 and during long storms) · tier: Cadet`
- **Kid text:** "[Name] misses their family. A message home would help."
- **Real science:** NASA's CHAPEA crew lived 378 days in a pretend Mars habitat [S43], with message delays of up to 22 minutes each way [S44].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Send a video home | ANY | `PWR-1` | `EN+1` now, `+1` more when the reply arrives next sol | — | On Mars you can't call live |
| ★ b. Crew game night | MGR | `LOST: 1 task (SP-1)` | `ALL.EN+1` | — | Teams look after each other |
| c. Keep busy with work | MGR | — | `SP+1` | `p=0.3:` ⏳1 `[Name].EN-2` | Ignoring feelings can backfire |

#### CR-04 · Dust Sneezes 🤧
`deck: 🔗 after an EVA: 20% chance next sol (D-013) · tier: Cadet`
- **Kid text:** "Red dust came inside on the spacesuits. Achoo!"
- **Real science:** On the Moon, Apollo 17 astronaut Harrison Schmitt got "lunar hay fever" from dust brought inside [S48]. Mars dust adds another problem: the soil contains perchlorate, which is toxic to people [S38].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Clean suits in the airlock | ANY | `EVA.EN-1` each | No sneezes | — | Clean-up is part of the job |
| ★ b. Run air filters extra | ANY | `PWR-1` | Dust removed | — | Machines can clean air |
| c. Ignore it | MGR | — | — | ⏳1: `ALL.EN-1`; MED needed | Dust inside is a real hazard |

#### CR-05 · Water in the Helmet! 🪖💧
`deck: 🔗 during an EVA (weight 1) · tier: Cadet`
- **EVA mishap (D-013):** on a sol with ≥ 1 EVA planned, 15% chance the event slot becomes CR-05 or CR-06 (50/50), on an EVA astronaut.
- **Kid text:** "Water is floating inside [Name]'s helmet! Come back or keep going?"
- **Real science:** In 2013, water collected in astronaut Luca Parmitano's helmet during a spacewalk. NASA ended the walk early and he got back inside safely [S46]. About 1–1.5 L of water got into his suit [S47].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Come back inside now | [Name] | `LOST: EVA task` | [Name] safe | — | Safety rules protect people |
| ★ b. Buddy walks them back | ANY + [Name] | `PICK.EN-1`; `LOST: EVA task` | Safe, and the suit gets checked (no repeat) | — | Teams watch out for each other |
| c. Finish the task first | [Name] | — | Task done (+SP) | `p=0.5:` [Name] to Sick Bay for 2 sols | Never risk a person for a task |

#### CR-06 · Slip on a Rock 🦶
`deck: 🔗 during an EVA (weight 1) · tier: Cadet` (EVA mishap rule: see CR-05)
- **Kid text:** "[Name] slipped on a rock outside. Their ankle hurts."
- **Real science:** Gravity on Mars is about 38% of Earth's, so walking in a bulky suit feels very different [S13].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Doctor treats it | MED | `MED.EN-1; MEDKIT-1` | [Name] OK tomorrow | — | Medical supplies matter |
| ★ b. Rest for 2 sols | MGR | [Name]: no tasks for 2 sols | Heals | — | Time is medicine too |
| c. Tape it and keep going | [Name] | — | Keeps working | `p=0.4:` ⏳ Sick Bay 2 sols | Pushing through can make it worse |

#### CR-07 · Too Tired to Work 🥱
`deck: ⚠️ crew EN ≤ 4 (≈ 1 per astronaut; a warning before Sick Bay, D-011 + D-017) · tier: Cadet`
- **Kid text:** "The crew is almost out of energy!"
- **Real science:** Astronauts often sleep less than planned, which makes their work harder [S42].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Day off | MGR | [Name]: no task today | `[Name].EN+3` | — | Rest is not lazy |
| ★ b. Others cover the job | MGR | `PICK.EN-1` extra | The job still gets done | — | Teams share the load |
| c. Energy snack | ANY | `FOOD-1` extra | `[Name].EN+1` | — | Food is fuel |

#### CR-08 · Blurry Vision 👓
`deck: 🟢 · tier: Commander`
- **Kid text:** "[Name]'s eyes are a bit blurry. Body fluids shift toward the head in low gravity."
- **Real science:** About 70% of long-mission astronauts get eye changes (called SANS) as fluid shifts toward the head [S39].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Eye check | MED | `MED.EN-1` | Watched closely: no worse | — | Doctors track small changes |
| ★ b. Switch to non-screen jobs | MGR | [Name]'s lab tasks −1 SP | More comfortable | — | Adapt tasks to people |
| c. Ignore it | MGR | — | — | `p=0.3:` ⏳ `[Name].ENMAX-1` | Watch small symptoms |

---

### 7.6 🔬 Research (RS)

#### RS-01 · Shiny Rock Far Away 💎
`deck: 🟢 · tier: Cadet`
- **Kid text:** "Cameras spot an amazing rock, but it's far away!"
- **Real science:** Spacewalks are usually planned for about 6.5 hours, because suits carry limited air and supplies [S47].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Long trip to get it | RES + ANY (EVA) | `EVA.EN-3; EVA.AIR-3`; EVA dose | `SP+5` | `p=0.2: → CR-05 or CR-06` | Big science, big risk |
| ★ b. Study a closer rock | RES (EVA) | `RES.EN-2; RES.AIR-1`; EVA dose | `SP+2` | — | "Good enough" can be smart |
| c. Send a robot rover | ENG | `PWR-2; ENG.EN-1` | `SP+3`; no human dose | `p=0.3:` robot gets stuck (lost) | Robots save astronaut dose |

#### RS-02 · The Ground Is Shaking! 🌋
`deck: 🎯 M5 (repeatable, up to 2×), M9 · tier: Cadet`
- **Kid text:** "Rumble! A marsquake is shaking the base."
- **Real science:** On 4 May 2022, NASA's InSight felt a magnitude 4.7 marsquake that lasted hours [S49]. InSight detected 1,319 marsquakes in total [S50]. The most active quake area known on Mars is Cerberus Fossae, in Elysium Planitia, where InSight landed [S52].
- **Engine:** 40% chance of PW-09 or LS-07 next sol, unless card b is played.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Record it with the seismometer | RES | `RES.EN-1; PWR-1` | `SP+3` | Damage chance stays 40% | Quakes show what's inside a planet |
| ★ b. Inspect the base for cracks | ENG | `ENG.EN-2` | Cancels follow-up damage | `LOST: quake science` | Check after every shake |
| c. Do both, rushed | ENG + RES | `EN-1` each | `SP+1`; damage chance halves | — | Split effort = half results |

#### RS-03 · Lab Machine Broken 🔬❌
`deck: 🟢 / ⚠️ LAB ≤3 · tier: Cadet`
- **Kid text:** "The lab's main machine stopped. No experiments until it's fixed!"
- **Real science:** In 2016, the ISS lost its main CO₂-removal machines for a while and the crew had to work on repairs [S55]. Breakdowns happen even on the best stations.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Engineer fixes it | ENG | `ENG.EN-2; PARTS-1` | `LAB+4` | — | Engineers keep science running |
| ★ b. Scientist tries to fix it | RES | `RES.EN-3` | `p=0.5: LAB+2` | — | Experts are faster |
| c. Use backup tools | RES | `LOST: half of lab SP until fixed` | Some science continues | — | Backups keep a little going |

#### RS-04 · Send Your Data Home 📡
`deck: 📅 every 4 sols (comms window) **and on the last sol** (D-005) · Morning Briefing card (D-004) · tier: Cadet`
- **Kid text:** "The antenna is ready. Send your science to Earth now?"
- **Real science:** Signals between Earth and Mars take about 3–22 minutes each way [S54][S44].
- **Rule (D-005):** **all** SP (from tasks and events) starts *pending*. Only **banked** SP (sent to Earth) counts toward the goal. Pending SP is lost if LAB reaches 0. Cadet UI: "⭐ collected" vs "⭐ sent to Earth".

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Send everything | ANY | `PWR-2` | All pending SP banked | — | Science only counts when shared |
| ★ b. Send only the best | ANY | `PWR-1` | Half banked; the rest waits | — | Prioritize when bandwidth is short |
| c. Wait for the next window | MGR | — | Power saved | Pending SP still at risk | Delaying has risks |

#### RS-05 · Experiment Results! 🐭🌱
`deck: 🔗 after 3 lab tasks · tier: Cadet`
- **Kid text:** "Your space-biology experiment is finished. What do we do with it?"
- **Real science:** In an ISS study, mice lost muscle and bone after 33 days in space, and a treatment helped protect them (the data is in NASA's OSDR) [S40]. NASA's Twins Study found most of Scott Kelly's body changes went back to normal within months of returning [S41].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Share results with Earth | ANY | `PWR-1` | `SP+3` | — | Sharing turns data into knowledge |
| ★ b. Use it to protect our crew | MED | `MED.EN-1` | `SP+1`; CR-01.a costs no SP from now on | — | Research helps the researchers |
| c. Run a bigger follow-up | RES | `RES.EN-2; LAB-1; PWR-1` | ⏳2: `SP+5` | — | Big questions take longer |

#### RS-06 · Earth Wants More Science 📋
`deck: 🟢 · tier: Cadet`
- **Kid text:** "Mission Control asks: can you do an extra experiment this week?"
- **Real science:** NASA's CHAPEA crew split their time between simulated Marswalks, robots, habitat repairs, exercise and growing crops [S45].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Yes, extra experiment | MGR | `LOST: maintenance` → `LS-1` | `SP+3` | — | Every hour goes somewhere |
| ★ b. Explain we need repair time | MGR | `PWR-1` | Earth agrees: next "Ask Earth" is free | `LOST: SP` | Speaking up is part of leading |
| c. Yes, everyone works late | MGR | `ALL.EN-1` | `SP+3`; no maintenance lost | ⏳ CR-02 more likely | Overwork has hidden costs |

#### RS-07 · Space Rock Hits Mars! ☄️
`deck: 🎯 M5, M9 · tier: Cadet`
- **Kid text:** "BOOM, far away! A space rock just hit Mars and made a brand-new crater."
- **Real science:** InSight felt quakes caused by space rocks hitting Mars. The two biggest impacts made craters about 150 meters wide [S51].
- **Engine:** 20% chance of LS-07 next sol, unless card c is played.

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Drive out to the fresh crater | RES + ANY (EVA) | `EVA.EN-3; EVA.AIR-2`; EVA dose | `SP+5` (fresh crater = rare science) | `p=0.2: → CR-06` | Rare chances can be worth a trip |
| ★ b. Record the shaking | RES | `RES.EN-1; PWR-1` | `SP+2` | Damage chance stays 20% | Shaking tells where the hit was |
| c. Check our base for damage | ENG | `ENG.EN-1` | Damage chance cancelled | `LOST: crater science` | Safety check first |

---

### 7.7 📡 Communication (CM)

**Rule card "Ask Mission Control" (used inside many events):** On Mars the answer arrives **after** the current event (signals take 3–22 min each way, so emergencies can't wait) [S54][S44]. This is the main comm-delay lesson. Show a little animation of the signal travelling, and a countdown.

#### CM-01 · The Sun Is Between Us 🌞🚫
`deck: 🎯 M8 (scripted mid-mission) · warning: 3 sols · tier: Commander`
- **Kid text:** "Mars is going behind the Sun. No talking to Earth for a while!"
- **Real science:** About every 2 years, Earth and Mars end up on opposite sides of the Sun. NASA stops sending commands for about 2 weeks and hears nothing at all for about 2 days [S53].
- **Effect:** Ask Earth and Send Data are disabled for 5 sols (game-scaled).

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Plan 2 weeks ahead | MGR | `MGR.EN-2` | Random breakdowns −50% during the blackout | — | Planning replaces live help |
| ★ b. Send all data before it starts | ANY | `PWR-2` | Pending SP banked | — | Finish important talks first |
| c. Wing it | MGR | — | Effort saved | During the blackout, "Ask Earth" cards fail | Alone and unprepared is harder |

#### CM-02 · Antenna Off Target 📡↗️
`deck: 🔗 after a storm or quake · tier: Cadet`
- **Kid text:** "The antenna isn't pointing at Earth anymore!"
- **Real science:** Messages between Earth and Mars take about 3–22 minutes each way, and only if the antenna points the right way [S54][S44].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Re-aim it outside | ENG (EVA) | `ENG.EN-2`; EVA dose | Comms back | — | Hardware needs care |
| ★ b. Use the backup antenna | ANY | `PWR-1` per sol | Comms back (slow: sending costs +1 PWR) | — | Backups work but cost more |
| c. Go without Earth for now | MGR | — | — | No Ask Earth, no data until fixed | Independence has limits |

#### CM-03 · Garbled Message 📻
`deck: ☀️ DONKI FLR ≥X1 (M3, M8, M9) · tier: Commander`
- **Kid text:** "Mission Control's message came through scrambled!"
- **Real science:** Big X-class flares can cause radio blackouts [S3].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Ask them to repeat | ANY | `PWR-1`; answer arrives next sol | Correct info | — | Check before acting |
| ★ b. Guess what they meant | MGR | — | Act now | `p=0.4:` wrong action → lose today's task | Guessing saves time but risks mistakes |
| c. Use our own judgment | MGR + RES | `EN-1` each | Make our own plan | — | Far-away crews must think for themselves |

---

### 7.8 🧭 Mission & leadership (MG)

#### MG-01 · Choose Your Base 🗺️
`deck: 🚀 setup in M9 Free Play (story missions pick the site for you) · tier: Cadet`
- **Kid text:** "Where on Mars will you build your base?"
- **Real science:** Curiosity measured surface radiation at Gale crater [S7]. Perseverance, which carried MOXIE, explores Jezero crater [S60][S31]. Phoenix found ice, and also perchlorate, in the far northern plains [S30][S38].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Gale Crater (balanced) | MGR | No special bonus | Standard values; good rock science (+1 SP on T-EVA-SCI) | — | A safe start teaches the basics |
| ★ b. Jezero Crater (air makers) | MGR | Dust timer every 3 sols | LS-11 at sol 1 (MOXIE) | — | Each site has its own trade-offs |
| c. Northern Plains (ice!) | MGR | PW-07 ×2; FD-07 likely | LS-10 at sol 2 (ice) | Toxic soil | Water nearby, but colder and riskier |

#### MG-02 · Go Home Early? 🚀🏠
`deck: ⚠️ 2+ of {LS, LAB, BAT} ≤ 2, or 2+ astronauts in Sick Bay; 3-sol cooldown (D-013) · tier: Cadet`
- **Kid text:** "Things are going badly. Keep going, or end the mission safely?"
- **Real science:** When Apollo 13 lost power and oxygen, the crew gave up the Moon landing and focused on getting home safely [S24].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. End the mission safely | MGR | Mission ends now (banked SP counted, D-005) | "Safe Return" badge | — | Knowing when to stop is brave |
| ★ b. One more sol to fix things | MGR | — | Repairs work double next sol | If still critical → mission ends | Try, but set a limit |
| c. Push on for the science | MGR | — | Continue | `p=0.3` per sol: an astronaut goes to Sick Bay | Goals vs safety |

#### MG-03 · Crew Disagreement 🗣️
`deck: 🟢 · tier: Cadet`
- **Kid text:** "The Engineer wants to fix the panels. The Researcher wants to explore. There's only power for one!"
- **Real science:** NASA's CHAPEA crew had to handle limited resources, isolation and communication delays [S44].

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Fix the panels first | MGR | `LOST: RES task (SP-2)` | `PWR+1` per sol from now on | — | Infrastructure first pays off later |
| ★ b. Explore first | MGR | Panels wait (dust stack +1) | `SP+2` now | — | Quick wins vs long-term |
| c. Vote as a team | MGR | `MGR.EN-1` | Random pick, but `ALL.EN+1` (everyone feels heard) | — | A fair process builds trust |

#### MG-04 · The Long Trip 🚀➡️🔴
`deck: 🚀 setup (Commander, all missions) · tier: Commander`
- **Kid text:** "Before you land, you fly for months through deep space. How will you travel?"
- **Real science:** During the flight to Mars, Curiosity's detector measured about 1.8 mSv a day. A round trip alone would give about 0.66 Sv, more than NASA's 600 mSv career limit [S8][S9].
- **Note:** the real one-way trip dose would be about 5 DOSE pips. The game uses a smaller start (2–3) so the surface part is playable. Label this "game-simplified".

| Card | Who | Cost now | Effect | Later ⏳ / risk | Lesson |
|---|---|---|---|---|---|
| ★ a. Standard ship | MGR | — | Start DOSE 3 | Less room for storms later | The trip counts too |
| ★ b. Extra water walls around the beds | MGR | `FOOD-10` (cargo weight) | Start DOSE 2 | — | Shielding costs mass |
| c. Faster route | MGR | `PARTS-2` (more fuel, less cargo) | Start DOSE 2 | — | Speed is a kind of shield |

---

## 8. Mars missions & decks (not every event in every game)

### 8.1 The deck types
Not all 60 events can happen in one game. Each event belongs to a **deck type** that decides *if* and *when* it can appear:

| Tag | Deck type | When it can appear | Example |
|---|---|---|---|
| 🟢 | **Core** | In any mission, drawn randomly from the shuffled deck. Most appear **once at most** per game | LS-01, CR-02, RS-01 |
| 🎯 | **Mission** | Only in the missions listed for it | RS-02 Marsquake (M5), CM-01 Conjunction (M8) |
| 🔗 | **Chain** | Only after another event or action | LS-04 Smoke! only after lighting a candle |
| ⚠️ | **Condition** | Only when a number gets too low or too high. Can repeat | PW-08 Not Enough Power!, FD-06 Food Running Low |
| 📅 | **Timer** | Every N sols | CR-01 every 3 sols, RS-04 every 4 sols |
| ☀️ | **DONKI** | Only if the mission's real NASA data window has that event | SW-01 Flash on the Sun |
| 🚀 | **Setup** | Before sol 1 | FD-04 Pack the Cargo, MG-04 The Long Trip |

### 8.2 The Mars missions

| # | Mission | Site | Length (Cadet / Commander) | Goal | Mission-only events (🎯) and scripted beats | Special rule | What it teaches |
|---|---|---|---|---|---|---|---|
| **M1** | 👣 **First Steps** (tutorial) | Gale Crater | 8 / — (Cadet only) | 6 SP | PW-03 Lucky Wind; DONKI forced quiet (calm Sun) | No Commander events; tips shown on every card | The basics: power, air, food, science |
| **M2** | 🌫️ **Dust Season** | Meridiani Planum (Opportunity's plains [S59]) | 10 / 20 | 8 / 16 SP **and** never lose LS power | PW-04 sol 3 → PW-05 sol 6 (Commander); PW-06; PW-03 | Dust timer every 3 sols | Solar power vs dust; batteries; reactors |
| **M3** | ☀️ **Storm from the Sun** | Gale Crater | 10 / 20 | 8 / 16 SP **and** every astronaut DOSE ≤ 6 (no red badges, D-010) | DONKI window 2024-05-01 → 2024-05-31 (ENLIL Mars hits + flares). Scripted SW-01 sol 2, SW-03 sol 4 → SW-04 sol 6, SW-02 sol 7; SW-08, SW-09, SW-10, CM-03 | **Compressed storm replay** (D-009): each scripted beat is tied to one real DONKI record and shows its real date + "replay, sped up" | Radiation, warnings, shelters, real space weather |
| **M4** | 🧊 **Ice Hunters** | Northern Plains (Phoenix region [S30]) | 10 / 20 | 6 / 14 SP **and** end with H2O ≥ start | LS-10 sol 2; FD-07; LS-06 | H2O starts low (12 / 15); PW-07 ×2 weight | Living off the land; water vs air; toxic soil |
| **M5** | 🌋 **Quake Watch** | Elysium Planitia (InSight's site [S52]) | 10 / 20 | 8 / 18 SP | RS-02 (up to 2×), RS-07, PW-09, PW-06 | Seismometer: every quake gives +1 SP automatically | Marsquakes, impacts, keeping a base safe |
| **M6** | 🫧 **Air Makers** | Jezero Crater (Perseverance/MOXIE [S60][S31]) | 10 / 20 | 6 / 14 SP **and** make 4 O2T | LS-11 sol 1 (unlocks T-MOXIE); LS-03 ×2 weight | O2T starts at 1 | Air from CO₂ and from water; backups and risks |
| **M7** | 🌱 **Green Thumbs** | Gale or Jezero | 10 / 20 | 6 / 14 SP **and** end with FOOD ≥ start | FD-03, FD-07, LS-06; 2 greenhouse bays (2× FD-01) | FOOD starts 10 lower | Growing food; power for light; patience |
| **M8** | 🌞 **Alone Behind the Sun** | Gale or Jezero | — / 20 (Commander only) | 16 SP | CM-01 scripted sol 9 (blackout to sol 13); SW-10, CM-03, FD-03; CR-03 ×2 weight | "Ask Earth" always arrives after the event | Comm delay, planning, independence |
| **M9** | 🎲 **Free Play** | Player chooses (MG-01) | 10 / 20 | 8 / 18 SP | Every 🎯 event allowed except mission-scripted beats; PW-10 at setup | Optional **Today's Sun**: live DONKI for the last 30–60 days | Everything, in a new mix every time |

### 8.3 How one game builds its deck (draw order)

```text
SETUP
  run 🚀 setup events: FD-04, FD-01, (Commander) MG-04, (M9) MG-01 + PW-10
  deck = all 🟢 Core events for this tier + this mission's 🎯 events
  shuffle(deck, seed)                       // the seed makes every game different but replayable

EACH SOL
  MORNING (D-004)
    add a dust stack if the dust timer says so (automatic, shown in the report)
    Morning Briefing: at most 1 due 📅 timer (RS-04, CR-01) or FD-01 re-planting
        → same cards and costs as the event; does NOT count against the event cap
        → if FD-01 is bumped, the same crop is replanted automatically
  POWER PLAN: need > PWR + BAT → PW-08 shortage mode (D-003, no event slot)

  EVENT SLOT, by priority (D-004):
    1. scripted beat for this sol
    2. ☀️ DONKI event on this sol             (Commander: may also play a deck card)
    3. MG-02
    4. SW-02
    5. LS / air chains and conditions
    6. other 🔗 chains and ⚠️ conditions (incl. EVA mishap, D-013)
    7. quiet sol? (Cadet 30%, Commander 15%) → SW-05 if DONKI is calm, else nothing
    8. otherwise                              → play the top card of the deck
    PW-02 plays only when a stack was added today AND the slot is free.
    A displaced chain or condition waits 1 sol, then is dropped and logged.
    ⚠️ condition events have a 3-sol cooldown.
  Max 1 event per sol in Cadet; max 2 in Commander (the Morning Briefing is extra).
  🟢/🎯 events are removed after playing (unless marked "repeatable").
```

### 8.4 Kid scope (D-018, D-019, D-020)
The playable game (both missions, Cadet) uses a small set so young players are never overwhelmed:

| Mission | Sols | Goal | Events it can show |
|---|---|---|---|
| M1 First Steps | 8 | 6 SP sent | FD-01 (setup + re-plant), PW-02, PW-03, PW-08, LS-03, LS-05, RS-01, RS-04 |
| M3 Storm from the Sun | 10 | 8 SP sent, badge never red | the M1 set + SW-01 (sol 2, real X3.9 flare 2024-05-10) + SW-02 (sol 6, real particle event 2024-05-13) |

**Jobs (4 per astronaut, all their own):** Manager: Rest · Pep talk · Care for plants · Send data. Engineer: Rest · Maintain life support · Clean solar panels · Pile soil bags. Doctor: Rest · Treat (when someone is in Sick Bay, otherwise Check-up) · Care for plants · Lab experiment. Researcher: Rest · Lab experiment · Rock-study walk · Care for plants.

**Rules:** an event outside the scope never appears, and a card never shows a follow-up that cannot happen. The sol on screen is: Morning news card (if any) → jobs → one surprise → night report.

**Result:** a 10-sol Cadet game shows about **8–12** events. A 20-sol Commander game shows about **15–22**. A 60-event library across 9 missions gives every replay a different story.

---

## 9. Coverage check vs the challenge

| Challenge asks for… | Events that teach it | Missions that focus on it |
|---|---|---|
| Life support | LS-01…LS-11, CR-04 | M6, M4 |
| Radiation shielding | SW-01…SW-10, MG-04, T-SHIELD, T-WATERWALL | M3 |
| Power budgeting | PW-01…PW-10, the daily power plan | M2, M5 |
| Food production | FD-01…FD-07, T-GARDEN | M7 |
| Communication delay | Ask Mission Control rule, CM-01…CM-03, CR-03, LS-02.b, SW-09.c, SW-10.b | M8 |
| Real NASA data | DONKI (§5), Curiosity RAD doses, OSDR (RS-05, CR-01; RadLab radiation data and the ISS cabin-air app are good extras for science cards [S58]), Mars mission data (Opportunity, Spirit, InSight, Phoenix, MOXIE) | all |
| "No free choice" | §1.1 rule 2 + simulator check | all |
| Replayability | Deck types + seeds (§8.3), 9 missions, Cadet/Commander, Today's Sun | all |
| Clear attribution | `[S#]` on every card → "Where our data comes from" screen | all |

---

## 10. Data structures (TypeScript sketch)

```ts
type Tier = 'cadet' | 'commander';
type Role = 'MGR' | 'ENG' | 'MED' | 'RES';
type Who = Role | 'ANY' | 'EVA' | Role[] | ['ANY', 'ANY'];
type DeckType = 'core' | 'mission' | 'chain' | 'condition' | 'timer' | 'donki' | 'setup';
type MissionId = 'M1'|'M2'|'M3'|'M4'|'M5'|'M6'|'M7'|'M8'|'M9';

interface Effect { target: string; stat?: string; delta?: number; flag?: string; trigger?: string; }
interface Delayed { inSols: number; chance?: number; effects: Effect[]; }

interface ActionCard {
  id: string;            // 'SW-02.a'
  title: string;
  who: Who;
  cadet: boolean;        // ★
  tags?: 'repair'[];     // D-006
  costNow: Effect[];
  lostChance?: string;
  effects: Effect[];
  later?: Delayed[];
  lesson: string;        // ≤10 words
}

interface EventCard {
  id: string;            // 'SW-02'
  title: string;
  icon: string;
  systems: string[];
  tier: Tier;
  deck: DeckType;
  missions: MissionId[] | 'all';
  repeatable?: boolean | number;   // e.g. RS-02 in M5: 2
  weight?: number;                 // draw weight (default 1)
  trigger?:
    | { kind: 'donki'; type: 'FLR'|'SEP'|'CME'|'WSAEnlilSimulations'|'notifications'|'quiet' }
    | { kind: 'condition'; expr: string }    // e.g. 'H2O <= 6'
    | { kind: 'timer'; everySols: number }
    | { kind: 'scripted'; sol: number }
    | { kind: 'chain'; from: string };
  warningSols: number;
  briefing?: boolean;              // shown as the Morning Briefing card (D-004): RS-04, CR-01, FD-01 re-plant
  cooldownSols?: number;           // ⚠️ conditions: 3 (D-004)
  kidText: string;
  realScience: { text: string; sources: string[] };
  actions: ActionCard[]; // 2–3
}

interface Mission {
  id: MissionId;
  name: string;
  site: string;
  sols: { cadet?: number; commander?: number };
  goal: { sp: { cadet?: number; commander?: number }; extra?: string };
  missionEvents: string[];          // 🎯 IDs allowed
  scripted: { sol: number; event: string }[];
  startOverrides?: Partial<Record<'FOOD'|'H2O'|'O2T'|'PARTS', number>>;
  donkiWindow?: { start: string; end: string } | 'live-last-60-days' | 'quiet';
  specialRules: string[];
}
```

---

## 11. Sources
*(Every `[S#]` above points here. Show these on the in-game "Where our data comes from" screen.)*

- [S1] CCMC Announcements: DONKI moves to ccmc.gsfc.nasa.gov/DONKI-API (Sep 2026) – https://ccmc.gsfc.nasa.gov/news/major-updates/
- [S2] NASA DONKI, WSA-ENLIL simulation with a Mars arrival and "no or little impact to Earth" (example) – https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/WSA-ENLIL/46407/1
- [S3] NASA SVS, "X-Class: A Guide to Solar Flares" – https://svs.gsfc.nasa.gov/10109
- [S4] NASA SVS, travel times of flares, particles and CMEs (transcript) – https://svs.gsfc.nasa.gov/vis/a010000/a010900/a010941/10941_Travel_Time_HTML_Transcript.html
- [S5] NASA, "How NASA Tracked the Most Intense Solar Storm in Decades" – https://science.nasa.gov/science-research/heliophysics/how-nasa-tracked-the-most-intense-solar-storm-in-decades/
- [S6] NASA (via EurekAlert), "What NASA is learning from the biggest geomagnetic storm in 20 years" (Curiosity RAD 8,100 µGy) – https://www.eurekalert.org/news-releases/1083377
- [S7] Hassler et al. 2014, Science (Curiosity RAD on the Mars surface; 1 sol = 24 h 39 min) – https://www.scienceintheclassroom.org/research-papers/curiosity-tells-all-about-mars-radiation-environment
- [S8] CS Monitor summary of the RAD results (0.64 mSv/day on the surface; 1.8 in cruise; 0.66 Sv round trip) – https://www.csmonitor.com/Science/2013/1209/Curiosity-measures-radiation-at-Martian-surface
- [S9] NASA OCHMO Radiation Protection Technical Brief (600 mSv career; 250 mSv per event; nuclear-system limit) – https://www.nasa.gov/sites/default/files/atoms/files/radiation_protection_technical_brief_ochmo.pdf
- [S10] NASA, Orion storm shelter using stowage bags – https://www.nasa.gov/feature/orion-passengers-on-artemis-i-to-test-radiation-vest-for-deep-space-missions
- [S11] Scientific American, Artemis II space-weather protection (shelter within ~30 min) – https://www.scientificamerican.com/article/space-weather-could-threaten-nasas-artemis-ii-astronauts-during-their-trip/
- [S12] Space.com, Artemis 2 solar-storm plan (HERA sensors, crew dosimeter badges) – https://www.space.com/space-exploration/artemis/how-the-artemis-2-astronauts-could-weather-a-solar-storm-during-their-moon-mission
- [S13] NASA NSSDC Mars Fact Sheet (sunlight, temperatures, gravity) – https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
- [S14] NASA JPL, "Six Things About Opportunity's Recovery Efforts" – https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/
- [S15] AP via WRAL, end of the Opportunity mission (21 Wh, −97%, tau 10.8) – https://www.wral.com/amp/my-battery-is-low-and-it-s-getting-dark-end-of-opportunity-mission-a-loss-for-team/18197530/
- [S16] JPL via Solar Daily, Opportunity 468 Wh at tau ≈1.0 (June 2018) – https://www.solardaily.com/reports/Regional_dust_storm_is_affecting_Opportunity_Mars_rover_999.html
- [S17] NASA JPL, "Spirit Gets Energy Boost from Cleaner Solar Panels" (2009) – https://www.jpl.nasa.gov/news/spirit-gets-energy-boost-from-cleaner-solar-panels/
- [S18] Inverse, InSight's dusty panels and the end of the mission (Dec 2022) – https://nc.inverse.com/science/mars-quake-surprising-source-insight-lander
- [S19] NASA Glenn, Fission Surface Power project (40 kW, 10 years, possible Mars use) – https://www.nasa.gov/centers-and-facilities/glenn/nasas-fission-surface-power-project-energizes-lunar-exploration
- [S20] NASA OCHMO ECLSS Technical Brief (3,035 kcal/day; ≥2.5 L water/day) – https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-002-eclss.pdf
- [S21] NASA crew needs & outputs per person per day (O₂ ≈0.84 kg, CO₂ ≈1.0 kg; credit NASA MSFC; see NASA's BVAD, NASA/TP-2015-218570) – https://lunarpedia.org/w/Needs_and_Effluents
- [S22] NASA OCHMO CO₂ Technical Brief – https://www.nasa.gov/ochmo-tb-004-carbon-dioxide-2/
- [S23] NASA Apollo Flight Journal, Apollo 13 CO₂ adapter – https://www.nasa.gov/history/afj/ap13fj/15day4-mailbox.html
- [S24] NASA SP-350, "A Square Peg in a Round Hole" (Apollo 13) – https://www.nasa.gov/wp-content/uploads/static/history/SP-350/ch-13-4.html
- [S25] NASA APPEL, solid-fuel oxygen generators and the 1997 Mir fire – https://appel.nasa.gov/?p=279500
- [S26] Windows to the Universe, "Small Fire Occurs on Mir Space Station" – https://www.windows2universe.org/headline_universe/shuttle_news/mir_fire.html
- [S27] ISS reaches 98% water recovery (93–94% before the Brine Processor) – https://www.audacy.com/wwl/news/national/iss-recycles-98-of-astronaut-urine-into-drinking-water and https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone
- [S28] National Academies, ISS oxygen from water electrolysis – https://www.nationalacademies.org/read/5826/chapter/4
- [S29] SpacePolicyOnline, Soyuz MS-22 coolant leak – https://spacepolicyonline.com/news/roscosmos-to-decide-next-week-if-soyuz-ms-22-is-safe-enough/
- [S30] VOA News, Phoenix lander confirms ice on Mars and finds perchlorate (2008) – https://www.voanews.com/a/a-13-2008-08-05-voa64/330540.html
- [S31] MIT AeroAstro / NASA, MOXIE completes its Mars mission – https://aeroastro.mit.edu/news-impact/oxygen-generating-experiment-moxie-completes-mars-mission
- [S31b] Phys.org / NASA, MOXIE 12 g per hour – https://phys.org/news/2023-09-nasa-oxygen-generating-moxie-mars-mission.html
- [S32] CNN (via Yahoo News), Mars' thin air is 96% CO₂ (MOXIE's final run) – https://news.yahoo.com/perseverance-rover-experiment-creates-oxygen-211853830.html
- [S33] Scientific American, first space lettuce (33 days) – https://www.scientificamerican.com/article/astronauts-take-first-bites-of-lettuce-grown-in-space/
- [S34] NASA, "NASA's Second Pepper Harvest Sets Record on Space Station" (137 days) – https://www.nasa.gov/missions/station/nasas-second-pepper-harvest-sets-record-on-space-station
- [S35] NASA, Plant Habitat-04 chile peppers (fans, hand pollination, tacos, 12 returned, radishes) – https://www.nasa.gov/?p=73108
- [S36] NASA NTRS, Food Fortification Stability Study (5-year shelf life) – https://ntrs.nasa.gov/citations/20160012717
- [S37] Science News, "Food for Mars" (vitamin losses) – https://www.sciencenews.org/blog/science-public/food-mars
- [S38] Space.com via NBC News, perchlorate in Mars soil – https://www.nbcnews.com/id/wbna52197237
- [S39] Discover, long-term spaceflight and the body (bone loss, exercise, SANS) – https://www.discovermagazine.com/the-sciences/how-long-term-space-travel-wears-down-an-astronauts-mind-and-body
- [S40] NASA OSDR dataset: myostatin/activin A study (mice lost muscle and bone in 33 days) – https://catalog.data.gov/dataset/targeting-myostatin-activin-a-protects-against-skeletal-muscle-and-bone-loss-during-spacef
- [S41] Phys.org, NASA Twins Study results – https://phys.org/news/2019-04-nasa-twins-landmark-eventual-mars.html
- [S42] Lancet Neurology 2014 via EurekAlert, astronaut sleep study – https://www.eurekalert.org/news-releases/541449
- [S43] SpacePolicyOnline, CHAPEA 378-day mission and crew roles – https://spacepolicyonline.com/news/four-analog-astronauts-complete-378-day-practice-mars-mission/
- [S44] CBS News, CHAPEA (delays up to 22 min; limited resources, isolation) – https://www.cbsnews.com/news/nasa-simulated-mars-mission-ends-more-than-a-year
- [S45] ABC/GMA, CHAPEA daily activities – https://www.goodmorningamerica.com/news/story/nasas-mars-simulator-crew-emerged-after-378-days-111755446
- [S46] NASA History, "EVA 23: A High Visibility Close Call" – https://www.nasa.gov/history/10-years-ago-eva-23-how-a-high-visibility-close-call-cut-short-a-spacewalk/
- [S47] Space.com, spacesuit water leak (1–1.5 L; planned 6.5 h) – https://www.space.com/21988-spacewalk-dangers-spacesuit-water-leak.html
- [S48] Stony Brook / AGU, lunar dust and "lunar hay fever" – https://news.stonybrookmedicine.edu/news/breathing-lunar-dust-could-pose-health-risk-to-future-astronauts/
- [S49] Live Science, largest marsquake (M4.7, lasted hours) – https://www.livescience.com/largest-marsquake-ever-detected
- [S50] Reuters (via Fiji Times), InSight detected 1,319 marsquakes – https://www.fijitimes.com.fj/?p=687359
- [S51] Universe Today, InSight impact quakes (craters ≈150 m) – https://www.universetoday.com/articles/the-big-one-the-most-powerful-marsquake-ever-detected
- [S52] EarthSky, Cerberus Fossae in Elysium Planitia is Mars' most active known quake region – https://earthsky.org/?p=423546
- [S53] NASA, Mars solar conjunction communications pause – https://www.nasa.gov/?p=565122
- [S54] Space Academy, communication delay table (Mars 3–21 min one way) – https://spaceacademy.net.au/spacelink/commdly.htm
- [S55] Spaceflight101, 2016 ISS CO₂-removal failures – https://spaceflight101.com/?p=9970
- [S56] NewSpace Economy, Mars distance and 26-month launch windows – https://newspaceeconomy.ca/2026/04/18/how-far-away-is-mars-distance-delay-and-what-it-means-for-getting-there/
- [S57] api.nasa.gov notice: the Mars Rover API is archived – https://api.nasa.gov/assets/html/header.html
- [S58] NASA OSDR Visualization Portal (RadLab radiation data, Environmental Data App, Biological Data API) – https://visualization.osdr.nasa.gov/
- [S59] Scientific American / Space.com, 2018 dust storm (Opportunity on Meridiani Planum since 2004) – https://www.scientificamerican.com/article/massive-dust-storm-engulfs-mars/
- [S60] CNN via ABC17, Perseverance exploring Jezero Crater – https://abc17news.com/?p=659714

> **Before judging:** spot-check a few key numbers against the original NASA pages, and prefer NASA sources over news summaries where both exist. Keep the "game-scaled ×15" note visible in the game.
