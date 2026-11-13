import { useState } from 'preact/hooks';
import { copy } from '../../content/copy';
import type { Settings } from '../settings';

export function SettingsScreen(props: {
  settings: Settings;
  onChange: (s: Settings) => void;
  back: () => void;
  onReset: () => void;
}) {
  const { settings, onChange } = props;
  const [done, setDone] = useState(false);
  return (
    <section class="center-screen text-screen" aria-labelledby="settings-title">
      <button class="btn btn-back" onClick={props.back}>
        ← {copy.back}
      </button>
      <h1 id="settings-title" tabIndex={-1}>
        {copy.settingsScreen.title}
      </h1>
      <label class="toggle">
        <input
          id="set-projector"
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
      <label class="toggle">
        <input
          id="set-motion"
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={(e) =>
            onChange({ ...settings, reduceMotion: (e.target as HTMLInputElement).checked })
          }
        />
        <span>
          {copy.settingsScreen.motion}
          <small>{copy.settingsScreen.motionHint}</small>
        </span>
      </label>
      <button
        class="btn"
        onClick={() => {
          props.onReset();
          setDone(true);
        }}
      >
        {copy.settingsScreen.reset}
      </button>
      {done && (
        <p class="hint" role="status">
          {copy.settingsScreen.resetDone}
        </p>
      )}
    </section>
  );
}
