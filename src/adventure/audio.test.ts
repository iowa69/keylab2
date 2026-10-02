import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaults } from '../playroom/settings';

class Utterance {
  text: string;
  lang = '';
  voice: unknown;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
let spoken: Utterance[];
let synthesis: {
  getVoices: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
};
beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  spoken = [];
  synthesis = {
    getVoices: vi.fn(() => []),
    speak: vi.fn((utterance: Utterance) => spoken.push(utterance)),
    cancel: vi.fn(),
    resume: vi.fn(),
  };
  vi.stubGlobal('window', { speechSynthesis: synthesis, dispatchEvent: vi.fn() });
  vi.stubGlobal('document', { hidden: false });
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('short English speech for toddler interactions', () => {
  it('lets iPad pick English when voices have not loaded', async () => {
    const { speak } = await import('./audio');
    speak('Hello, friend!', defaults);
    expect(spoken[0].lang).toBe('en-GB');
  });
  it('keeps only the newest waiting discovery during rapid input', async () => {
    const { speak } = await import('./audio');
    for (const word of ['Apple', 'Bee', 'Cat', 'Duck']) speak(word, defaults);
    expect(spoken.map((u) => u.text)).toEqual(['Apple']);
    spoken[0].onend?.();
    await vi.advanceTimersByTimeAsync(100);
    expect(spoken.map((u) => u.text)).toEqual(['Apple', 'Duck']);
  });
  it('a deliberate replay interrupts and stale events cannot revive an old queue', async () => {
    const { speak } = await import('./audio');
    speak('Apple', defaults);
    speak('Bee', defaults);
    const stale = spoken[0];
    speak('Saturn has rings!', defaults, { interrupt: true });
    stale.onend?.();
    await vi.advanceTimersByTimeAsync(1000);
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(spoken.map((u) => u.text)).toEqual(['Apple', 'Saturn has rings!']);
  });
  it('pause cancels queued speech and silent settings do not speak', async () => {
    const { speak, hushVoice } = await import('./audio');
    speak('Apple', defaults);
    speak('Bee', defaults);
    spoken[0].onend?.();
    hushVoice();
    await vi.advanceTimersByTimeAsync(1000);
    speak('Cat', { ...defaults, narration: false });
    speak('Duck', { ...defaults, volume: 0 });
    expect(spoken.map((u) => u.text)).toEqual(['Apple']);
  });
});
