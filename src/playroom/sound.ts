import type { Preferences, ToyId } from './settings';

let audio: AudioContext | undefined;
let master: GainNode | undefined;
let lastNote = -1000;
const notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

export function sound(toy: ToyId, tone: number, settings: Preferences) {
  if (!settings.sound || document.hidden || performance.now() - lastNote < 65) return;
  lastNote = performance.now();
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume().catch(() => {});
    if (!master) {
      master = audio.createGain();
      const limiter = audio.createDynamicsCompressor();
      limiter.threshold.value = -20;
      limiter.knee.value = 12;
      limiter.ratio.value = 16;
      master.connect(limiter).connect(audio.destination);
    }
    master.gain.setTargetAtTime(settings.volume * 0.2, audio.currentTime, 0.02);
    const start = audio.currentTime;
    const voice = audio.createOscillator();
    const envelope = audio.createGain();
    const frequency = notes[Math.abs(Math.round(tone)) % notes.length];
    voice.type = toy === 'stars' || toy === 'paint' ? 'triangle' : 'sine';
    voice.frequency.setValueAtTime(frequency * (toy === 'bounce' ? 0.6 : 1), start);
    if (toy === 'sea') voice.frequency.exponentialRampToValueAtTime(frequency * 1.8, start + 0.12);
    if (toy === 'peek') voice.frequency.exponentialRampToValueAtTime(frequency * 1.25, start + 0.2);
    if (toy === 'bounce')
      voice.frequency.exponentialRampToValueAtTime(frequency * 0.35, start + 0.18);
    const length = settings.calm ? 0.55 : toy === 'stars' ? 1.1 : 0.45;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(0.45, start + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
    voice.connect(envelope).connect(master);
    voice.start(start);
    voice.stop(start + length + 0.03);
    voice.onended = () => {
      voice.disconnect();
      envelope.disconnect();
    };
  } catch {
    /* A blocked audio device never blocks the toy. */
  }
}
export function quiet() {
  if (audio && master) master.gain.setTargetAtTime(0, audio.currentTime, 0.015);
}
