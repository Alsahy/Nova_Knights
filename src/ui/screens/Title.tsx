import { copy } from '../../content/copy';
import type { GameState } from '../../engine/types';
import { Icon, type UiIcon } from '../components/Icon';
import type { Screen } from '../App';
import { fill } from '../text';

const METERS: [UiIcon, string][] = [
  ['LS', copy.meters.LS],
  ['PWR', copy.meters.PWR],
  ['SH', copy.meters.SH],
  ['SP', copy.meters.SP],
];

export function Title({
  go,
  saved,
  onContinue,
}: {
  go: (s: Screen) => void;
  saved: GameState | null;
  onContinue: () => void;
}) {
  return (
    <section class="center-screen title-screen" aria-labelledby="game-title">
      <p class="eyebrow">{copy.tagline}</p>
      <h1 id="game-title" tabIndex={-1}>
        {copy.gameName}
      </h1>
      <p class="lead">{copy.hello}</p>
      <p>{copy.intro}</p>
      <ul class="meter-preview" aria-label="What you look after">
        {METERS.map(([icon, label]) => (
          <li key={icon} class="glass">
            <Icon name={icon} size={26} />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <div class="menu">
        {saved && (
          <button class="btn btn-go" onClick={onContinue}>
            <Icon name="PLAY" /> {fill(copy.ui.continueGame, { sol: saved.sol })}
          </button>
        )}
        <button class={`btn ${saved ? '' : 'btn-go'}`} onClick={() => go('missions')}>
          <Icon name="PLAY" /> {copy.play}
        </button>
        <button class="btn" onClick={() => go('sources')}>
          <Icon name="DATA" /> {copy.dataSources}
        </button>
        <button class="btn" onClick={() => go('settings')}>
          <Icon name="GEAR" /> {copy.settings}
        </button>
      </div>
    </section>
  );
}
