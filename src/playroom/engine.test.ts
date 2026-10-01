import { describe, expect, it } from 'vitest';
import { PlayEngine, LIMITS, distance } from './engine';
import { defaults, toys, validatePreferences } from './settings';

describe('play without instructions', () => {
  for (const toy of toys)
    it(`${toy.name} responds to an arbitrary key`, () => {
      const engine = new PlayEngine({ ...defaults, toy: toy.id }, 1000, 700);
      engine.keyboard();
      expect(engine.interactions).toBeGreaterThan(0);
      expect(
        engine.friends.length + engine.ribbons.length + engine.particles.length,
      ).toBeGreaterThan(0);
    });
  it('a popped bubble releases a fish and replenishes itself', () => {
    const e = new PlayEngine(defaults, 390, 844);
    const original = e.friends.length;
    const f = e.friends[0];
    e.down(1, f);
    e.up(1);
    expect(e.particles.some((p) => p.kind === 'fish')).toBe(true);
    expect(e.friends.length).toBe(original - 1);
    for (let i = 0; i < 30; i++) e.step(1 / 60);
    expect(e.friends.length).toBe(original);
  });
  it('supports simultaneous fingers and releases cancelled touches', () => {
    const e = new PlayEngine({ ...defaults, toy: 'bounce' }, 1000, 700);
    e.down(1, e.friends[0]);
    e.down(2, e.friends[1]);
    e.move(1, { x: 300, y: 350 });
    e.move(2, { x: 650, y: 330 });
    expect(e.fingers.size).toBe(2);
    expect(e.friends.filter((f) => f.dragged).length).toBe(2);
    e.cancelFingers();
    expect(e.fingers.size).toBe(0);
    expect(e.friends.some((f) => f.dragged)).toBe(false);
  });
  it('lets a finger paint a continuous ribbon', () => {
    const e = new PlayEngine({ ...defaults, toy: 'paint' }, 1000, 700);
    e.down(1, { x: 100, y: 100 });
    for (let i = 0; i < 40; i++) {
      e.move(1, { x: 100 + i * 12, y: 100 + Math.sin(i) * 20 });
      e.step(1 / 60);
    }
    expect(e.ribbons.at(-1)!.points.length).toBeGreaterThan(30);
    e.up(1);
    expect(e.fingers.size).toBe(0);
  });
  it('reveals an animal with one touch, then closes its egg gently', () => {
    const e = new PlayEngine({ ...defaults, toy: 'peek' }, 1000, 700);
    e.down(1, e.friends[0]);
    e.up(1);
    expect(e.friends[0].targetGrowth).toBe(1);
    for (let i = 0; i < 400; i++) e.step(1 / 60);
    expect(e.friends[0].growth).toBeLessThan(0.01);
  });
  it('grows a flower with repeated easy actions', () => {
    const e = new PlayEngine({ ...defaults, toy: 'garden' }, 1000, 700);
    e.down(1, e.friends[0]);
    e.up(1);
    e.step(0.04);
    e.down(1, e.friends[0]);
    e.up(1);
    expect(e.friends[0].targetGrowth).toBe(1);
    e.down(1, e.friends[0]);
    e.up(1);
    expect(e.friends[0].targetGrowth).toBe(0);
  });
});
describe('resilience under little hands', () => {
  for (const toy of toys)
    it(`bounds resources during ${toy.name} key storms`, () => {
      const e = new PlayEngine({ ...defaults, toy: toy.id }, 390, 844);
      for (let i = 0; i < 1800; i++) {
        e.step(0.04);
        e.keyboard();
      }
      expect(e.friends.length).toBeLessThanOrEqual(LIMITS.friends);
      expect(e.particles.length).toBeLessThanOrEqual(LIMITS.particles);
      expect(e.ribbons.length).toBeLessThanOrEqual(LIMITS.ribbons);
      for (const friend of e.friends) {
        expect(Number.isFinite(friend.x + friend.y + friend.vx + friend.vy)).toBe(true);
        expect(Math.abs(friend.vy)).toBeLessThanOrEqual(700);
      }
    });
  it('bounds a very long painted swipe', () => {
    const e = new PlayEngine({ ...defaults, toy: 'paint' }, 390, 844);
    e.down(1, { x: 10, y: 100 });
    for (let i = 0; i < 2000; i++) {
      e.move(1, { x: i % 390, y: 100 + (i % 600) });
      e.step(0.01);
    }
    expect(e.ribbons.every((r) => r.points.length <= LIMITS.ribbonPoints)).toBe(true);
  });
  it('separates coincident bouncing friends without invalid physics', () => {
    const e = new PlayEngine({ ...defaults, toy: 'bounce' }, 1000, 700);
    e.friends[0].x = e.friends[1].x = 300;
    e.friends[0].y = e.friends[1].y = 300;
    e.step(0.02);
    expect(distance(e.friends[0], e.friends[1])).toBeGreaterThan(0);
  });
  it('keeps toys visible through rotation and clears held fingers', () => {
    const e = new PlayEngine(defaults, 1000, 700);
    e.down(1, e.friends[0]);
    e.resize(390, 844);
    e.step(0.02);
    expect(e.fingers.size).toBe(0);
    for (const friend of e.friends) {
      expect(friend.x).toBeGreaterThanOrEqual(friend.r);
      expect(friend.x).toBeLessThanOrEqual(390 - friend.r);
    }
  });
  it('validates local settings and can migrate older sound preferences', () => {
    expect(validatePreferences(null)).toEqual(defaults);
    expect(validatePreferences({ toy: 'bad', volume: Infinity, mode: 'bad' })).toEqual(defaults);
    expect(validatePreferences({ sound: false, volume: 4, calm: true, breakMinutes: -10 })).toEqual(
      { ...defaults, sound: false, volume: 1, calm: true },
    );
  });
});
