/**
 * The cockpit, simplified (lead feedback): top bar · "Our base" on the LEFT · the current step in the centre · console.
 * D-020: no morning or power screens; the UI steps through them automatically. A power shortage still
 * shows PW-08 as a card, and Morning news (briefing) cards still show.
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import type { AstronautId, CardView, Command, GameState } from '../../engine/types';
import { Icon } from '../components/Icon';
import { BasePanel, TopBar, type Preview } from '../components/Panels';
import { engine, saveGame } from '../engine';
import { ui } from '../text';
import { EventPanel, JobsPanel, NightReport } from './Phases';

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

export function Game(props: {
  initial: GameState;
  onEnd: (s: GameState) => void;
  onMenu: () => void;
  onHelp: () => void;
}) {
  const [s, setS] = useState<GameState>(() => autoAdvance(props.initial));
  const [selected, setSelected] = useState<string | null>(null);

  const dispatch = (cmd: Command) => {
    const next = autoAdvance(engine.reduce(s, cmd));
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
        onPlan={(a: AstronautId, t: string | null) =>
          dispatch({ type: 'PLAN_TASK', astronaut: a, taskId: t })
        }
      />
    );
    action = { label: ui.toEvent, cmd: { type: 'CONFIRM_TASKS' } };
  } else {
    center = <NightReport s={s} />;
    action = { label: ui.nextSol, cmd: { type: 'CONTINUE' } };
  }

  return (
    <div class="cockpit">
      <TopBar h={hud} missionName={CONTENT.missions[s.mission]?.name ?? ''} />
      <BasePanel s={s} h={hud} preview={preview} />
      <main class="center">{center}</main>
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
    </div>
  );
}
