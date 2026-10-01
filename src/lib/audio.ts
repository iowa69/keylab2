import { keyIndex, type Settings, type WorldId } from './worlds';

let context: AudioContext | undefined;
let master: GainNode | undefined;
let lastNote = 0;
let lastSpeech = 0;
const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

// A bounded pentatonic voice keeps random key combinations gentle.
export function playNote(key: string, world: WorldId, settings: Settings, celebrate = false) {
  if (!settings.sound || document.hidden) return;
  const now = performance.now();
  if (!celebrate && now - lastNote < 55) return;
  lastNote = now;
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
    master.gain.setTargetAtTime(settings.volume * 0.22, context.currentTime, 0.02);
    const notes = celebrate ? [0, 2, 4, 5] : [keyIndex(key) % scale.length];
    notes.forEach((note, i) => {
      const osc = context!.createOscillator();
      const gain = context!.createGain();
      const start = context!.currentTime + i * 0.12;
      osc.type = world === 'music' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(scale[note] * (world === 'space' ? 0.5 : 1), start);
      if (world === 'bubbles')
        osc.frequency.exponentialRampToValueAtTime(scale[note] * 1.8, start + 0.14);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.65, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain).connect(master!);
      osc.start(start);
      osc.stop(start + 0.7);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  } catch {
    /* Play remains available if audio is unsupported or blocked. */
  }
}

export function hush() {
  if (context && master) master.gain.setTargetAtTime(0, context.currentTime, 0.01);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function narrate(text: string, settings: Settings, immediate = false) {
  if (!settings.sound || !settings.narration || document.hidden || !('speechSynthesis' in window))
    return;
  const now = performance.now();
  if (!immediate && now - lastSpeech < 1700) return;
  lastSpeech = now;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.82;
  utterance.pitch = 1.12;
  utterance.volume = Math.min(0.65, settings.volume);
  // Prefer an installed voice so narration never requires a remote service.
  const localVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.localService && v.lang.startsWith('en'));
  if (!localVoice) return;
  utterance.voice = localVoice;
  window.speechSynthesis.speak(utterance);
}
