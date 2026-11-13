/** The cockpit: HUD on top, mission board left, holo frame centre, crew right, console bottom. */
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { AstronautId, CardView, Command, GameState, PoweredSystem } from '../../engine/types';
import { Icon } from '../components/Icon';
import { CrewPanel, Hud, MissionBoard, type Preview } from '../components/Panels';
import { engine, saveGame } from '../engine';
import { ui } from '../text';
import { EventPanel, MorningReport, NightLog, PowerPlan, TaskPlanner } from './Phases';

const PREVIEW_KEYS = new Set(['LS', 'SH', 'BAT', 'LAB', 'SP', 'DOSE', 'FOOD', 'H2O', 'O2T', 'PARTS', 'MEDKIT', 'FUL', 'HYD', 'AIR', 'EN']);

/** "Choice → the stats it changes light up" (design canvas). Costs + effects only (not later/maybe). */
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

export function Game(props: {
  initial: GameState;
  onEnd: (s: GameState) => void;
  onQuit: () => void;
  onHelp: () => void;
  onBriefing: () => void;
}) {
  const [s, setS] = useState<GameState>(props.initial);
  const [selected, setSelected] = useState<string | null>(null);

  const dispatch = (cmd: Command) => {
    const next = engine.reduce(s, cmd);
    setS(next);
    setSelected(null);
    saveGame(next.phase === 'ended' ? null : next);
    if (next.phase === 'ended') props.onEnd(next);
  };

  useEffect(() => {
    document.querySelector<HTMLElement>('.holo h2')?.focus();
  }, [s.phase, s.sol, s.pending?.eventId]);

  const hud = useMemo(() => engine.hud(s), [s]);
  const cards = useMemo(() => (s.pending ? engine.shownCards(s) : []), [s]);
  const preview = previewOf(cards.find((c) => c.id === selected));

  let center;
  let action: { label: string; cmd: Command | null; go?: boolean };
  if (s.pending) {
    center = <EventPanel s={s} selected={selected} onSelect={setSelected} />;
    action = { label: selected ? ui.choose : ui.pickACard, cmd: selected ? { type: 'CHOOSE', actionId: selected } : null, go: !!selected };
  } else if (s.phase === 'morning') {
    center = <MorningReport s={s} />;
    action = { label: ui.toPower, cmd: { type: 'CONTINUE' }, go: true };
  } else if (s.phase === 'power') {
    center = <PowerPlan s={s} onToggle={(k: PoweredSystem, on: boolean) => dispatch({ type: 'SET_POWER', system: k, on })} />;
    action = { label: ui.toTasks, cmd: { type: 'CONFIRM_POWER' }, go: true };
  } else if (s.phase === 'tasks') {
    center = <TaskPlanner s={s} onPlan={(a: AstronautId, t: string | null) => dispatch({ type: 'PLAN_TASK', astronaut: a, taskId: t })} />;
    action = { label: ui.toEvent, cmd: { type: 'CONFIRM_TASKS' }, go: true };
  } else {
    center = <NightLog s={s} />;
    action = { label: ui.nextSol, cmd: { type: 'CONTINUE' }, go: true };
  }

  return (
    <div class="cockpit">
      <Hud h={hud} preview={preview} />
      <MissionBoard s={s} h={hud} />
      <main class="center">{center}</main>
      <CrewPanel h={hud} preview={preview} />
      <nav class="console" aria-label="Game controls">
        <button class="btn" onClick={props.onHelp}>
          <Icon name="HELP" /> <span class="hide-sm">{ui.howToPlay}</span>
        </button>
        <button class={`btn btn-main ${action.go ? 'btn-go' : ''}`} disabled={!action.cmd} onClick={() => action.cmd && dispatch(action.cmd)}>
          {action.label} <Icon name="ARROW" />
        </button>
        <button class="btn" onClick={props.onBriefing}>
          <Icon name="BRIEF" /> <span class="hide-sm">{ui.missionBriefing}</span>
        </button>
        <button class="btn" onClick={props.onQuit} aria-label={ui.quit}>
          <Icon name="MENU" />
        </button>
      </nav>
    </div>
  );
}
