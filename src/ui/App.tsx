import { useEffect, useState } from 'preact/hooks';
import { copy } from '../content/copy';
import { GLOSSARY } from '../content/glossary';
import type { GameState, MissionId } from '../engine/types';
import { Icon } from './components/Icon';
import { engine, loadGame, newSeed, saveGame, setTutorialDone, tutorialDone } from './engine';
import { DataSources } from './screens/DataSources';
import { Debrief } from './screens/Debrief';
import { Game } from './screens/Game';
import { SettingsScreen } from './screens/Settings';
import { Briefing } from './screens/Start';
import { Title } from './screens/Title';
import { applySettings, loadSettings, saveSettings, type Settings } from './settings';

export type Screen =
  'title' | 'sources' | 'settings' | 'missions' | 'briefing' | 'game' | 'debrief';

/** D-021: one game, no difficulty choice: Storm from the Sun (calm sols + the real May 2024 storm). */
const THE_MISSION: MissionId = 'M3';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(loadGame);
  const [seed, setSeed] = useState<number>(newSeed);
  const [withTutorial, setWithTutorial] = useState(!tutorialDone());
  const [modal, setModal] = useState<'help' | 'menu' | null>(null);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.querySelector<HTMLElement>('h1[tabindex]')?.focus();
  }, [screen]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const start = (s0: number) => {
    const s = engine.newGame({ mission: THE_MISSION, tier: 'cadet', seed: s0 });
    saveGame(s);
    setGame(s);
    setScreen('game');
  };

  const toTitle = () => {
    setModal(null);
    setSaved(loadGame());
    setScreen('title');
  };

  return (
    <div class={`shell ${screen === 'game' ? 'in-game' : ''}`}>
      <div class="mars-bg" aria-hidden="true" />
      {screen === 'title' && (
        <Title
          go={(sc: Screen) => {
            if (sc === 'missions') {
              setSeed(newSeed());
              setScreen('briefing');
            } else setScreen(sc);
          }}
          saved={saved}
          onContinue={() => {
            if (saved) {
              setGame(saved);
              setScreen('game');
            }
          }}
          onTutorial={() => {
            setTutorialDone(false);
            setWithTutorial(true);
            start(newSeed());
          }}
        />
      )}
      {screen === 'briefing' && (
        <Briefing
          mission={THE_MISSION}
          seed={seed}
          onStart={() => start(seed)}
          back={() => setScreen('title')}
        />
      )}
      {screen === 'game' && game && (
        <Game
          key={`${game.seed}-${game.mission}-${withTutorial}`}
          initial={game}
          tutorial={withTutorial && game.sol <= 1}
          timerSeconds={settings.timer}
          paused={modal !== null}
          onTutorialEnd={() => {
            setTutorialDone(true);
            setWithTutorial(false);
          }}
          onEnd={(s) => {
            setGame(s);
            setSaved(null);
            setScreen('debrief');
          }}
          onMenu={() => setModal('menu')}
          onHelp={() => setModal('help')}
        />
      )}
      {screen === 'debrief' && game && (
        <Debrief s={game} onAgain={() => start(game.seed)} onNew={() => start(newSeed())} />
      )}
      {screen === 'sources' && <DataSources back={() => setScreen('title')} />}
      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          onChange={setSettings}
          back={() => setScreen('title')}
          onReset={() => {
            saveGame(null);
            setSaved(null);
            setTutorialDone(false);
            setWithTutorial(true);
          }}
        />
      )}
      {modal && (
        <div class="modal-backdrop" onClick={() => setModal(null)}>
          <div
            class="modal glass"
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'help' ? copy.ui.howToPlay : copy.ui.menu}
            onClick={(e) => e.stopPropagation()}
          >
            {modal === 'help' ? (
              <>
                <h2>{copy.ui.howToPlay}</h2>
                <ol class="howto">
                  {copy.ui.howTo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <details>
                  <summary>{copy.ui.wordHelper}</summary>
                  <dl class="glossary">
                    {GLOSSARY.map((t) => (
                      <div key={t.word}>
                        <dt>{t.word}</dt>
                        <dd>{t.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <div class="briefing-actions">
                  <button
                    class="btn"
                    onClick={() => {
                      setModal(null);
                      setTutorialDone(false);
                      setWithTutorial(true);
                      start(newSeed());
                    }}
                  >
                    {copy.ui.tutReplay}
                  </button>
                  <button class="btn btn-go" onClick={() => setModal(null)} autoFocus>
                    {copy.ui.close}
                  </button>
                </div>
              </>
            ) : (
              <>
                {game && (
                  <Briefing
                    mission={game.mission}
                    seed={game.seed}
                    onStart={() => setModal(null)}
                    inGame
                  />
                )}
                <div class="briefing-actions">
                  <button class="btn" onClick={toTitle}>
                    <Icon name="MENU" /> {copy.ui.quit}
                  </button>
                  <button
                    class="btn"
                    onClick={() => {
                      setModal(null);
                      setTutorialDone(false);
                      setWithTutorial(true);
                      start(newSeed());
                    }}
                  >
                    <Icon name="HELP" /> {copy.ui.tutorialBtn}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {screen !== 'game' && (
        <footer class="footer">
          <p>{copy.footer}</p>
        </footer>
      )}
      {screen === 'game' && <p class="footer-mini">{copy.footer}</p>}
    </div>
  );
}
