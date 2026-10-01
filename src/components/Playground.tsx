import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Keyboard,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sprout,
  Volume2,
} from 'lucide-react';
import { Animal, Face, Flower, Star, WorldArt } from './Art';
import {
  animalNames,
  challengeFor,
  countForKey,
  displayKey,
  keyIndex,
  letterWords,
  noteNames,
  palette,
  shapeNames,
  type Settings,
  type World,
} from '../lib/worlds';
import { hush, narrate, playNote } from '../lib/audio';

type Toy = {
  id: number;
  key: string;
  x: number;
  y: number;
  color: string;
  index: number;
  created: number;
};
let nextToy = 1;
export function Playground({
  world,
  settings,
  onBack,
  onNext,
  blocked,
}: {
  world: World;
  settings: Settings;
  onBack: () => void;
  onNext: () => void;
  blocked: boolean;
}) {
  const [mode, setMode] = useState<'free' | 'challenge'>('free');
  const [toys, setToys] = useState<Toy[]>([]);
  const [lastKey, setLastKey] = useState('');
  const [presses, setPresses] = useState(0);
  const [round, setRound] = useState(0);
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [breakTime, setBreakTime] = useState(false);
  const [full, setFull] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const theatre = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const celebrateRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPress = useRef(0);
  const activeSeconds = useRef(0);
  const challenge = challengeFor(world.id, round);
  const inactive = paused || breakTime || blocked;

  useEffect(() => {
    stage.current?.focus({ preventScroll: true });
    const cleanup = setInterval(
      () =>
        setToys((items) =>
          items.filter(
            (item) => Date.now() - item.created < (world.id === 'garden' ? 24000 : 7500),
          ),
        ),
      1000,
    );
    return () => {
      clearInterval(cleanup);
      clearTimeout(timer.current);
      hush();
    };
  }, [world.id]);
  useEffect(() => {
    const clock = setInterval(() => {
      if (inactive || document.hidden || !settings.breakMinutes) return;
      activeSeconds.current += 1;
      if (activeSeconds.current >= settings.breakMinutes * 60) {
        setBreakTime(true);
        hush();
      }
    }, 1000);
    return () => clearInterval(clock);
  }, [inactive, settings.breakMinutes]);
  useEffect(() => {
    const change = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        setPaused(true);
        hush();
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);

  const press = useCallback(
    (raw: string, position?: { x: number; y: number }) => {
      if (inactive) return;
      const time = performance.now();
      if (time - lastPress.current < 40) return;
      lastPress.current = time;
      const key = displayKey(raw);
      const index = keyIndex(raw);
      const count = world.id === 'space' ? countForKey(raw) : 1;
      const batch = Array.from({ length: count }, (_, i): Toy => ({
        id: nextToy++,
        key,
        index: index + (world.id === 'space' ? i : 0),
        x: position?.x ?? 12 + Math.random() * 76,
        y:
          position?.y ??
          (world.id === 'garden' ? 60 + Math.random() * 14 : 33 + Math.random() * 40),
        color: palette[index % palette.length],
        created: Date.now(),
      }));
      setToys((items) => [...items, ...batch].slice(-36));
      setLastKey(key);
      setPresses((n) => n + 1);
      playNote(raw, world.id, settings);
      if (
        mode === 'challenge' &&
        !celebrateRef.current &&
        (challenge.kind === 'any' || key === challenge.target)
      ) {
        progressRef.current += 1;
        setProgress(progressRef.current);
        if (progressRef.current >= challenge.total) {
          celebrateRef.current = true;
          setCelebrating(true);
          playNote(raw, world.id, settings, true);
          narrate('You did it! What a lovely discovery.', settings, true);
          timer.current = setTimeout(
            () => {
              progressRef.current = 0;
              celebrateRef.current = false;
              setProgress(0);
              setCelebrating(false);
              setRound((r) => r + 1);
            },
            settings.calm ? 2400 : 1900,
          );
        }
      } else if (mode === 'free') {
        const words =
          world.id === 'garden'
            ? letterWords[key]
              ? `${key}. ${letterWords[key]}.`
              : key
            : world.id === 'animals'
              ? animalNames[index % animalNames.length]
              : world.id === 'shapes'
                ? shapeNames[index % shapeNames.length]
                : world.id === 'space'
                  ? `${count} ${count === 1 ? 'star' : 'stars'}`
                  : '';
        if (words) narrate(words, settings);
      }
    },
    [inactive, world.id, settings, mode, challenge.kind, challenge.target, challenge.total],
  );
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (blocked || breakTime) return;
      if (event.key === 'Escape') {
        setPaused((p) => !p);
        hush();
        return;
      }
      if (paused || event.key === 'Tab') return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-ui]') &&
        (event.key === 'Enter' || event.key === ' ')
      )
        return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn'].includes(event.key)) return;
      if (event.cancelable) event.preventDefault();
      if (event.repeat || event.isComposing) return;
      pressRef.current(event.key);
    };
    window.addEventListener('keydown', keydown, { capture: true });
    return () => window.removeEventListener('keydown', keydown, { capture: true });
  }, [blocked, paused, breakTime]);

  function changeMode(value: 'free' | 'challenge') {
    clearTimeout(timer.current);
    setMode(value);
    setRound(0);
    setProgress(0);
    setCelebrating(false);
    progressRef.current = 0;
    celebrateRef.current = false;
    if (value === 'challenge') narrate(challengeFor(world.id, 0).spoken, settings, true);
    stage.current?.focus({ preventScroll: true });
  }
  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await theatre.current?.requestFullscreen();
    } catch {
      /* Fullscreen is an optional enhancement. */
    }
    stage.current?.focus({ preventScroll: true });
  }
  const touchKeys =
    world.id === 'space'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9']
      : world.id === 'music'
        ? ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K']
        : world.id === 'garden'
          ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
          : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return (
    <main
      id="main-content"
      className="playground page-width"
      ref={theatre}
      style={{ '--world-color': world.color, '--world-ink': world.ink } as React.CSSProperties}
    >
      <div className="play-topline" data-ui>
        <button className="text-button back-button" onClick={onBack}>
          <ArrowLeft size={17} /> All little worlds
        </button>
        <div className="mode-switch" aria-label="Play mode">
          <button aria-pressed={mode === 'free'} onClick={() => changeMode('free')}>
            <Sprout size={16} /> Free play
          </button>
          <button aria-pressed={mode === 'challenge'} onClick={() => changeMode('challenge')}>
            <Sparkles size={16} /> Little challenge
          </button>
        </div>
        <button
          className="icon-button fullscreen-button"
          aria-label={full ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={toggleFull}
        >
          {full ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
      <div className="play-heading">
        <span className="eyebrow">YOUR LITTLE WORLD OF {world.tag.split(' & ')[0]}</span>
        <h1>{world.name}</h1>
        <p>{world.hint}</p>
      </div>
      <div
        className={`play-stage ${settings.calm ? 'calm' : ''} ${celebrating ? 'is-celebrating' : ''}`}
        ref={stage}
        tabIndex={-1}
        aria-label={`${world.name} play area. ${world.hint}`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          stage.current?.focus({ preventScroll: true });
          const rect = e.currentTarget.getBoundingClientRect();
          const raw =
            mode === 'challenge' && challenge.kind === 'key'
              ? challenge.target
              : world.id === 'space'
                ? String(Math.floor(Math.random() * 5) + 1)
                : String.fromCharCode(65 + Math.floor(Math.random() * 26));
          press(raw, {
            x: Math.min(88, Math.max(12, ((e.clientX - rect.left) / rect.width) * 100)),
            y: Math.min(77, Math.max(32, ((e.clientY - rect.top) / rect.height) * 100)),
          });
        }}
      >
        <WorldArt world={world.id} />
        <div className="stage-instruction" aria-live="polite" aria-atomic="true">
          {celebrating ? (
            <>
              <span className="success-icon">
                <Check size={20} />
              </span>
              <div>
                <strong>You did it, little explorer!</strong>
                <span>Look what you made.</span>
              </div>
            </>
          ) : mode === 'challenge' ? (
            <>
              <span className="target-key">
                {challenge.kind === 'key' ? challenge.target : <Sparkles size={24} />}
              </span>
              <div>
                <strong>{challenge.prompt}</strong>
                <span>
                  {challenge.kind === 'key'
                    ? `Press ${challenge.target} on your keyboard, or tap it below.`
                    : 'Any key is the right key.'}
                </span>
                <div className="progress-dots" aria-label={`${progress} of ${challenge.total}`}>
                  {Array.from({ length: challenge.total }, (_, i) => (
                    <i key={i} className={i < progress ? 'filled' : ''} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="instruction-icon">
                <Keyboard size={24} />
              </span>
              <div>
                <strong>{presses ? world.prompt : 'Go on. Press any key!'}</strong>
                <span>
                  {presses
                    ? 'There’s always something lovely to discover.'
                    : 'Little fingers, big possibilities.'}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="toy-layer">
          {toys.map((toy) => (
            <div
              key={toy.id}
              data-testid="toy"
              className={`toy toy-${world.id}`}
              style={
                {
                  left: `${toy.x}%`,
                  top: `${toy.y}%`,
                  '--toy-color': toy.color,
                  '--wobble': `${(toy.index % 16) - 8}deg`,
                } as React.CSSProperties
              }
            >
              {world.id === 'garden' && (
                <svg viewBox="-65 -65 130 220">
                  <Flower
                    color={toy.color}
                    letter={toy.key}
                    size={0.95}
                    tilt={(toy.index % 12) - 6}
                  />
                </svg>
              )}
              {world.id === 'bubbles' && (
                <button
                  className="pop-bubble"
                  aria-label={`Pop bubble ${toy.key}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setToys((items) => items.filter((t) => t.id !== toy.id));
                    playNote(toy.key, 'bubbles', settings);
                  }}
                >
                  <span>{toy.key}</span>
                  <svg viewBox="-30 -20 60 40">
                    <Face scale={0.8} />
                  </svg>
                </button>
              )}
              {world.id === 'space' && (
                <svg viewBox="-60 -60 120 120">
                  <Star size={42} color={toy.color} face />
                </svg>
              )}
              {world.id === 'music' && (
                <div className="music-note">
                  <span>♪</span>
                  <small>{noteNames[toy.index % noteNames.length]}</small>
                </div>
              )}
              {world.id === 'shapes' && (
                <svg viewBox="-65 -65 130 130">
                  {toy.index % 5 === 0 ? (
                    <circle r="48" fill={toy.color} />
                  ) : toy.index % 5 === 1 ? (
                    <path
                      d="M0-51 52 43H-52Z"
                      fill={toy.color}
                      stroke={toy.color}
                      strokeWidth="9"
                      strokeLinejoin="round"
                    />
                  ) : toy.index % 5 === 2 ? (
                    <rect x="-45" y="-45" width="90" height="90" rx="15" fill={toy.color} />
                  ) : toy.index % 5 === 3 ? (
                    <Star size={48} color={toy.color} />
                  ) : (
                    <path d="M0 46C-90-10-33-76 0-30C33-76 90-10 0 46" fill={toy.color} />
                  )}
                  <Face y={4} />
                </svg>
              )}
              {world.id === 'animals' && (
                <>
                  <svg viewBox="-65 -90 150 180">
                    <Animal kind={animalNames[toy.index % animalNames.length]} />
                  </svg>
                  <span className="animal-name">{animalNames[toy.index % animalNames.length]}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {celebrating && !settings.calm && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    left: `${i * 5.5}%`,
                    background: palette[i % palette.length],
                    animationDelay: `${(i % 5) * 0.08}s`,
                    '--drift': `${i % 2 ? 70 : -70}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
        <div className="stage-bottom">
          <span className="play-status">
            <i /> {inactive ? 'Taking a little pause' : 'Every key is a little discovery'}
          </span>
          <div data-ui>
            <button
              className="stage-control"
              aria-label="Clear the playground"
              onClick={() => {
                setToys([]);
                setLastKey('');
                stage.current?.focus({ preventScroll: true });
              }}
            >
              <RotateCcw size={17} />
            </button>
            <button
              className="stage-control"
              aria-label="Pause play"
              onClick={() => {
                setPaused(true);
                hush();
              }}
            >
              <Pause size={18} />
            </button>
          </div>
        </div>
        {(paused || breakTime) && (
          <div className="pause-overlay" data-ui>
            <div className="pause-card">
              <svg viewBox="-65 -95 140 185">
                <Animal kind="bunny" />
              </svg>
              <h2>{breakTime ? 'Time for a little stretch.' : 'A little pause.'}</h2>
              <p>
                {breakTime
                  ? 'Wiggle your fingers. Reach for the sky. Your little worlds will be here.'
                  : 'Your little world will be right here.'}
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setPaused(false);
                  setBreakTime(false);
                  activeSeconds.current = 0;
                  stage.current?.focus({ preventScroll: true });
                }}
              >
                <Play size={17} fill="currentColor" />{' '}
                {breakTime ? 'Start a fresh playtime' : 'Keep playing'}
              </button>
              <button className="text-button" onClick={onBack}>
                Back to all worlds
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="keyboard-panel">
        <div className="keyboard-caption">
          <span>
            <Keyboard size={16} /> A real keyboard or a little tap. Both are magic.
          </span>
          <span className="last-key">
            {lastKey && (
              <>
                You pressed <kbd>{lastKey}</kbd>
              </>
            )}
          </span>
        </div>
        <div className={`on-screen-keys ${world.id === 'garden' ? 'alphabet-keys' : ''}`} data-ui>
          {touchKeys.map((key, i) => (
            <button
              key={key}
              className={`${lastKey === key ? 'just-pressed' : ''} ${mode === 'challenge' && challenge.target === key ? 'hint-key' : ''}`}
              style={{ '--key-color': palette[i % palette.length] } as React.CSSProperties}
              onClick={() => {
                press(key);
                stage.current?.focus({ preventScroll: true });
              }}
              aria-label={`Play ${key}`}
            >
              {key}
            </button>
          ))}
          {world.id !== 'garden' && (
            <button className="space-key" onClick={() => press(' ')} aria-label="Play space">
              <Sparkles size={17} /> Space
            </button>
          )}
        </div>
      </div>
      <div className="play-footnote">
        <span>
          <Sprout size={16} /> No wrong keys. No hurry. Just wonder.
        </span>
        <button className="text-button" onClick={onNext}>
          Explore another world <ArrowRight size={16} />
        </button>
        {settings.narration && (
          <button
            className="sr-only"
            onClick={() =>
              narrate(mode === 'challenge' ? challenge.spoken : world.hint, settings, true)
            }
          >
            <Volume2 /> Repeat instructions
          </button>
        )}
      </div>
    </main>
  );
}
