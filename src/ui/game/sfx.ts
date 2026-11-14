/**
 * Tiny synth sound effects (D-033): no audio files, so nothing to download or credit.
 * Everything is a few oscillators or a burst of noise through the Web Audio API.
 */
export type Sfx =
  | 'alarm'
  | 'tick'
  | 'tap'
  | 'good'
  | 'win'
  | 'fail'
  | 'boom'
  | 'star'
  | 'pop'
  | 'whoosh'
  | 'buzz'
  | 'night'
  | 'morning'
  | 'ting'
  | 'warn'
  | 'sun'
  | 'wind'
  | 'geiger'
  | 'hiss'
  | 'drip'
  | 'freeze'
  | 'sneeze'
  | 'cough'
  | 'zap'
  | 'growl'
  | 'radio'
  | 'steps'
  | 'fly'
  | 'hover';

let ctx: AudioContext | null = null;
let on = true;

export function setSound(enabled: boolean): void {
  on = enabled;
}

function ac(force = false): AudioContext | null {
  if (!on && !force) return null;
  try {
    if (!ctx) {
      const C =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  a: AudioContext,
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.12,
  slideTo?: number,
): void {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime + at);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + at + dur);
  g.gain.setValueAtTime(0.0001, a.currentTime + at);
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + at);
  o.stop(a.currentTime + at + dur + 0.02);
}

function noise(
  a: AudioContext,
  at: number,
  dur: number,
  vol = 0.2,
  freq = 900,
  type: BiquadFilterType = 'lowpass',
  sweepTo?: number,
): void {
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / n);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, a.currentTime + at);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, a.currentTime + at + dur);
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + at);
}

let bed: { stop: () => void } | null = null;
/**
 * The background sound of Mars (D-048): thin wind that comes in gusts, over a low hum from the Sun.
 * Not music: one filtered noise loop and two very low tones, all slowly drifting. Starts after the first tap or key
 * (browsers do not allow sound before that).
 */
export function ambience(play: boolean): void {
  if (!play) {
    bed?.stop();
    bed = null;
    return;
  }
  if (bed) return;
  const a = ac(true); // the background has its own switch (D-054)
  if (!a) return;
  const out = a.createGain();
  out.gain.value = 0.0001;
  out.gain.exponentialRampToValueAtTime(1, a.currentTime + 2.5);
  out.connect(a.destination);
  const nodes: AudioScheduledSourceNode[] = [];
  const lfo = (rate: number, depth: number, target: AudioParam) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.frequency.value = rate;
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
    nodes.push(o);
  };
  // wind: looped noise through a band that wanders, with gusts
  const n = a.sampleRate * 4;
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const wind = a.createBufferSource();
  wind.buffer = buf;
  wind.loop = true;
  const band = a.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 420;
  band.Q.value = 0.7;
  const gust = a.createGain();
  gust.gain.value = 0.05;
  wind.connect(band).connect(gust).connect(out);
  lfo(0.07, 220, band.frequency);
  lfo(0.13, 0.028, gust.gain);
  wind.start();
  nodes.push(wind);
  // the Sun: two low tones that swell and fade like slow waves
  for (const [f, rate] of [
    [55, 0.05],
    [82.5, 0.08],
  ] as const) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.value = 0.03;
    o.connect(g).connect(out);
    lfo(rate, 0.022, g.gain);
    o.start();
    nodes.push(o);
  }
  bed = {
    stop: () => {
      out.gain.cancelScheduledValues(a.currentTime);
      out.gain.setTargetAtTime(0.0001, a.currentTime, 0.3);
      window.setTimeout(() => {
        nodes.forEach((x) => {
          try {
            x.stop();
          } catch {
            /* already stopped */
          }
        });
        out.disconnect();
      }, 1200);
    },
  };
}

export function sfx(name: Sfx): void {
  const a = ac();
  if (!a) return;
  switch (name) {
    case 'alarm':
      tone(a, 880, 0, 0.16, 'square', 0.07);
      tone(a, 660, 0.2, 0.16, 'square', 0.07);
      tone(a, 880, 0.4, 0.16, 'square', 0.07);
      break;
    case 'tick':
      tone(a, 1200, 0, 0.05, 'square', 0.05);
      break;
    case 'tap':
      tone(a, 520, 0, 0.06, 'triangle', 0.1);
      break;
    case 'good':
      tone(a, 660, 0, 0.09, 'triangle', 0.12);
      tone(a, 990, 0.08, 0.12, 'triangle', 0.12);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(a, f, i * 0.09, 0.22, 'triangle', 0.13));
      tone(a, 1319, 0.4, 0.4, 'sine', 0.1);
      break;
    case 'fail':
      tone(a, 300, 0, 0.3, 'sawtooth', 0.09, 110);
      break;
    case 'boom':
      noise(a, 0, 0.7, 0.35, 500);
      tone(a, 120, 0, 0.5, 'sine', 0.25, 40);
      break;
    case 'star':
      tone(a, 1568, 0, 0.1, 'sine', 0.09);
      tone(a, 2093, 0.07, 0.16, 'sine', 0.09);
      break;
    case 'pop':
      tone(a, 400, 0, 0.08, 'sine', 0.14, 900);
      break;
    case 'whoosh':
      noise(a, 0, 0.3, 0.12, 2400);
      break;
    case 'buzz':
      tone(a, 150, 0, 0.14, 'square', 0.07);
      break;
    case 'night':
      [660, 523, 392].forEach((f, i) => tone(a, f, i * 0.22, 0.4, 'sine', 0.08));
      break;
    case 'ting': // achievement bell
      tone(a, 1760, 0, 0.5, 'sine', 0.14);
      tone(a, 2637, 0.06, 0.7, 'sine', 0.1);
      tone(a, 3520, 0.12, 0.5, 'sine', 0.05);
      break;
    case 'warn': // something is running low
      tone(a, 330, 0, 0.18, 'square', 0.06);
      tone(a, 247, 0.22, 0.28, 'square', 0.06);
      break;
    case 'sun': // a flare: a rising roar with crackle
      tone(a, 70, 0, 1.1, 'sawtooth', 0.07, 220);
      noise(a, 0, 1.1, 0.16, 300, 'lowpass', 2600);
      break;
    case 'wind':
      noise(a, 0, 1.6, 0.2, 300, 'bandpass', 1400);
      noise(a, 0.5, 1.2, 0.1, 900, 'bandpass', 400);
      break;
    case 'geiger':
      for (let i = 0; i < 9; i++) noise(a, Math.random() * 0.9, 0.012, 0.5, 3000, 'highpass');
      break;
    case 'hiss':
      noise(a, 0, 0.9, 0.12, 4200, 'highpass');
      break;
    case 'drip':
      tone(a, 900, 0, 0.09, 'sine', 0.12, 420);
      tone(a, 1100, 0.3, 0.09, 'sine', 0.1, 500);
      break;
    case 'freeze':
      [2400, 3100, 2700, 3600].forEach((f, i) => tone(a, f, i * 0.09, 0.12, 'sine', 0.05));
      break;
    case 'sneeze':
      tone(a, 500, 0, 0.25, 'sawtooth', 0.05, 900);
      noise(a, 0.26, 0.25, 0.3, 2500, 'highpass');
      break;
    case 'cough':
      noise(a, 0, 0.12, 0.3, 700);
      noise(a, 0.2, 0.14, 0.26, 600);
      break;
    case 'zap':
      for (let i = 0; i < 4; i++)
        tone(a, 90 + Math.random() * 900, i * 0.06, 0.05, 'sawtooth', 0.07);
      break;
    case 'growl': // a hungry tummy
      tone(a, 95, 0, 0.5, 'sawtooth', 0.09, 60);
      tone(a, 70, 0.3, 0.4, 'sawtooth', 0.07, 110);
      break;
    case 'radio':
      noise(a, 0, 0.5, 0.1, 1800, 'bandpass');
      tone(a, 1400, 0.1, 0.07, 'square', 0.03);
      tone(a, 1800, 0.3, 0.07, 'square', 0.03);
      break;
    case 'steps':
      noise(a, 0, 0.05, 0.2, 300);
      noise(a, 0.16, 0.05, 0.2, 260);
      break;
    case 'hover': // a soft tick when the pointer lands on a button
      tone(a, 1050, 0, 0.035, 'sine', 0.035);
      break;
    case 'fly':
      tone(a, 300, 0, 0.3, 'triangle', 0.08, 1200);
      break;
    case 'morning':
      [392, 523, 659].forEach((f, i) => tone(a, f, i * 0.14, 0.3, 'triangle', 0.09));
      break;
  }
}

/**
 * Nova's voice (D-055): the browser's own text-to-speech reads a line out loud. No audio files, nothing recorded.
 * Not every browser has a voice; `onEnd` is still called (after a pause that fits the text) so the mouth stops moving.
 */
let speakTimer = 0;
let endTimer = 0;
/** Kept in a variable on purpose: desktop Chrome can drop a line that nothing else points to. */
let line: SpeechSynthesisUtterance | null = null;
let voices: SpeechSynthesisVoice[] = [];
function loadVoices(): void {
  try {
    voices = window.speechSynthesis?.getVoices() ?? [];
  } catch {
    voices = [];
  }
}
// Desktop browsers load their voices a moment after the page: ask now, and again when they say the list is ready.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}
/** Does this device have any voice to read with? (False until the browser has loaded its list.) */
export function hasVoice(): boolean {
  if (!voices.length) loadVoices();
  return voices.length > 0;
}

export function speak(text: string, onEnd: () => void): void {
  hush();
  endTimer = window.setTimeout(onEnd, Math.min(12000, 1200 + text.length * 55));
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth) return;
  // Stopping the old line and starting a new one in the same instant makes desktop Chrome drop the new one,
  // so the new line starts a moment later.
  speakTimer = window.setTimeout(() => {
    try {
      if (!voices.length) loadVoices();
      const u = new SpeechSynthesisUtterance(text);
      const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
      const pick =
        en.find((v) => /female|zira|samantha|aria|jenny|google us/i.test(v.name)) ??
        en.find((v) => v.default) ??
        en[0];
      if (pick) {
        u.voice = pick;
        u.lang = pick.lang;
      } else u.lang = 'en-US';
      u.rate = 1;
      u.pitch = 1.2;
      u.volume = 1;
      u.onend = () => {
        window.clearTimeout(endTimer);
        line = null;
        onEnd();
      };
      line = u;
      synth.resume(); // a browser left paused by an earlier page stays silent otherwise
      synth.speak(u);
    } catch {
      /* no voice on this device: the text is on screen anyway */
    }
  }, 140);
}
export function hush(): void {
  window.clearTimeout(speakTimer);
  window.clearTimeout(endTimer);
  line = null;
  try {
    const synth = window.speechSynthesis;
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
  } catch {
    /* nothing to stop */
  }
}
