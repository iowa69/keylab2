import type { Preferences } from '../playroom/settings';
export type GameProps = {
  settings: Preferences;
  paused: boolean;
  onCelebrate: (label: string) => void;
};
export type GameId =
  | 'garage'
  | 'runner'
  | 'space'
  | 'treats'
  | 'transport'
  | 'letters'
  | 'music'
  | 'splash'
  | 'arcade';
export const games: { id: GameId; name: string; action: string; tag: string; color: string }[] = [
  {
    id: 'garage',
    name: 'My little garage',
    action: 'Build a car. Take it for a spin.',
    tag: 'BUILD & DRIVE',
    color: '#f5d492',
  },
  {
    id: 'runner',
    name: 'Jungle dash',
    action: 'Jump, collect, and explore!',
    tag: '3D ADVENTURE',
    color: '#acd6af',
  },
  {
    id: 'space',
    name: 'Space explorers',
    action: 'A rocket. Eight new worlds.',
    tag: 'FLY & DISCOVER',
    color: '#c2b6e4',
  },
  {
    id: 'treats',
    name: 'The sweet shop',
    action: 'Make something delicious.',
    tag: 'MAKE & SHARE',
    color: '#f3bdc4',
  },
  {
    id: 'transport',
    name: 'Away we go!',
    action: 'All aboard. Up, up, and away.',
    tag: 'TRAINS & PLANES',
    color: '#a9d8e5',
  },
  {
    id: 'letters',
    name: 'Discovery safari',
    action: 'Find letters, numbers & colors.',
    tag: 'LOOK & LEARN',
    color: '#e3d797',
  },
  {
    id: 'music',
    name: 'Little music makers',
    action: 'Play a song, one note at a time.',
    tag: 'TUNES & RHYTHM',
    color: '#d6bce0',
  },
  {
    id: 'splash',
    name: 'Mischief meadow',
    action: 'Splash the mud. Watch them run!',
    tag: 'SQUIRT & GIGGLE',
    color: '#afd7c4',
  },
  {
    id: 'arcade',
    name: 'Fruit picnic',
    action: 'Catch the fruit. Feed a friend.',
    tag: 'CATCH & COUNT',
    color: '#eaca9f',
  },
];
