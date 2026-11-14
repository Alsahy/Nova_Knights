import { useEffect, useState } from 'preact/hooks';
import { copy } from '../content/copy';
import { GLOSSARY } from '../content/glossary';
import type { GameState, MissionId } from '../engine/types';
import { Icon } from './components/Icon';
import { engine, loadGame, newSeed, saveGame, setTutorialDone, tutorialDone } from './engine';
import { Cutscene } from './screens/Cutscene';
import { DataSources } from './screens/DataSources';
import { Debrief } from './screens/Debrief';
import { Game } from './screens/Game';
import { SettingsScreen } from './screens/Settings';
import { Briefing } from './screens/Start';
import { ModePick, Scores } from './screens/Modes';
import { Practice } from './screens/Practice';
import { Shop } from './screens/Shop';
import { Title } from './screens/Title';
import { ambience, hush, setSound, sfx } from './game/sfx';
import {
  addScore,
  finishMission,
  loadProfile,
  loadScores,
  saveProfile,
  scoreOf,
  type Profile,
  type Reward,
  suitColor,
  type Score,
} from './meta';
import { applySettings, loadSettings, saveSettings, type Settings } from './settings';

export type Screen =
  | 'title'
  | 'sources'
  | 'settings'
  | 'missions'
  | 'briefing'
  | 'game'
  | 'debrief'
  | 'shop'
  | 'practice'
  | 'scores'
  | 'intro'
  | 'outro';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(loadGame);
  const [seed, setSeed] = useState<number>(newSeed);
  const [withTutorial, setWithTutorial] = useState(!tutorialDone());
  const [modal, setModal] = useState<'help' | 'menu' | null>(null);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [reward, setReward] = useState<Reward | null>(null);
  const [mission, setMission] = useState<MissionId>('M3'); // D-050: M3 = Casual, M9 = Survival
  const [scores, setScores] = useState<Score[]>(loadScores);
  const [run, setRun] = useState(0); // a new number = a fresh Game screen (new game, replay, continue)
  const changeProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
    setSound(settings.sound);
    ambience(settings.ambient);
    if (!settings.voice) hush();
  }, [settings]);

  // D-048: the wind-and-Sun background can only start after the first tap or key (browser rule)
  useEffect(() => {
    const wake = () => ambience(settings.ambient);
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);
    const hide = () => ambience(!document.hidden && settings.ambient);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [settings.ambient]);

  // D-057: a soft tick whenever the mouse lands on a new button
  useEffect(() => {
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const b = (e.target as Element | null)?.closest?.(
        'button, a, summary, label.toggle, .seg-opt',
      );
      if (b === last) return;
      last = b ?? null;
      if (b && !(b as HTMLButtonElement).disabled) sfx('hover');
    };
    document.addEventListener('pointerover', over);
    return () => document.removeEventListener('pointerover', over);
  }, []);

  useEffect(() => {
    document.querySelector<HTMLElement>('h1[tabindex]')?.focus();
  }, [screen]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const start = (s0: number, m: MissionId = mission) => {
    const s = engine.newGame({ mission: m, tier: 'cadet', seed: s0 });
    saveGame(s);
    setGame(s);
    setRun((n) => n + 1);
    setScreen('intro'); // D-062: the trip to Mars, then the game
  };

  const toTitle = () => {
    setModal(null);
    setSaved(loadGame());
    hush();
    setScreen('title');
  };

  return (
    <div class={`shell ${['game', 'title', 'intro', 'outro'].includes(screen) ? 'in-game' : ''}`}>
      {!['game', 'title', 'intro', 'outro'].includes(screen) && (
        <div class="mars-bg" aria-hidden="true" />
      )}
      {screen === 'title' && (
        <Title
          go={(sc: Screen) => {
            setScreen(sc);
          }}
          saved={saved}
          profile={profile}
          onContinue={() => {
            if (saved) {
              setGame(saved);
              setRun((n) => n + 1);
              setScreen('game');
            }
          }}
          onTutorial={() => {
            setTutorialDone(false);
            setWithTutorial(true);
            setMission('M3');
            start(newSeed(), 'M3');
          }}
        />
      )}
      {screen === 'missions' && (
        <ModePick
          scores={scores}
          back={toTitle}
          onPick={(m) => {
            setMission(m);
            setSeed(newSeed());
            setScreen('briefing');
          }}
        />
      )}
      {screen === 'intro' && game && (
        <Cutscene
          kind="intro"
          site={engine.content.missions[game.mission]?.site ?? 'Mars'}
          days={0}
          suit={suitColor(profile)}
          onDone={() => setScreen('game')}
        />
      )}
      {screen === 'outro' && game && (
        <Cutscene
          kind={
            game.mission === 'M9' ? 'survival' : game.ending?.kind === 'success' ? 'win' : 'home'
          }
          site=""
          days={game.sol}
          suit={suitColor(profile)}
          onDone={() => setScreen('debrief')}
        />
      )}
      {screen === 'scores' && <Scores scores={scores} back={toTitle} />}
      {screen === 'briefing' && (
        <Briefing
          mission={mission}
          timer={settings.timer}
          seed={seed}
          onStart={() => start(seed)}
          back={() => setScreen('missions')}
        />
      )}
      {screen === 'game' && game && (
        <Game
          key={run}
          initial={game}
          tutorial={withTutorial && game.sol <= 1}
          timerSeconds={settings.timer}
          skill={settings.skill}
          sound={settings.sound || settings.ambient}
          voice={settings.voice}
          onSound={() => {
            const any = settings.sound || settings.ambient;
            setSettings({ ...settings, sound: !any, ambient: !any });
          }}
          profile={profile}
          paused={modal !== null}
          onTutorialEnd={() => {
            setTutorialDone(true);
            setWithTutorial(false);
          }}
          onProfile={changeProfile}
          onEnd={(s, miniWins, fastWins) => {
            const done = finishMission(loadProfile(), s, miniWins, fastWins);
            changeProfile(done.profile);
            const added = addScore(scores, scoreOf(s));
            setScores(added.all);
            setReward({ ...done.reward, score: { ...scoreOf(s), best: added.best } });
            setGame(s);
            setSaved(null);
            setScreen('outro');
          }}
          onMenu={() => setModal('menu')}
          onHelp={() => setModal('help')}
        />
      )}
      {screen === 'debrief' && game && (
        <Debrief
          s={game}
          reward={reward}
          bank={profile.stars}
          seenStories={profile.stories}
          onStory={(id) =>
            changeProfile({ ...loadProfile(), stories: [...loadProfile().stories, id].slice(-12) })
          }
          onAgain={() => start(game.seed, game.mission)}
          onNew={() => start(newSeed(), game.mission)}
          onShop={() => setScreen('shop')}
          onMenu={toTitle}
        />
      )}
      {screen === 'practice' && <Practice back={toTitle} />}
      {screen === 'shop' && <Shop profile={profile} onChange={changeProfile} back={toTitle} />}
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
                  <button class="btn" onClick={() => setModal('help')}>
                    <Icon name="HELP" /> {copy.ui.howToPlay}
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
      {!['game', 'title', 'intro', 'outro'].includes(screen) && (
        <footer class="footer">
          <p>{copy.footer}</p>
        </footer>
      )}
      {(screen === 'game' || screen === 'title') && <p class="footer-mini">{copy.footer}</p>}
    </div>
  );
}
