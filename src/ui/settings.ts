/** Per-device settings in localStorage, wrapped in try/catch (the game still works if storage is blocked). */
export interface Settings {
  projector: boolean;
  reduceMotion: boolean;
}
const KEY = 'mba.settings.v1';
const DEFAULTS: Settings = { projector: false, reduceMotion: false };

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
