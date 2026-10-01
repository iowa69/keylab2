import { describe, expect, it, vi } from 'vitest';
import {
  challengeFor,
  countForKey,
  defaultSettings,
  displayKey,
  readSettings,
  worlds,
} from './worlds';

describe('kid-friendly input', () => {
  it('gives special keys a friendly visible response', () => {
    expect(displayKey(' ')).toBe('★');
    expect(displayKey('ArrowUp')).toBe('↑');
    expect(displayKey('Backspace')).toBe('✦');
    expect(displayKey('é')).toBe('É');
    expect(displayKey('a')).toBe('A');
  });
  it('bounds the stars created by any single key', () => {
    for (const key of ['0', '10', '-1', 'a', 'Enter', '', '9']) {
      expect(countForKey(key)).toBeGreaterThanOrEqual(1);
      expect(countForKey(key)).toBeLessThanOrEqual(9);
    }
    expect(countForKey('4')).toBe(4);
  });
  it('keeps every challenge small and reachable, indefinitely', () => {
    for (const world of worlds)
      for (let round = 0; round < 100; round++) {
        const challenge = challengeFor(world.id, round);
        expect(challenge.total).toBeGreaterThanOrEqual(1);
        expect(challenge.total).toBeLessThanOrEqual(5);
        if (challenge.kind === 'key') expect(challenge.target).toMatch(/^[A-Z1-5]$/);
      }
  });
});
describe('resilient local settings', () => {
  it('can play when local storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('Blocked');
      },
    });
    expect(readSettings()).toEqual(defaultSettings);
    vi.unstubAllGlobals();
  });
  it('rejects corrupted stored data', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{bad json' });
    expect(readSettings()).toEqual(defaultSettings);
    vi.unstubAllGlobals();
  });
  it('validates and bounds externally changed preferences', () => {
    vi.stubGlobal('localStorage', {
      getItem: () =>
        JSON.stringify({
          sound: 'yes',
          volume: 100,
          calm: true,
          narration: 'yes',
          breakMinutes: -2,
        }),
    });
    expect(readSettings()).toEqual({ ...defaultSettings, volume: 1, calm: true });
    vi.unstubAllGlobals();
  });
});
