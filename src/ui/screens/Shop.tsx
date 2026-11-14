/** The base shop and the badge wall (D-034): what a player keeps between missions. Decorations only. */
import { copy } from '../../content/copy';
import { Avatar } from '../components/Avatar';
import { Icon, type UiIcon } from '../components/Icon';
import {
  BADGE_DEFS,
  BADGES,
  SHOP,
  buy,
  rankOf,
  rankProgress,
  use,
  type Profile,
  type ShopItem,
} from '../meta';
import { fill } from '../text';

const S = copy.shop;
const B = copy.badges;
const EXTRA_ICON: Record<string, UiIcon> = {
  'extra.dog': 'ROBOT',
  'extra.flag': 'COMPASS',
  'extra.lights': 'SP',
  'extra.rug': 'COUCH',
  'extra.plant': 'SPROUT',
  'extra.poster': 'SP',
  'extra.telescope': 'ANTENNA',
  'extra.cat': 'ROBOT',
  'extra.drone': 'FAN',
  'extra.trophy': 'MEDAL',
};
const BADGE_ICON: Record<string, UiIcon> = {
  firstFix: 'WRENCH',
  speedy: 'PWR',
  teamBoss: 'CREW',
  firstStars: 'ANTENNA',
  gardener: 'SPROUT',
  stormRider: 'SUN',
  fixIt: 'PARTS',
  halfway: 'MEDKIT',
  firstLanding: 'COMPASS',
  missionComplete: 'SP',
  stormDodger: 'SH',
  quickHands: 'CLOCK',
  healthyCrew: 'MEDKIT',
  starCollector: 'FLASK',
  handyHero: 'HAND',
  explorer: 'ROCK',
  scienceHero: 'MEDAL',
};

function Swatch({ item }: { item: ShopItem }) {
  if (item.kind === 'suit')
    return <Avatar role="MGR" size={54} mood="cheer" suit={item.colors![0]!} />;
  if (item.kind === 'dome' || item.kind === 'rover')
    return (
      <span
        class={`swatch-paint ${item.kind}`}
        style={{ background: item.colors![0]! }}
        aria-hidden="true"
      />
    );
  if (item.kind === 'light')
    return (
      <span class="swatch-lights" aria-hidden="true">
        {item.colors!.map((c, i) => (
          <i key={i} style={{ background: c }} />
        ))}
      </span>
    );
  return (
    <span class="swatch-extra" aria-hidden="true">
      <Icon name={EXTRA_ICON[item.id] ?? 'SP'} size={34} />
    </span>
  );
}

export function Shop(props: {
  profile: Profile;
  onChange: (p: Profile) => void;
  back: () => void;
}) {
  const p = props.profile;
  const rank = rankOf(p);
  const prog = rankProgress(p);
  return (
    <section class="center-screen text-screen shop" aria-labelledby="shop-title">
      <button class="btn btn-back" onClick={props.back}>
        ← {copy.back}
      </button>
      <h1 id="shop-title" tabIndex={-1}>
        {S.title}
      </h1>
      <p class="bank" role="status">
        <Icon name="SP" size={30} color="var(--star)" /> {S.bank}: <b class="num">{p.stars}</b>
      </p>
      <div class="rank-card glass" role="status">
        <span>
          {S.rank}: <b>{S.ranks[rank]}</b>
        </span>
        {prog ? (
          <>
            <span class="rank-bar">
              <i style={{ width: `${Math.round((100 * prog.have) / prog.need)}%` }} />
            </span>
            <small>{fill(S.rankNext, { ...prog, rank: S.ranks[rank + 1]! })}</small>
          </>
        ) : (
          <small>{S.rankTop}</small>
        )}
        <small>{fill(S.owned, { n: p.owned.length, total: SHOP.length })}</small>
      </div>
      <p class="muted">{S.intro}</p>
      {(['suit', 'light', 'dome', 'rover', 'extra'] as const).map((kind) => (
        <div key={kind}>
          <h2>{S.kinds[kind]}</h2>
          <ul class="shop-grid">
            {SHOP.filter((i) => i.kind === kind).map((item) => {
              const owned = p.owned.includes(item.id);
              const active =
                item.kind === 'suit'
                  ? p.suit === item.id
                  : item.kind === 'light'
                    ? p.light === item.id
                    : item.kind === 'dome'
                      ? p.dome === item.id
                      : item.kind === 'rover'
                        ? p.rover === item.id
                        : p.extras.includes(item.id);
              const short = item.price - p.stars;
              const locked = !owned && rank < (item.rank ?? 0);
              return (
                <li
                  key={item.id}
                  class={`shop-item glass ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                >
                  <Swatch item={item} />
                  <b>{S.items[item.id]}</b>
                  {owned ? (
                    <button
                      class={`btn btn-small ${active ? 'btn-go' : ''}`}
                      aria-pressed={active}
                      disabled={active && item.kind !== 'extra'}
                      onClick={() => props.onChange(use(p, item.id))}
                    >
                      {item.kind === 'extra' ? (active ? S.on : S.off) : active ? S.inUse : S.use}
                    </button>
                  ) : (
                    <button
                      class="btn btn-small"
                      disabled={short > 0 || locked}
                      onClick={() => props.onChange(buy(p, item.id))}
                    >
                      <Icon name="SP" size={16} color="var(--star)" />{' '}
                      {locked
                        ? fill(S.needRank, { rank: S.ranks[item.rank ?? 0]! })
                        : short > 0
                          ? fill(S.need, { n: short })
                          : `${S.buy} · ${item.price}`}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <h2 id="badges">{B.title}</h2>
      <p class="muted">{fill(B.count, { n: p.badges.length, total: BADGES.length })}</p>
      <ul class="badge-grid">
        {BADGES.map((b) => {
          const got = p.badges.includes(b);
          return (
            <li key={b} class={`badge-card glass ${got ? 'got' : ''}`}>
              <span class="medal">
                <Icon name={BADGE_ICON[b] ?? 'MEDAL'} size={30} />
              </span>
              <b>{B.names[b]}</b>
              <small>{B.how[b]}</small>
              <span class="pill num">
                <Icon name="SP" size={14} color="var(--star)" /> +{BADGE_DEFS[b].stars}
              </span>
              {!got && <em>{B.locked}</em>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
