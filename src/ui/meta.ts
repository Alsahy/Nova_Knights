/**
 * What a player keeps between missions (D-034, D-038): a star bank, base decorations and space badges.
 * Badges pop up the moment they are earned and each one pays stars into the bank.
 * Stored only on this device (localStorage, try/catch). No account, no personal data (CLAUDE.md §10).
 */
import type { GameState } from '../engine/types';

export type ShopKind = 'suit' | 'light' | 'dome' | 'rover' | 'extra';
export interface ShopItem {
  id: string;
  kind: ShopKind;
  price: number;
  /** suit: body colour · light: room glow colour(s) */
  colors?: string[];
  /** Rank needed before it can be bought (index into RANKS). Gives long-term goals (D-066). */
  rank?: number;
}

/** Decorations only: nothing here changes the game rules. Prices are in banked science stars. */
export const SHOP: ShopItem[] = [
  { id: 'suit.classic', kind: 'suit', price: 0, colors: ['#e2e8f0'] },
  { id: 'suit.sunset', kind: 'suit', price: 8, colors: ['#f6a15b'] },
  { id: 'suit.mint', kind: 'suit', price: 8, colors: ['#8fe3c0'] },
  { id: 'suit.sky', kind: 'suit', price: 12, colors: ['#8cc8ff'] },
  { id: 'suit.rose', kind: 'suit', price: 12, colors: ['#ffa3c4'] },
  { id: 'suit.galaxy', kind: 'suit', price: 15, colors: ['#b79cf5'] },
  { id: 'suit.night', kind: 'suit', price: 25, colors: ['#5b6b8c'], rank: 1 },
  { id: 'suit.gold', kind: 'suit', price: 30, colors: ['#f2cf5b'], rank: 2 },
  {
    id: 'light.neon',
    kind: 'light',
    price: 0,
    colors: ['#4fd8e8', '#4fe0b0', '#f0625a', '#b072f5'],
  },
  {
    id: 'light.aurora',
    kind: 'light',
    price: 10,
    colors: ['#5ff0a8', '#5ff0a8', '#5ff0a8', '#5ff0a8'],
  },
  {
    id: 'light.candy',
    kind: 'light',
    price: 10,
    colors: ['#ff8fd0', '#ffb36b', '#ff8fd0', '#ffb36b'],
  },
  {
    id: 'light.ocean',
    kind: 'light',
    price: 15,
    colors: ['#5c9cff', '#4fd8e8', '#5c9cff', '#4fd8e8'],
  },
  {
    id: 'light.sunset',
    kind: 'light',
    price: 15,
    colors: ['#ff9d5c', '#ff6f91', '#ffc75f', '#ff9d5c'],
  },
  {
    id: 'light.royal',
    kind: 'light',
    price: 22,
    colors: ['#b072f5', '#f2cf5b', '#b072f5', '#f2cf5b'],
    rank: 1,
  },
  { id: 'dome.steel', kind: 'dome', price: 0, colors: ['#94a3b8'] },
  { id: 'dome.red', kind: 'dome', price: 10, colors: ['#d9654f'] },
  { id: 'dome.glass', kind: 'dome', price: 18, colors: ['#a5e4f7'] },
  { id: 'dome.gold', kind: 'dome', price: 35, colors: ['#f2cf5b'], rank: 3 },
  { id: 'rover.white', kind: 'rover', price: 0, colors: ['#cbd5e1'] },
  { id: 'rover.yellow', kind: 'rover', price: 10, colors: ['#f2cf5b'] },
  { id: 'rover.green', kind: 'rover', price: 10, colors: ['#6cc08b'] },
  { id: 'rover.red', kind: 'rover', price: 14, colors: ['#f0625a'] },
  { id: 'extra.flag', kind: 'extra', price: 6 },
  { id: 'extra.rug', kind: 'extra', price: 6 },
  { id: 'extra.plant', kind: 'extra', price: 8 },
  { id: 'extra.poster', kind: 'extra', price: 8 },
  { id: 'extra.lights', kind: 'extra', price: 12 },
  { id: 'extra.telescope', kind: 'extra', price: 18 },
  { id: 'extra.dog', kind: 'extra', price: 20 },
  { id: 'extra.cat', kind: 'extra', price: 25, rank: 1 },
  { id: 'extra.drone', kind: 'extra', price: 30, rank: 2 },
  { id: 'extra.trophy', kind: 'extra', price: 40, rank: 3 },
];

/** Ranks grow with every star ever earned (never spent away), so each mission moves the player forward (D-066). */
export const RANKS: readonly number[] = [0, 25, 70, 150, 300]; // lifetime stars needed for rank 0…4
export const rankOf = (p: Pick<Profile, 'earned'>): number =>
  RANKS.reduce((r, need, i) => (p.earned >= need ? i : r), 0);
/** Progress toward the next rank: stars earned in this rank, stars this rank needs, or null at the top. */
export function rankProgress(p: Pick<Profile, 'earned'>): { have: number; need: number } | null {
  const r = rankOf(p);
  const next = RANKS[r + 1];
  return next === undefined ? null : { have: p.earned - RANKS[r]!, need: next - RANKS[r]! };
}

/** What the game knows when it checks for badges. */
export interface PlayCtx {
  s: GameState;
  miniWins: number; // this mission
  fastWins: number; // mini-games won with more than half the time left
  ended: boolean;
}

const count = (s: GameState, key: string) => s.log.filter((e) => e.key === key).length;
const lastSol = (c: PlayCtx) => c.ended && c.s.sol >= c.s.lastSol;

/** Every badge: the stars it pays and when it is earned. Order = the order on the badge wall. */
export const BADGE_DEFS = {
  firstFix: { stars: 2, test: (c: PlayCtx) => c.miniWins >= 1 },
  speedy: { stars: 3, test: (c: PlayCtx) => c.fastWins >= 1 },
  teamBoss: { stars: 2, test: (c: PlayCtx) => count(c.s, 'log.taskDone') >= 4 },
  firstStars: { stars: 3, test: (c: PlayCtx) => c.s.sp.banked > 0 },
  gardener: { stars: 4, test: (c: PlayCtx) => count(c.s, 'log.harvest') >= 2 },
  stormRider: {
    stars: 5,
    test: (c: PlayCtx) => c.s.choices.some((x) => x.eventId === 'SW-02') && c.s.crew.DOSE < 7,
  },
  fixIt: { stars: 5, test: (c: PlayCtx) => c.miniWins >= 6 },
  halfway: {
    stars: 3,
    test: (c: PlayCtx) => c.s.sol >= 6 && count(c.s, 'log.toSickBay') === 0,
  },
  firstLanding: { stars: 3, test: (c: PlayCtx) => c.ended },
  missionComplete: { stars: 10, test: (c: PlayCtx) => c.ended && c.s.ending?.kind === 'success' },
  stormDodger: { stars: 6, test: (c: PlayCtx) => lastSol(c) && c.s.crew.DOSE <= 3 },
  quickHands: { stars: 6, test: (c: PlayCtx) => lastSol(c) && count(c.s, 'log.timeout') === 0 },
  healthyCrew: { stars: 5, test: (c: PlayCtx) => lastSol(c) && count(c.s, 'log.toSickBay') === 0 },
  starCollector: { stars: 8, test: (c: PlayCtx) => c.s.sp.banked >= 20 },
  handyHero: { stars: 6, test: (_c: PlayCtx, p: Profile) => p.fixes >= 25 },
  explorer: { stars: 5, test: (_c: PlayCtx, p: Profile) => p.missions >= 3 },
  scienceHero: { stars: 10, test: (_c: PlayCtx, p: Profile) => p.earned >= 50 },
  collector: { stars: 6, test: (_c: PlayCtx, p: Profile) => p.owned.length >= 10 },
  decorator: { stars: 12, test: (_c: PlayCtx, p: Profile) => p.owned.length >= 20 },
} satisfies Record<string, { stars: number; test: (c: PlayCtx, p: Profile) => boolean }>;
export type BadgeId = keyof typeof BADGE_DEFS;
export const BADGES = Object.keys(BADGE_DEFS) as BadgeId[];

export interface Profile {
  stars: number; // star bank (spendable)
  earned: number; // lifetime stars
  missions: number;
  fixes: number; // lifetime mini-games won
  owned: string[];
  suit: string;
  light: string;
  dome: string;
  rover: string;
  extras: string[]; // switched-on extras
  badges: BadgeId[];
  stories: string[]; // true stories already shown at the end of a mission
}

const KEY = 'mba.profile.v1';
const FRESH: Profile = {
  stars: 0,
  earned: 0,
  missions: 0,
  fixes: 0,
  owned: ['suit.classic', 'light.neon', 'dome.steel', 'rover.white'],
  suit: 'suit.classic',
  light: 'light.neon',
  dome: 'dome.steel',
  rover: 'rover.white',
  extras: [],
  badges: [],
  stories: [],
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? { ...FRESH, ...(JSON.parse(raw) as Partial<Profile>) } : { ...FRESH };
    p.badges = p.badges.filter((b) => b in BADGE_DEFS); // older saves may hold retired badges
    for (const id of FRESH.owned) if (!p.owned.includes(id)) p.owned = [...p.owned, id]; // free items added later
    return p;
  } catch {
    return { ...FRESH };
  }
}
export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage blocked: rewards last for this visit only */
  }
}

export const itemById = (id: string): ShopItem | undefined => SHOP.find((i) => i.id === id);
export const suitColor = (p: Profile): string => itemById(p.suit)?.colors?.[0] ?? '#e2e8f0';
export const domeColor = (p: Profile): string => itemById(p.dome)?.colors?.[0] ?? '#94a3b8';
export const roverColor = (p: Profile): string => itemById(p.rover)?.colors?.[0] ?? '#cbd5e1';
export const lightColors = (p: Profile): string[] =>
  itemById(p.light)?.colors ?? itemById('light.neon')!.colors!;

export function buy(p: Profile, id: string): Profile {
  const item = itemById(id);
  if (!item || p.owned.includes(id) || p.stars < item.price) return p;
  if (rankOf(p) < (item.rank ?? 0)) return p; // not that rank yet
  return use({ ...p, stars: p.stars - item.price, owned: [...p.owned, id] }, id);
}
/** Put on / switch on something already owned. */
export function use(p: Profile, id: string): Profile {
  const item = itemById(id);
  if (!item || !p.owned.includes(id)) return p;
  if (item.kind === 'suit') return { ...p, suit: id };
  if (item.kind === 'light') return { ...p, light: id };
  if (item.kind === 'dome') return { ...p, dome: id };
  if (item.kind === 'rover') return { ...p, rover: id };
  return {
    ...p,
    extras: p.extras.includes(id) ? p.extras.filter((x) => x !== id) : [...p.extras, id],
  };
}

/** Badges earned right now that the player doesn't have yet. */
export function newBadges(c: PlayCtx, p: Profile): BadgeId[] {
  return BADGES.filter((b) => !p.badges.includes(b) && BADGE_DEFS[b].test(c, p));
}
export const badgeStars = (ids: BadgeId[]): number =>
  ids.reduce((n, b) => n + BADGE_DEFS[b].stars, 0);
/** Add badges and pay their stars. */
export function award(p: Profile, ids: BadgeId[]): Profile {
  const stars = badgeStars(ids);
  return ids.length
    ? { ...p, badges: [...p.badges, ...ids], stars: p.stars + stars, earned: p.earned + stars }
    : p;
}

export interface Reward {
  /** Survival only: the run's score and whether it beat every earlier run. */
  score?: Score & { best: boolean };
  stars: number; // mission stars added to the bank
  half: boolean; // soft fail: half the stars are kept
  newBadges: BadgeId[]; // badges earned at the very end
  badgeStars: number;
  /** The new rank, when this mission's stars pushed the player up one (D-066). */
  rankUp?: number;
}

/**
 * Close a mission: win = every star sent to Earth; not a win = half (rounded up); then the end-of-mission badges.
 * Returns the new profile and what to show.
 */
export function finishMission(
  p: Profile,
  s: GameState,
  miniWins: number,
  fastWins: number,
): { profile: Profile; reward: Reward } {
  const survival = s.mission === 'M9';
  const won = s.ending?.kind === 'success';
  // Survival always ends with the crew going home, so every star it sent counts (D-050)
  const stars = won || survival ? s.sp.banked : Math.ceil(s.sp.banked / 2);
  const paid: Profile = {
    ...p,
    stars: p.stars + stars,
    earned: p.earned + stars,
    missions: p.missions + 1,
  };
  const got = newBadges({ s, miniWins, fastWins, ended: true }, paid);
  const after = award(paid, got);
  const up = rankOf(after) > rankOf(p) ? { rankUp: rankOf(after) } : {};
  return {
    profile: after,
    reward: { stars, half: !won && !survival, newBadges: got, badgeStars: badgeStars(got), ...up },
  };
}

// ───────────────────────── high scores (D-050) ─────────────────────────
export interface Score {
  mode: 'survival' | 'casual';
  days: number;
  stars: number;
  score: number; // survival: 10 a day + 1 a star · casual: stars sent
  won: boolean;
}
const SCORE_KEY = 'mba.scores.v1';
export const scoreOf = (s: GameState): Score => {
  const survival = s.mission === 'M9';
  return {
    mode: survival ? 'survival' : 'casual',
    days: s.sol,
    stars: s.sp.banked,
    score: survival ? s.sol * 10 + s.sp.banked : s.sp.banked,
    won: s.ending?.kind === 'success',
  };
};
export function loadScores(): Score[] {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) ?? '[]') as Score[];
  } catch {
    return [];
  }
}
export const topScores = (all: Score[], mode: Score['mode'], n = 5): Score[] =>
  all
    .filter((x) => x.mode === mode)
    .sort((a, b) => b.score - a.score || b.days - a.days)
    .slice(0, n);
/** Add a finished run; returns the new list and whether it is the best of its mode so far. */
export function addScore(all: Score[], sc: Score): { all: Score[]; best: boolean } {
  const before = topScores(all, sc.mode, 1)[0];
  const best = !before || sc.score > before.score;
  const next = [...all, sc];
  const kept = [...topScores(next, 'survival', 10), ...topScores(next, 'casual', 10)];
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(kept));
  } catch {
    /* storage blocked: scores last for this visit only */
  }
  return { all: kept, best };
}
