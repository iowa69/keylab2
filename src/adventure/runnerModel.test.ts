import { describe, expect, it } from 'vitest';
import {
  advanceRunner,
  createRunnerState,
  jumpRunner,
  steerRunner,
  runnerPrizes,
} from './runnerModel';

describe('little explorer runner', () => {
  it('helps a baby reach a new island, then provides a fresh goal', () => {
    const state = createRunnerState();
    let opened = false;
    let changed = false;
    for (let frame = 0; frame < 2400 && !changed; frame++) {
      const events = advanceRunner(state, 1 / 60, true, false);
      opened ||= events.openedGate;
      changed ||= events.newIsland;
    }
    expect(opened).toBe(true);
    expect(changed).toBe(true);
    expect(state.island).toBe(1);
    expect(state.stars).toBe(0);
    expect(state.items.length).toBe(6);
  });

  it('cycles all five islands and varied alphabet treasures without growing the scene', () => {
    const state = createRunnerState();
    const found = new Set<string>();
    for (let frame = 0; frame < 16000; frame++) {
      for (const prize of advanceRunner(state, 1 / 60, true, false).prizes) found.add(prize);
      expect(state.items.length).toBeLessThanOrEqual(6);
    }
    expect(state.trips).toBeGreaterThan(5);
    expect([...found].sort()).toEqual([...runnerPrizes].sort());
  });

  it('keeps steering in three lanes and safely lands repeated jumps', () => {
    const state = createRunnerState();
    for (let i = 0; i < 10; i++) steerRunner(state, -1);
    expect(state.lane).toBe(0);
    for (let i = 0; i < 10; i++) steerRunner(state, 1);
    expect(state.lane).toBe(2);
    expect(jumpRunner(state)).toBe(true);
    expect(jumpRunner(state)).toBe(false);
    for (let frame = 0; frame < 90; frame++) advanceRunner(state, 1 / 60, false, false);
    expect(state.jump).toBe(0);
    expect(state.velocity).toBe(0);
  });

  it('bumps recover without losing collected stars', () => {
    const state = createRunnerState();
    state.stars = 3;
    state.items = [{ id: 9, kind: 'bump', lane: 1, x: 0, z: 2.15 }];
    const events = advanceRunner(state, 1 / 60, false, false);
    expect(events.bumped).toBe(true);
    expect(state.stars).toBe(3);
    expect(state.jump).toBeGreaterThan(0);
    expect(state.bump).toBeGreaterThan(0);
  });

  it('recycles missed stars and lets a keyboard hop attract the next one', () => {
    const state = createRunnerState();
    state.items = [{ id: 20, kind: 'star', lane: 0, x: -2.15, z: -6 }];
    jumpRunner(state);
    let collected = 0;
    for (let frame = 0; frame < 100; frame++)
      collected += advanceRunner(state, 1 / 60, false, false).collected;
    expect(collected).toBeGreaterThan(0);
    expect(state.items.length).toBe(6);
  });
});
