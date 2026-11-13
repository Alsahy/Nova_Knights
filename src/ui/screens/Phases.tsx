/**
 * The centre of the screen for each step of a sol, simplified for ages 7–12 (lead feedback, D-018…D-020):
 * jobs (4 per astronaut) → one surprise (2 cards) → night report. Short words, big buttons.
 */
import { useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { reasonText } from '../../content/format';
import { sourceById } from '../../content/sources';
import { STORIES } from '../../content/stories';
import type { AstronautId, CardView, GameState, LogEntry, Role } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { ChipRow } from '../components/Chips';
import { GlossaryText } from '../components/Glossary';
import { Icon, systemIcon, type UiIcon } from '../components/Icon';
import { engine } from '../engine';
import { actionTitle, fill, kidText, logLine, ui } from '../text';

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

// ── a surprise (event / morning news / setup / power problem) ──
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
}) {
  const { s, c } = props;
  const risk = c.risk ? (s.tier === 'cadet' ? c.risk.words : `${c.risk.pct}%`) : undefined;
  const who = whoRoles(s, c);
  // Kid wording first: if a rule chip already says what is lost, drop the spec's raw "LOST: …" text.
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
    >
      {props.selected && (
        <span class="chosen-pill">
          <Icon name="CHECK" size={14} /> {ui.chosen}
        </span>
      )}
      <span class="choice-icon">
        <Icon name={props.icon} size={26} />
      </span>
      <span class="choice-title">{c.title.startsWith('chip.') ? copy.chip[c.title] : c.title}</span>
      {who.length > 0 && (
        <span class="choice-who">
          {who.map((r) => (
            <span key={r} class="who-chip">
              <Avatar role={r} size={22} /> {s.astronauts.find((a) => a.id === r)!.callSign}
            </span>
          ))}
        </span>
      )}
      <ChipRow chips={costs} />
      <ChipRow chips={c.effects} />
      <ChipRow chips={c.later} {...(risk ? { risk } : {})} />
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
  const [showStory, setShowStory] = useState(false);
  const [showData, setShowData] = useState(false);
  const tag =
    p.slot === 'setup'
      ? ui.beforeLanding
      : p.slot === 'briefing'
        ? ui.morningNews
        : p.slot === 'shortage'
          ? ui.powerProblem
          : ui.surprise;
  return (
    <section class="holo" aria-labelledby="ev-title">
      <div class="holo-head">
        <p class="holo-tag">{tag}</p>
        {p.donki && (
          <button
            class="data-badge"
            aria-expanded={showData}
            onClick={() => setShowData(!showData)}
          >
            <Icon name="DATA" size={16} /> {ui.realData} · {p.donki.date}
          </button>
        )}
      </div>
      {p.donki && showData && (
        <p class="donki-label">
          {p.donki.label} {ui.replay}.
          {p.donki.fetchedAt
            ? ` ${fill(ui.archived, { date: p.donki.fetchedAt.slice(0, 10) })}.`
            : ''}{' '}
          {p.donki.sourceUrl && (
            <a href={p.donki.sourceUrl} target="_blank" rel="noopener noreferrer">
              {ui.seeRecord}
            </a>
          )}
        </p>
      )}
      <h2 id="ev-title" class="holo-title" tabIndex={-1}>
        <Icon name={systemIcon(ev.id)} size={32} /> {ev.title}
      </h2>
      <p class="kid-text">
        <GlossaryText text={kidText(s, ev.kidText)} />
      </p>
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
          />
        ))}
      </div>
      {story && (
        <div class="story-wrap">
          <button
            class="btn btn-small btn-ghost"
            aria-expanded={showStory}
            onClick={() => setShowStory(!showStory)}
          >
            <Icon name="HELP" size={18} /> {showStory ? ui.hideStory : ui.realStory}
          </button>
          {showStory && (
            <p class="story">
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
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ── jobs (D-019: 4 per astronaut) ──
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

function morningNotes(s: GameState): string[] {
  const notes: string[] = [];
  if (s.sol === s.lastSol) notes.push(ui.noteLastSol);
  else if (s.sol % 4 === 0) notes.push(ui.noteSend);
  if (s.dust.addedToday || s.dust.stacks >= 2) notes.push(ui.noteDust);
  if (s.crop && s.crop.readySol - s.sol <= 1) notes.push(fill(ui.noteCrop, { crop: s.crop.kind }));
  if (s.mission === 'M3' && s.sol === 1) notes.push(ui.noteStorm);
  return notes.slice(0, 2);
}

export function JobsPanel({
  s,
  onPlan,
}: {
  s: GameState;
  onPlan: (a: AstronautId, t: string | null) => void;
}) {
  const free = ROLES.filter((r) => {
    const a = s.astronauts.find((x) => x.id === r)!;
    return a.sickBaySols === 0 && a.busyUntilSol < s.sol;
  });
  const [active, setActive] = useState<Role | undefined>(
    free.find((r) => !s.astronauts.find((x) => x.id === r)!.plannedTask) ?? free[0],
  );
  const energyCost = s.astronauts.reduce((sum, a) => {
    const t = a.plannedTask ? CONTENT.tasks[a.plannedTask] : undefined;
    return (
      sum +
      (t
        ? t.cost.reduce(
            (x, e) => x + (e.kind === 'stat' && e.stat === 'EN' && e.delta < 0 ? -e.delta : 0),
            0,
          )
        : 0)
    );
  }, 0);
  const energyGain =
    s.astronauts.filter((a) => a.plannedTask === 'T-REST').length * 3 +
    s.astronauts.filter((a) => a.plannedTask === 'T-PEP').length * 2;
  const after = Math.max(0, Math.min(s.crew.ENMAX, s.crew.EN - energyCost + energyGain));
  return (
    <section class="holo" aria-labelledby="jobs-title">
      <p class="holo-tag">{fill(ui.morning, { sol: s.sol })}</p>
      {morningNotes(s).map((n) => (
        <p key={n} class="note">
          <Icon name="EVENT" size={18} /> {n}
        </p>
      ))}
      <h2 id="jobs-title" class="holo-title" tabIndex={-1}>
        <Icon name="CREW" size={32} /> {ui.jobsTitle}
      </h2>
      <p class="kid-text small-kid">{ui.pickJobs}</p>
      <div class="crew-grid">
        {ROLES.map((r) => {
          const a = s.astronauts.find((x) => x.id === r)!;
          const away = a.sickBaySols > 0 || a.busyUntilSol >= s.sol;
          return (
            <div key={r} class={`crew-card ${away ? 'away' : ''} ${active === r ? 'active' : ''}`}>
              <button
                class="crew-head"
                aria-expanded={active === r}
                onClick={() => setActive(r)}
                disabled={away}
              >
                <Avatar role={r} size={44} dim={away} />
                <span class="crew-id">
                  <b>{a.callSign}</b>
                  <span class="small muted">{ui.roleNames[r]}</span>
                </span>
                <span class="crew-pick small">
                  {a.plannedTask ? (
                    <>
                      <Icon name="CHECK" size={16} /> {ui.jobNames[a.plannedTask] ?? a.plannedTask}
                    </>
                  ) : away ? (
                    ''
                  ) : (
                    ui.noTask
                  )}
                </span>
              </button>
              {away ? (
                <p class="muted">
                  {a.sickBaySols > 0 ? fill(ui.inSickBay, { n: a.sickBaySols }) : ui.busy}
                </p>
              ) : (
                <div class="job-grid" role="group" aria-label={`${a.callSign}: ${ui.jobsTitle}`}>
                  {engine.availableTasks(s, r).map((o) => {
                    const chosen = a.plannedTask === o.taskId;
                    const gain = o.effects.find((c) => c.tone === 'effect');
                    return (
                      <button
                        key={o.taskId}
                        class={`job ${chosen ? 'chosen' : ''}`}
                        aria-pressed={chosen}
                        disabled={!o.allowed && !chosen}
                        onClick={() => {
                          onPlan(r, chosen ? null : o.taskId);
                          if (!chosen)
                            setActive(
                              free.find(
                                (x) =>
                                  x !== r && !s.astronauts.find((y) => y.id === x)!.plannedTask,
                              ) ?? r,
                            );
                        }}
                      >
                        <span class="job-name">
                          <Icon name={JOB_ICON[o.taskId] ?? 'RULE'} size={20} />{' '}
                          {ui.jobNames[o.taskId] ?? o.title}
                        </span>
                        <ChipRow
                          compact
                          chips={[
                            ...o.costs.filter((c) => c.amount !== undefined || c.icon === 'DOSE'),
                            ...(gain ? [gain] : []),
                          ]}
                        />
                        {!o.allowed && o.reason && (
                          <span class="choice-reason small">{reasonText(o.reason)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p class={`energy-line ${after <= 4 ? 'warn' : ''}`}>
        <Icon name="EN" /> {fill(ui.energyAfter, { n: after, max: s.crew.ENMAX })}
        {after <= 4 ? ` · ${ui.energyLow}` : ''}
      </p>
    </section>
  );
}

// ── night report ──
const SHOW = new Set([
  'log.harvest',
  'log.stormDose',
  'log.backgroundDose',
  'log.spBanked',
  'log.toSickBay',
  'log.backFromSickBay',
  'log.broken',
  'log.fixed',
  'log.lsUnpowered',
  'log.powerShort',
  'log.hungry',
  'log.thirsty',
  'log.batteryPop',
  'log.indoorOnly',
  'log.cropUntended',
  'log.o2makerBroken',
  'log.cantFix',
  'log.sepFollows',
  'log.planted',
  'log.waterWallGone',
  'log.treated',
  'log.taskFailed',
]);
const ICON_FOR: Record<string, UiIcon> = {
  harvest: 'SPROUT',
  dose: 'DOSE',
  power: 'PWR',
  upkeep: 'FOOD',
  warning: 'EVENT',
  info: 'CHECK',
  task: 'CREW',
  event: 'EVENT',
};

export function NightReport({ s }: { s: GameState }) {
  const today = engine.nightLog(s);
  const lines = today.filter(
    (e: LogEntry) => SHOW.has(e.key) && !(e.key === 'log.spBanked' && e.params?.['sp'] === 0),
  );
  const jobsDone = today.filter((e) => e.key === 'log.taskDone').length;
  const choice = [...s.choices]
    .reverse()
    .find((c) => c.sol === s.sol && !c.actionId.endsWith('.wait'));
  const lesson = choice
    ? CONTENT.events[choice.eventId]?.actions.find((a) => a.id === choice.actionId)?.lesson
    : undefined;
  return (
    <section class="holo" aria-labelledby="nl-title">
      <p class="holo-tag">
        {ui.sol} {s.sol}
      </p>
      <h2 id="nl-title" class="holo-title" tabIndex={-1}>
        <Icon name="TIME" size={32} /> {ui.nightReport}
      </h2>
      <ul class="log" aria-live="polite">
        {choice && (
          <li class="log-choice">
            <Icon name="CHECK" />{' '}
            {fill(copy.log['log.choice']!, { id: actionTitle(choice.actionId) })}
          </li>
        )}
        {jobsDone > 0 && (
          <li class="log-task">
            <Icon name="CREW" /> {fill(ui.jobsDone, { n: jobsDone })}
          </li>
        )}
        {lines.slice(0, 5).map((e, i) => (
          <li key={i} class={`log-${e.kind}`}>
            <Icon name={ICON_FOR[e.kind] ?? 'RULE'} /> {logLine(e)}
          </li>
        ))}
        {!choice && lines.length === 0 && jobsDone === 0 && <li>{ui.allQuiet}</li>}
      </ul>
      {lesson && (
        <p class="lesson">
          <Icon name="SP" color="var(--star)" /> <b>{ui.youLearned}:</b> {lesson}
        </p>
      )}
    </section>
  );
}
