/**
 * The skill mini-games (D-032). Every tool a kid drags onto a problem opens one of these.
 * Each one is a 100 × 100 SVG play field driven by pointer events (finger or mouse) and, where it is natural, keys.
 * They only ever call onWin(); the alarm timer in Play.tsx decides when time is up.
 * UI-side randomness is fine here: the engine stays seeded and pure (CLAUDE.md §7).
 */
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { copy } from '../../content/copy';
import { sfx } from './sfx';

const T = copy.mini;

export type Mech =
  | 'crank'
  | 'mash'
  | 'slots'
  | 'pull'
  | 'track'
  | 'timing'
  | 'scratch'
  | 'balance'
  | 'sequence'
  | 'charge'
  | 'trace'
  | 'slice'
  | 'catch'
  | 'dodge'
  | 'wires'
  | 'sweep'
  | 'memory'
  | 'whack'
  | 'basket'
  | 'pairs'
  | 'rotate'
  | 'sort'
  | 'odd'
  | 'swap'
  | 'count'
  | 'reflex';

export type MiniParams = Record<string, number | string | boolean>;
export interface MiniProps {
  p: MiniParams;
  onWin: () => void;
}

interface Pt {
  x: number;
  y: number;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);

/** A state object that lives across frames, stepped ~60 times a second; each step re-renders. */
function useSim<T>(init: () => T, step?: (st: T, dt: number) => void): T {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = init();
  const stepRef = useRef(step);
  stepRef.current = step;
  const [, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepRef.current?.(ref.current!, dt);
      setN((n) => (n + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return ref.current;
}

function useWin(onWin: () => void): () => void {
  const done = useRef(false);
  return () => {
    if (done.current) return;
    done.current = true;
    onWin();
  };
}

function useKeys(down: (key: string) => void, up?: (key: string) => void): void {
  const d = useRef(down);
  const u = useRef(up);
  d.current = down;
  u.current = up;
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
      d.current(e.key);
    };
    const ku = (e: KeyboardEvent) => u.current?.(e.key);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);
}

interface Handlers {
  down?: (q: Pt, e: PointerEvent) => void;
  move?: (q: Pt, e: PointerEvent) => void;
  up?: (q: Pt, e: PointerEvent) => void;
}

/** The square play field. Pointer positions arrive in field units (0–100). */
function Field({ on, children }: { on: Handlers; children: ComponentChildren }) {
  const ref = useRef<SVGSVGElement>(null);
  const at = (e: PointerEvent): Pt => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  };
  return (
    <svg
      ref={ref}
      class="mini-svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label={T.label}
      onPointerDown={(e) => {
        e.preventDefault();
        try {
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
        } catch {
          /* older browsers: dragging still works inside the field */
        }
        on.down?.(at(e), e);
      }}
      onPointerMove={(e) => on.move?.(at(e), e)}
      onPointerUp={(e) => on.up?.(at(e), e)}
      onPointerCancel={(e) => on.up?.(at(e), e)}
    >
      {children}
    </svg>
  );
}

function Bar({ v }: { v: number }) {
  return (
    <g>
      <rect x="10" y="4" width="80" height="6" rx="3" class="m-track" />
      <rect x="10" y="4" width={80 * clamp(v, 0, 1)} height="6" rx="3" class="m-fill" />
    </g>
  );
}

// ───────────────────────── 1. crank ─────────────────────────
/** Spin in circles. `jam`: spinning too fast jams it for a second (thermostat). */
function Crank({ p, onWin }: MiniProps) {
  const turns = num(p['turns'], 3);
  const jam = !!p['jam'];
  const need = turns * 2 * Math.PI;
  const win = useWin(onWin);
  const st = useSim(
    () => ({ total: 0, last: null as number | null, jamT: 0, speed: 0 }),
    (s, dt) => {
      if (s.jamT > 0) s.jamT -= dt;
      s.speed *= Math.pow(0.9, dt * 60);
    },
  );
  const ang = (q: Pt) => Math.atan2(q.y - 62, q.x - 50);
  const v = Math.min(1, st.total / need);
  const hx = 50 + 20 * Math.cos(st.total);
  const hy = 62 + 20 * Math.sin(st.total);
  return (
    <Field
      on={{
        down: (q) => (st.last = ang(q)),
        move: (q) => {
          if (st.last === null) return;
          const a = ang(q);
          let d = a - st.last;
          if (d > Math.PI) d -= 2 * Math.PI;
          if (d < -Math.PI) d += 2 * Math.PI;
          st.last = a;
          if (st.jamT > 0) return;
          st.speed += Math.abs(d);
          if (jam && st.speed > 1.7) {
            st.jamT = 1;
            st.speed = 0;
            sfx('buzz');
            return;
          }
          st.total += Math.abs(d);
          if (st.total >= need) win();
        },
        up: () => (st.last = null),
      }}
    >
      <Bar v={v} />
      {jam ? (
        <g>
          <rect x="40" y="14" width="20" height="20" rx="4" class="m-panel" />
          <rect x="43" y={31 - 14 * v} width="14" height={14 * v} class="m-hot" />
        </g>
      ) : (
        <g>
          <rect x="30" y="14" width="40" height="22" rx="2" class="m-window" />
          <rect x="30" y="14" width="40" height={22 * v} class="m-steel" />
          <path d={`M30 ${14 + 22 * v}h40`} class="m-line" />
        </g>
      )}
      <circle cx="50" cy="62" r="24" class={`m-wheel ${st.jamT > 0 ? 'm-bad' : ''}`} />
      <circle cx="50" cy="62" r="4" class="m-steel" />
      <path d={`M50 62L${hx} ${hy}`} class="m-line thick" />
      <circle cx={hx} cy={hy} r="6" class="m-knob" />
      {st.jamT > 0 && (
        <text x="50" y="96" class="m-text m-warn">
          {T.slowDown}
        </text>
      )}
    </Field>
  );
}

// ───────────────────────── 2. mash ─────────────────────────
/** Tap fast. `decay`: the count drains, so keep going. `heavy`: a few big hits. */
function Mash({ p, onWin }: MiniProps) {
  const n = num(p['n'], 15);
  const decay = num(p['decay'], 0);
  const win = useWin(onWin);
  const st = useSim(
    () => ({ c: 0, hit: 0 }),
    (s, dt) => {
      s.c = Math.max(0, s.c - decay * dt);
      s.hit = Math.max(0, s.hit - dt * 5);
    },
  );
  const tap = () => {
    st.c += 1;
    st.hit = 1;
    sfx(p['heavy'] ? 'boom' : 'tap');
    if (st.c >= n) win();
  };
  useKeys((k) => (k === ' ' || k === 'Enter') && tap());
  const r = 26 - 4 * st.hit;
  const look = str(p['look'], 'button');
  return (
    <Field on={{ down: tap }}>
      <Bar v={st.c / n} />
      <g class={p['heavy'] && st.hit > 0.5 ? 'm-shake' : ''}>
        {look === 'fan' ? (
          <g transform={`rotate(${st.c * 47} 50 58)`}>
            <circle cx="50" cy="58" r="28" class="m-panel" />
            {[0, 90, 180, 270].map((a) => (
              <ellipse
                key={a}
                cx="50"
                cy="42"
                rx="7"
                ry="15"
                class="m-blade"
                transform={`rotate(${a} 50 58)`}
              />
            ))}
            <circle cx="50" cy="58" r="5" class="m-steel" />
          </g>
        ) : look === 'glass' ? (
          <g>
            <rect x="24" y="30" width="52" height="56" rx="4" class="m-window" />
            {st.c >= 1 && <path d="M50 58l-14-16M50 58l16-10M50 58l-6 20" class="m-crack" />}
            {st.c >= 2 && <path d="M50 58l20 14M50 58l-22 6M36 42l-8-2" class="m-crack" />}
            <circle cx="50" cy="58" r={8 + 3 * st.hit} class="m-knob" />
          </g>
        ) : (
          <g>
            <circle cx="50" cy="60" r="30" class="m-panel" />
            <circle cx="50" cy="58" r={r} class="m-knob" />
          </g>
        )}
      </g>
      <text x="50" y="97" class="m-text">
        {Math.max(0, Math.ceil(n - st.c))}
      </text>
    </Field>
  );
}

// ───────────────────────── shared little drawings ─────────────────────────
const CREW_COLORS = ['#5cb4e4', '#e2b046', '#e07a72', '#6cc08b'];
function Thing({ look, x, y, i = 0 }: { look: string; x: number; y: number; i?: number }) {
  switch (look) {
    case 'crew':
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle r="8" class="m-helmet" />
          <ellipse rx="5.6" ry="5" fill="#16263c" stroke={CREW_COLORS[i % 4]} stroke-width="1.2" />
          <circle cx="-2" cy="-0.5" r="0.9" fill="#fff" />
          <circle cx="2" cy="-0.5" r="0.9" fill="#fff" />
          <path d="M-2 2.2Q0 3.6 2 2.2" stroke="#fff" stroke-width="0.8" fill="none" />
        </g>
      );
    case 'rock':
      return (
        <path transform={`translate(${x} ${y})`} d="M-8 4-5-6 2-8 8-2 6 6-3 7z" class="m-gem" />
      );
    case 'soil':
      return <path transform={`translate(${x} ${y})`} d="M-8 6Q-9-6 0-7 9-6 8 6z" class="m-soil" />;
    case 'box':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-8" y="-7" width="16" height="14" rx="1.5" class="m-box" />
          <path d="M-8-1h16M0-7v14" class="m-line" />
        </g>
      );
    default: // water bag
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-9" y="-6.5" width="18" height="13" rx="5" class="m-bag" />
          <path d="M-4-1Q0-4 4-1" class="m-line" />
        </g>
      );
  }
}

// ───────────────────────── 3. slots ─────────────────────────
/** Drag things into place. `one`: one big target. `precise`: small targets. `drunk`: left/right swapped and wobbly. */
function Slots({ p, onWin }: MiniProps) {
  const n = num(p['n'], 3);
  const one = !!p['one'];
  const precise = !!p['precise'];
  const drunk = !!p['drunk'];
  const look = str(p['look'], 'bag');
  const win = useWin(onWin);
  const st = useSim(
    () => {
      const xs = Array.from({ length: n }, (_, i) => 50 + (i - (n - 1) / 2) * (n > 3 ? 22 : 27));
      const homes = [...xs].sort(() => Math.random() - 0.5);
      return {
        t: 0,
        targets: one ? [{ x: 50, y: 30 }] : xs.map((x) => ({ x, y: 30 })),
        items: homes.map((x) => ({ x, y: 80, hx: x, hy: 80, placed: false, slot: -1 })),
        drag: -1,
        start: { x: 0, y: 0 },
      };
    },
    (s, dt) => {
      s.t += dt;
      for (const [i, it] of s.items.entries())
        if (!it.placed && i !== s.drag) {
          it.x += (it.hx - it.x) * Math.min(1, dt * 12);
          it.y += (it.hy - it.y) * Math.min(1, dt * 12);
        }
    },
  );
  const tol = one ? 17 : precise ? 6.5 : 12;
  return (
    <Field
      on={{
        down: (q) => {
          let best = -1;
          let bd = 15;
          st.items.forEach((it, i) => {
            const d = dist(q, it);
            if (!it.placed && d < bd) {
              bd = d;
              best = i;
            }
          });
          st.drag = best;
          st.start = q;
        },
        move: (q) => {
          const it = st.items[st.drag];
          if (!it) return;
          if (drunk) {
            it.x = clamp(it.hx - (q.x - st.start.x) + 5 * Math.sin(st.t * 6), 6, 94);
            it.y = clamp(it.hy + (q.y - st.start.y) + 4 * Math.cos(st.t * 5), 6, 94);
          } else {
            it.x = clamp(q.x, 4, 96);
            it.y = clamp(q.y, 4, 96);
          }
        },
        up: () => {
          const it = st.items[st.drag];
          st.drag = -1;
          if (!it) return;
          const taken = new Set(st.items.filter((x) => x.placed).map((x) => x.slot));
          const ti = st.targets.findIndex((t, i) => (one || !taken.has(i)) && dist(it, t) < tol);
          if (ti < 0) {
            if (st.targets.some((t) => dist(it, t) < 18)) sfx('buzz');
            return;
          }
          const t = st.targets[ti]!;
          const k = st.items.filter((x) => x.placed).length;
          it.placed = true;
          it.slot = ti;
          it.x = one ? t.x + (k - (n - 1) / 2) * (n > 1 ? 9 : 0) : t.x;
          it.y = one ? t.y - 2 : t.y;
          sfx('good');
          if (st.items.every((x) => x.placed)) win();
        },
      }}
    >
      <Bar v={st.items.filter((x) => x.placed).length / n} />
      {st.targets.map((t, i) =>
        one ? (
          <g key={i}>
            <rect x={t.x - 26} y={t.y - 14} width="52" height="26" rx="8" class="m-target" />
            <rect x={t.x - 26} y={t.y + 6} width="52" height="8" rx="3" class="m-target-base" />
          </g>
        ) : (
          <g key={i}>
            {precise && (
              <rect x={t.x - 13} y={t.y - 10.5} width="26" height="21" rx="7" class="m-danger" />
            )}
            <rect x={t.x - 10} y={t.y - 7.5} width="20" height="15" rx="5" class="m-target" />
          </g>
        ),
      )}
      {st.items.map((it, i) => (
        <Thing key={i} look={look} x={it.x} y={it.y} i={i} />
      ))}
      {drunk && (
        <text x="50" y="97" class="m-text m-warn">
          {T.dizzy}
        </text>
      )}
    </Field>
  );
}

// ───────────────────────── 4. pull ─────────────────────────
/** A heavy bolt or plug: n long pulls to the right. */
function Pull({ p, onWin }: MiniProps) {
  const n = num(p['n'], 3);
  const win = useWin(onWin);
  const st = useSim(
    () => ({ step: 0, off: 0, sx: null as number | null }),
    (s, dt) => {
      if (s.sx === null) s.off *= Math.pow(0.02, dt);
    },
  );
  const bolt = (st.step + st.off / 44) / n;
  return (
    <Field
      on={{
        down: (q) => (st.sx = q.x),
        move: (q) => {
          if (st.sx === null) return;
          st.off = clamp((q.x - st.sx) * 0.75, 0, 44);
          if (st.off >= 44) {
            st.step += 1;
            st.off = 0;
            st.sx = null;
            sfx('boom');
            if (st.step >= n) win();
          }
        },
        up: () => (st.sx = null),
      }}
    >
      <Bar v={st.step / n} />
      <rect x="10" y="26" width="80" height="20" rx="3" class="m-panel" />
      <rect x="12" y="30" width={14 + 62 * Math.min(1, bolt)} height="12" rx="2" class="m-steel" />
      <rect x="84" y="24" width="8" height="24" rx="2" class="m-target-base" />
      <path d="M22 70h56" class="m-line dashed" />
      <path d="M70 64l8 6-8 6" class="m-line" />
      <g transform={`translate(${24 + st.off} 70)`}>
        <rect x="-10" y="-10" width="20" height="20" rx="6" class="m-knob" />
        <path d="M-4-4v8M0-4v8M4-4v8" class="m-line" />
      </g>
      <text x="50" y="96" class="m-text">
        {n - st.step}
      </text>
    </Field>
  );
}

// ───────────────────────── 5. track ─────────────────────────
/** Keep the beam on a moving target for `secs` seconds. */
function Track({ p, onWin }: MiniProps) {
  const secs = num(p['secs'], 1.5);
  const speed = num(p['speed'], 0.65); // gentle enough for a 7-year-old with a mouse
  const look = str(p['look'], 'hose');
  const win = useWin(onWin);
  const st = useSim(
    () => ({
      t: rnd(0, 6),
      held: 0,
      on: false,
      q: { x: 50, y: 80 },
      tx: 50,
      ty: 50,
      hit: false,
    }),
    (s, dt) => {
      s.t += dt * speed;
      s.tx = 50 + 32 * Math.sin(s.t * 1.3) * Math.cos(s.t * 0.4);
      s.ty = 46 + 22 * Math.sin(s.t * 1.9 + 1);
      s.hit = s.on && dist(s.q, { x: s.tx, y: s.ty }) < 15;
      s.held = s.hit ? s.held + dt : Math.max(0, s.held - dt * 0.3);
      if (s.held >= secs) win();
    },
  );
  const beam =
    look === 'lamp' ? (
      <path d={`M50 100L${st.q.x - 11} ${st.q.y}L${st.q.x + 11} ${st.q.y}z`} class="m-lamp" />
    ) : look === 'hose' ? (
      <path d={`M50 100Q${st.q.x} ${(st.q.y + 100) / 2 + 8} ${st.q.x} ${st.q.y}`} class="m-water" />
    ) : (
      <path d={`M50 100L${st.q.x} ${st.q.y}`} class="m-line dashed" />
    );
  return (
    <Field
      on={{
        down: (q) => {
          st.on = true;
          st.q = q;
        },
        move: (q, e) => {
          if (e.pointerType === 'mouse') st.on = true;
          if (st.on) st.q = q;
        },
        up: (_q, e) => {
          if (e.pointerType !== 'mouse') st.on = false;
        },
      }}
    >
      <Bar v={st.held / secs} />
      {look === 'lamp' ? (
        <g transform={`translate(${st.tx} ${st.ty})`}>
          <path
            d={`M0 8V${-2 - 8 * (st.held / secs)}`}
            stroke="#6cc08b"
            stroke-width="2.4"
            fill="none"
          />
          <ellipse cx="-5" cy={-2 - 6 * (st.held / secs)} rx="6" ry="3" class="m-leaf" />
          <ellipse cx="5" cy={-4 - 8 * (st.held / secs)} rx="6" ry="3" class="m-leaf" />
          <rect x="-7" y="8" width="14" height="6" rx="2" class="m-soil" />
        </g>
      ) : look === 'earth' ? (
        <g transform={`translate(${st.tx} ${st.ty})`}>
          <circle r="9" fill="#3b82f6" stroke="#cfe9f8" stroke-width="1" />
          <path d="M-5-3q3-3 6 0t-2 5-5-1zM3 3q3-1 4 2-2 3-4 1z" fill="#6cc08b" />
        </g>
      ) : look === 'cloud' ? (
        <g transform={`translate(${st.tx} ${st.ty})`} class="m-cloud">
          <circle cx="-7" cy="2" r="7" />
          <circle cx="2" cy="-3" r="9" />
          <circle cx="10" cy="3" r="6" />
        </g>
      ) : (
        <g transform={`translate(${st.tx} ${st.ty})`}>
          <circle r={11 - 5 * (st.held / secs)} class="m-hot pulse" />
          <circle r="4" fill="#ffe08a" />
        </g>
      )}
      {beam}
      <circle cx={st.q.x} cy={st.q.y} r="6" class={`m-ring ${st.hit ? 'ok' : ''}`} />
    </Field>
  );
}

// ───────────────────────── 6. timing ─────────────────────────
/** A marker sweeps back and forth: tap when it is in the green. Looks: bar · ring · hands. */
function Timing({ p, onWin }: MiniProps) {
  const hits = num(p['hits'], 1);
  const zone = num(p['zone'], 0.22);
  const look = str(p['look'], 'bar');
  const win = useWin(onWin);
  const st = useSim(
    () => ({ t: rnd(0, 1), got: 0, miss: 0, speed: num(p['speed'], 1) }),
    (s, dt) => {
      s.t += dt * s.speed * 0.8;
      s.miss = Math.max(0, s.miss - dt * 3);
    },
  );
  const u = st.t % 2;
  const pos = u < 1 ? u : 2 - u;
  const inZone = Math.abs(pos - 0.5) < zone / 2;
  const tap = () => {
    if (inZone) {
      st.got += 1;
      sfx('good');
      st.speed *= 1.15;
      if (st.got >= hits) win();
    } else {
      st.miss = 1;
      sfx('buzz');
    }
  };
  useKeys((k) => (k === ' ' || k === 'Enter') && tap());
  return (
    <Field on={{ down: tap }}>
      <Bar v={st.got / hits} />
      <g class={st.miss > 0.4 ? 'm-shake' : ''}>
        {look === 'ring' ? (
          <g>
            <rect x="18" y="22" width="64" height="64" rx="6" class="m-window" />
            <circle cx="50" cy="54" r="18" class="m-zone-ring" />
            <circle cx="50" cy="54" r={4 + 28 * pos} class={`m-ring big ${inZone ? 'ok' : ''}`} />
          </g>
        ) : look === 'hands' ? (
          <g>
            <rect x={50 - 40 * zone} y="38" width={80 * zone} height="34" rx="6" class="m-zone" />
            <g transform={`translate(${10 + 80 * pos} 55)`}>
              <rect x="-7" y="-10" width="14" height="20" rx="6" fill="#e2b046" />
            </g>
            <g transform={`translate(${90 - 80 * pos} 55)`}>
              <rect x="-7" y="-10" width="14" height="20" rx="6" fill="#6cc08b" />
            </g>
          </g>
        ) : (
          <g>
            <rect x="10" y="48" width="80" height="16" rx="8" class="m-panel" />
            <rect x={50 - 40 * zone} y="48" width={80 * zone} height="16" rx="4" class="m-zone" />
            <rect x={10 + 80 * pos - 2} y="42" width="4" height="28" rx="2" class="m-marker" />
          </g>
        )}
      </g>
      <text x="50" y="96" class="m-text">
        {T.tap}
      </text>
    </Field>
  );
}

// ───────────────────────── 7. scratch ─────────────────────────
/** Rub the dust off, like a scratch card. */
function Scratch({ p, onWin }: MiniProps) {
  const win = useWin(onWin);
  const COLS = 10;
  const ROWS = 8;
  const st = useSim(() => ({
    cells: Array.from({ length: COLS * ROWS }, () => true),
    down: false,
    left: COLS * ROWS,
  }));
  const rub = (q: Pt) => {
    for (let i = 0; i < st.cells.length; i++) {
      if (!st.cells[i]) continue;
      const cx = 14 + (i % COLS) * 8;
      const cy = 24 + Math.floor(i / COLS) * 8;
      if (Math.hypot(q.x - cx, q.y - cy) < 9) {
        st.cells[i] = false;
        st.left -= 1;
      }
    }
    if (st.left <= 2) win();
  };
  const rock = p['look'] === 'rock';
  return (
    <Field
      on={{
        down: (q) => {
          st.down = true;
          rub(q);
        },
        move: (q, e) => (st.down || e.pointerType === 'mouse') && e.buttons !== 0 && rub(q),
        up: () => (st.down = false),
      }}
    >
      <Bar v={1 - st.left / st.cells.length} />
      {rock ? (
        <path d="M14 84 22 34l30-12 30 16 6 46z" class="m-gem" />
      ) : (
        <g>
          <rect x="10" y="20" width="80" height="64" rx="3" class="m-solar" />
          <path d="M10 36h80M10 52h80M10 68h80M30 20v64M50 20v64M70 20v64" class="m-line" />
        </g>
      )}
      {st.cells.map(
        (c, i) =>
          c && (
            <rect
              key={i}
              x={10 + (i % COLS) * 8}
              y={20 + Math.floor(i / COLS) * 8}
              width="8.2"
              height="8.2"
              class={`m-dust d${i % 3}`}
            />
          ),
      )}
    </Field>
  );
}

// ───────────────────────── 8. balance ─────────────────────────
/** Keep the bubble in the middle: drag left/right, use the arrow keys, or tilt the phone. */
function Balance({ p, onWin }: MiniProps) {
  const secs = num(p['secs'], 2);
  const win = useWin(onWin);
  const st = useSim(
    () => ({ x: rnd(-25, 25), v: 0, f: 0, ft: 0, c: 0, key: 0, tilt: 0, held: 0 }),
    (s, dt) => {
      s.ft -= dt;
      if (s.ft <= 0) {
        s.f = rnd(-30, 30);
        s.ft = rnd(0.5, 1.1);
      }
      const a = s.f + s.c + s.key + s.tilt - 2.2 * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
      if (Math.abs(s.x) > 40) {
        s.x = 40 * Math.sign(s.x);
        s.v *= -0.4;
      }
      s.held = Math.abs(s.x) < 11 ? s.held + dt : Math.max(0, s.held - dt * 0.6);
      if (s.held >= secs) win();
    },
  );
  useKeys(
    (k) => (st.key = k === 'ArrowLeft' ? -90 : k === 'ArrowRight' ? 90 : st.key),
    (k) => (k === 'ArrowLeft' || k === 'ArrowRight') && (st.key = 0),
  );
  useEffect(() => {
    const h = (e: DeviceOrientationEvent) => (st.tilt = clamp((e.gamma ?? 0) / 25, -1, 1) * 90);
    window.addEventListener('deviceorientation', h);
    return () => window.removeEventListener('deviceorientation', h);
  }, []);
  const steer = (q: Pt) => (st.c = clamp((q.x - 50) / 40, -1, 1) * 95);
  return (
    <Field
      on={{
        down: steer,
        move: (q, e) => e.buttons !== 0 && steer(q),
        up: () => (st.c = 0),
      }}
    >
      <Bar v={st.held / secs} />
      <g transform={`rotate(${st.x * 0.25} 50 40)`}>
        <rect x="16" y="30" width="68" height="10" rx="2" class="m-solar" />
        <path d="M50 40v14" class="m-line thick" />
      </g>
      <rect x="6" y="62" width="88" height="16" rx="8" class="m-panel" />
      <rect x="39" y="62" width="22" height="16" rx="4" class="m-zone" />
      <circle cx={50 + st.x} cy="70" r="6.5" class="m-bubble" />
      <path d="M14 90l-6-4v8zM86 90l6-4v8z" class="m-arrow" />
      <text x="50" y="94" class="m-text small">
        {T.push}
      </text>
    </Field>
  );
}

// ───────────────────────── 9. sequence ─────────────────────────
/** Tap things in order: numbered bolts, or a door code on a keypad. */
function Sequence({ p, onWin }: MiniProps) {
  const keypad = p['look'] === 'keypad';
  const n = num(p['n'], 4);
  const win = useWin(onWin);
  const st = useSim(
    () => {
      const spots: Pt[] = [];
      while (spots.length < n) {
        const c = { x: rnd(16, 84), y: rnd(26, 84) };
        if (spots.every((s) => dist(s, c) > 22)) spots.push(c);
      }
      return {
        spots,
        code: Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 9)),
        next: 0,
        bad: 0,
      };
    },
    (s, dt) => (s.bad = Math.max(0, s.bad - dt * 3)),
  );
  const total = keypad ? 4 : n;
  const press = (v: number) => {
    const want = keypad ? st.code[st.next] : st.next + 1;
    if (v === want) {
      st.next += 1;
      sfx('good');
      if (st.next >= total) win();
    } else {
      st.bad = 1;
      sfx('buzz');
      if (keypad) st.next = 0;
    }
  };
  useKeys((k) => /^[1-9]$/.test(k) && press(Number(k)));
  const key = (d: number): Pt => ({
    x: 30 + ((d - 1) % 3) * 20,
    y: 42 + Math.floor((d - 1) / 3) * 18,
  });
  return (
    <Field
      on={{
        down: (q) => {
          if (keypad) {
            for (let d = 1; d <= 9; d++) if (dist(q, key(d)) < 9) return press(d);
          } else {
            const i = st.spots.findIndex((s) => dist(q, s) < 11);
            if (i >= 0 && i >= st.next) press(i + 1);
          }
        },
      }}
    >
      <Bar v={st.next / total} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        {keypad ? (
          <g>
            <rect x="22" y="14" width="56" height="15" rx="3" class="m-window" />
            {st.code.map((d, i) => (
              <text
                key={i}
                x={32 + i * 12}
                y="25.5"
                class={`m-text code ${i < st.next ? 'ok' : ''}`}
              >
                {d}
              </text>
            ))}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <g key={d}>
                <rect
                  x={key(d).x - 8}
                  y={key(d).y - 7}
                  width="16"
                  height="14"
                  rx="3"
                  class="m-key"
                />
                <text x={key(d).x} y={key(d).y + 3} class="m-text small">
                  {d}
                </text>
              </g>
            ))}
          </g>
        ) : (
          st.spots.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={i < st.next ? 0.35 : 1}>
              <path
                d="M-9 0-4.5-8h9L9 0 4.5 8h-9z"
                class={i < st.next ? 'm-zone' : i === st.next ? 'm-knob' : 'm-steel'}
              />
              <text y="3.2" class="m-text small dark">
                {i + 1}
              </text>
            </g>
          ))
        )}
      </g>
    </Field>
  );
}

// ───────────────────────── 10. charge ─────────────────────────
/** Hold to fill, let go inside the green. Looks: balloon · jet · battery. */
function Charge({ p, onWin }: MiniProps) {
  const look = str(p['look'], 'balloon');
  const win = useWin(onWin);
  const st = useSim(
    () => ({ lo: rnd(0.5, 0.68), w: 0.2, level: 0, hold: false, bad: 0 }),
    (s, dt) => {
      s.bad = Math.max(0, s.bad - dt * 3);
      if (!s.hold) return;
      s.level += dt * 0.75;
      if (s.level >= 1) {
        s.level = 0;
        s.hold = false;
        s.bad = 1;
        sfx('pop');
      }
    },
  );
  const press = () => {
    st.hold = true;
  };
  const release = () => {
    if (!st.hold) return;
    st.hold = false;
    if (st.level >= st.lo && st.level <= st.lo + st.w) win();
    else {
      st.level = 0;
      st.bad = 1;
      sfx('buzz');
    }
  };
  useKeys(
    (k) => k === ' ' && press(),
    (k) => k === ' ' && release(),
  );
  const gy = (v: number) => 90 - 70 * v;
  return (
    <Field on={{ down: press, up: release }}>
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        <rect x="78" y="20" width="12" height="70" rx="4" class="m-panel" />
        <rect x="78" y={gy(st.lo + st.w)} width="12" height={70 * st.w} class="m-zone" />
        <rect x="80" y={gy(st.level)} width="8" height={70 * st.level} rx="2" class="m-fill" />
        {look === 'jet' ? (
          <g>
            <path d="M6 90h30M52 90h20" class="m-line thick" />
            <path d="M36 90v8h16v-8" class="m-danger" />
            <path transform="translate(62 82)" d="M-6 4-3-5 3-6 6 0 4 5z" class="m-gem" />
            <g
              transform={`translate(${16 + 46 * st.level} ${84 - 40 * Math.sin(Math.PI * Math.min(1, st.level / (st.lo + st.w / 2)) * 0.5)})`}
            >
              <Thing look="crew" x={0} y={0} i={3} />
              {st.hold && <path d="M-3 8l3 7 3-7z" class="m-hot" />}
            </g>
          </g>
        ) : look === 'battery' ? (
          <g>
            <rect x="18" y="34" width="44" height="50" rx="5" class="m-panel" />
            <rect x="32" y="28" width="16" height="6" rx="2" class="m-steel" />
            <rect
              x="22"
              y={80 - 42 * st.level}
              width="36"
              height={42 * st.level}
              rx="3"
              class="m-fill"
            />
          </g>
        ) : (
          <g>
            <path d="M40 90V72" class="m-line" />
            <circle cx="40" cy={66 - 16 * st.level} r={6 + 22 * st.level} class="m-bubble" />
          </g>
        )}
      </g>
      <text x="40" y="12" class="m-text small">
        {T.hold}
      </text>
    </Field>
  );
}

// ───────────────────────── 11. trace ─────────────────────────
const PATHS: Record<string, Pt[]> = {
  weld: [
    { x: 10, y: 72 },
    { x: 28, y: 32 },
    { x: 46, y: 72 },
    { x: 64, y: 32 },
    { x: 90, y: 66 },
  ],
  maze: [
    { x: 12, y: 84 },
    { x: 12, y: 52 },
    { x: 40, y: 52 },
    { x: 40, y: 24 },
    { x: 68, y: 24 },
    { x: 68, y: 66 },
    { x: 88, y: 66 },
  ],
  wrap: [
    { x: 8, y: 54 },
    { x: 22, y: 40 },
    { x: 36, y: 62 },
    { x: 50, y: 40 },
    { x: 64, y: 62 },
    { x: 78, y: 40 },
    { x: 92, y: 54 },
  ],
};
function sample(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const steps = Math.max(1, Math.round(dist(a, b) / 1.5));
    for (let k = 0; k < steps; k++)
      out.push({ x: a.x + ((b.x - a.x) * k) / steps, y: a.y + ((b.y - a.y) * k) / steps });
  }
  out.push(pts[pts.length - 1]!);
  return out;
}
/** Follow a line with your finger without leaving it. Looks: weld · maze · wrap. */
function Trace({ p, onWin }: MiniProps) {
  const look = str(p['look'], 'weld');
  const win = useWin(onWin);
  const st = useSim(
    () => ({ s: sample(PATHS[look] ?? PATHS['weld']!), idx: 0, on: false, bad: 0 }),
    (s, dt) => (s.bad = Math.max(0, s.bad - dt * 3)),
  );
  const d = (pts: Pt[]) =>
    pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('');
  const cur = st.s[st.idx]!;
  const end = st.s[st.s.length - 1]!;
  return (
    <Field
      on={{
        down: (q) => (st.on = dist(q, cur) < 14),
        move: (q) => {
          if (!st.on) return;
          for (let j = Math.min(st.s.length - 1, st.idx + 9); j > st.idx; j--)
            if (dist(q, st.s[j]!) < 8) {
              st.idx = j;
              break;
            }
          if (dist(q, st.s[st.idx]!) > 17) {
            st.on = false;
            st.idx = Math.max(0, st.idx - 14);
            st.bad = 1;
            sfx('buzz');
          }
          if (st.idx >= st.s.length - 1) win();
        },
        up: () => (st.on = false),
      }}
    >
      <Bar v={st.idx / (st.s.length - 1)} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        <path d={d(st.s)} class="m-path" />
        <path d={d(st.s.slice(0, st.idx + 1))} class="m-path done" />
        <circle cx={end.x} cy={end.y} r="7" class="m-zone" />
        <circle cx={cur.x} cy={cur.y} r="6.5" class={look === 'weld' ? 'm-hot pulse' : 'm-knob'} />
      </g>
      <text x="50" y="97" class="m-text small">
        {st.on ? T.onLine : T.startDot}
      </text>
    </Field>
  );
}

// ───────────────────────── 12. slice ─────────────────────────
/** A potato flies through the air: swipe across it. */
function Slice({ p, onWin }: MiniProps) {
  const n = num(p['n'], 2);
  const win = useWin(onWin);
  const st = useSim(
    () => ({ u: 0, dir: 1, cut: 0, got: 0, last: null as Pt | null, trail: [] as Pt[] }),
    (s, dt) => {
      if (s.cut > 0) {
        s.cut -= dt * 2;
        if (s.cut <= 0) {
          s.u = 0;
          s.dir = -s.dir;
        }
        return;
      }
      s.u += dt / 1.6;
      if (s.u > 1) {
        s.u = 0;
        s.dir = -s.dir;
      }
    },
  );
  const px = st.dir > 0 ? 10 + 80 * st.u : 90 - 80 * st.u;
  const py = 84 - 240 * st.u * (1 - st.u);
  return (
    <Field
      on={{
        down: (q) => {
          st.last = q;
          st.trail = [q];
        },
        move: (q) => {
          if (!st.last) return;
          const a = st.last;
          st.last = q;
          st.trail = [...st.trail.slice(-6), q];
          const len = dist(a, q);
          if (len < 1.5 || st.cut > 0) return;
          const t = clamp(
            ((px - a.x) * (q.x - a.x) + (py - a.y) * (q.y - a.y)) / (len * len),
            0,
            1,
          );
          const near = dist(
            { x: a.x + t * (q.x - a.x), y: a.y + t * (q.y - a.y) },
            { x: px, y: py },
          );
          if (near < 9) {
            st.cut = 1;
            st.got += 1;
            sfx('whoosh');
            sfx('pop');
            if (st.got >= n) win();
          }
        },
        up: () => {
          st.last = null;
          st.trail = [];
        },
      }}
    >
      <Bar v={st.got / n} />
      {st.cut > 0 ? (
        <g>
          <path
            transform={`translate(${px - 10 * (1 - st.cut)} ${py}) rotate(-20)`}
            d="M0-7A9 7 0 0 0 0 7z"
            class="m-potato"
          />
          <path
            transform={`translate(${px + 10 * (1 - st.cut)} ${py}) rotate(20)`}
            d="M0-7A9 7 0 0 1 0 7z"
            class="m-potato"
          />
        </g>
      ) : (
        <ellipse
          cx={px}
          cy={py}
          rx="10"
          ry="7.5"
          class="m-potato"
          transform={`rotate(${st.u * 300} ${px} ${py})`}
        />
      )}
      {st.trail.length > 1 && (
        <path
          d={st.trail.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join('')}
          class="m-swipe"
        />
      )}
      <text x="50" y="97" class="m-text small">
        {T.swipe}
      </text>
    </Field>
  );
}

// ───────────────────────── 13. catch ─────────────────────────
/** A hopping alarm clock: grab it and drag it off the edge. */
function Catch({ onWin }: MiniProps) {
  const win = useWin(onWin);
  const st = useSim(
    () => ({ x: 50, y: 50, gx: 50, gy: 50, hop: 0.6, held: false, t: 0 }),
    (s, dt) => {
      s.t += dt;
      if (s.held) return;
      s.hop -= dt;
      if (s.hop <= 0) {
        s.gx = rnd(18, 82);
        s.gy = rnd(24, 80);
        s.hop = 0.85;
      }
      s.x += (s.gx - s.x) * Math.min(1, dt * 9);
      s.y += (s.gy - s.y) * Math.min(1, dt * 9);
    },
  );
  return (
    <Field
      on={{
        down: (q) => {
          if (dist(q, st) < 15) {
            st.held = true;
            sfx('good');
          }
        },
        move: (q) => {
          if (!st.held) return;
          st.x = q.x;
          st.y = q.y;
          if (q.x < 7 || q.x > 93 || q.y < 9 || q.y > 89) win();
        },
        up: () => {
          st.held = false;
          st.gx = st.x;
          st.gy = st.y;
        },
      }}
    >
      <rect x="5" y="7" width="90" height="84" rx="6" class="m-edge" />
      <g
        transform={`translate(${st.x} ${st.y - (st.held ? 0 : 3 * Math.abs(Math.sin(st.t * 9)))})`}
      >
        <circle cx="-7" cy="-9" r="4" class="m-knob" />
        <circle cx="7" cy="-9" r="4" class="m-knob" />
        <circle r="10" class="m-clock" />
        <path d="M0-5v5l4 2" class="m-line dark" />
        <path d="M-6 9l-2 4M6 9l2 4" class="m-line" />
      </g>
      <text x="50" y="97" class="m-text small">
        {st.held ? T.dragOff : T.catchIt}
      </text>
    </Field>
  );
}

// ───────────────────────── 14. dodge ─────────────────────────
/** Three lanes: tap left or right (or use the arrow keys) to get past the rocks. */
function Dodge({ p, onWin }: MiniProps) {
  const n = num(p['n'], 3);
  const look = str(p['look'], 'robot');
  const win = useWin(onWin);
  const LX = [25, 50, 75];
  const st = useSim(
    () => ({ lane: 1, ol: Math.floor(Math.random() * 3), oy: -10, passed: 0, bump: 0, x: 50 }),
    (s, dt) => {
      s.bump = Math.max(0, s.bump - dt * 3);
      s.x += (LX[s.lane]! - s.x) * Math.min(1, dt * 14);
      s.oy += dt * (62 + 8 * s.passed);
      if (s.oy > 72 && s.oy < 90 && s.ol === s.lane) {
        s.bump = 1;
        sfx('buzz');
        s.oy = -10;
        s.ol = Math.floor(Math.random() * 3);
      } else if (s.oy > 100) {
        s.passed += 1;
        sfx('good');
        s.oy = -10;
        s.ol = Math.random() < 0.6 ? s.lane : Math.floor(Math.random() * 3);
        if (s.passed >= n) win();
      }
    },
  );
  const go = (d: number) => {
    st.lane = clamp(st.lane + d, 0, 2);
    sfx('tap');
  };
  useKeys((k) => (k === 'ArrowLeft' ? go(-1) : k === 'ArrowRight' ? go(1) : undefined));
  return (
    <Field on={{ down: (q) => go(q.x < st.x ? -1 : 1) }}>
      <Bar v={st.passed / n} />
      <path d="M37.5 14v82M62.5 14v82" class="m-line dashed" />
      <path
        transform={`translate(${LX[st.ol]} ${st.oy})`}
        d="M-9 6-6-6 3-9 10-1 7 7-2 8z"
        class="m-rockgrey"
      />
      <g transform={`translate(${st.x} 82)`}>
        <g class={st.bump > 0.4 ? 'm-shake' : ''}>
          {look === 'robot' ? (
            <g>
              <rect x="-8" y="-6" width="16" height="11" rx="2" class="m-steel" />
              <circle cx="-5" cy="7" r="3" class="m-knob" />
              <circle cx="5" cy="7" r="3" class="m-knob" />
              <path d="M0-6v-5" class="m-line" />
              <circle cy="-12" r="1.6" class="m-hot" />
            </g>
          ) : (
            <Thing look="crew" x={0} y={0} i={look === 'buddy' ? 2 : 3} />
          )}
        </g>
      </g>
      <path d="M8 90l-5 4 5 4zM92 90l5 4-5 4z" class="m-arrow" />
    </Field>
  );
}

// ───────────────────────── 15. wires ─────────────────────────
const WIRE = [
  { c: '#e07a72', shape: 'M-4-4h8v8h-8z' },
  { c: '#5cb4e4', shape: 'M0-5a5 5 0 1 0 0 10 5 5 0 1 0 0-10' },
  { c: '#f2cf5b', shape: 'M0-5.5 5.5 4.5h-11z' },
];
/** Join each wire to the socket with the same colour and shape. */
function Wires({ p, onWin }: MiniProps) {
  const n = Math.min(3, num(p['n'], 3));
  const win = useWin(onWin);
  const st = useSim(() => ({
    right: [0, 1, 2].slice(0, n).sort(() => Math.random() - 0.5),
    done: [] as number[],
    drag: -1,
    q: { x: 0, y: 0 },
  }));
  const ly = (i: number) => 30 + i * 24;
  const rIndex = (id: number) => st.right.indexOf(id);
  return (
    <Field
      on={{
        down: (q) => {
          const i = [0, 1, 2].slice(0, n).find((k) => dist(q, { x: 16, y: ly(k) }) < 12);
          if (i !== undefined && !st.done.includes(i)) {
            st.drag = i;
            st.q = q;
          }
        },
        move: (q) => st.drag >= 0 && (st.q = q),
        up: (q) => {
          const i = st.drag;
          st.drag = -1;
          if (i < 0) return;
          const hit = st.right.findIndex((_, k) => dist(q, { x: 84, y: ly(k) }) < 12);
          if (hit < 0) return;
          if (st.right[hit] === i) {
            st.done.push(i);
            sfx('good');
            if (st.done.length >= n) win();
          } else sfx('buzz');
        },
      }}
    >
      <Bar v={st.done.length / n} />
      {st.done.map((i) => (
        <path
          key={i}
          d={`M16 ${ly(i)}C50 ${ly(i)} 50 ${ly(rIndex(i))} 84 ${ly(rIndex(i))}`}
          stroke={WIRE[i]!.c}
          class="m-wire"
        />
      ))}
      {st.drag >= 0 && (
        <path
          d={`M16 ${ly(st.drag)}L${st.q.x} ${st.q.y}`}
          stroke={WIRE[st.drag]!.c}
          class="m-wire"
        />
      )}
      {[0, 1, 2].slice(0, n).map((i) => (
        <g key={i}>
          <g transform={`translate(16 ${ly(i)})`}>
            <circle r="9" class="m-panel" />
            <path d={WIRE[i]!.shape} fill={WIRE[i]!.c} />
          </g>
          <g transform={`translate(84 ${ly(i)})`}>
            <circle r="9" class="m-panel" />
            <path d={WIRE[st.right[i]!]!.shape} fill={WIRE[st.right[i]!]!.c} />
          </g>
        </g>
      ))}
    </Field>
  );
}

// ───────────────────────── 16. sweep ─────────────────────────
/** Dust balls scurry around: run the vacuum over every one. */
function Sweep({ p, onWin }: MiniProps) {
  const n = num(p['n'], 5);
  const win = useWin(onWin);
  const st = useSim(
    () => ({
      balls: Array.from({ length: n }, () => ({
        x: rnd(15, 85),
        y: rnd(22, 85),
        vx: rnd(-28, 28),
        vy: rnd(-28, 28),
        t: rnd(0, 6),
      })),
      q: { x: 50, y: 92 },
      on: false,
    }),
    (s, dt) => {
      for (const b of s.balls) {
        b.t += dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 10 || b.x > 90) b.vx *= -1;
        if (b.y < 18 || b.y > 90) b.vy *= -1;
        b.x = clamp(b.x, 10, 90);
        b.y = clamp(b.y, 18, 90);
      }
      if (!s.on) return;
      const before = s.balls.length;
      s.balls = s.balls.filter((b) => dist(b, s.q) > 10);
      if (s.balls.length < before) sfx('pop');
      if (s.balls.length === 0) win();
    },
  );
  return (
    <Field
      on={{
        down: (q) => {
          st.on = true;
          st.q = q;
        },
        move: (q, e) => {
          if (e.pointerType === 'mouse') st.on = true;
          if (st.on) st.q = q;
        },
        up: (_q, e) => {
          if (e.pointerType !== 'mouse') st.on = false;
        },
      }}
    >
      <Bar v={1 - st.balls.length / n} />
      {st.balls.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y + Math.sin(b.t * 10)})`}>
          <circle r="6" class="m-dustball" />
          <circle cx="-2" cy="-1" r="1.1" fill="#fff" />
          <circle cx="2" cy="-1" r="1.1" fill="#fff" />
        </g>
      ))}
      <g transform={`translate(${st.q.x} ${st.q.y})`}>
        <circle r="10" class={`m-ring ${st.on ? 'ok' : ''}`} />
        <rect x="-5" y="-3" width="10" height="6" rx="2" class="m-steel" />
      </g>
    </Field>
  );
}

// ───────────────────────── 17. memory ─────────────────────────
const PADS = [
  { x: 30, y: 38, c: '#e07a72' },
  { x: 70, y: 38, c: '#5cb4e4' },
  { x: 30, y: 74, c: '#f2cf5b' },
  { x: 70, y: 74, c: '#6cc08b' },
];
/** Watch the lights blink, then tap them in the same order. */
function Memory({ p, onWin }: MiniProps) {
  const n = num(p['n'], 3);
  const win = useWin(onWin);
  const st = useSim(
    () => ({
      seq: Array.from({ length: n }, () => Math.floor(Math.random() * 4)),
      t: -0.4, // < seq time = showing; after = the player's turn
      at: 0,
      lit: -1,
      litT: 0,
      bad: 0,
    }),
    (s, dt) => {
      s.t += dt;
      s.litT = Math.max(0, s.litT - dt);
      s.bad = Math.max(0, s.bad - dt * 3);
    },
  );
  const showing = st.t < n * 0.5;
  const k = Math.floor(st.t / 0.5);
  const shown = showing && st.t >= 0 && st.t % 0.5 < 0.36 ? st.seq[k] : st.litT > 0 ? st.lit : -1;
  return (
    <Field
      on={{
        down: (q) => {
          if (showing) return;
          const i = PADS.findIndex((d) => dist(q, d) < 17);
          if (i < 0) return;
          st.lit = i;
          st.litT = 0.2;
          if (i === st.seq[st.at]) {
            st.at += 1;
            sfx('good');
            if (st.at >= n) win();
          } else {
            st.at = 0;
            st.bad = 1;
            st.t = -0.5; // show it again
            sfx('buzz');
          }
        },
      }}
    >
      <Bar v={st.at / n} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        {PADS.map((d, i) => (
          <rect
            key={i}
            x={d.x - 15}
            y={d.y - 14}
            width="30"
            height="28"
            rx="7"
            fill={d.c}
            opacity={shown === i ? 1 : 0.28}
            stroke="#fff"
            stroke-width={shown === i ? 2 : 0.6}
          />
        ))}
      </g>
      <text x="50" y="18" class="m-text small">
        {showing ? T.watch : T.yourTurn}
      </text>
    </Field>
  );
}

// ───────────────────────── 18. whack ─────────────────────────
/** Sparks pop up for a moment: tap each one before it jumps away. */
function Whack({ p, onWin }: MiniProps) {
  const n = num(p['n'], 5);
  const win = useWin(onWin);
  const spot = () => ({ x: rnd(16, 84), y: rnd(24, 84) });
  const st = useSim(
    () => ({ ...spot(), life: 1, got: 0, t: 0 }),
    (s, dt) => {
      s.t += dt;
      s.life -= dt;
      if (s.life <= 0) Object.assign(s, spot(), { life: 1 });
    },
  );
  return (
    <Field
      on={{
        down: (q) => {
          if (dist(q, st) > 13) return;
          st.got += 1;
          sfx('pop');
          Object.assign(st, spot(), { life: 1 });
          if (st.got >= n) win();
        },
      }}
    >
      <Bar v={st.got / n} />
      <g transform={`translate(${st.x} ${st.y})`}>
        <circle r={6 + 5 * st.life} class="m-hot" opacity="0.35" />
        <path
          d="M0-9 2.5-2.5 9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5z"
          class="m-knob"
          transform={`rotate(${st.t * 200})`}
        />
      </g>
      <text x="50" y="97" class="m-text">
        {n - st.got}
      </text>
    </Field>
  );
}

// ───────────────────────── 19. basket ─────────────────────────
/** Things fall from the top: slide the basket under them (finger, mouse or arrow keys). */
function Basket({ p, onWin }: MiniProps) {
  const n = num(p['n'], 4);
  const look = str(p['look'], 'rock');
  const win = useWin(onWin);
  const st = useSim(
    () => ({ bx: 50, key: 0, ix: rnd(15, 85), iy: 8, got: 0 }),
    (s, dt) => {
      s.bx = clamp(s.bx + s.key * dt * 90, 10, 90);
      s.iy += dt * (52 + 6 * s.got);
      if (s.iy > 80 && s.iy < 92 && Math.abs(s.ix - s.bx) < 13) {
        s.got += 1;
        sfx('good');
        s.iy = 8;
        s.ix = rnd(15, 85);
        if (s.got >= n) win();
      } else if (s.iy > 100) {
        s.iy = 8;
        s.ix = rnd(15, 85);
        sfx('buzz');
      }
    },
  );
  useKeys(
    (k) => (st.key = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : st.key),
    (k) => (k === 'ArrowLeft' || k === 'ArrowRight') && (st.key = 0),
  );
  const slide = (q: Pt) => (st.bx = clamp(q.x, 10, 90));
  return (
    <Field on={{ down: slide, move: slide }}>
      <Bar v={st.got / n} />
      <Thing look={look} x={st.ix} y={st.iy} />
      <path d={`M${st.bx - 13} 84h26l-4 11h-18z`} class="m-box" />
      <path d={`M${st.bx - 13} 84h26`} class="m-line thick" />
    </Field>
  );
}

// ───────────────────────── 20. pairs ─────────────────────────
/** Four cards face down: find the two pairs. */
function Pairs({ onWin }: MiniProps) {
  const win = useWin(onWin);
  const st = useSim(
    () => ({
      cards: [0, 0, 1, 1].sort(() => Math.random() - 0.5),
      open: [] as number[],
      done: [] as number[],
      wait: 0,
    }),
    (s, dt) => {
      if (s.wait <= 0) return;
      s.wait -= dt;
      if (s.wait <= 0) s.open = [];
    },
  );
  const at = (i: number): Pt => ({ x: 30 + (i % 2) * 40, y: 38 + Math.floor(i / 2) * 38 });
  return (
    <Field
      on={{
        down: (q) => {
          if (st.wait > 0) return;
          const i = [0, 1, 2, 3].find((k) => dist(q, at(k)) < 18);
          if (i === undefined || st.done.includes(i) || st.open.includes(i)) return;
          st.open.push(i);
          sfx('tap');
          if (st.open.length < 2) return;
          const [a, b] = st.open as [number, number];
          if (st.cards[a] === st.cards[b]) {
            st.done.push(a, b);
            st.open = [];
            sfx('good');
            if (st.done.length >= 4) win();
          } else st.wait = 0.55;
        },
      }}
    >
      <Bar v={st.done.length / 4} />
      {[0, 1, 2, 3].map((i) => {
        const up = st.done.includes(i) || st.open.includes(i);
        const w = WIRE[st.cards[i]!]!;
        return (
          <g key={i} transform={`translate(${at(i).x} ${at(i).y})`}>
            <rect
              x="-16"
              y="-15"
              width="32"
              height="30"
              rx="6"
              class={st.done.includes(i) ? 'm-zone' : up ? 'm-window' : 'm-key'}
            />
            {up ? (
              <path d={w.shape} fill={w.c} transform="scale(2)" />
            ) : (
              <text y="4" class="m-text">
                ?
              </text>
            )}
          </g>
        );
      })}
    </Field>
  );
}

// ───────────────────────── 21. rotate ─────────────────────────
/** Four pipe pieces: tap each one to turn it until the water can flow straight through. */
function Rotate({ onWin }: MiniProps) {
  const win = useWin(onWin);
  const st = useSim(
    () => {
      const rot: number[] = [0, 1, 2, 3].map(() => (Math.random() < 0.75 ? 1 : 0));
      if (!rot.includes(1)) rot[0] = 1;
      return { rot, t: 0 };
    },
    (s, dt) => (s.t += dt),
  );
  const ok = st.rot.map((r) => r % 2 === 0);
  const flow = ok.findIndex((x) => !x); // water reaches the first wrong piece
  return (
    <Field
      on={{
        down: (q) => {
          const i = [0, 1, 2, 3].find(
            (k) => Math.abs(q.x - (20 + k * 20)) < 10 && Math.abs(q.y - 55) < 16,
          );
          if (i === undefined) return;
          st.rot[i] = st.rot[i]! + 1;
          sfx('tap');
          if (st.rot.every((r) => r % 2 === 0)) win();
        },
      }}
    >
      <Bar v={ok.filter(Boolean).length / 4} />
      <rect x="2" y="50" width="9" height="10" rx="2" class="m-bag" />
      <rect x="89" y="50" width="9" height="10" rx="2" class="m-steel" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${20 + i * 20} 55)`}>
          <rect x="-9" y="-9" width="18" height="18" rx="3" class="m-key" />
          <g style={{ transform: `rotate(${st.rot[i]! * 90}deg)`, transition: 'transform 0.15s' }}>
            <rect
              x="-9"
              y="-3.500"
              width="18"
              height="7"
              class={flow < 0 || i < flow ? 'm-bag' : 'm-steel'}
            />
          </g>
        </g>
      ))}
    </Field>
  );
}

// ───────────────────────── 22. sort ─────────────────────────
/** One thing at a time drops in: send it to the left or the right bin (tap a side, or the arrow keys). */
function Sort({ p, onWin }: MiniProps) {
  const n = num(p['n'], 5);
  const win = useWin(onWin);
  const st = useSim(
    () =>
      ({ kind: Math.random() < 0.5 ? 0 : 1, got: 0, x: 50, to: 50, bad: 0 }) as {
        kind: number;
        got: number;
        x: number;
        to: number;
        bad: number;
      },
    (s, dt) => {
      s.x += (s.to - s.x) * Math.min(1, dt * 14);
      s.bad = Math.max(0, s.bad - dt * 3);
      if (Math.abs(s.x - s.to) < 1.5 && s.to !== 50) {
        s.x = 50;
        s.to = 50;
        s.kind = Math.random() < 0.5 ? 0 : 1;
      }
    },
  );
  const send = (side: number) => {
    if (st.to !== 50) return;
    if (side === st.kind) {
      st.got += 1;
      sfx('good');
      st.to = side === 0 ? 16 : 84;
      if (st.got >= n) win();
    } else {
      st.bad = 1;
      sfx('buzz');
    }
  };
  useKeys((k) => (k === 'ArrowLeft' ? send(0) : k === 'ArrowRight' ? send(1) : undefined));
  return (
    <Field on={{ down: (q) => send(q.x < 50 ? 0 : 1) }}>
      <Bar v={st.got / n} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        <path d="M4 60h24l-3 30H7z" class="m-window" />
        <path d="M72 60h24l-3 30H75z" class="m-panel" />
        <Thing look="bag" x={16} y={76} />
        <g transform="translate(84 76)">
          <circle r="6" class="m-dustball" />
        </g>
        <path d="M30 96l-6-4v8zM70 96l6-4v8z" class="m-arrow" />
        <g transform={`translate(${st.x} 40)`}>
          {st.kind === 0 ? <Thing look="bag" x={0} y={0} /> : <circle r="7" class="m-dustball" />}
        </g>
      </g>
    </Field>
  );
}

// ───────────────────────── 23. odd ─────────────────────────
/** Nine shapes, one is different: find it. Three rounds. */
function Odd({ p, onWin }: MiniProps) {
  const n = num(p['n'], 3);
  const win = useWin(onWin);
  const round = () => {
    const a = Math.floor(Math.random() * 3);
    return {
      a,
      b: (a + 1 + Math.floor(Math.random() * 2)) % 3,
      odd: Math.floor(Math.random() * 9),
    };
  };
  const st = useSim(
    () => ({ ...round(), got: 0, bad: 0 }),
    (s, dt) => (s.bad = Math.max(0, s.bad - dt * 3)),
  );
  const at = (i: number): Pt => ({ x: 26 + (i % 3) * 24, y: 32 + Math.floor(i / 3) * 22 });
  return (
    <Field
      on={{
        down: (q) => {
          const i = [0, 1, 2, 3, 4, 5, 6, 7, 8].find((k) => dist(q, at(k)) < 11);
          if (i === undefined) return;
          if (i === st.odd) {
            st.got += 1;
            sfx('good');
            if (st.got >= n) win();
            else Object.assign(st, round());
          } else {
            st.bad = 1;
            sfx('buzz');
          }
        },
      }}
    >
      <Bar v={st.got / n} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const w = WIRE[i === st.odd ? st.b : st.a]!;
          return (
            <g key={i} transform={`translate(${at(i).x} ${at(i).y})`}>
              <circle r="10" class="m-key" />
              <path d={w.shape} fill={w.c} transform="scale(1.3)" />
            </g>
          );
        })}
      </g>
    </Field>
  );
}

// ───────────────────────── 24. swap ─────────────────────────
/** Four boxes of different sizes in the wrong order: tap two to swap them, smallest to biggest. */
function Swap({ onWin }: MiniProps) {
  const win = useWin(onWin);
  const st = useSim(() => {
    let order = [1, 2, 3, 4];
    while (order.every((v, i) => v === i + 1)) order = [...order].sort(() => Math.random() - 0.5);
    return { order, pick: -1 };
  });
  const sorted = st.order.filter((v, i) => v === i + 1).length;
  return (
    <Field
      on={{
        down: (q) => {
          const i = [0, 1, 2, 3].find((k) => Math.abs(q.x - (20 + k * 20)) < 10 && q.y > 30);
          if (i === undefined) return;
          if (st.pick < 0) {
            st.pick = i;
            sfx('tap');
            return;
          }
          const a = st.order[st.pick]!;
          st.order[st.pick] = st.order[i]!;
          st.order[i] = a;
          st.pick = -1;
          sfx('good');
          if (st.order.every((v, k) => v === k + 1)) win();
        },
      }}
    >
      <Bar v={sorted / 4} />
      <path d="M8 88h84" class="m-line thick" />
      {st.order.map((v, i) => (
        <g
          key={v}
          style={{ transform: `translate(${20 + i * 20}px, 88px)`, transition: 'transform 0.18s' }}
        >
          <rect
            x="-8"
            y={-(8 + v * 11)}
            width="16"
            height={8 + v * 11}
            rx="2"
            class={i === st.pick ? 'm-knob' : 'm-box'}
          />
          <text y="-3" class="m-text small dark">
            {v}
          </text>
        </g>
      ))}
      <path d="M12 96l8-3v6zM88 96l-8-5v10z" class="m-arrow" opacity="0.6" />
    </Field>
  );
}

// ───────────────────────── 25. count ─────────────────────────
/** "Take exactly 4": tap + the right number of times, then OK. */
function Count({ onWin }: MiniProps) {
  const win = useWin(onWin);
  const st = useSim(
    () => ({ want: 3 + Math.floor(Math.random() * 3), n: 0, bad: 0 }),
    (s, dt) => (s.bad = Math.max(0, s.bad - dt * 3)),
  );
  const add = () => {
    st.n = Math.min(8, st.n + 1);
    sfx('tap');
  };
  const ok = () => {
    if (st.n === st.want) win();
    else {
      st.n = 0;
      st.bad = 1;
      sfx('buzz');
    }
  };
  useKeys((k) => (k === ' ' ? add() : k === 'Enter' ? ok() : undefined));
  return (
    <Field on={{ down: (q) => (q.x < 55 ? add() : q.y > 44 && ok()) }}>
      <text x="50" y="14" class="m-text">
        {st.want}
      </text>
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        {Array.from({ length: st.n }, (_, i) => (
          <rect
            key={i}
            x={12 + (i % 4) * 9}
            y={24 + Math.floor(i / 4) * 9}
            width="7"
            height="7"
            rx="1.500"
            class="m-box"
          />
        ))}
        <circle cx="30" cy="68" r="19" class="m-knob" />
        <path d="M30 58v20M20 68h20" class="m-line dark" stroke-width="3" />
        <rect x="60" y="54" width="32" height="28" rx="7" class="m-zone" />
        <text x="76" y="71.500" class="m-text dark">
          OK
        </text>
      </g>
    </Field>
  );
}

// ───────────────────────── 26. reflex ─────────────────────────
/** The light is red: wait. The moment it turns green, tap! Two quick reactions. */
function Reflex({ p, onWin }: MiniProps) {
  const n = num(p['n'], 2);
  const win = useWin(onWin);
  const st = useSim(
    () => ({ wait: rnd(0.7, 1.8), go: 0, got: 0, bad: 0 }),
    (s, dt) => {
      s.bad = Math.max(0, s.bad - dt * 3);
      if (s.wait > 0) {
        s.wait -= dt;
        if (s.wait <= 0) {
          s.go = 0.9;
          sfx('tick');
        }
      } else {
        s.go -= dt;
        if (s.go <= 0) s.wait = rnd(0.6, 1.5); // too slow: red again
      }
    },
  );
  const tap = () => {
    if (st.wait > 0) {
      st.bad = 1;
      st.wait = rnd(0.7, 1.6);
      sfx('buzz');
      return;
    }
    st.got += 1;
    sfx('good');
    st.wait = rnd(0.6, 1.5);
    if (st.got >= n) win();
  };
  useKeys((k) => (k === ' ' || k === 'Enter') && tap());
  const green = st.wait <= 0;
  return (
    <Field on={{ down: tap }}>
      <Bar v={st.got / n} />
      <g class={st.bad > 0.4 ? 'm-shake' : ''}>
        <rect x="30" y="20" width="40" height="66" rx="10" class="m-panel" />
        <circle cx="50" cy="38" r="12" fill={green ? '#3a1512' : '#ff5a4d'} />
        <circle cx="50" cy="68" r="12" fill={green ? '#22c55e' : '#12301c'} />
      </g>
      <text x="50" y="97" class="m-text small">
        {green ? T.now : T.wait}
      </text>
    </Field>
  );
}

export const MINIS: Record<Mech, (props: MiniProps) => JSX.Element> = {
  crank: Crank,
  mash: Mash,
  slots: Slots,
  pull: Pull,
  track: Track,
  timing: Timing,
  scratch: Scratch,
  balance: Balance,
  sequence: Sequence,
  charge: Charge,
  trace: Trace,
  slice: Slice,
  catch: Catch,
  dodge: Dodge,
  wires: Wires,
  sweep: Sweep,
  memory: Memory,
  whack: Whack,
  basket: Basket,
  pairs: Pairs,
  rotate: Rotate,
  sort: Sort,
  odd: Odd,
  swap: Swap,
  count: Count,
  reflex: Reflex,
};

/** Mini-games that already have their own keys. The rest get the "tap SPACE to help" assist in Play.tsx. */
export const OWN_KEYS: ReadonlySet<Mech> = new Set<Mech>([
  'mash',
  'timing',
  'balance',
  'sequence',
  'charge',
  'dodge',
  'basket',
  'sort',
  'count',
  'reflex',
]);
