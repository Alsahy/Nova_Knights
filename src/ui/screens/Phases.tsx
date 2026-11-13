/**
 * The centre of the screen (D-027…D-029): the day's surprise (2 big cards, a timer, hover = preview on the bars)
 * and the jobs (3 big picture cards per astronaut, one astronaut at a time). Few words; science behind "?".
 */
import { useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { reasonText } from '../../content/format';
import { sourceById } from '../../content/sources';
import { STORIES } from '../../content/stories';
import type { AstronautId, CardView, Chip, GameState, Role } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { ChipRow } from '../components/Chips';
import { Icon, systemIcon, type UiIcon } from '../components/Icon';
import { engine } from '../engine';
import { fill, kidDate, kidText, ui } from '../text';

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

/** A small "?" that opens grown-up / science text on hover, focus or tap (D-029). */
export function InfoTip({
  label,
  children,
}: {
  label: string;
  children: preact.ComponentChildren;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span class="info-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        class="info-btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <span class="info-pop" role="note">
          {children}
        </span>
      )}
    </span>
  );
}

function whoRoles(s: GameState, c: CardView): Role[] {
  const out: Role[] = [];
  for (const t of c.who) {
    if ((ROLES as string[]).includes(t)) out.push(t as Role);
    else if (t.includes('|')) out.push(t.split('|')[0] as Role);
    else if (t === 'NAME' && s.pending?.nameTarget) out.push(s.pending.nameTarget);
  }
  return out;
}

function ChoiceCard(props: {
  s: GameState;
  c: CardView;
  icon: UiIcon;
  selected: boolean;
  dimmed: boolean;
  onPick: () => void;
  onHover: (c: CardView | null) => void;
}) {
  const { s, c } = props;
  const risk = c.risk ? (s.tier === 'cadet' ? c.risk.words : `${c.risk.pct}%`) : undefined;
  const who = whoRoles(s, c);
  const hasRuleLost = c.costs.some((x) => x.icon === 'LOST' && x.label?.startsWith('chip.'));
  const costs = hasRuleLost
    ? c.costs.filter((x) => !(x.icon === 'LOST' && !x.label?.startsWith('chip.')))
    : c.costs;
  return (
    <button
      class={`choice ${props.selected ? 'chosen' : ''} ${props.dimmed ? 'dimmed' : ''}`}
      disabled={!c.affordable}
      aria-pressed={props.selected}
      onClick={props.onPick}
      onMouseEnter={() => props.onHover(c)}
      onMouseLeave={() => props.onHover(null)}
      onFocus={() => props.onHover(c)}
      onBlur={() => props.onHover(null)}
    >
      {props.selected && (
        <span class="chosen-pill">
          <Icon name="CHECK" size={14} /> {ui.chosen}
        </span>
      )}
      <span class="choice-icon">
        <Icon name={props.icon} size={30} />
      </span>
      <span class="choice-title">{c.title}</span>
      {who.length > 0 && (
        <span
          class="choice-who"
          aria-label={who.map((r) => s.astronauts.find((a) => a.id === r)!.callSign).join(', ')}
        >
          {who.map((r) => (
            <Avatar key={r} role={r} size={28} />
          ))}
        </span>
      )}
      <ChipRow compact chips={costs} />
      <ChipRow compact chips={c.effects} />
      <ChipRow compact chips={c.later} {...(risk ? { risk } : {})} />
      {!c.affordable && c.reason && <span class="choice-reason">{reasonText(c.reason)}</span>}
    </button>
  );
}

export function EventPanel(props: {
  s: GameState;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onHover: (c: CardView | null) => void;
  timer: { left: number; total: number } | null;
}) {
  const { s } = props;
  const p = s.pending!;
  const ev = CONTENT.events[p.eventId]!;
  const cards = engine.shownCards(s);
  const story = STORIES[ev.id];
  return (
    <section
      class={`holo ${ev.id.startsWith('SW') ? 'storm' : ''} ${props.timer && props.timer.left <= 3 ? 'hurry' : ''}`}
      aria-labelledby="ev-title"
    >
      <div class="holo-head">
        <p class="holo-tag">
          {ui.sol} {s.sol}
        </p>
        {p.donki && (
          <span class="data-badge">
            <Icon name="DATA" size={16} /> {ui.realData} · {kidDate(p.donki.date)}
            <InfoTip label={ui.realData}>
              {p.donki.label} {ui.replay}.
              {p.donki.fetchedAt
                ? ` ${fill(ui.archived, { date: p.donki.fetchedAt.slice(0, 10) })}.`
                : ''}{' '}
              {p.donki.sourceUrl && (
                <a href={p.donki.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {ui.seeRecord}
                </a>
              )}
            </InfoTip>
          </span>
        )}
        {props.timer && (
          <span
            class="timer"
            role="timer"
            aria-label={fill(ui.secondsLeft, { n: props.timer.left })}
            style={
              { '--p': `${(100 * props.timer.left) / props.timer.total}%` } as Record<
                string,
                string
              >
            }
          >
            <span class="num">{props.timer.left}</span>
          </span>
        )}
      </div>
      <h2 id="ev-title" class="holo-title" tabIndex={-1}>
        <Icon name={systemIcon(ev.id)} size={34} /> {ev.title}
        {story && (
          <InfoTip label={ui.realStory}>
            {story.trueStory}{' '}
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
          </InfoTip>
        )}
      </h2>
      <p class="kid-text">{kidText(s, ev.kidText)}</p>
      <div class={`choices n${cards.length}`} role="group" aria-label={ui.pickACard}>
        {cards.map((c) => (
          <ChoiceCard
            key={c.id}
            s={s}
            c={c}
            icon={systemIcon(ev.id)}
            selected={props.selected === c.id}
            dimmed={props.selected !== null && props.selected !== c.id}
            onPick={() => props.onSelect(props.selected === c.id ? null : c.id)}
            onHover={props.onHover}
          />
        ))}
      </div>
      {props.timer && <p class="hint-line">{ui.timerHint}</p>}
    </section>
  );
}

const JOB_ICON: Record<string, UiIcon> = {
  'T-REST': 'TIME',
  'T-PEP': 'CREW',
  'T-GARDEN': 'SPROUT',
  'T-SEND': 'ANTENNA',
  'T-MAINT-LS': 'LS',
  'T-PANELS': 'SUN',
  'T-SHIELD': 'SH',
  'T-TREAT': 'MEDKIT',
  'T-MED': 'MEDKIT',
  'T-LAB': 'FLASK',
  'T-EVA-SCI': 'COMPASS',
};

/** D-024 + D-028: one astronaut at a time, 3 big picture cards. */
export function JobsPanel({
  s,
  onPlan,
  current,
  setCurrent,
  onHover,
}: {
  s: GameState;
  onPlan: (a: AstronautId, t: string | null) => void;
  current: AstronautId | null;
  setCurrent: (a: AstronautId | null) => void;
  onHover: (chips: Chip[] | null) => void;
}) {
  const free = ROLES.filter((r) => {
    const a = s.astronauts.find((x) => x.id === r)!;
    return a.sickBaySols === 0 && a.busyUntilSol < s.sol;
  });
  const who = current && free.includes(current) ? current : null;
  const a = who ? s.astronauts.find((x) => x.id === who)! : null;
  return (
    <section class="holo" aria-labelledby="jobs-title">
      <div class="holo-head">
        <p class="holo-tag">
          {ui.sol} {s.sol}
        </p>
        <ol class="turns" aria-label={ui.jobsTitle}>
          {free.map((r) => {
            const x = s.astronauts.find((y) => y.id === r)!;
            return (
              <li key={r}>
                <button
                  class={`turn ${who === r ? 'now' : ''} ${x.plannedTask ? 'done' : ''}`}
                  aria-current={who === r ? 'step' : undefined}
                  aria-label={`${x.callSign}${x.plannedTask ? ' ✓' : ''}`}
                  onClick={() => setCurrent(r)}
                >
                  <Avatar role={r} size={30} />
                  {x.plannedTask && <Icon name="CHECK" size={14} />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {a && who ? (
        <div class="job-step">
          <h2 id="jobs-title" class="holo-title" tabIndex={-1}>
            <Avatar role={who} size={44} /> {a.callSign}
          </h2>
          <div
            class="job-grid big"
            role="group"
            aria-label={fill(ui.pickFor, { name: a.callSign })}
          >
            {engine.availableTasks(s, who).map((o) => {
              const chosen = a.plannedTask === o.taskId;
              const gain = o.effects.find((c) => c.tone === 'effect');
              const chips = [
                ...o.costs.filter((c) => c.amount !== undefined || c.icon === 'DOSE'),
                ...(gain ? [gain] : []),
              ];
              return (
                <button
                  key={o.taskId}
                  class={`job ${chosen ? 'chosen' : ''}`}
                  aria-pressed={chosen}
                  disabled={!o.allowed && !chosen}
                  onMouseEnter={() => onHover(chips)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(chips)}
                  onBlur={() => onHover(null)}
                  onClick={() => {
                    onPlan(who, o.taskId);
                    const next = free.find(
                      (r) => r !== who && !s.astronauts.find((y) => y.id === r)!.plannedTask,
                    );
                    setCurrent(next ?? null);
                  }}
                >
                  <span class="job-icon">
                    <Icon name={JOB_ICON[o.taskId] ?? 'RULE'} size={34} />
                  </span>
                  <span class="job-name">{ui.jobNames[o.taskId] ?? o.title}</span>
                  <ChipRow compact chips={chips} />
                  {!o.allowed && o.reason && (
                    <span class="choice-reason small">{reasonText(o.reason)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div class="job-step">
          <h2 id="jobs-title" class="holo-title" tabIndex={-1}>
            <Icon name="CHECK" size={30} color="var(--green)" />{' '}
            {free.length ? ui.allSet : ui.allRest}
          </h2>
          <ul class="job-summary">
            {free.map((r) => {
              const x = s.astronauts.find((y) => y.id === r)!;
              return (
                <li key={r}>
                  <button class="summary-row" onClick={() => setCurrent(r)}>
                    <Avatar role={r} size={30} /> <b>{x.callSign}</b>
                    <span>
                      {x.plannedTask && <Icon name={JOB_ICON[x.plannedTask] ?? 'RULE'} size={18} />}{' '}
                      {x.plannedTask ? (ui.jobNames[x.plannedTask] ?? x.plannedTask) : ui.noTask}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
