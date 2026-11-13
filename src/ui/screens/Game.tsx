/**
 * The cockpit (D-020…D-029): base LEFT · the step in the centre · crew RIGHT · console.
 * Each day: the surprise first, with a timer (D-027) → 3-choice jobs one astronaut at a time (D-024, D-028) →
 * night runs on its own (no report screen; the bars flash what changed, D-029) → next day.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { timeoutId } from '../../engine';
import type {
  AstronautId,
  CardView,
  Chip,
  Command,
  GameState,
  Hud,
  Role,
} from '../../engine/types';
import { Icon } from '../components/Icon';
import { BasePanel, CrewPanel, TopBar, type Preview } from '../components/Panels';
import { Tutorial } from '../components/Tutorial';
import { engine, saveGame } from '../engine';
import { actionTitle, fill, ui } from '../text';
import { EventPanel, JobsPanel } from './Phases';

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

/** Chips → which bars change and by how much ("hover a choice: the bars light up"). */
export function previewOfChips(chips: Chip[]): Preview {
  const p: Preview = {};
  for (const ch of chips) {
    if (ch.label === 'chip.enmax') continue;
    const k = ch.icon === 'PWR' ? 'BAT' : ch.icon;
    if (!PREVIEW_KEYS.has(k)) continue;
    const amt = ch.amount ?? (ch.icon === 'DOSE' ? 1 : 0);
    if (amt) p[k] = (p[k] ?? 0) + amt;
  }
  return p;
}
const previewOf = (c: CardView | undefined): Preview =>
  c ? previewOfChips([...c.costs, ...c.effects]) : {};

/** What changed overnight, for the flash on the bars (D-029: no night screen). */
function diff(a: Hud, b: Hud): Preview {
  const d: Preview = {};
  const put = (k: string, x: number, y: number) => {
    if (y !== x) d[k] = y - x;
  };
  put('LS', a.core.LS, b.core.LS);
  put('BAT', a.core.BAT, b.core.BAT);
  put('SH', a.core.SH, b.core.SH);
  put('SP', a.sp.banked, b.sp.banked);
  put('DOSE', a.crew.DOSE, b.crew.DOSE);
  put('EN', a.crew.EN, b.crew.EN);
  put('FUL', a.crew.FUL, b.crew.FUL);
  put('HYD', a.crew.HYD, b.crew.HYD);
  put('AIR', a.crew.AIR, b.crew.AIR);
  return d;
}

/** Skip the screens a kid doesn't need: morning → power → (surprise | jobs); night → next morning (D-020, D-029). */
export function autoAdvance(s0: GameState): GameState {
  let s = s0;
  for (let i = 0; i < 8 && !s.pending; i++) {
    if (s.phase === 'morning') s = engine.reduce(s, { type: 'CONTINUE' });
    else if (s.phase === 'power') s = engine.reduce(s, { type: 'CONFIRM_POWER' });
    else if (s.phase === 'night') s = engine.reduce(s, { type: 'CONTINUE' });
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
  timerSeconds: number; // 0 = off (Settings)
  paused: boolean; // a menu or help window is open
  onTutorialEnd: () => void;
  onEnd: (s: GameState) => void;
  onMenu: () => void;
  onHelp: () => void;
}) {
  const [s, setS] = useState<GameState>(() => autoAdvance(props.initial));
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<Preview | null>(null);
  const [current, setCurrent] = useState<AstronautId | null>(() => firstUnassigned(s));
  const [tutorial, setTutorial] = useState(props.tutorial);
  const [flash, setFlash] = useState<Preview>({});
  const [toast, setToast] = useState<string | null>(null);
  const [left, setLeft] = useState<number>(props.timerSeconds);
  const flashTimer = useRef<number | undefined>(undefined);

  const hud = useMemo(() => engine.hud(s), [s]);
  const cards = useMemo(() => (s.pending ? engine.shownCards(s) : []), [s]);
  const timed = !!s.pending && s.pending.slot === 'event' && props.timerSeconds > 0 && !tutorial;
  const timeoutCard = useMemo(() => (timed ? engine.timeoutChoice(s) : null), [s, timed]);
  const timeoutPreview = useMemo(() => {
    if (!timeoutCard) return {};
    const ev = CONTENT.events[s.pending!.eventId]!;
    const view = engine
      .shownCards({ ...s, pending: { ...s.pending!, offered: ev.actions.map((a) => a.id) } })
      .find((c) => c.id === timeoutCard);
    return previewOf(view);
  }, [timeoutCard]);

  const dispatch = (cmd: Command) => {
    const before = engine.hud(s);
    const next = autoAdvance(engine.reduce(s, cmd));
    setS(next);
    setSelected(null);
    setHover(null);
    if (next.sol !== s.sol || next.phase === 'ended') {
      const d = diff(before, engine.hud(next));
      setFlash(d);
      window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash({}), 3500);
    }
    if (next.phase === 'tasks' && (s.phase !== 'tasks' || next.sol !== s.sol))
      setCurrent(firstUnassigned(next));
    saveGame(next.phase === 'ended' ? null : next);
    if (next.phase === 'ended') props.onEnd(next);
  };

  // D-027: the surprise timer. Paused during the tutorial, menus, and when the tab is hidden.
  useEffect(() => {
    setLeft(props.timerSeconds);
  }, [s.pending?.eventId, s.sol]);
  useEffect(() => {
    if (!timed || props.paused) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      setLeft((x) => x - 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [timed, props.paused, s.pending?.eventId, s.sol]);
  useEffect(() => {
    if (timed && left <= 0 && s.pending) {
      const worst = engine.timeoutChoice(s);
      setToast(fill(ui.tooSlow, { card: worst ? actionTitle(worst) : '' }));
      window.setTimeout(() => setToast(null), 5000);
      dispatch({ type: 'CHOOSE', actionId: timeoutId(s.pending.eventId) });
    }
  }, [left]);

  useEffect(() => {
    if (!tutorial) document.querySelector<HTMLElement>('.holo h2')?.focus();
  }, [s.phase, s.sol, s.pending?.eventId, current]);

  const preview: Preview =
    hover ??
    (selected
      ? previewOf(cards.find((c) => c.id === selected))
      : timed
        ? timeoutPreview
        : Object.keys(flash).length
          ? flash
          : {});
  const allAssigned = freeCrew(s).every((r) => s.astronauts.find((x) => x.id === r)!.plannedTask);

  let center;
  let action: { label: string; cmd: Command | null };
  if (s.pending) {
    center = (
      <EventPanel
        s={s}
        selected={selected}
        onSelect={setSelected}
        onHover={(c) => setHover(c ? previewOf(c) : null)}
        timer={timed ? { left: Math.max(0, left), total: props.timerSeconds } : null}
      />
    );
    action = {
      label: selected ? ui.choose : ui.pickACard,
      cmd: selected ? { type: 'CHOOSE', actionId: selected } : null,
    };
  } else {
    center = (
      <JobsPanel
        s={s}
        current={current}
        setCurrent={setCurrent}
        onHover={(chips) => setHover(chips ? previewOfChips(chips) : null)}
        onPlan={(a: AstronautId, t: string | null) => {
          const next = engine.reduce(s, { type: 'PLAN_TASK', astronaut: a, taskId: t });
          setS(next);
          setHover(null);
          saveGame(next);
        }}
      />
    );
    action = { label: ui.toEvent, cmd: allAssigned ? { type: 'CONFIRM_TASKS' } : null };
  }

  return (
    <div class="cockpit">
      <TopBar h={hud} missionName={CONTENT.missions[s.mission]?.name ?? ''} />
      <BasePanel s={s} h={hud} preview={preview} />
      <main class="center">
        {toast && (
          <p class="toast" role="status">
            <Icon name="TIME" /> {toast}
          </p>
        )}
        {center}
      </main>
      <CrewPanel
        s={s}
        h={hud}
        preview={preview}
        current={s.phase === 'tasks' && !s.pending ? current : null}
      />
      <nav class="console" aria-label="Game controls">
        <button class="btn" onClick={props.onHelp} aria-label={ui.howToPlay}>
          <Icon name="HELP" />
        </button>
        <button
          class="btn btn-main btn-go"
          disabled={!action.cmd}
          onClick={() => action.cmd && dispatch(action.cmd)}
        >
          {action.label} <Icon name="ARROW" />
        </button>
        <button class="btn" onClick={props.onMenu} aria-label={ui.menu}>
          <Icon name="MENU" />
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
