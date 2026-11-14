/**
 * Training room (D-047, D-056).
 * Top: the 26 skills, each exactly once, to practise with no timer.
 * Below: every problem with its tools. Tap a tool to see why it exists, what it teaches,
 * and what really happened in space, with a real NASA picture when there is one.
 */
import { useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { KID_EVENTS } from '../../content/missions';
import { imageFor } from '../../content/nasaImages';
import { sourceById } from '../../content/sources';
import { STORIES } from '../../content/stories';
import type { ActionDef } from '../../engine/types';
import { Icon, systemIcon } from '../components/Icon';
import { MINIS } from '../game/minis';
import { sfx } from '../game/sfx';
import { howTo, SKILLS, toolName, TOOLS } from '../game/tools';
import { fill, kidDate } from '../text';

const T = copy.practice;
const img = (file: string) => `${import.meta.env.BASE_URL}img/nasa/${file}.webp`;

export function Practice({ back }: { back: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [info, setInfo] = useState<ActionDef | null>(null);
  const [won, setWon] = useState<string[]>([]);
  const [run, setRun] = useState(0);
  const skill = open !== null ? SKILLS[open]! : null;
  const Mini = skill ? MINIS[skill.mech] : null;
  const infoEv = info ? CONTENT.events[info.eventId]! : null;
  const infoStory = info ? STORIES[info.eventId] : undefined;
  const infoImg = info ? imageFor(info.eventId) : undefined;
  const infoTool = info ? TOOLS[info.id] : undefined;
  return (
    <section class="center-screen practice" aria-labelledby="practice-title">
      <button class="btn btn-back" onClick={back}>
        ← {copy.back}
      </button>
      <h1 id="practice-title" tabIndex={-1}>
        {T.title}
      </h1>
      <h2>{fill(T.skills, { n: SKILLS.length, done: won.length })}</h2>
      <p class="lead">{T.intro}</p>
      <div class="skill-grid">
        {SKILLS.map((k, i) => (
          <div key={k.mech} class="practice-tool">
            <button
              class={`big-tool ${won.includes(k.mech) ? 'done' : ''}`}
              data-skill={k.mech}
              onClick={() => {
                setOpen(i);
                setRun((n) => n + 1);
              }}
            >
              <Icon name={k.icon} size={46} />
              {won.includes(k.mech) && (
                <span class="tick">
                  <Icon name="CHECK" size={16} />
                </span>
              )}
            </button>
            <span class="tool-name">{copy.skills[k.mech]}</span>
          </div>
        ))}
      </div>

      <h2>{T.whyTitle}</h2>
      <p class="lead">{T.whyIntro}</p>
      <div class="practice-grid">
        {KID_EVENTS.map((id) => {
          const ev = CONTENT.events[id];
          const tools = (ev?.actions ?? []).filter((a) => TOOLS[a.id]);
          if (!ev || !tools.length) return null;
          return (
            <article key={id} class="practice-card glass">
              <h3>
                <span class="practice-sys">
                  <Icon name={systemIcon(id)} size={22} />
                </span>
                {ev.title}
              </h3>
              <div class="why-tools">
                {tools.map((a) => (
                  <button key={a.id} class="why-tool" data-why={a.id} onClick={() => setInfo(a)}>
                    <Icon name={TOOLS[a.id]!.icon} size={24} />
                    <span>{toolName(a.id, a.title)}</span>
                    <b aria-hidden="true">?</b>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {info && infoEv && infoTool && (
        <div class="modal-backdrop" onClick={() => setInfo(null)}>
          <div
            class="modal glass why-card"
            role="dialog"
            aria-modal="true"
            aria-label={T.why}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              <span class="tool-icon">
                <Icon name={infoTool.icon} size={30} />
              </span>
              {toolName(info.id, info.title)}
            </h2>
            {infoImg && (
              <figure class="nasa-fig">
                <img src={img(infoImg.file)} alt={infoImg.caption} loading="lazy" />
                <figcaption>
                  {infoImg.caption}{' '}
                  <small>
                    {fill(T.credit, { credit: infoImg.credit, date: kidDate(infoImg.published) })}{' '}
                    <a
                      href={`https://images.nasa.gov/details/${infoImg.nasaId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {infoImg.nasaId}
                    </a>
                  </small>
                </figcaption>
              </figure>
            )}
            <dl>
              <dt>{T.problem}</dt>
              <dd>{infoEv.kidText.replace(/\[Name\]/g, 'Echo').replace(/\[N\]/g, '2')}</dd>
              <dt>{T.does}</dt>
              <dd>
                {info.title}. {info.lesson && <b>{info.lesson}.</b>}
                {infoTool.mech !== 'none' && (
                  <> {fill(T.uses, { skill: copy.skills[infoTool.mech] ?? '' })}</>
                )}
              </dd>
              <dt>{T.real}</dt>
              <dd>
                {infoStory?.trueStory ?? infoEv.realScience.text.replace(/\s*\[S\d+b?\]/g, '')}{' '}
                {infoEv.realScience.sources.map((id) => (
                  <a key={id} href={sourceById(id)?.url} target="_blank" rel="noopener noreferrer">
                    [{id}]
                  </a>
                ))}
              </dd>
            </dl>
            <div class="briefing-actions">
              <button class="btn btn-go" onClick={() => setInfo(null)} autoFocus>
                {copy.ui.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {skill && Mini && (
        <div class="modal-backdrop">
          <div class="mini practice-mini" role="dialog" aria-label={copy.skills[skill.mech]}>
            <div class="mini-head">
              <span class="tool-icon">
                <Icon name={skill.icon} size={28} />
              </span>
              <div>
                <b>{copy.skills[skill.mech]}</b>
                <p>{howTo(skill)}</p>
              </div>
              <button class="btn btn-small" onClick={() => setOpen(null)}>
                ← {copy.back}
              </button>
            </div>
            <div class="mini-field">
              <Mini
                key={`${skill.mech}-${run}`}
                p={skill.p ?? {}}
                onWin={() => {
                  sfx('win');
                  setWon((w) => (w.includes(skill.mech) ? w : [...w, skill.mech]));
                  window.setTimeout(() => setOpen(null), 500);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
