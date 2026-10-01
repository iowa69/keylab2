export const toys = [
  {
    id: 'sea',
    name: 'Bubble sea',
    verb: 'Pop & follow',
    description: 'Pop a bubble, meet a fish. Drag slowly and the bubbles follow.',
    color: '#bceee9',
    icon: 'bubbles',
  },
  {
    id: 'bounce',
    name: 'Bouncy friends',
    verb: 'Grab & tumble',
    description: 'Squishy little friends to pick up, roll, throw, and catch.',
    color: '#ffe6bd',
    icon: 'shapes',
  },
  {
    id: 'paint',
    name: 'Rainbow ribbons',
    verb: 'Swipe & paint',
    description: 'Every finger leaves a flowing ribbon. Every key paints a swirl.',
    color: '#f5d9eb',
    icon: 'rainbow',
  },
  {
    id: 'peek',
    name: 'Peekaboo',
    verb: 'Tap & discover',
    description: 'Who is hiding? Touch an egg to meet a little friend.',
    color: '#dcecc3',
    icon: 'egg',
  },
  {
    id: 'garden',
    name: 'Little growers',
    verb: 'Sprinkle & grow',
    description: 'Water little seeds and watch them become smiling flowers.',
    color: '#d8eabd',
    icon: 'flower',
  },
  {
    id: 'stars',
    name: 'Star song',
    verb: 'Touch & listen',
    description: 'Touch the stars or sweep across them to make a gentle tune.',
    color: '#dcd9f6',
    icon: 'star',
  },
] as const;
export type ToyId = (typeof toys)[number]['id'];
export type PlayMode = 'baby' | 'toddler';
export type Preferences = {
  toy: ToyId;
  mode: PlayMode;
  sound: boolean;
  volume: number;
  calm: boolean;
  contrast: boolean;
  breakMinutes: number;
};
export const defaults: Preferences = {
  toy: 'sea',
  mode: 'baby',
  sound: true,
  volume: 0.32,
  calm: false,
  contrast: false,
  breakMinutes: 0,
};
export const storageKey = 'keylab2-playroom-v3';

export function validatePreferences(value: unknown): Preferences {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    toy: toys.some((t) => t.id === raw.toy) ? (raw.toy as ToyId) : defaults.toy,
    mode: raw.mode === 'toddler' ? 'toddler' : 'baby',
    sound: typeof raw.sound === 'boolean' ? raw.sound : defaults.sound,
    volume:
      typeof raw.volume === 'number' && Number.isFinite(raw.volume)
        ? Math.max(0, Math.min(1, raw.volume))
        : defaults.volume,
    calm: typeof raw.calm === 'boolean' ? raw.calm : false,
    contrast: typeof raw.contrast === 'boolean' ? raw.contrast : false,
    breakMinutes: [0, 5, 10, 15].includes(Number(raw.breakMinutes)) ? Number(raw.breakMinutes) : 0,
  };
}
export function loadPreferences(): Preferences {
  try {
    return validatePreferences(
      JSON.parse(
        localStorage.getItem(storageKey) || localStorage.getItem('keylab2-settings') || '{}',
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
    /* Play also works without storage. */
  }
}
