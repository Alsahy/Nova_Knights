/**
 * Nova the guide (D-039): a speech bubble that points at one part of the screen at a time.
 * "Next" steps explain; the other steps wait for the player to do the thing.
 */
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { hush, speak } from '../game/sfx';
import { copy } from '../../content/copy';
import { Avatar } from './Avatar';

export function Coach(props: {
  text: string;
  target: string | null; // CSS selector of the part to point at
  place?: string | null; // where the bubble sits when it must not cover the target (a selector)
  onNext: (() => void) | null; // null = the player has to act
  onSkip: () => void;
  n: number;
  total: number;
  voice?: boolean; // read the line out loud (D-055)
  clip?: string; // the recorded line to play (D-067)
}) {
  const [r, setR] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const measure = () =>
      setR(
        props.target
          ? (document.querySelector(props.target)?.getBoundingClientRect() ?? null)
          : null,
      );
    measure();
    const t = window.setInterval(measure, 250);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [props.target]);
  // Nova talks: her mouth moves while the line is being read (or for as long as reading it would take)
  const [talking, setTalking] = useState(false);
  useEffect(() => {
    setTalking(true);
    let live = true;
    const done = () => live && setTalking(false);
    let t = 0;
    if (props.voice) speak(props.text, done, props.clip);
    else t = window.setTimeout(done, Math.min(8000, 900 + props.text.length * 45));
    return () => {
      live = false;
      window.clearTimeout(t);
      if (props.voice) hush();
    };
  }, [props.text, props.voice]);
  // her hand points at the thing she is talking about
  const hand: Record<string, string> | null = r
    ? r.left > 90
      ? { left: `${r.left - 62}px`, top: `${r.top + r.height / 2 - 18}px`, '--rot': '0deg' }
      : r.top > 90
        ? { left: `${r.left + r.width / 2 - 26}px`, top: `${r.top - 58}px`, '--rot': '90deg' }
        : { left: `${r.right + 10}px`, top: `${r.top + r.height / 2 - 18}px`, '--rot': '180deg' }
    : null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(340, vw - 16);
  const style: Record<string, string> = { width: `${w}px` };
  const home = props.place ? document.querySelector(props.place)?.getBoundingClientRect() : null;
  if (home) {
    // park the bubble at the top of another area, so every button of the target stays free
    style['left'] = `${Math.max(8, Math.min(vw - w - 8, home.left + home.width / 2 - w / 2))}px`;
    style['top'] = `${home.top + 10}px`;
  } else if (r && r.height > vh * 0.45 && r.left > vw * 0.5) {
    // a tall column on the right (the toolbelt): stand beside it, never on top of its buttons
    style['left'] = `${Math.max(8, r.left - w - 16)}px`;
    style['top'] = `${r.top + 24}px`;
  } else if (!r || r.height > vh * 0.45) {
    // a big target (the base): sit in the middle of it
    const cx = r ? r.left + r.width / 2 : vw / 2;
    style['left'] = `${Math.max(8, Math.min(vw - w - 8, cx - w / 2))}px`;
    style['top'] = `${r ? r.top + r.height * 0.35 : vh * 0.35}px`;
  } else {
    style['left'] = `${Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2))}px`;
    if (r.top + r.height / 2 < vh / 2) style['top'] = `${r.bottom + 16}px`;
    else style['bottom'] = `${vh - r.top + 16}px`;
  }
  return (
    <div class="coach">
      {props.onNext && <div class="coach-block" />}
      {r && (
        <div
          class="coach-ring"
          style={{
            left: `${r.left - 6}px`,
            top: `${r.top - 6}px`,
            width: `${r.width + 12}px`,
            height: `${r.height + 12}px`,
          }}
        />
      )}
      {hand && (
        <svg
          class="coach-hand"
          style={hand}
          viewBox="0 0 52 36"
          width="52"
          height="36"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="6"
            width="22"
            height="26"
            rx="9"
            fill="#e2e8f0"
            stroke="#334155"
            stroke-width="2"
          />
          <rect
            x="18"
            y="10"
            width="32"
            height="11"
            rx="5.500"
            fill="#e2e8f0"
            stroke="#334155"
            stroke-width="2"
          />
          <path d="M12 22h10M12 27h8" stroke="#334155" stroke-width="2" stroke-linecap="round" />
        </svg>
      )}
      <div class="coach-bubble" style={style} role="dialog" aria-live="polite">
        <Avatar role="MGR" size={56} mood="cheer" talking={talking} />
        <div>
          <p>{props.text}</p>
          <div class="coach-actions">
            <button class="btn btn-small btn-ghost" onClick={props.onSkip}>
              {copy.coach.skip}
            </button>
            <small class="num">
              {props.n}/{props.total}
            </small>
            {props.onNext && (
              <button class="btn btn-small btn-go" onClick={props.onNext} autoFocus>
                {copy.coach.next} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
