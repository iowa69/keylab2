export type Preferences = {
  mode: 'baby' | 'toddler';
  sound: boolean;
  volume: number;
  calm: boolean;
  contrast: boolean;
  breakMinutes: number;
};
export const defaults: Preferences = {
  mode: 'baby',
  sound: true,
  volume: 0.32,
  calm: false,
  contrast: false,
  breakMinutes: 0,
};
export const storageKey = 'keylab2-adventures-v4';
export function validatePreferences(value: unknown): Preferences {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    mode: raw.mode === 'toddler' ? 'toddler' : 'baby',
    sound: typeof raw.sound === 'boolean' ? raw.sound : defaults.sound,
    volume:
      typeof raw.volume === 'number' && Number.isFinite(raw.volume)
        ? Math.max(0, Math.min(1, raw.volume))
        : defaults.volume,
    calm: typeof raw.calm === 'boolean' ? raw.calm : false,
    contrast: typeof raw.contrast === 'boolean' ? raw.contrast : false,
    breakMinutes:
      typeof raw.breakMinutes === 'number' && [0, 5, 10, 15].includes(raw.breakMinutes)
        ? raw.breakMinutes
        : 0,
  };
}
export function loadPreferences(): Preferences {
  try {
    return validatePreferences(
      JSON.parse(
        localStorage.getItem(storageKey) ||
          localStorage.getItem('keylab2-playroom-v3') ||
          localStorage.getItem('keylab2-settings') ||
          '{}',
      ),
    );
  } catch {
    return { ...defaults };
  }
}
export function savePreferences(value: Preferences) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    /* Optional local preferences. */
  }
}
