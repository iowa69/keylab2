import { describe, it, expect } from 'vitest';
import {
  advanceSpace,
  assistSpace,
  collectSpace,
  createSpaceState,
  steerSpace,
} from './spaceModel';
describe('little astronaut flight', () => {
  it('baby assistance reaches the chosen planet without failures', () => {
    const state = createSpaceState();
    for (let frame = 0; frame < 4200 && !state.complete; frame++)
      advanceSpace(state, 1 / 60, true, false);
    expect(state.complete).toBe(true);
    expect(state.stars).toBe(6);
    expect(state.arrival).toBeGreaterThanOrEqual(1.3);
  });
  it('keeps a dragged rocket on screen and permits a helpful key action', () => {
    const state = createSpaceState();
    steerSpace(state, -200, 400);
    expect(state.targetX).toBe(9);
    expect(state.targetY).toBe(70);
    const id = assistSpace(state)!;
    expect(collectSpace(state, id)).toBe(true);
    expect(collectSpace(state, id)).toBe(false);
    expect(state.stars).toBe(1);
  });
  it('rocks and black holes make recoverable reactions without losing fuel', () => {
    const state = createSpaceState();
    state.stars = 3;
    state.objects = [{ id: 99, kind: 'asteroid', x: 50, y: 57, phase: 0 }];
    expect(advanceSpace(state, 0.02, false, false).bumped).toBe(true);
    expect(state.stars).toBe(3);
    state.shield = 0;
    state.objects = [{ id: 100, kind: 'blackhole', x: 50, y: 57, phase: 0 }];
    expect(advanceSpace(state, 0.02, false, false).swirled).toBe(true);
    expect(state.swirl).toBeGreaterThan(0);
    expect(state.stars).toBe(3);
  });
  it('caps fuel at six and emits arrival exactly once', () => {
    const state = createSpaceState();
    for (let i = 0; i < 10; i++) {
      const id = assistSpace(state);
      if (id !== null) collectSpace(state, id);
    }
    expect(state.stars).toBe(6);
    let arrivals = 0;
    for (let i = 0; i < 100; i++)
      arrivals += Number(advanceSpace(state, 0.05, true, false).arrived);
    expect(arrivals).toBe(1);
  });
});
