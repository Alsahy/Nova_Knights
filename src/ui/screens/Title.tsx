import { copy } from '../../content/copy';
import type { GameState } from '../../engine/types';
import { Icon } from '../components/Icon';
import type { Screen } from '../App';
import { fill } from '../text';

/** Title (D-029: no icon row, few words). */
export function Title(props: {
  go: (s: Screen) => void;
  saved: GameState | null;
  onContinue: () => void;
  onTutorial: () => void;
}) {
  const { go, saved } = props;
  return (
    <section class="center-screen title-screen" aria-labelledby="game-title">
      <p class="eyebrow">{copy.tagline}</p>
      <h1 id="game-title" tabIndex={-1}>
        {copy.gameName}
      </h1>
      <p class="lead">{copy.intro}</p>
      <div class="menu">
        {saved && (
          <button class="btn btn-go" onClick={props.onContinue}>
            <Icon name="PLAY" /> {fill(copy.ui.continueGame, { sol: saved.sol })}
          </button>
        )}
        <button class={`btn ${saved ? '' : 'btn-go'}`} onClick={() => go('missions')}>
          <Icon name="PLAY" /> {copy.play}
        </button>
        <button class="btn" onClick={props.onTutorial}>
          <Icon name="HELP" /> {copy.ui.tutorialBtn}
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
