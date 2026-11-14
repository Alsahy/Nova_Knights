/**
 * End of the game (spec §1.1 rule 10 + D-029): a clear win/lose title, stars, a "next time" tip,
 * the 3 biggest choices, and the day-by-day story (the night reports live here now).
 */
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { formatLog } from '../../content/format';
import { sourceById } from '../../content/sources';
import type { GameState, LogEntry } from '../../engine/types';
import { Icon, systemIcon, type UiIcon } from '../components/Icon';
import { InfoTip } from '../components/InfoTip';
import { useEffect, useState } from 'preact/hooks';
import { STORIES } from '../../content/stories';
import { engine } from '../engine';
import type { Reward } from '../meta';
import { fill } from '../text';
import { actionTitle, eventTitle, logLine, ui } from '../text';

const SHOW = new Set([
  'log.harvest',
  'log.stormDose',
  'log.evaDose',
  'log.backgroundDose',
  'log.spBanked',
  'log.toSickBay',
  'log.broken',
  'log.lsUnpowered',
  'log.hungry',
  'log.thirsty',
  'log.batteryPop',
  'log.indoorOnly',
  'log.timeout',
]);
const ICON: Record<string, UiIcon> = {
  harvest: 'SPROUT',
  dose: 'DOSE',
  power: 'PWR',
  upkeep: 'FOOD',
  warning: 'EVENT',
  info: 'SP',
};

function days(s: GameState): { sol: number; event?: string; choice?: string; lines: LogEntry[] }[] {
  const out: { sol: number; event?: string; choice?: string; lines: LogEntry[] }[] = [];
  for (let sol = 1; sol <= s.sol; sol++) {
    const entries = s.log.filter((e) => e.sol === sol);
    const ev = entries.find((e) => e.key === 'log.event' || e.key === 'log.briefing');
    const ch = [...s.choices].reverse().find((c) => c.sol === sol && !c.actionId.endsWith('.wait'));
    const day: { sol: number; event?: string; choice?: string; lines: LogEntry[] } = {
      sol,
      lines: entries
        .filter((e) => SHOW.has(e.key) && !(e.key === 'log.spBanked' && e.params?.['sp'] === 0))
        .slice(0, 3),
    };
    if (ev && typeof ev.params?.['id'] === 'string') day.event = ev.params['id'];
    if (ch) day.choice = ch.actionId;
    out.push(day);
  }
  return out;
}

export function Debrief({
  s,
  reward,
  bank,
  seenStories,
  onStory,
  onAgain,
  onNew,
  onShop,
  onMenu,
}: {
  s: GameState;
  reward: Reward | null;
  bank: number;
  seenStories: string[];
  onStory: (id: string) => void;
  onAgain: () => void;
  onNew: () => void;
  onShop: () => void;
  onMenu: () => void;
}) {
  const d = engine.debrief(s)!;
  // D-040: one true story tied to a choice the player made; a different one each mission.
  const [tale] = useState(() => {
    const mine = s.choices.filter(
      (c) =>
        STORIES[c.eventId] && CONTENT.events[c.eventId]?.actions.some((a) => a.id === c.actionId),
    );
    const fresh = mine.filter((c) => !seenStories.includes(c.eventId));
    const pool = fresh.length ? fresh : mine;
    const same = pool.filter((c) => copy.endStory.same[c.actionId]);
    const from = same.length ? same : pool;
    return from.length ? from[Math.floor(Math.random() * from.length)]! : null;
  });
  useEffect(() => {
    if (tale) onStory(tale.eventId);
  }, []);
  const [showTale, setShowTale] = useState(!!tale);
  const [more, setMore] = useState(false);
  const won = d.ending.kind === 'success';
  const survival = s.mission === 'M9';
  return (
    <section class="center-screen" aria-labelledby="db-title">
      <div class={`debrief glass end-${d.ending.kind}`}>
        <h1 id="db-title" tabIndex={-1} class="screen-title">
          <Icon name={won ? 'SP' : 'COMPASS'} size={40} color={won ? 'var(--star)' : undefined} />{' '}
          {survival ? fill(copy.mode.lasted, { days: s.sol }) : ui.endTitles[d.ending.kind]}
        </h1>
        <p class="kid-text">
          {formatLog({ sol: d.ending.sol, kind: 'ending', key: d.ending.reason })}
        </p>
        <div class="end-stats">
          <span class="stars-big num">
            <Icon name="SP" size={28} color="var(--star)" /> {d.stats.spBanked} / {d.stats.spGoal}
          </span>
          <span
            class={`badge badge-${d.stats.dose >= 7 ? 'red' : d.stats.dose >= 4 ? 'yellow' : 'green'}`}
          >
            <Icon name="DOSE" size={20} /> <span class="num">{d.stats.dose}/10</span>
          </span>
        </div>
        {ui.endTips[d.ending.reason] && (
          <p class="lesson">
            <Icon name="SP" color="var(--star)" /> <b>{won ? ui.youLearned : ui.nextTime}:</b>{' '}
            {ui.endTips[d.ending.reason]}
          </p>
        )}
        {survival && reward?.score && (
          <p class="survival-score num" role="status">
            {fill(copy.mode.score, { score: reward.score.score })}
            <small>{copy.mode.scoreHow}</small>
            {reward.score.best && <em>{copy.mode.newBest}</em>}
          </p>
        )}
        {tale && (
          <button class="btn tale-again" onClick={() => setShowTale(true)}>
            <Icon name="COMPASS" size={20} color="var(--sky)" /> {copy.endStory.again}
          </button>
        )}
        {reward && (
          <div class="reward glass" role="status">
            <h2>{copy.reward.title}</h2>
            <p class="reward-stars num">
              <Icon name="SP" size={30} color="var(--star)" />{' '}
              {fill(copy.reward.stars, { n: reward.stars })}
            </p>
            {reward.half && <p>{copy.reward.half}</p>}
            {reward.rankUp !== undefined && (
              <p class="rank-up">
                {fill(copy.shop.rankUp, { rank: copy.shop.ranks[reward.rankUp]! })}
              </p>
            )}
            {reward.badgeStars > 0 && (
              <p class="reward-stars num">
                <Icon name="MEDAL" size={26} color="var(--star)" />{' '}
                {fill(copy.reward.badgeStars, { n: reward.badgeStars })}
              </p>
            )}
            {reward.newBadges.length > 0 && (
              <ul class="new-badges">
                {reward.newBadges.map((b, i) => (
                  <li key={b} style={{ '--i': i } as Record<string, number>}>
                    <Icon name="MEDAL" size={22} color="var(--star)" />{' '}
                    <b>{copy.badges.newBadge}</b> {copy.badges.names[b]}
                  </li>
                ))}
              </ul>
            )}
            <button class="btn btn-small" onClick={onShop}>
              <Icon name="SHOP" size={18} /> {copy.reward.shop} ·{' '}
              {fill(copy.reward.bank, { n: bank })}
            </button>
          </div>
        )}
        <h2>{ui.debriefChoices}</h2>
        <ol class="big-choices">
          {d.top3.map((t, i) => (
            <li key={i} class="glass">
              <p>
                <Icon name={systemIcon(t.choice.eventId)} size={20} /> <b>{t.eventTitle}</b> →{' '}
                {t.actionTitle}{' '}
                <InfoTip label={ui.nasaToo}>
                  {CONTENT.events[t.choice.eventId]?.realScience.text.replace(/\s*\[S\d+b?\]/g, '')}{' '}
                  {t.sources.map((id) => (
                    <a
                      key={id}
                      href={sourceById(id)?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      [{id}]
                    </a>
                  ))}
                </InfoTip>
              </p>
              {t.lesson && (
                <p class="lesson-line">
                  <Icon name="SP" size={18} color="var(--star)" /> {t.lesson}
                </p>
              )}
            </li>
          ))}
        </ol>
        <details class="timeline">
          <summary>{ui.dayByDay}</summary>
          <ol>
            {days(s).map((day) => (
              <li key={day.sol}>
                <span class="num day">{day.sol}</span>
                <div>
                  {day.event && (
                    <p>
                      <Icon name={systemIcon(day.event)} size={18} /> <b>{eventTitle(day.event)}</b>
                      {day.choice ? ` → ${actionTitle(day.choice)}` : ''}
                    </p>
                  )}
                  {day.lines.map((l, i) => (
                    <p key={i} class="small muted">
                      <Icon name={ICON[l.kind] ?? 'RULE'} size={16} /> {logLine(l)}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </details>
        <p class="muted small">
          {copy.ui.missionCode}: {s.seed}
        </p>
        <div class="briefing-actions">
          <button class="btn" onClick={onMenu}>
            <Icon name="MENU" size={18} /> {copy.mode.menu}
          </button>
          <button class="btn" onClick={onNew}>
            {ui.newGame}
          </button>
          <button class="btn btn-go" onClick={onAgain}>
            {ui.playAgain} <Icon name="ARROW" size={18} />
          </button>
        </div>
      </div>
      {tale && showTale && (
        <div class="modal-backdrop" onClick={() => setShowTale(false)}>
          <div
            class="modal glass tale"
            role="dialog"
            aria-modal="true"
            aria-label={copy.endStory.title}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              <Icon name="COMPASS" size={26} color="var(--sky)" /> {copy.endStory.title}
            </h2>
            <p class="muted">
              {fill(copy.endStory.youChose, {
                sol: tale.sol,
                event: eventTitle(tale.eventId),
                card: actionTitle(tale.actionId),
              })}
            </p>
            <p class="tale-text">{STORIES[tale.eventId]!.trueStory}</p>
            <p class="tale-you">
              <Icon name="SP" size={22} color="var(--star)" />{' '}
              {copy.endStory.same[tale.actionId] ?? copy.endStory.similar}
            </p>
            {more && (
              <p class="tale-more">
                {CONTENT.events[tale.eventId]!.realScience.text.replace(/\s*\[S\d+b?\]/g, '')}
              </p>
            )}
            <p class="small">
              {CONTENT.events[tale.eventId]!.realScience.sources.map((id) => (
                <a key={id} href={sourceById(id)?.url} target="_blank" rel="noopener noreferrer">
                  [{id}]{' '}
                </a>
              ))}
            </p>
            <div class="briefing-actions">
              <button class="btn" onClick={() => setMore(!more)}>
                {more ? copy.endStory.less : copy.endStory.more}
              </button>
              <button class="btn btn-go" onClick={() => setShowTale(false)} autoFocus>
                {copy.ui.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
