import type { Preferences } from '../playroom/settings';
let context: AudioContext | undefined;
let master: GainNode | undefined;
let lastNote = -1000,
  lastSpeech = -1000;
export const frequencies = [
  261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99,
];
export function playTone(index: number, settings: Preferences, duration = 0.45) {
  if (!settings.sound || document.hidden || performance.now() - lastNote < 45) return;
  lastNote = performance.now();
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    if (!master) {
      master = context.createGain();
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.ratio.value = 12;
      master.connect(limiter).connect(context.destination);
    }
    const now = context.currentTime;
    master.gain.setTargetAtTime(settings.volume * 0.23, now, 0.02);
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value =
      frequencies[
        ((Math.round(index) % frequencies.length) + frequencies.length) % frequencies.length
      ];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.08, Math.min(duration, 1.5)));
    oscillator.connect(gain).connect(master);
    oscillator.start();
    oscillator.stop(now + Math.max(0.08, Math.min(duration, 1.5)) + 0.05);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch {
    /* Sound is optional. */
  }
}
export function hush() {
  if (context && master) master.gain.setTargetAtTime(0, context.currentTime, 0.015);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function speak(text: string, settings: Preferences) {
  if (
    !settings.sound ||
    document.hidden ||
    !('speechSynthesis' in window) ||
    performance.now() - lastSpeech < 900
  )
    return;
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.localService && v.lang.startsWith('en'));
  if (!voice) return;
  lastSpeech = performance.now();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = 0.8;
  utterance.pitch = 1.15;
  utterance.volume = Math.min(0.65, settings.volume);
  window.speechSynthesis.speak(utterance);
}
