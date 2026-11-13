import { useEffect, useState } from 'preact/hooks';
import { copy } from '../content/copy';
import type { GameState, MissionId } from '../engine/types';
import { engine, loadGame, newSeed, saveGame } from './engine';
import { DataSources } from './screens/DataSources';
import { Debrief } from './screens/Debrief';
import { Game } from './screens/Game';
import { SettingsScreen } from './screens/Settings';
import { Briefing, MissionSelect } from './screens/Start';
import { Title } from './screens/Title';
import { applySettings, loadSettings, saveSettings, type Settings } from './settings';

export type Screen = 'title' | 'sources' | 'settings' | 'missions' | 'briefing' | 'game' | 'debrief';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(loadGame);
  const [setup, setSetup] = useState<{ mission: MissionId; seed: number }>({ mission: 'M1', seed: newSeed() });
  const [modal, setModal] = useState<'help' | 'briefing' | null>(null);
  const [back, setBack] = useState<Screen>('title');

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.querySelector<HTMLElement>('h1[tabindex]')?.focus();
  }, [screen]);

  const start = (mission: MissionId, seed: number) => {
    const s = engine.newGame({ mission, tier: 'cadet', seed });
    saveGame(s);
    setGame(s);
    setScreen('game');
  };

  const go = (sc: Screen) => {
    setBack(screen);
    setScreen(sc);
  };

  return (
    <div class={`shell ${screen === 'game' ? 'in-game' : ''}`}>
      <div class="mars-bg" aria-hidden="true" />
      {screen === 'title' && (
        <Title
          go={go}
          saved={saved}
          onContinue={() => {
            if (saved) {
              setGame(saved);
              setScreen('game');
            }
          }}
        />
      )}
      {screen === 'missions' && (
        <MissionSelect
          back={() => setScreen('title')}
          onPick={(m) => {
            setSetup({ mission: m, seed: newSeed() });
            setScreen('briefing');
          }}
        />
      )}
      {screen === 'briefing' && (
        <Briefing mission={setup.mission} seed={setup.seed} onStart={() => start(setup.mission, setup.seed)} back={() => setScreen('missions')} />
      )}
      {screen === 'game' && game && (
        <Game
          key={`${game.seed}-${game.mission}`}
          initial={game}
          onEnd={(s) => {
            setGame(s);
            setSaved(null);
            setScreen('debrief');
          }}
          onQuit={() => {
            setSaved(loadGame());
            setScreen('title');
          }}
          onHelp={() => setModal('help')}
          onBriefing={() => setModal('briefing')}
        />
      )}
      {screen === 'debrief' && game && (
        <Debrief
          s={game}
          onAgain={() => start(game.mission, game.seed)}
          onNew={() => setScreen('missions')}
          onSources={() => go('sources')}
        />
      )}
      {screen === 'sources' && <DataSources back={() => setScreen(back === 'sources' ? 'title' : back)} />}
      {screen === 'settings' && <SettingsScreen settings={settings} onChange={setSettings} back={() => setScreen('title')} />}
      {modal && (
        <div class="modal-backdrop" onClick={() => setModal(null)}>
          <div class="modal glass" role="dialog" aria-modal="true" aria-label={modal === 'help' ? copy.ui.howToPlay : copy.ui.missionBriefing} onClick={(e) => e.stopPropagation()}>
            {modal === 'help' ? (
              <>
                <h2>{copy.ui.howToPlay}</h2>
                <ol class="howto">
                  {copy.ui.howTo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <button class="btn btn-go" onClick={() => setModal(null)} autoFocus>
                  {copy.ui.close}
                </button>
              </>
            ) : (
              game && <Briefing mission={game.mission} seed={game.seed} onStart={() => setModal(null)} inGame />
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
