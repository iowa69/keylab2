export type SpaceKind = 'star' | 'asteroid' | 'alien' | 'comet' | 'blackhole';
export type SpaceObject = { id: number; kind: SpaceKind; x: number; y: number; phase: number };
export type SpaceState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  time: number;
  stars: number;
  shield: number;
  swirl: number;
  nextId: number;
  spawn: number;
  arrival: number;
  complete: boolean;
  objects: SpaceObject[];
};
const order: SpaceKind[] = [
  'star',
  'asteroid',
  'star',
  'alien',
  'star',
  'comet',
  'star',
  'blackhole',
  'star',
  'asteroid',
  'star',
  'alien',
];
export function createSpaceState(): SpaceState {
  return {
    x: 50,
    y: 57,
    targetX: 50,
    targetY: 57,
    time: 0,
    stars: 0,
    shield: 0,
    swirl: 0,
    nextId: 3,
    spawn: 0,
    arrival: 0,
    complete: false,
    objects: [
      { id: 0, kind: 'star', x: 35, y: 23, phase: 0 },
      { id: 1, kind: 'asteroid', x: 78, y: 5, phase: 1 },
      { id: 2, kind: 'star', x: 58, y: -9, phase: 2 },
    ],
  };
}
export function steerSpace(state: SpaceState, x: number, y = state.targetY) {
  state.targetX = Math.max(9, Math.min(91, x));
  state.targetY = Math.max(22, Math.min(70, y));
}
export function collectSpace(state: SpaceState, id: number) {
  if (state.complete || state.stars >= 6) return false;
  const item = state.objects.find((object) => object.id === id);
  if (!item || (item.kind !== 'star' && item.kind !== 'alien')) return false;
  state.objects = state.objects.filter((object) => object.id !== id);
  state.stars++;
  return true;
}
/** A big assist button is also the keyboard's useful, forgiving action. */
export function assistSpace(state: SpaceState) {
  if (state.complete || state.stars >= 6) return null;
  const star = state.objects
    .filter((item) => item.kind === 'star' && item.y >= -10)
    .sort((a, b) => b.y - a.y)[0];
  if (star) {
    steerSpace(state, star.x, Math.max(35, Math.min(80, star.y + 12)));
    star.y = state.y - 10;
    star.x = state.x;
    return star.id;
  }
  // There is always a discoverable star, even after a rapid flurry of taps.
  const id = state.nextId++;
  state.objects.push({ id, kind: 'star', x: state.x, y: state.y - 13, phase: id });
  return id;
}
export function advanceSpace(state: SpaceState, delta: number, baby: boolean, calm: boolean) {
  const dt = Math.max(0, Math.min(0.05, delta));
  const events = { collected: 0, bumped: false, hello: false, swirled: false, arrived: false };
  if (state.complete) return events;
  state.time += dt;
  state.shield = Math.max(0, state.shield - dt);
  state.swirl = Math.max(0, state.swirl - dt);
  state.x += (state.targetX - state.x) * Math.min(1, dt * 8);
  state.y += (state.targetY - state.y) * Math.min(1, dt * 8);
  if (state.stars >= 6) {
    state.arrival += dt;
    if (state.arrival >= 1.3) {
      state.complete = true;
      events.arrived = true;
    }
    return events;
  }
  state.spawn += dt;
  if (state.spawn > 1.65) {
    state.spawn = 0;
    const id = state.nextId++;
    state.objects.push({
      id,
      kind: order[id % order.length],
      x: 18 + ((id * 29) % 66),
      y: -12,
      phase: id,
    });
  }
  const speed = calm ? 10 : baby ? 14 : 18;
  for (const item of [...state.objects]) {
    item.y += dt * speed * (item.kind === 'comet' ? 1.35 : 1);
    if (item.kind === 'alien') item.x += Math.sin(state.time * 1.5 + item.phase) * dt * 4;
    if (item.kind === 'star' && baby && item.y > state.y - 33 && item.y < state.y + 5)
      item.x += (state.x - item.x) * Math.min(1, dt * 3.5);
    const nearX = Math.abs(item.x - state.x) < (baby ? 11 : 8);
    const nearY = Math.abs(item.y - state.y) < 9;
    if (nearX && nearY) {
      if (item.kind === 'star' || item.kind === 'alien') {
        if (collectSpace(state, item.id)) {
          events.collected++;
          events.hello ||= item.kind === 'alien';
        }
      } else if (state.shield === 0) {
        state.shield = 1.4;
        state.objects = state.objects.filter((object) => object.id !== item.id);
        if (item.kind === 'blackhole') {
          state.swirl = 1.1;
          events.swirled = true;
        } else {
          events.bumped = true;
        }
      }
    }
  }
  state.objects = state.objects.filter((item) => item.y < 116).slice(-18);
  return events;
}
