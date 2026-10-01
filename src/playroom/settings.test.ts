import { describe, it, expect } from 'vitest';
import { defaults, validatePreferences } from './settings';
describe('saved preferences from old versions or damaged storage', () => {
  it('uses safe defaults for malformed storage', () => {
    for (const value of [null, [], false, 'baby', 42])
      expect(validatePreferences(value)).toEqual(defaults);
  });
  it('preserves supported preferences while ignoring retired toys', () => {
    expect(
      validatePreferences({
        toy: 'stars',
        mode: 'toddler',
        sound: false,
        volume: 0.4,
        calm: true,
        contrast: true,
        breakMinutes: 5,
      }),
    ).toEqual({
      mode: 'toddler',
      sound: false,
      volume: 0.4,
      calm: true,
      contrast: true,
      breakMinutes: 5,
    });
  });
  it('bounds loudness and accepts only actual supported reminder numbers', () => {
    expect(validatePreferences({ volume: 80, breakMinutes: '5' })).toEqual({
      ...defaults,
      volume: 1,
    });
    expect(validatePreferences({ volume: -3, breakMinutes: 3 })).toEqual({
      ...defaults,
      volume: 0,
    });
    expect(validatePreferences({ volume: NaN, sound: 'false' })).toEqual(defaults);
  });
});
