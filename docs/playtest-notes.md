# Playtest notes

*Phase 4 DoD: two adults outside the UI lane finish M1 without help. Do not photograph faces or write down children's names (CLAUDE.md §10).*

**Link:** https://claude.ai/artifact/GCexFXof8QhJLbVhK9tfio (or the GitHub Pages URL once it is live)
**What to try:** Play → First Steps → finish all 8 sols. Then try Storm from the Sun.

| # | Date | Tester (role, no names of minors) | Device | Mission | Finished without help? | Ending | Confusing moments | Fun moments | Bugs |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | M1 | | | | | |
| 2 | | | | M1 | | | | | |

## Questions to ask after playing
1. What did each job do? Which job did you like?
2. Did you understand red / green / yellow chips?
3. Did you know when to send your science stars home?
4. Was there a moment you didn't know what to press?

## Automated checks already done (13 Nov 2026, headless Chromium)
- M1 and M3 played to the debrief at 1280×800 and 360×640: no console errors, no horizontal scroll.
- Projector mode at 1024×768: kid text 27 px; no tap target under 44 px.
- Throttled phone (4× CPU, Fast 3G): title usable after ~2.1 s, each step < 0.8 s; first load ~141 KB.
- Lighthouse mobile: performance 93, accessibility 100, best practices 100.
