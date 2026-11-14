/** The live-action layer (D-031…D-034): every card a kid can meet has a tool, a name and a mini-game prompt. */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NASA_IMAGES } from '../../src/content/nasaImages';
import { CONTENT } from '../../src/content';
import { copy } from '../../src/content/copy';
import { KID_EVENTS, KID_JOBS } from '../../src/content/missions';
import { ICON_PATHS } from '../../src/ui/components/Icon';
import { howTo, JOBS, pickPlay, SKILLS, STAGE, toolFor, TOOLS } from '../../src/ui/game/tools';
import {
  award,
  BADGE_DEFS,
  BADGES,
  buy,
  finishMission,
  loadProfile,
  newBadges,
  rankOf,
  rankProgress,
  scoreOf,
  SHOP,
  addScore,
  topScores,
  use,
} from '../../src/ui/meta';
import { MINIS } from '../../src/ui/game/minis';
import { balancedBot, playGame } from '../../src/sim/bots';
import { E } from '../engine/helpers';

describe('tools and stages', () => {
  const events = [...KID_EVENTS, 'PW-08', 'LS-02']; // + the shortage card and the LS-01 → LS-02 swap
  it('every playable card has its own tool, a short name and an icon', () => {
    for (const id of events) {
      const ev = CONTENT.events[id]!;
      expect(STAGE[id], `stage for ${id}`).toBeDefined();
      for (const a of ev.actions) {
        const t = TOOLS[a.id];
        expect(t, `tool for ${a.id}`).toBeDefined();
        expect(copy.tools[a.id], `name for ${a.id}`).toBeTruthy();
        expect(copy.tools[a.id]!.split(' ').length).toBeLessThanOrEqual(3);
        expect(ICON_PATHS[t!.icon], `icon for ${a.id}`).toBeTruthy();
        expect(STAGE[id]!.at, `trouble spot for ${id}`).toBeDefined();
        if (t!.mech === 'none') continue;
        expect(howTo(pickPlay(t!, false)), `prompt for ${a.id}`).toBeTruthy();
        for (const alt of t!.alt ?? []) {
          expect(howTo(alt), `alt prompt for ${a.id}`).toBeTruthy();
          expect(alt.mech, `alt of ${a.id} differs`).not.toBe(t!.mech);
        }
      }
    }
  });
  it('the two star cards of an event never open the same mini-game', () => {
    for (const id of KID_EVENTS) {
      const [a, b] = CONTENT.events[id]!.actions.filter((x) => x.cadet);
      const ta = toolFor(a!.id);
      const tb = toolFor(b!.id);
      if (ta.mech === 'none' || tb.mech === 'none') continue;
      expect(`${ta.mech}${JSON.stringify(ta.p ?? {})}`, id).not.toBe(
        `${tb.mech}${JSON.stringify(tb.p ?? {})}`,
      );
    }
  });
  it('an unknown card still gets a playable tool', () => {
    expect(toolFor('CM-02.a').mech).not.toBe('none');
    expect(toolFor('CM-02.wait').mech).toBe('none');
  });
  it('every job has a spot in the base', () => {
    for (const list of Object.values(KID_JOBS))
      for (const slot of list) for (const t of slot.split('|')) expect(JOBS[t], t).toBeDefined();
  });
});

describe('NASA pictures in the Training room (D-047)', () => {
  it('every picture is bundled, credited, dated and tied to events of the game', () => {
    expect(NASA_IMAGES.length).toBeGreaterThanOrEqual(8);
    for (const i of NASA_IMAGES) {
      expect(existsSync(resolve(__dirname, `../../public/img/nasa/${i.file}.webp`)), i.file).toBe(
        true,
      );
      expect(i.credit, i.file).toMatch(/^NASA/);
      expect(i.nasaId.length, i.file).toBeGreaterThan(5);
      expect(i.published, i.file).toMatch(/^\d{4}-\d\d-\d\d$/);
      expect(i.caption.split(' ').length, i.file).toBeLessThanOrEqual(30);
      for (const e of i.events) expect(KID_EVENTS, `${i.file} → ${e}`).toContain(e);
    }
  });
});

describe('Training room skills and scores (D-050, D-056)', () => {
  it('lists every mini-game mechanic exactly once', () => {
    const mechs = SKILLS.map((k) => k.mech);
    expect(new Set(mechs).size).toBe(mechs.length);
    expect(mechs.sort()).toEqual(Object.keys(MINIS).sort());
    for (const k of SKILLS) expect(copy.skills[k.mech] && howTo(k), k.mech).toBeTruthy();
  });
  it('Survival scores 10 a day + 1 a star and the board keeps the best on top', () => {
    const run = playGame(E, E.newGame({ mission: 'M9', tier: 'cadet', seed: 2 }), balancedBot());
    const sc = scoreOf(run);
    expect(sc.mode).toBe('survival');
    expect(sc.score).toBe(run.sol * 10 + run.sp.banked);
    const a = addScore([], sc);
    expect(a.best).toBe(true);
    const b = addScore(a.all, { ...sc, score: sc.score - 5 });
    expect(b.best).toBe(false);
    expect(topScores(b.all, 'survival')[0]!.score).toBe(sc.score);
    // every star sent in Survival is paid, even though the run always ends with the crew going home
    expect(finishMission(loadProfile(), run, 0, 0).reward.stars).toBe(run.sp.banked);
  });
});

describe('shop continuity (D-066)', () => {
  it('ranks rise with lifetime stars and unlock the rank items', () => {
    const fresh = loadProfile();
    expect(rankOf(fresh)).toBe(0);
    expect(rankOf({ earned: 25 })).toBe(1);
    expect(rankOf({ earned: 300 })).toBe(4);
    expect(rankProgress({ earned: 30 })).toEqual({ have: 5, need: 45 });
    const cat = SHOP.find((i) => i.id === 'extra.cat')!;
    const rich = { ...fresh, stars: 99 };
    expect(buy(rich, cat.id)).toBe(rich); // enough stars, but still a Cadet
    expect(buy({ ...rich, earned: 25 }, cat.id).owned).toContain(cat.id);
  });
  it('every item has a name, paint picks one at a time, and collecting pays a badge', () => {
    for (const i of SHOP) expect(copy.shop.items[i.id], i.id).toBeTruthy();
    expect(new Set(SHOP.map((i) => i.id)).size).toBe(SHOP.length);
    let p = { ...loadProfile(), stars: 500, earned: 500 };
    p = buy(buy(p, 'dome.red'), 'dome.glass');
    expect(p.dome).toBe('dome.glass');
    for (const i of SHOP.slice(0, 12)) p = buy(p, i.id);
    expect(p.owned.length).toBeGreaterThanOrEqual(10);
    const end = playGame(E, E.newGame({ mission: 'M3', tier: 'cadet', seed: 7 }), balancedBot());
    expect(newBadges({ s: end, miniWins: 0, fastWins: 0, ended: false }, p)).toContain('collector');
  });
});

describe('rewards between missions', () => {
  const fresh = loadProfile();
  const end = playGame(E, E.newGame({ mission: 'M3', tier: 'cadet', seed: 7 }), balancedBot());
  it('a win pays every star sent, anything else pays half (rounded up)', () => {
    const { reward, profile } = finishMission(fresh, end, 0, 0);
    const won = end.ending!.kind === 'success';
    expect(reward.half).toBe(!won);
    expect(reward.stars).toBe(won ? end.sp.banked : Math.ceil(end.sp.banked / 2));
    expect(reward.newBadges).toContain('firstLanding');
    expect(profile.stars).toBe(reward.stars + reward.badgeStars);
    expect(profile.missions).toBe(1);
  });
  it('badges pop during play, pay stars, and are given once', () => {
    const ctx = { s: end, miniWins: 6, fastWins: 1, ended: false };
    const got = newBadges(ctx, fresh);
    expect(got).toEqual(expect.arrayContaining(['firstFix', 'speedy', 'fixIt']));
    expect(got).not.toContain('firstLanding'); // end-of-mission badges wait for the end
    const p = award(fresh, got);
    expect(p.stars).toBe(got.reduce((n, b) => n + BADGE_DEFS[b].stars, 0));
    expect(newBadges(ctx, p)).toEqual([]);
  });
  it('the shop only sells what the star bank can pay, and never changes the rules', () => {
    const dog = SHOP.find((i) => i.id === 'extra.dog')!;
    expect(buy(fresh, dog.id)).toBe(fresh); // 0 stars
    const rich = buy({ ...fresh, stars: dog.price }, dog.id);
    expect(rich.stars).toBe(0);
    expect(rich.extras).toContain(dog.id);
    expect(use(rich, dog.id).extras).not.toContain(dog.id); // extras toggle
    for (const i of SHOP) expect(copy.shop.items[i.id], i.id).toBeTruthy();
    for (const b of BADGES) expect(copy.badges.names[b] && copy.badges.how[b], b).toBeTruthy();
  });
  it('a "same choice as the real crew" line only exists for real cards in the game', () => {
    for (const id of Object.keys(copy.endStory.same)) {
      const ev = CONTENT.events[id.slice(0, 5)];
      expect(
        ev?.actions.some((a) => a.id === id),
        id,
      ).toBe(true);
      expect(ev!.realScience.sources.length, id).toBeGreaterThan(0);
    }
  });
});
