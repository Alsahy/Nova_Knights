/**
 * Guided first sol (D-022): each step highlights one part of the screen. "Look" steps block everything
 * and show Next; "do" steps let the player click ONLY the highlighted part and move on when it's done.
 */
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import type { AstronautId, GameState } from '../../engine/types';
import { fill, ui } from '../text';
import { Avatar } from './Avatar';

export interface TutCtx {
  s: GameState;
  selected: string | null;
  current: AstronautId | null;
}

interface Step {
  id: string;
  target?: string;
  mode: 'look' | 'do';
  text: (c: TutCtx) => string;
  done?: (c: TutCtx) => boolean;
  skip?: (c: TutCtx) => boolean;
}

const free = (s: GameState) =>
  s.astronauts.filter((a) => a.sickBaySols === 0 && a.busyUntilSol < s.sol);
const name = (c: TutCtx) => c.s.astronauts.find((a) => a.id === c.current)?.callSign ?? '';

export const STEPS: Step[] = [
  { id: 'welcome', mode: 'look', text: () => ui.tut['welcome']! },
  { id: 'base', target: '.base-panel', mode: 'look', text: () => ui.tut['base']! },
  {
    id: 'stars',
    target: '.stars',
    mode: 'look',
    text: (c) => fill(ui.tut['stars']!, { goal: c.s.sp.goal }),
  },
  { id: 'crew', target: '.crew-panel', mode: 'look', text: () => ui.tut['crew']! },
  {
    id: 'pick',
    target: '.choices',
    mode: 'do',
    text: () => ui.tut['pickCard']!,
    done: (c) => c.selected !== null,
    skip: (c) => !c.s.pending,
  },
  {
    id: 'chips',
    target: '.choice.chosen',
    mode: 'look',
    text: () => ui.tut['chips']!,
    skip: (c) => !c.selected,
  },
  {
    id: 'doit',
    target: '.btn-main',
    mode: 'do',
    text: () => ui.tut['doIt']!,
    done: (c) => !c.s.pending,
    skip: (c) => !c.s.pending,
  },
  {
    id: 'job1',
    target: '.job-grid',
    mode: 'do',
    text: (c) => fill(ui.tut['firstJob']!, { name: name(c) }),
    done: (c) => free(c.s).some((a) => a.plannedTask),
    skip: (c) => c.s.phase !== 'tasks',
  },
  {
    id: 'jobs',
    target: '.center .holo',
    mode: 'do',
    text: () => ui.tut['moreJobs']!,
    done: (c) => free(c.s).every((a) => a.plannedTask),
    skip: (c) => c.s.phase !== 'tasks',
  },
  {
    id: 'start',
    target: '.btn-main',
    mode: 'do',
    text: () => ui.tut['startDay']!,
    done: (c) => c.s.phase !== 'tasks',
    skip: (c) => c.s.phase !== 'tasks',
  },
  {
    id: 'surprise',
    target: '.choices',
    mode: 'do',
    text: () => ui.tut['surprise']!,
    done: (c) => c.selected !== null,
    skip: (c) => !c.s.pending,
  },
  {
    id: 'doit2',
    target: '.btn-main',
    mode: 'do',
    text: () => ui.tut['doIt']!,
    done: (c) => !c.s.pending,
    skip: (c) => !c.s.pending,
  },
  {
    id: 'night',
    target: '.center .holo',
    mode: 'look',
    text: () => ui.tut['night']!,
    skip: (c) => c.s.phase !== 'night',
  },
  {
    id: 'next',
    target: '.btn-main',
    mode: 'do',
    text: () => ui.tut['nextSol']!,
    done: (c) => c.s.phase !== 'night',
    skip: (c) => c.s.phase !== 'night',
  },
];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function Tutorial({ ctx, onEnd }: { ctx: TutCtx; onEnd: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = STEPS[i];

  // Move on automatically: skipped steps, and "do" steps once the player did the thing.
  useEffect(() => {
    if (!step) {
      onEnd();
      return;
    }
    if (step.skip?.(ctx) || (step.mode === 'do' && step.done?.(ctx))) setI(i + 1);
  });

  // Only the highlighted part (and the bubble) can be used: other clicks and keys are cancelled.
  useEffect(() => {
    if (!step) return;
    const allowed = (t: EventTarget | null): boolean => {
      const el = t as Element | null;
      if (!el || !el.closest) return false;
      if (el.closest('.tut-bubble')) return true;
      if (step.mode === 'look' || !step.target) return false;
      const target = document.querySelector(step.target);
      return !!target && target.contains(el);
    };
    const stop = (e: Event) => {
      if (!allowed(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !allowed(document.activeElement)) stop(e);
    };
    document.addEventListener('click', stop, true);
    document.addEventListener('keydown', keys, true);
    return () => {
      document.removeEventListener('click', stop, true);
      document.removeEventListener('keydown', keys, true);
    };
  }, [i, step?.target, step?.mode]);

  // Follow the highlighted element (layout changes, scrolling, resizing).
  useLayoutEffect(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(step.target);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const tick = () => {
      const e = document.querySelector<HTMLElement>(step.target!);
      if (!e) return setRect(null);
      const r = e.getBoundingClientRect();
      setRect((old) =>
        old && old.x === r.left && old.y === r.top && old.w === r.width && old.h === r.height
          ? old
          : { x: r.left, y: r.top, w: r.width, h: r.height },
      );
    };
    tick();
    const t = window.setInterval(tick, 200);
    return () => window.clearInterval(t);
  }, [i, step?.target]);

  if (!step) return null;
  const pad = 8;
  const hole = rect
    ? { x: rect.x - pad, y: rect.y - pad, w: rect.w + 2 * pad, h: rect.h + 2 * pad }
    : null;
  const blockAll = !hole;
  const bubbleTop = !!hole && hole.y + hole.h / 2 > window.innerHeight / 2;
  return (
    <div class="tut" role="dialog" aria-modal="false" aria-label={ui.howToPlay}>
      {blockAll ? (
        <div class="tut-block" style={{ inset: 0 }} />
      ) : (
        <>
          <div
            class="tut-block"
            style={{ left: 0, top: 0, right: 0, height: `${Math.max(0, hole.y)}px` }}
          />
          <div
            class="tut-block"
            style={{ left: 0, top: `${hole.y + hole.h}px`, right: 0, bottom: 0 }}
          />
          <div
            class="tut-block"
            style={{
              left: 0,
              top: `${hole.y}px`,
              width: `${Math.max(0, hole.x)}px`,
              height: `${hole.h}px`,
            }}
          />
          <div
            class="tut-block"
            style={{
              left: `${hole.x + hole.w}px`,
              top: `${hole.y}px`,
              right: 0,
              height: `${hole.h}px`,
            }}
          />
        </>
      )}
      {hole && (
        <div
          class="tut-ring"
          style={{
            left: `${hole.x}px`,
            top: `${hole.y}px`,
            width: `${hole.w}px`,
            height: `${hole.h}px`,
          }}
        />
      )}
      <div class={`tut-bubble ${bubbleTop ? 'top' : ''}`} role="status" aria-live="polite">
        <Avatar role="MGR" size={46} />
        <p>{step.text(ctx)}</p>
        <div class="tut-actions">
          <button class="btn btn-small btn-ghost" onClick={onEnd}>
            {ui.tutSkip}
          </button>
          {step.mode === 'look' && (
            <button class="btn btn-small btn-go" onClick={() => setI(i + 1)} autoFocus>
              {ui.tutNext}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
