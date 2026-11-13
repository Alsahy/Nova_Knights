/**
 * The cockpit (D-020…D-024): top bar · "Our base" LEFT · the current step in the centre · "Our crew" RIGHT · console.
 * No morning or power screens (auto-advance); jobs one astronaut at a time; a guided first sol (tutorial).
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import type { AstronautId, CardView, Command, GameState, Role } from '../../engine/types';
import { Icon } from '../components/Icon';
import { BasePanel, CrewPanel, TopBar, type Preview } from '../components/Panels';
import { Tutorial } from '../components/Tutorial';
import { engine, saveGame } from '../engine';
import { ui } from '../text';
import { EventPanel, JobsPanel, NightReport } from './Phases';

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];
const PREVIEW_KEYS = new Set([
  'LS',
  'SH',
  'BAT',
  'LAB',
  'SP',
  'DOSE',
  'FOOD',
  'H2O',
  'O2T',
  'PARTS',
  'MEDKIT',
  'FUL',
  'HYD',
  'AIR',
  'EN',
]);

/** "Choice → the stats it changes light up" (design canvas). Costs + gains only. */
function previewOf(c: CardView | undefined): Preview {
  const p: Preview = {};
  if (!c) return p;
  for (const ch of [...c.costs, ...c.effects]) {
    if (ch.amount === undefined || ch.label === 'chip.enmax') continue;
    const k = ch.icon === 'PWR' ? 'BAT' : ch.icon;
    if (PREVIEW_KEYS.has(k)) p[k] = (p[k] ?? 0) + ch.amount;
  }
  return p;
}

/** Skip the screens a kid doesn't need: morning → power → jobs, unless a card is waiting (D-020). */
export function autoAdvance(s0: GameState): GameState {
  let s = s0;
  for (let i = 0; i < 4 && !s.pending; i++) {
    if (s.phase === 'morning') s = engine.reduce(s, { type: 'CONTINUE' });
    else if (s.phase === 'power') s = engine.reduce(s, { type: 'CONFIRM_POWER' });
    else break;
  }
  return s;
}

const freeCrew = (s: GameState) =>
  ROLES.filter((r) => {
    const a = s.astronauts.find((x) => x.id === r)!;
    return a.sickBaySols === 0 && a.busyUntilSol < s.sol;
  });
const firstUnassigned = (s: GameState): AstronautId | null =>
  freeCrew(s).find((r) => !s.astronauts.find((x) => x.id === r)!.plannedTask) ?? null;

export function Game(props: {
  initial: GameState;
  tutorial: boolean;
  onTutorialEnd: () => void;
  onEnd: (s: GameState) => void;
  onMenu: () => void;
  onHelp: () => void;
}) {
  const [s, setS] = useState<GameState>(() => autoAdvance(props.initial));
  const [selected, setSelected] = useState<string | null>(null);
  const [current, setCurrent] = useState<AstronautId | null>(() => firstUnassigned(s));
  const [tutorial, setTutorial] = useState(props.tutorial);

  const dispatch = (cmd: Command) => {
    const next = autoAdvance(engine.reduce(s, cmd));
    setS(next);
    setSelected(null);
    if (next.phase === 'tasks' && (s.phase !== 'tasks' || next.sol !== s.sol))
      setCurrent(firstUnassigned(next));
    saveGame(next.phase === 'ended' ? null : next);
    if (next.phase === 'ended') props.onEnd(next);
  };

  useEffect(() => {
    if (!tutorial) document.querySelector<HTMLElement>('.holo h2')?.focus();
  }, [s.phase, s.sol, s.pending?.eventId, current]);

  const hud = useMemo(() => engine.hud(s), [s]);
  const cards = useMemo(() => (s.pending ? engine.shownCards(s) : []), [s]);
  const preview = previewOf(cards.find((c) => c.id === selected));
  const allAssigned = freeCrew(s).every((r) => s.astronauts.find((x) => x.id === r)!.plannedTask);

  let center;
  let action: { label: string; cmd: Command | null };
  if (s.pending) {
    center = <EventPanel s={s} selected={selected} onSelect={setSelected} />;
    action = {
      label: selected ? ui.choose : ui.pickACard,
      cmd: selected ? { type: 'CHOOSE', actionId: selected } : null,
    };
  } else if (s.phase === 'tasks') {
    center = (
      <JobsPanel
        s={s}
        current={current}
        setCurrent={setCurrent}
        onPlan={(a: AstronautId, t: string | null) => {
          const next = engine.reduce(s, { type: 'PLAN_TASK', astronaut: a, taskId: t });
          setS(next);
          saveGame(next);
        }}
      />
    );
    action = { label: ui.toEvent, cmd: allAssigned ? { type: 'CONFIRM_TASKS' } : null };
  } else {
    center = <NightReport s={s} />;
    action = { label: ui.nextSol, cmd: { type: 'CONTINUE' } };
  }

  return (
    <div class="cockpit">
      <TopBar h={hud} missionName={CONTENT.missions[s.mission]?.name ?? ''} />
      <BasePanel s={s} h={hud} preview={preview} />
      <main class="center">{center}</main>
      <CrewPanel
        s={s}
        h={hud}
        preview={preview}
        current={s.phase === 'tasks' && !s.pending ? current : null}
      />
      <nav class="console" aria-label="Game controls">
        <button class="btn" onClick={props.onHelp} aria-label={ui.howToPlay}>
          <Icon name="HELP" /> <span class="hide-sm">{ui.howToPlay}</span>
        </button>
        <button
          class="btn btn-main btn-go"
          disabled={!action.cmd}
          onClick={() => action.cmd && dispatch(action.cmd)}
        >
          {action.label} <Icon name="ARROW" />
        </button>
        <button class="btn" onClick={props.onMenu} aria-label={ui.menu}>
          <Icon name="MENU" /> <span class="hide-sm">{ui.menu}</span>
        </button>
      </nav>
      {tutorial && (
        <Tutorial
          ctx={{ s, selected, current }}
          onEnd={() => {
            setTutorial(false);
            props.onTutorialEnd();
          }}
        />
      )}
    </div>
  );
}
