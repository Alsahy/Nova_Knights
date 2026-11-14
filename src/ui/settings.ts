/** Per-device settings in localStorage, wrapped in try/catch (the game still works if storage is blocked). */
export interface Settings {
  projector: boolean;
  reduceMotion: boolean;
  timer: number; // seconds for the alarm timer; 0 = off (D-027)
  sound: boolean; // D-033: event sounds (alarms, taps, wins)
  ambient: boolean; // D-054: the wind-and-Sun background, on its own switch
  voice: boolean; // D-055: Nova reads the tutorial out loud
  skill: boolean; // D-032: mini-games on; off = a tool works with one tap (access option)
}
const KEY = 'mba.settings.v2'; // v2: alarms are 5–8 s (D-045)
const DEFAULTS: Settings = {
  projector: false,
  reduceMotion: false,
  timer: 8,
  sound: true,
  ambient: true,
  voice: true,
  skill: true,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: keep the setting for this visit only */
  }
}

export function applySettings(s: Settings): void {
  document.documentElement.classList.toggle('projector', s.projector);
  document.documentElement.classList.toggle('reduce-motion', s.reduceMotion);
}
