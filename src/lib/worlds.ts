export type WorldId = 'garden' | 'bubbles' | 'space' | 'music' | 'shapes' | 'animals';
export type World = {
  id: WorldId;
  name: string;
  description: string;
  tag: string;
  color: string;
  ink: string;
  prompt: string;
  hint: string;
};

export const worlds: World[] = [
  {
    id: 'garden',
    name: 'Letter Garden',
    description: 'A little letter. A lovely bloom.',
    tag: 'LETTERS & SOUNDS',
    color: '#e7efdd',
    ink: '#567153',
    prompt: 'Let your letters bloom!',
    hint: 'Press a letter and grow a flower.',
  },
  {
    id: 'bubbles',
    name: 'Bubble Bay',
    description: 'Pop, giggle, and do it again.',
    tag: 'CAUSE & EFFECT',
    color: '#dfeef2',
    ink: '#477987',
    prompt: 'Make a little bubble magic!',
    hint: 'Press any key. Tap a bubble to pop it.',
  },
  {
    id: 'space',
    name: 'Number Space',
    description: 'Small numbers. Big adventures.',
    tag: 'COUNTING',
    color: '#eae4f5',
    ink: '#796491',
    prompt: 'Ready, set, lift off!',
    hint: 'Press 1–9 to send that many stars into space.',
  },
  {
    id: 'music',
    name: 'Melody Meadow',
    description: 'Every key has a happy little tune.',
    tag: 'MUSIC & RHYTHM',
    color: '#fbecd4',
    ink: '#a77936',
    prompt: 'Make your own happy song!',
    hint: 'Every key plays a note. Try a few together.',
  },
  {
    id: 'shapes',
    name: 'Shape Party',
    description: 'A wonderfully wobbly world.',
    tag: 'SHAPES & COLORS',
    color: '#f7e3df',
    ink: '#a46664',
    prompt: 'Let’s have a shape party!',
    hint: 'Press any key to make a shape dance.',
  },
  {
    id: 'animals',
    name: 'Little Friends',
    description: 'There’s a new friend in every key.',
    tag: 'ANIMALS & DISCOVERY',
    color: '#e4eee4',
    ink: '#52795f',
    prompt: 'Who’s hiding in the meadow?',
    hint: 'Press any key to meet a little friend.',
  },
];

export const palette = ['#e9a09a', '#e8bd66', '#a8b98c', '#9abfce', '#b5a0ce', '#e5ac7c'];
export const animalNames = ['fox', 'bunny', 'bear', 'cat', 'frog', 'owl'] as const;
export type AnimalName = (typeof animalNames)[number];
export const shapeNames = ['circle', 'triangle', 'square', 'star', 'heart'] as const;
export const noteNames = ['do', 're', 'mi', 'sol', 'la', 'do', 're', 'mi'];
export const letterWords: Record<string, string> = Object.fromEntries(
  'apple,bear,cat,dog,elephant,flower,garden,heart,ice cream,jellyfish,kite,leaf,moon,nest,owl,pear,queen,rainbow,sun,turtle,umbrella,violin,whale,xylophone,yellow,zebra'
    .split(',')
    .map((word, i) => [String.fromCharCode(65 + i), word]),
);
export function keyIndex(key: string) {
  return [...key].reduce((sum, ch) => sum + ch.codePointAt(0)!, 0);
}
export function displayKey(key: string): string {
  if (key === ' ') return '★';
  if (key.startsWith('Arrow'))
    return (
      { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' } as Record<string, string>
    )[key];
  return key.length === 1 ? key.toLocaleUpperCase() : '✦';
}
export function countForKey(key: string) {
  return /^[1-9]$/.test(key) ? Number(key) : 1;
}

export type Challenge = {
  prompt: string;
  target: string;
  total: number;
  kind: 'key' | 'any';
  spoken: string;
};
export function challengeFor(world: WorldId, round: number): Challenge {
  if (world === 'garden') {
    const target = String.fromCharCode(65 + (round % 26));
    return {
      prompt: `Can you find the letter ${target}?`,
      target,
      total: 1,
      kind: 'key',
      spoken: `Can you find the letter ${target}?`,
    };
  }
  if (world === 'space') {
    const target = String((round % 5) + 1);
    return {
      prompt: `Let’s launch ${target} ${target === '1' ? 'star' : 'stars'}!`,
      target,
      total: 1,
      kind: 'key',
      spoken: `Find the number ${target}.`,
    };
  }
  const total = (round % 3) + 3;
  const nouns = { bubbles: 'bubbles', music: 'notes', shapes: 'shapes', animals: 'friends' };
  return {
    prompt: `Let’s make ${total} ${nouns[world]}!`,
    target: 'ANY KEY',
    total,
    kind: 'any',
    spoken: `Press any key ${total} times.`,
  };
}

export type Settings = {
  sound: boolean;
  volume: number;
  calm: boolean;
  narration: boolean;
  breakMinutes: number;
};
export const defaultSettings: Settings = {
  sound: true,
  volume: 0.4,
  calm: false,
  narration: false,
  breakMinutes: 0,
};
export function readSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem('keylab2-settings') || '{}');
    return {
      sound: typeof saved.sound === 'boolean' ? saved.sound : true,
      volume:
        typeof saved.volume === 'number' && Number.isFinite(saved.volume)
          ? Math.min(1, Math.max(0, saved.volume))
          : 0.4,
      calm: typeof saved.calm === 'boolean' ? saved.calm : false,
      narration: typeof saved.narration === 'boolean' ? saved.narration : false,
      breakMinutes: [0, 5, 10, 15].includes(saved.breakMinutes) ? saved.breakMinutes : 0,
    };
  } catch {
    return { ...defaultSettings };
  }
}
