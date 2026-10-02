export const runnerPrizes = [
  'star',
  'strawberry',
  'orange',
  'bee',
  'apple',
  'banana',
  'flower',
] as const;
export type RunnerPrize = (typeof runnerPrizes)[number];
export const prizeWords: Record<RunnerPrize, { letter: string; word: string; color: string }> = {
  star: { letter: 'S', word: 'star', color: '#f4cb56' },
  strawberry: { letter: 'S', word: 'strawberry', color: '#ed7c83' },
  orange: { letter: 'O', word: 'orange', color: '#f5aa54' },
  bee: { letter: 'B', word: 'bee', color: '#f4ca56' },
  apple: { letter: 'A', word: 'apple', color: '#e87a74' },
  banana: { letter: 'B', word: 'banana', color: '#f5d77b' },
  flower: { letter: 'F', word: 'flower', color: '#de94bc' },
};
export type RunnerItem = {
  id: number;
  kind: RunnerPrize | 'bump';
  lane: number;
  x: number;
  z: number;
};

export type RunnerState = {
  lane: number;
  x: number;
  jump: number;
  velocity: number;
  distance: number;
  time: number;
  stars: number;
  island: number;
  trips: number;
  gate: number | null;
  magnet: number;
  bump: number;
  nextId: number;
  items: RunnerItem[];
};

export const runnerIslands = [
  {
    name: 'Jungle island',
    icon: '🌴',
    sky: '#b8e7ed',
    ground: '#7dcfa3',
    road: '#ffe5a6',
    tree: '#40aa83',
    detail: '#f28a63',
  },
  {
    name: 'Candy clouds',
    icon: '🍦',
    sky: '#f7d9e8',
    ground: '#e7adc9',
    road: '#fff0cd',
    tree: '#f893ae',
    detail: '#a18bda',
  },
  {
    name: 'Moon garden',
    icon: '🪐',
    sky: '#aab5e6',
    ground: '#9da9ce',
    road: '#e0ddf7',
    tree: '#b0dece',
    detail: '#f8d778',
  },
  {
    name: 'Seashell shore',
    icon: 'shell',
    sky: '#bee7ed',
    ground: '#e9d6a2',
    road: '#fff0cf',
    tree: '#77b8a6',
    detail: '#e88da0',
  },
  {
    name: 'Autumn orchard',
    icon: 'apple',
    sky: '#f6ddbd',
    ground: '#d2c790',
    road: '#f7e8bc',
    tree: '#e49c70',
    detail: '#cf765e',
  },
] as const;

export function laneX(lane: number) {
  return (lane - 1) * 2.15;
}

function addItem(state: RunnerState, z: number) {
  const id = state.nextId++;
  // First two stars teach the goal before asking the child to steer.
  const lane = id < 2 ? 1 : [0, 2, 1, 2, 0, 1][id % 6];
  const kind =
    id > 2 && id % 5 === 4 ? 'bump' : runnerPrizes[(id + state.trips) % runnerPrizes.length];
  state.items.push({ id, kind, lane, x: laneX(lane), z });
}

export function createRunnerState(): RunnerState {
  const state: RunnerState = {
    lane: 1,
    x: 0,
    jump: 0,
    velocity: 0,
    distance: 0,
    time: 0,
    stars: 0,
    island: 0,
    trips: 0,
    gate: null,
    magnet: 0,
    bump: 0,
    nextId: 0,
    items: [],
  };
  for (let i = 0; i < 6; i++) addItem(state, -12 - i * 12);
  return state;
}

export function steerRunner(state: RunnerState, direction: number) {
  state.lane = Math.max(0, Math.min(2, state.lane + direction));
}

export function jumpRunner(state: RunnerState) {
  state.magnet = 2;
  if (state.jump <= 0.05) {
    state.velocity = 7.2;
    state.jump = 0.06;
    return true;
  }
  return false;
}

/** Advance active play only. The owner never calls this while paused. */
export function advanceRunner(state: RunnerState, delta: number, baby: boolean, calm: boolean) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  const events = {
    collected: 0,
    prizes: [] as RunnerPrize[],
    bumped: false,
    openedGate: false,
    newIsland: false,
  };
  state.time += dt;
  state.magnet = Math.max(0, state.magnet - dt);
  state.bump = Math.max(0, state.bump - dt);
  const speed = (calm ? 5.8 : baby ? 7.2 : 8.8) * (state.bump > 0 ? 0.7 : 1);
  const movement = dt * speed;
  state.distance += movement;
  state.x += (laneX(state.lane) - state.x) * Math.min(1, dt * 11);
  if (state.jump > 0 || state.velocity > 0) {
    state.velocity -= 17 * dt;
    state.jump = Math.max(0, state.jump + state.velocity * dt);
    if (state.jump === 0) state.velocity = 0;
  }

  if (state.gate !== null) {
    state.gate += movement;
    if (state.gate > 5) {
      state.island = (state.island + 1) % runnerIslands.length;
      state.trips++;
      state.stars = 0;
      state.gate = null;
      state.items = [];
      for (let i = 0; i < 6; i++) addItem(state, -15 - i * 12);
      events.newIsland = true;
    }
    return events;
  }

  for (const item of state.items) {
    item.z += movement;
    if (item.kind !== 'bump' && item.z > -9 && (state.magnet > 0 || baby)) {
      item.x += (state.x - item.x) * Math.min(1, dt * (baby ? 2 : 5));
    }
    if (item.z >= 2.2 && item.z < 3.7) {
      if (item.kind !== 'bump' && Math.abs(item.x - state.x) < (baby ? 1.65 : 1.2)) {
        item.z = 10;
        state.stars++;
        events.collected++;
        events.prizes.push(item.kind);
        if (state.stars === 5) {
          state.gate = -27;
          state.items = [];
          events.openedGate = true;
          break;
        }
      } else if (item.kind === 'bump' && Math.abs(item.x - state.x) < 1 && state.jump < 0.55) {
        item.z = 10;
        // A gentle automatic hop teaches recovery; a bump never removes stars.
        state.velocity = baby ? 6.3 : 5;
        state.jump = 0.08;
        state.bump = 0.65;
        events.bumped = true;
      }
    }
  }
  if (state.gate === null) {
    state.items = state.items.filter((item) => item.z < 9);
    while (state.items.length < 6) {
      const farthest = Math.min(-8, ...state.items.map((item) => item.z));
      addItem(state, farthest - 12);
    }
  }
  return events;
}
