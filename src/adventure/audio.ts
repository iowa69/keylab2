import type { Preferences } from '../playroom/settings';
let context: AudioContext | undefined;
let master: GainNode | undefined;
let noise: AudioBuffer | undefined;
let lastNote = -1000,
  lastEffect = -1000;
const sources = new Set<AudioScheduledSourceNode>();
export const frequencies = [
  261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99,
];
export type SoundKind =
  'horn' | 'meow' | 'pop' | 'cheer' | 'giggle' | 'yuck' | 'splash' | 'boing' | 'whoosh';
/** Called from a real pointer/key gesture so iPad can unlock and resume audio. */
export function unlockAudio(settings: Preferences) {
  if (!settings.sound || settings.volume <= 0 || document.hidden) return;
  try {
    context ??= new AudioContext();
    if (context.state !== 'running' && context.state !== 'closed')
      void context.resume().catch(() => {});
    if (!master) {
      master = context.createGain();
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.ratio.value = 12;
      master.connect(limiter).connect(context.destination);
    }
    master.gain.setTargetAtTime(settings.volume * 0.22, context.currentTime, 0.025);
    if ('speechSynthesis' in window && window.speechSynthesis.paused)
      window.speechSynthesis.resume();
  } catch {
    /* Every game also works silently. */
  }
}
function voice(
  from: number,
  to: number,
  duration: number,
  delay = 0,
  type: OscillatorType = 'triangle',
  volume = 0.38,
) {
  if (!context || !master || sources.size >= 24) return;
  const ctx = context,
    at = ctx.currentTime + delay,
    osc = ctx.createOscillator(),
    gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(30, from), at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), at + duration);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
  osc.connect(gain).connect(master);
  sources.add(osc);
  osc.onended = () => {
    sources.delete(osc);
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(at);
  osc.stop(at + duration + 0.03);
}
export function playTone(index: number, settings: Preferences, duration = 0.45) {
  if (
    !settings.sound ||
    settings.volume <= 0 ||
    document.hidden ||
    performance.now() - lastNote < 45
  )
    return;
  lastNote = performance.now();
  unlockAudio(settings);
  const frequency =
    frequencies[
      ((Math.round(index) % frequencies.length) + frequencies.length) % frequencies.length
    ];
  voice(frequency, frequency, Math.max(0.08, Math.min(duration, 1.5)));
}
export function playSound(kind: SoundKind, settings: Preferences) {
  if (
    !settings.sound ||
    settings.volume <= 0 ||
    document.hidden ||
    performance.now() - lastEffect < 110
  )
    return;
  lastEffect = performance.now();
  unlockAudio(settings);
  if (!context || !master) return;
  if (kind === 'horn') {
    voice(220, 215, 0.34, 0, 'triangle', 0.28);
    voice(277, 270, 0.34, 0, 'triangle', 0.2);
  } else if (kind === 'meow') {
    voice(540, 870, 0.18, 0, 'triangle', 0.28);
    voice(870, 370, 0.43, 0.15, 'triangle', 0.32);
    voice(1080, 600, 0.48, 0.07, 'sine', 0.08);
  } else if (kind === 'giggle') {
    [0, 0.14, 0.29].forEach((delay, i) =>
      voice(430 + i * 65, 330 + i * 50, 0.11, delay, 'sine', 0.34),
    );
  } else if (kind === 'yuck') {
    voice(320, 185, 0.22, 0, 'triangle', 0.25);
    voice(240, 120, 0.28, 0.19, 'triangle', 0.22);
  } else if (kind === 'cheer') {
    [0, 2, 4, 7].forEach((n, i) => voice(frequencies[n], frequencies[n], 0.28, i * 0.095));
  } else if (kind === 'boing') {
    voice(130, 390, 0.11, 0, 'sine', 0.4);
    voice(390, 95, 0.32, 0.1, 'sine', 0.3);
  } else if (kind === 'pop') voice(720, 210, 0.1, 0, 'sine', 0.35);
  else {
    if (sources.size >= 24) return;
    const ctx = context,
      duration = kind === 'splash' ? 0.38 : 0.6,
      at = ctx.currentTime;
    noise ??= (() => {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    })();
    const source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = noise;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(kind === 'splash' ? 1800 : 800, at);
    filter.frequency.exponentialRampToValueAtTime(180, at + duration);
    gain.gain.setValueAtTime(0.001, at);
    gain.gain.linearRampToValueAtTime(0.24, at + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    source.connect(filter).connect(gain).connect(master);
    sources.add(source);
    source.onended = () => {
      sources.delete(source);
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start();
    source.stop(at + duration);
  }
}
type SpeechRequest = { text: string; settings: Preferences };
let currentSpeech: SpeechSynthesisUtterance | null = null;
let pendingSpeech: SpeechRequest | null = null;
let speechEpoch = 0;
let speechTimer: ReturnType<typeof setTimeout> | undefined;
function say(request: SpeechRequest) {
  if (
    !request.settings.sound ||
    !request.settings.narration ||
    document.hidden ||
    !('speechSynthesis' in window)
  )
    return;
  const synthesis = window.speechSynthesis,
    utterance = new SpeechSynthesisUtterance(request.text);
  const voices = synthesis.getVoices();
  // iPad can supply an empty list until its first utterance. Let the system pick English then.
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const selected =
    english.find((v) => v.localService && /^en[-_]GB/i.test(v.lang)) ??
    english.find((v) => v.localService) ??
    english[0];
  if (selected) utterance.voice = selected;
  utterance.lang = selected?.lang ?? 'en-GB';
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  utterance.volume = Math.min(0.8, request.settings.volume);
  const epoch = speechEpoch;
  currentSpeech = utterance;
  const finished = () => {
    if (epoch !== speechEpoch || currentSpeech !== utterance) return;
    currentSpeech = null;
    const next = pendingSpeech;
    pendingSpeech = null;
    if (next) speechTimer = setTimeout(() => say(next), 100);
  };
  utterance.onend = finished;
  utterance.onerror = finished;
  window.dispatchEvent(new CustomEvent('keylab-spoken', { detail: request.text }));
  try {
    synthesis.resume();
    synthesis.speak(utterance);
  } catch {
    finished();
  }
}
/** Deliberate taps can interrupt; ambient discoveries keep just one next sentence. */
export function speak(text: string, settings: Preferences, options: { interrupt?: boolean } = {}) {
  if (
    !settings.sound ||
    !settings.narration ||
    settings.volume <= 0 ||
    document.hidden ||
    !('speechSynthesis' in window)
  )
    return;
  const request = { text: text.trim().slice(0, 180), settings: { ...settings } };
  if (!request.text) return;
  if (options.interrupt) {
    speechEpoch++;
    clearTimeout(speechTimer);
    pendingSpeech = null;
    currentSpeech = null;
    window.speechSynthesis.cancel();
    say(request);
  } else if (currentSpeech) {
    if (currentSpeech.text !== request.text) pendingSpeech = request;
  } else {
    clearTimeout(speechTimer);
    pendingSpeech = null;
    say(request);
  }
}
export function hushVoice() {
  speechEpoch++;
  clearTimeout(speechTimer);
  currentSpeech = null;
  pendingSpeech = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function hush() {
  hushVoice();
  if (context && master) master.gain.setTargetAtTime(0, context.currentTime, 0.015);
  for (const source of sources) {
    try {
      source.stop();
    } catch {
      /* It may already have ended. */
    }
  }
  sources.clear();
}
