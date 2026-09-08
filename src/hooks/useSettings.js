import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { setSoundEnabled } from '../utils/sounds';

export function useSettings() {
  const [settings, setSettingsState] = useState(getSettings);

  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateSettings = (patch) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...patch };
      saveSettings(updated);
      return updated;
    });
  };

  return { settings, updateSettings };
}
