import { copy } from '../../content/copy';
import { Icon, type IconKey } from '../components/Icon';
import type { Screen } from '../App';

const METERS: IconKey[] = ['LS', 'PWR', 'SH', 'SP'];

export function Title({ go }: { go: (s: Screen) => void }) {
  return (
    <section class="title-screen" aria-labelledby="game-title">
      <p class="eyebrow">{copy.tagline}</p>
      <h1 id="game-title" tabIndex={-1}>
        {copy.gameName}
      </h1>
      <p class="lead">{copy.hello}</p>
      <p>{copy.intro}</p>

      <ul class="meter-preview" aria-label="What you look after">
        {METERS.map((m) => (
          <li key={m}>
            <Icon name={m} />
            <span>{copy.meters[m]}</span>
          </li>
        ))}
      </ul>

      <div class="menu">
        <button class="btn btn-primary" disabled aria-describedby="play-soon">
          {copy.play}
        </button>
        <p id="play-soon" class="hint">
          {copy.playSoon}
        </p>
        <button class="btn" onClick={() => go('sources')}>
          {copy.dataSources}
        </button>
        <button class="btn" onClick={() => go('settings')}>
          {copy.settings}
        </button>
      </div>
    </section>
  );
}
