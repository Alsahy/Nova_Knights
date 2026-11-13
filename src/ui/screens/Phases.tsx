/** The centre "holo frame" for each phase of a sol (spec §2.4). */
import { useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { reasonText } from '../../content/format';
import type { AstronautId, CardView, GameState, PoweredSystem, Role } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { ChipRow } from '../components/Chips';
import { Icon, systemIcon } from '../components/Icon';
import { engine } from '../engine';
import { STORIES } from '../../content/stories';
import { sourceById } from '../../content/sources';
import { GlossaryText } from '../components/Glossary';
import { callSign, fill, kidText, logLine, ui } from '../text';

// ── Event / briefing / setup / shortage cards ──
function whoText(s: GameState, c: CardView): string {
  const parts = c.who.map((t) => {
    if (t === 'ANY') return c.who.length === 1 ? ui.anyone : ui.helper;
    if (t === 'NAME') return s.pending?.nameTarget ? callSign(s, s.pending.nameTarget) : ui.anyone;
    if (t === 'PICK') return ui.anyone;
    if (t === 'EVA') return ui.evaCrew;
    if (t.includes('|'))
      return t
        .split('|')
        .map((r) => callSign(s, r as AstronautId))
        .join(' / ');
    return callSign(s, t as AstronautId);
  });
  const who = parts.length ? parts.join(' + ') : ui.anyone;
  return fill(ui.doesIt, { who: who.charAt(0).toUpperCase() + who.slice(1) });
}

export function ChoiceCard(props: {
  s: GameState;
  c: CardView;
  selected: boolean;
  dimmed: boolean;
  onPick: () => void;
}) {
  const { s, c } = props;
  const ev = s.pending ? CONTENT.events[s.pending.eventId] : undefined;
  const risk = c.risk ? (s.tier === 'cadet' ? c.risk.words : `${c.risk.pct}%`) : undefined;
  return (
    <button
      class={`choice ${props.selected ? 'chosen' : ''} ${props.dimmed ? 'dimmed' : ''}`}
      disabled={!c.affordable}
      aria-pressed={props.selected}
      onClick={props.onPick}
    >
      {props.selected && (
        <span class="chosen-pill">
          <Icon name="CHECK" size={14} /> {ui.chosen}
        </span>
      )}
      <span class="choice-icon">
        <Icon name={ev ? systemIcon(ev.id) : 'EVENT'} size={24} />
      </span>
      <span class="choice-title">{c.title.startsWith('chip.') ? copy.chip[c.title] : c.title}</span>
      {c.who.length > 0 && <span class="choice-who">{whoText(s, c)}</span>}
      {c.fallback && <span class="choice-warn">{ui.standIn}</span>}
      <ChipRow chips={c.costs} />
      <ChipRow chips={c.effects} />
      <ChipRow chips={c.later} {...(risk ? { risk } : {})} />
      {c.lesson && <span class="choice-lesson">“{c.lesson}”</span>}
      {!c.affordable && c.reason && <span class="choice-reason">{reasonText(c.reason)}</span>}
    </button>
  );
}

export function EventPanel(props: {
  s: GameState;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { s } = props;
  const p = s.pending!;
  const ev = CONTENT.events[p.eventId]!;
  const cards = engine.shownCards(s);
  const story = STORIES[ev.id];
  const tag =
    p.slot === 'setup'
      ? ui.beforeLanding
      : p.slot === 'briefing'
        ? ui.missionBriefing
        : p.slot === 'shortage'
          ? ui.powerTitle
          : `${ui.sol} ${s.sol}`;
  return (
    <section class="holo" aria-labelledby="ev-title">
      <p class="holo-tag">
        {tag} · {ev.system}
      </p>
      <h2 id="ev-title" class="holo-title">
        <Icon name={systemIcon(ev.id)} size={30} /> {ev.title}
      </h2>
      {p.donki && (
        <p class="donki-label">
          <b>{fill(ui.realEvent, { date: p.donki.date })}</b> · {ui.replay}
          {p.donki.fetchedAt
            ? ` · ${fill(ui.archived, { date: p.donki.fetchedAt.slice(0, 10) })}`
            : ''}
          <br />
          {p.donki.label}{' '}
          {p.donki.sourceUrl && (
            <a href={p.donki.sourceUrl} target="_blank" rel="noopener noreferrer">
              {ui.seeRecord}
            </a>
          )}
        </p>
      )}
      <p class="kid-text">
        <GlossaryText text={kidText(s, ev.kidText)} />
      </p>
      <div class={`choices n${cards.length}`} role="group" aria-label={ui.pickACard}>
        {cards.map((c) => (
          <ChoiceCard
            key={c.id}
            s={s}
            c={c}
            selected={props.selected === c.id}
            dimmed={props.selected !== null && props.selected !== c.id}
            onPick={() => props.onSelect(props.selected === c.id ? null : c.id)}
          />
        ))}
      </div>
      {story && (
        <p class="story">
          <b>{ui.trueStoryKid}:</b> {story.trueStory}{' '}
          {story.sources.map((id) => (
            <a
              key={id}
              href={sourceById(id)?.url}
              target="_blank"
              rel="noopener noreferrer"
              class="src-link"
            >
              [{id}]
            </a>
          ))}
        </p>
      )}
      <details class="true-story">
        <summary>{ui.trueStory}</summary>
        <p>
          {ev.realScience.text.split(/(\[S\d+b?\])/).map((part, i) =>
            /^\[S\d+b?\]$/.test(part) ? (
              <a
                key={i}
                href={sourceById(part.slice(1, -1))?.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part}
              </a>
            ) : (
              part
            ),
          )}
        </p>
      </details>
    </section>
  );
}

// ── Morning report ──
export function MorningReport({ s }: { s: GameState }) {
  const b = engine.powerBudget(s);
  const mission = CONTENT.missions[s.mission]!;
  return (
    <section class="holo" aria-labelledby="mr-title">
      <p class="holo-tag">
        {ui.sol} {s.sol}
      </p>
      <h2 id="mr-title" class="holo-title">
        <Icon name="SUN" size={30} /> {fill(ui.morning, { sol: s.sol })}
      </h2>
      <ul class="report">
        <li>
          <Icon name="SUN" /> {mission.donki === 'quiet' ? ui.morningSun : ui.morningSunBusy}
        </li>
        <li>
          <Icon name="PWR" />{' '}
          {fill(ui.morningPower, {
            solar: b.solar,
            reactor: b.reactor,
            supply: b.supply,
            ...(b.bonus ? { bonus: b.bonus } : {}),
          })}
        </li>
        <li>
          <Icon name="BAT" />{' '}
          {fill(ui.morningBattery, { bat: s.systems.BAT, max: s.systems.BATMAX })}
        </li>
        {s.dust.stacks > 0 && (
          <li class="warn">
            <Icon name="SUN" /> {fill(ui.morningDust, { n: s.dust.stacks })}
          </li>
        )}
        <li>
          <Icon name="SP" />{' '}
          {fill(ui.morningStars, { banked: s.sp.banked, pending: s.sp.pending, goal: s.sp.goal })}
        </li>
      </ul>
      <TodayLog s={s} />
    </section>
  );
}

// ── Power plan (D-002, D-003) ──
export function PowerPlan({
  s,
  onToggle,
}: {
  s: GameState;
  onToggle: (k: PoweredSystem, on: boolean) => void;
}) {
  const b = engine.powerBudget(s);
  const net = b.supply - b.totalNeed - b.spent;
  const rows: {
    k: PoweredSystem;
    label: string;
    hint: string;
    need: number;
    disabled?: boolean;
  }[] = [
    { k: 'LS', label: ui.sysLS, hint: ui.sysLSHint, need: 2 },
    { k: 'recycler', label: ui.sysRecycler, hint: ui.sysRecyclerHint, need: 1 },
    {
      k: 'greenhouse',
      label: ui.sysGreenhouse,
      hint: ui.sysGreenhouseHint,
      need: 1,
      disabled: !s.crop,
    },
  ];
  return (
    <section class="holo" aria-labelledby="pw-title">
      <p class="holo-tag">
        {ui.sol} {s.sol}
      </p>
      <h2 id="pw-title" class="holo-title">
        <Icon name="PWR" size={30} /> {ui.powerTitle}
      </h2>
      <p class="kid-text">{ui.powerIntro}</p>
      <div class="power-sum">
        <div>
          <span class="muted">{ui.supply}</span> <b class="num big">{b.supply}</b>
        </div>
        <div>
          <span class="muted">{ui.need}</span> <b class="num big">{b.totalNeed}</b>
        </div>
        <div>
          <span class="muted">{ui.battery}</span> <b class="num big">{b.battery}</b>
        </div>
      </div>
      <p class={`power-result ${b.shortfall > 0 ? 'bad' : net >= 0 ? 'good' : 'meh'}`}>
        {b.shortfall > 0
          ? fill(ui.short, { n: b.shortfall })
          : net >= 0
            ? fill(ui.leftover, { n: net })
            : fill(ui.fromBattery, { n: -net })}
      </p>
      <ul class="toggles">
        {rows.map((r) => {
          const on = s.power.plugged[r.k] && !(r.k === 'greenhouse' && !s.crop);
          return (
            <li key={r.k}>
              <label class="toggle-row">
                <input
                  type="checkbox"
                  role="switch"
                  checked={on}
                  disabled={r.disabled}
                  onChange={(e) => onToggle(r.k, (e.target as HTMLInputElement).checked)}
                />
                <span class="toggle-ui" aria-hidden="true">
                  {on ? ui.on : ui.off}
                </span>
                <span>
                  <b>{r.label}</b> <span class="chip chip-cost">−{r.need}</span>
                  <small>{r.hint}</small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Crew jobs (D-001: planned now, resolved at night) ──
const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

export function TaskPlanner({
  s,
  onPlan,
}: {
  s: GameState;
  onPlan: (a: AstronautId, t: string | null) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section class="holo" aria-labelledby="tk-title">
      <p class="holo-tag">
        {ui.sol} {s.sol}
      </p>
      <h2 id="tk-title" class="holo-title">
        <Icon name="CREW" size={30} /> {ui.tasksTitle}
      </h2>
      <p class="kid-text">{ui.tasksIntro}</p>
      <ul class="task-rows">
        {ROLES.map((r) => {
          const a = s.astronauts.find((x) => x.id === r)!;
          const unavailable = a.sickBaySols > 0 || a.busyUntilSol >= s.sol;
          const options = engine.availableTasks(s, r);
          const shown = options.filter((o) => o.allowed || o.taskId === a.plannedTask);
          const sorted = [...shown.filter((o) => !o.fallback), ...shown.filter((o) => o.fallback)];
          const isOpen =
            open === r ||
            (!a.plannedTask &&
              open === null &&
              !unavailable &&
              r === ROLES.find((x) => !s.astronauts.find((y) => y.id === x)!.plannedTask));
          return (
            <li key={r} class="task-row">
              <div class="task-who">
                <Avatar role={r} size={44} dim={unavailable} />
                <div>
                  <b>{a.callSign}</b> <span class="muted">· {ui.roleNames[r]}</span>
                  <div class="small">
                    {unavailable
                      ? a.sickBaySols > 0
                        ? fill(ui.inSickBay, { n: a.sickBaySols })
                        : ui.busy
                      : a.plannedTask
                        ? `✔ ${CONTENT.tasks[a.plannedTask]?.title}`
                        : ui.noTask}
                  </div>
                </div>
                {!unavailable && (
                  <button
                    class="btn btn-small"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? 'none' : r)}
                  >
                    {isOpen ? ui.close : a.plannedTask ? 'Change' : 'Pick a job'}
                  </button>
                )}
              </div>
              {!unavailable && isOpen && (
                <div class="task-options">
                  {sorted.map((o) => (
                    <button
                      key={o.taskId}
                      class={`task-btn ${a.plannedTask === o.taskId ? 'chosen' : ''}`}
                      aria-pressed={a.plannedTask === o.taskId}
                      onClick={() => {
                        onPlan(r, a.plannedTask === o.taskId ? null : o.taskId);
                        setOpen(null);
                      }}
                    >
                      <span class="task-title">{o.title}</span>
                      {o.fallback && <span class="choice-warn">{ui.standIn}</span>}
                      <ChipRow chips={o.costs} />
                      <ChipRow chips={o.effects} />
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p class="muted">{fill(ui.energyLeft, { n: s.crew.EN })}</p>
    </section>
  );
}

// ── Night: what happened today ──
const HIDE = new Set(['log.solStart', 'log.nightDone', 'log.newGame']);
export function TodayLog({ s }: { s: GameState }) {
  const lines = engine.nightLog(s).filter((e) => !HIDE.has(e.key));
  if (!lines.length) return null;
  return (
    <ul class="log">
      {lines.map((e, i) => (
        <li key={i} class={`log-${e.kind}`}>
          {logLine(e)}
        </li>
      ))}
    </ul>
  );
}

export function NightLog({ s }: { s: GameState }) {
  return (
    <section class="holo" aria-labelledby="nl-title">
      <p class="holo-tag">
        {ui.sol} {s.sol}
      </p>
      <h2 id="nl-title" class="holo-title">
        <Icon name="TIME" size={30} /> {ui.nightTitle}
      </h2>
      <TodayLog s={s} />
    </section>
  );
}
