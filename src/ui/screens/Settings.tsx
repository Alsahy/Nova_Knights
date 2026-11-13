import { copy } from '../../content/copy';
import type { Settings } from '../settings';

export function SettingsScreen({
  settings,
  onChange,
  back,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  back: () => void;
}) {
  return (
    <section class="center-screen text-screen" aria-labelledby="settings-title">
      <button class="btn btn-back" onClick={back}>
        ← {copy.back}
      </button>
      <h1 id="settings-title" tabIndex={-1}>
        {copy.settingsScreen.title}
      </h1>
      <label class="toggle">
        <input
          type="checkbox"
          checked={settings.projector}
          onChange={(e) =>
            onChange({ ...settings, projector: (e.target as HTMLInputElement).checked })
          }
        />
        <span>
          {copy.settingsScreen.projector}
          <small>{copy.settingsScreen.projectorHint}</small>
        </span>
      </label>
      <p class="hint">{copy.settingsScreen.placeholder}</p>
    </section>
  );
}
