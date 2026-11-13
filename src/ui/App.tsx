import { useEffect, useState } from 'preact/hooks';
import { copy } from '../content/copy';
import { Title } from './screens/Title';
import { DataSources } from './screens/DataSources';
import { SettingsScreen } from './screens/Settings';
import { applySettings, loadSettings, saveSettings, type Settings } from './settings';

export type Screen = 'title' | 'sources' | 'settings';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  // Move focus to the new screen's heading (keyboard + screen-reader users).
  useEffect(() => {
    document.querySelector<HTMLElement>('main h1')?.focus();
  }, [screen]);

  return (
    <div class="shell">
      <main class="screen">
        {screen === 'title' && <Title go={setScreen} />}
        {screen === 'sources' && <DataSources back={() => setScreen('title')} />}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            back={() => setScreen('title')}
          />
        )}
      </main>
      <footer class="footer">
        <p>{copy.footer}</p>
      </footer>
    </div>
  );
}
