import { copy } from '../../content/copy';
import type { GameState } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { Icon, type UiIcon } from '../components/Icon';
import type { Screen } from '../App';
import { rankOf, suitColor, type Profile } from '../meta';
import { fill } from '../text';

const L = copy.title.labels;

function Corner(props: { icon: UiIcon; label: string; onClick: () => void; badge?: number }) {
  return (
    <button class="corner-btn" onClick={props.onClick}>
      <Icon name={props.icon} size={24} />
      <span>{props.label}</span>
      {props.badge !== undefined && (
        <em class="num">
          <Icon name="SP" size={12} color="var(--star)" />
          {props.badge}
        </em>
      )}
    </button>
  );
}

/** Title (D-042, simpler in D-049): a quiet Mars horizon, Nova, one big START; everything else in the corners. */
export function Title(props: {
  go: (s: Screen) => void;
  saved: GameState | null;
  profile: Profile;
  onContinue: () => void;
  onTutorial: () => void;
}) {
  const { go, saved, profile } = props;
  return (
    <section class="title2" aria-labelledby="game-title">
      <svg class="title-sky" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1a0b0d" />
            <stop offset="0.7" stop-color="#8f3c20" />
            <stop offset="1" stop-color="#c8632f" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#t-sky)" />
        <path d="M0 74Q30 66 55 72T100 68V100H0z" fill="#5a2415" />
        <path d="M0 84Q40 76 100 82V100H0z" fill="#32130c" />
      </svg>
      <nav class="corner left" aria-label={copy.settings}>
        <Corner icon="HELP" label={L['tutorial']!} onClick={props.onTutorial} />
        <Corner icon="GEAR" label={L['settings']!} onClick={() => go('settings')} />
        <Corner icon="DATA" label={L['data']!} onClick={() => go('sources')} />
      </nav>
      <nav class="corner right" aria-label={copy.shop.open}>
        <Corner icon="MEDAL" label={L['scores']!} onClick={() => go('scores')} />
        <Corner icon="WRENCH" label={L['practice']!} onClick={() => go('practice')} />
        <Corner icon="SHOP" label={L['shop']!} onClick={() => go('shop')} badge={profile.stars} />
      </nav>
      <div class="title-mid">
        <p class="eyebrow">{copy.tagline}</p>
        <h1 id="game-title" tabIndex={-1}>
          {copy.gameName}
        </h1>
      </div>
      <div class="title-nova" aria-hidden="true">
        <Avatar role="MGR" size={150} mood="cheer" suit={suitColor(profile)} />
      </div>
      <p class="title-rank">
        {copy.shop.rank}: {copy.shop.ranks[rankOf(profile)]}
      </p>
      <div class="title-cta">
        <button class="start-btn" onClick={() => go('missions')}>
          <Icon name="PLAY" size={34} /> {copy.title.start}
        </button>
        {saved && (
          <button class="btn continue-btn" onClick={props.onContinue}>
            <Icon name="ARROW" size={18} /> {fill(copy.ui.continueGame, { sol: saved.sol })}
          </button>
        )}
      </div>
    </section>
  );
}
