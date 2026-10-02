import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { playSound, playTone, speak } from './audio';
import { useGameKeys } from './useGameKeys';
import './arcade.css';

type FruitKind = 'strawberry' | 'orange' | 'blueberry';
type FallingFruit = { id: number; x: number; y: number; wobble: number };
type PicnicState = {
  round: number;
  caught: number;
  basket: number;
  fruits: FallingFruit[];
  time: number;
  spawnAt: number;
  nextId: number;
  lastInput: number;
  sparkle: number;
  phase: 'catch' | 'ready' | 'served';
  servedAt: number;
  waveUntil: number;
  flutterUntil: number;
};

const FRUITS: FruitKind[] = ['strawberry', 'orange', 'blueberry'];
const NAMES: Record<FruitKind, string> = {
  strawberry: 'strawberries',
  orange: 'oranges',
  blueberry: 'blueberries',
};
const LANES = [18, 82, 42, 24, 76, 50];
const initialState = (): PicnicState => ({
  round: 0,
  caught: 0,
  basket: 50,
  fruits: [{ id: 0, x: 50, y: 17, wobble: 0 }],
  time: 0,
  spawnAt: 2.2,
  nextId: 1,
  lastInput: -20,
  sparkle: 0,
  phase: 'catch',
  servedAt: 0,
  waveUntil: 0,
  flutterUntil: 0,
});
const goalFor = (round: number) => 3 + (round % 3);
const snapshot = (state: PicnicState): PicnicState => ({
  ...state,
  fruits: state.fruits.map((fruit) => ({ ...fruit })),
});

function FruitArt({ kind }: { kind: FruitKind }) {
  return (
    <svg viewBox="0 0 100 110" fill="none" aria-hidden="true">
      {kind === 'strawberry' ? (
        <>
          <path
            d="M14 40C11 17 42 17 50 28C63 13 91 22 87 45C83 71 65 96 50 101C34 95 16 66 14 40Z"
            fill="#F65F74"
            stroke="#AC3D57"
            strokeWidth="3"
          />
          <path d="M50 28L29 18L37 34L17 34L37 45L51 32L64 42L81 32L63 30L70 13Z" fill="#4A9B60" />
          <path
            d="M28 47L30 52M48 51L49 56M68 46L67 51M39 68L41 73M62 67L60 72M51 83L51 86"
            stroke="#FFE9AD"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M23 40C20 50 24 60 28 66"
            stroke="#FF9CAB"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      ) : kind === 'orange' ? (
        <>
          <circle cx="50" cy="61" r="39" fill="#FFA731" stroke="#D77728" strokeWidth="3" />
          <path d="M50 24C53 14 66 8 81 15C74 32 58 33 50 24Z" fill="#479F60" />
          <path d="M48 28L46 15" stroke="#825C45" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M24 48C27 39 32 36 38 34"
            stroke="#FFDB80"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="70" cy="79" r="2" fill="#E78826" />
          <circle cx="62" cy="88" r="2" fill="#E78826" />
          <circle cx="77" cy="65" r="2" fill="#E78826" />
        </>
      ) : (
        <>
          <path d="M46 27C34 14 22 17 20 22C26 38 36 39 46 34Z" fill="#5BAB72" />
          <circle cx="50" cy="63" r="37" fill="#7D87DC" stroke="#505CA5" strokeWidth="3" />
          <path d="M50 25L56 34L67 34L61 43L63 54L50 48L39 54L41 42L34 34L45 34Z" fill="#515DA3" />
          <path
            d="M25 54C23 63 26 71 31 77"
            stroke="#ADB9F4"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <ellipse cx="66" cy="79" rx="11" ry="7" fill="#6975C8" />
        </>
      )}
    </svg>
  );
}

function Bear({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 150 160" fill="none" aria-hidden="true">
      <ellipse cx="77" cy="148" rx="61" ry="8" fill="#B5694420" />
      <ellipse className="picnic-bear-breath" cx="76" cy="124" rx="41" ry="31" fill="#C88751" />
      <g className="picnic-bear-head">
        <circle cx="32" cy="39" r="21" fill="#CF905B" />
        <circle cx="118" cy="39" r="21" fill="#CF905B" />
        <circle cx="32" cy="39" r="12" fill="#ECAE7B" />
        <circle cx="118" cy="39" r="12" fill="#ECAE7B" />
        <rect x="22" y="30" width="107" height="89" rx="42" fill="#DB9F6A" />
        <ellipse cx="77" cy="86" rx="28" ry="21" fill="#F9DAA8" />
        {happy ? (
          <>
            <path
              d="M44 68Q51 59 58 68M94 68Q101 59 108 68"
              stroke="#513C39"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path className="picnic-bear-chew" d="M62 88Q77 111 92 88Z" fill="#70433C" />
            <path d="M69 99Q78 91 86 99" fill="#EE8586" />
          </>
        ) : (
          <>
            <ellipse className="picnic-bear-blink" cx="51" cy="66" rx="4" ry="6" fill="#513C39" />
            <ellipse className="picnic-bear-blink" cx="101" cy="66" rx="4" ry="6" fill="#513C39" />
            <path d="M66 91Q77 100 88 91" stroke="#70433C" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        <ellipse cx="77" cy="81" rx="8" ry="6" fill="#513C39" />
        <ellipse cx="40" cy="84" rx="9" ry="5" fill="#EFAC8B" />
        <ellipse cx="112" cy="84" rx="9" ry="5" fill="#EFAC8B" />
      </g>
      <path d="M60 118L77 126L91 118L86 139L77 132L66 138Z" fill="#66B7A2" />
      <ellipse
        cx="32"
        cy="129"
        rx="14"
        ry="19"
        fill="#DB9F6A"
        transform={happy ? 'rotate(40 32 129)' : undefined}
      />
      <ellipse
        className="picnic-bear-wave"
        cx="121"
        cy="126"
        rx="14"
        ry="19"
        fill="#DB9F6A"
        transform={happy ? 'rotate(-40 121 126)' : undefined}
      />
    </svg>
  );
}

function Basket({ kind, caught }: { kind: FruitKind; caught: number }) {
  return (
    <div className="picnic-basket-art">
      <div className="picnic-basket-fruit">
        {Array.from({ length: Math.min(5, caught) }, (_, index) => (
          <span
            key={index}
            style={{
              left: `${15 + index * 14}%`,
              bottom: `${index % 2 ? 7 : 0}px`,
              rotate: `${index % 2 ? 13 : -10}deg`,
            }}
          >
            <FruitArt kind={kind} />
          </span>
        ))}
      </div>
      <svg viewBox="0 0 200 120" fill="none" aria-hidden="true">
        <path d="M44 37C40-9 159-9 156 37" stroke="#A96D3D" strokeWidth="11" />
        <path
          d="M20 32H180L163 106H37Z"
          fill="#DCA768"
          stroke="#A16B44"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M25 52H176M30 73H170M34 94H165M57 34L67 105M86 34L89 105M113 34L111 105M143 34L133 105"
          stroke="#BA824C"
          strokeWidth="4"
        />
        <rect
          x="12"
          y="26"
          width="177"
          height="16"
          rx="8"
          fill="#EFCA89"
          stroke="#A16B44"
          strokeWidth="3"
        />
        <rect x="68" y="53" width="63" height="45" rx="14" fill="#FFF2C9" />
        <ellipse cx="86" cy="70" rx="3" ry="4" fill="#735344" />
        <ellipse cx="112" cy="70" rx="3" ry="4" fill="#735344" />
        <path d="M87 81Q100 92 111 81" stroke="#735344" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function ArcadeGame({ settings, paused, onCelebrate }: GameProps) {
  const engine = useRef<PicnicState>(initialState());
  const [frame, setFrame] = useState<PicnicState>(() => snapshot(engine.current));
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const live = useRef({ settings, paused, onCelebrate });
  live.current = { settings, paused, onCelebrate };
  const publish = () => setFrame(snapshot(engine.current));
  const nextRound = () => {
    const current = engine.current;
    if (live.current.paused || current.phase !== 'served') return;
    current.round += 1;
    current.caught = 0;
    current.phase = 'catch';
    current.fruits = [{ id: current.nextId++, x: 50, y: 15, wobble: 0 }];
    current.spawnAt = current.time + 2.2;
    current.basket = 50;
    current.sparkle = 0;
    publish();
  };
  const guide = (x?: number, boost = false) => {
    if (live.current.paused) return;
    const current = engine.current;
    if (current.phase !== 'catch') return;
    const target = current.fruits.reduce<FallingFruit | undefined>(
      (best, fruit) => (!best || fruit.y > best.y ? fruit : best),
      undefined,
    );
    current.basket = Math.max(12, Math.min(88, x ?? target?.x ?? 50));
    current.lastInput = current.time;
    if (boost && target) target.y = Math.min(81, target.y + 16);
    playTone(current.caught % 5, live.current.settings, 0.07);
    publish();
  };
  const serve = () => {
    const current = engine.current;
    if (live.current.paused || current.phase !== 'ready') return;
    current.phase = 'served';
    current.waveUntil = current.time + 3;
    playSound('giggle', live.current.settings);
    current.servedAt = current.time;
    playTone(7, live.current.settings, 0.3);
    speak('Yummy! Thank you!', live.current.settings);
    live.current.onCelebrate('Fruit picnic');
    publish();
  };

  useEffect(() => {
    let raf = 0;
    let previous = 0;
    let lastPaint = 0;
    const tick = (now: number) => {
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      const { settings: currentSettings, paused: isPaused } = live.current;
      const current = engine.current;
      if (!isPaused && !document.hidden) {
        current.time += dt;
        current.sparkle = Math.max(0, current.sparkle - dt);
        if (current.phase === 'catch') {
          const wanted = goalFor(current.round);
          if (
            current.time >= current.spawnAt &&
            current.fruits.length < Math.min(2, wanted - current.caught)
          ) {
            current.fruits.push({
              id: current.nextId++,
              x: LANES[(current.nextId + current.round) % LANES.length],
              y: 10,
              wobble: current.nextId,
            });
            current.spawnAt = current.time + 2.6;
          }
          for (const fruit of current.fruits) {
            fruit.y += dt * (currentSettings.calm ? 10 : currentSettings.mode === 'baby' ? 14 : 19);
            if (fruit.y >= 81) {
              const catchWidth = currentSettings.mode === 'baby' ? 22 : 17;
              if (
                current.lastInput >= 0 &&
                Math.abs(fruit.x - current.basket) <= catchWidth &&
                current.caught < wanted
              ) {
                current.caught++;
                current.sparkle = 0.7;
                fruit.y = 200;
                playTone(current.caught + 1, currentSettings, 0.14);
                speak(String(current.caught), currentSettings);
                if (current.caught >= wanted) {
                  current.phase = 'ready';
                  current.fruits = [];
                  speak('Picnic time!', currentSettings);
                  break;
                }
              } else {
                // A miss simply returns the same fruit to the tree.
                fruit.y = 9;
                if (currentSettings.mode === 'baby' && current.time - current.lastInput < 5)
                  fruit.x = current.basket;
              }
            }
          }
          current.fruits = current.fruits.filter((fruit) => fruit.y < 150);
        }
        if (now - lastPaint > 30) {
          lastPaint = now;
          setFrame(snapshot(current));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useGameKeys(paused, (key) => {
    if (key === 'Escape') return;
    const current = engine.current;
    if (current.phase === 'ready') {
      serve();
      return;
    }
    if (current.phase === 'served') {
      nextRound();
      return;
    }
    if (key === 'ArrowLeft' || key.toLowerCase() === 'a') guide(current.basket - 13, true);
    else if (key === 'ArrowRight' || key.toLowerCase() === 'd') guide(current.basket + 13, true);
    else guide(undefined, true);
  });

  useEffect(() => {
    if (paused) pointer.current = null;
  }, [paused]);
  const kind = FRUITS[frame.round % FRUITS.length];
  const goal = goalFor(frame.round);
  const positionFromPointer = (clientX: number) => {
    const bounds = stage.current?.getBoundingClientRect();
    if (bounds) guide(((clientX - bounds.left) / bounds.width) * 100);
  };
  return (
    <section
      className={`picnic-game ${settings.calm ? 'picnic-calm' : ''} ${paused ? 'picnic-paused' : ''}`}
      aria-label="Fruit picnic arcade"
      data-testid="arcade-game"
      data-phase={frame.phase}
    >
      <div
        className="picnic-order"
        role="status"
        aria-live="polite"
        aria-label={`${frame.caught} of ${goal} ${NAMES[kind]} collected`}
      >
        <span className="picnic-order-number">
          {frame.caught}
          <small> / {goal}</small>
        </span>
        <div className="picnic-order-fruits">
          {Array.from({ length: goal }, (_, index) => (
            <span key={index} className={index < frame.caught ? 'collected' : ''}>
              <FruitArt kind={kind} />
              {index < frame.caught && <i>✓</i>}
            </span>
          ))}
        </div>
        <span className="picnic-order-label">
          {frame.phase === 'catch'
            ? 'Fill the picnic basket'
            : frame.phase === 'ready'
              ? 'Time for a picnic!'
              : 'A very happy tummy!'}
        </span>
      </div>
      <div
        className="picnic-stage"
        ref={stage}
        onPointerDown={(event) => {
          if (paused || (event.target instanceof Element && event.target.closest('button'))) return;
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          positionFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (pointer.current === event.pointerId) positionFromPointer(event.clientX);
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onLostPointerCapture={() => {
          pointer.current = null;
        }}
      >
        <svg
          className="picnic-scenery"
          viewBox="0 0 800 500"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <rect width="800" height="500" fill="#D8F1E5" />
          <path d="M0 316Q160 211 347 319Q615 207 800 325V500H0Z" fill="#A8D5A9" />
          <path d="M0 385Q212 275 452 373Q665 298 800 359V500H0Z" fill="#88C69B" />
          <path d="M0 443Q201 398 418 436Q656 392 800 432V500H0Z" fill="#72B789" />
          <path d="M78 30L65 335M705 26L732 330" stroke="#B69A70" strokeWidth="40" />
          <path
            d="M64 135L139 76M718 141L659 93"
            stroke="#B69A70"
            strokeWidth="17"
            strokeLinecap="round"
          />
          <path
            d="M0 2H800V82Q752 93 709 65Q664 113 606 69Q553 114 506 59Q449 105 402 62Q351 108 298 59Q245 107 198 66Q140 112 94 66Q43 101 0 66Z"
            fill="#64A886"
          />
          <path
            d="M0 0H800V32Q712 66 646 31Q575 77 508 30Q432 70 366 27Q287 71 220 28Q144 64 83 30Q34 53 0 34Z"
            fill="#80BD92"
          />
          <path
            d="M180 155C159 155 156 133 173 126C172 106 206 101 213 122C236 116 253 140 234 151Z"
            fill="#FCFFF5"
            opacity=".8"
          />
          <path
            d="M512 193C491 193 488 171 505 164C504 144 538 139 545 160C568 154 585 178 566 189Z"
            fill="#FCFFF5"
            opacity=".7"
          />
          <path
            d="M24 393L28 372M19 382L28 388L36 379M774 399L771 378M764 386L772 391L780 384M632 433L635 416"
            stroke="#4D9B73"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="120" cy="423" r="5" fill="#FFF2A5" />
          <circle cx="655" cy="400" r="5" fill="#FFF2A5" />
          <circle cx="554" cy="446" r="4" fill="#FFD2C6" />
        </svg>
        <button
          type="button"
          className={`picnic-bear ${frame.phase === 'served' ? 'picnic-bear-happy' : ''} ${frame.time < frame.waveUntil ? 'picnic-bear-waving' : ''}`}
          aria-label="Say hello to Bear"
          disabled={paused}
          onClick={() => {
            if (paused) return;
            engine.current.waveUntil = engine.current.time + 2;
            playSound('giggle', settings);
            speak('Hello! Shall we have a picnic?', settings, { interrupt: true });
            publish();
          }}
        >
          <Bear happy={frame.phase === 'served'} />
          <span className="picnic-bear-bubble">
            {frame.phase === 'served' ? (
              <span className="picnic-heart">♥</span>
            ) : (
              <FruitArt kind={kind} />
            )}
          </span>
        </button>
        <button
          type="button"
          className={`picnic-butterfly ${frame.time < frame.flutterUntil ? 'picnic-butterfly-hello' : ''}`}
          aria-label="Say hello to Butterfly"
          disabled={paused}
          onClick={() => {
            if (paused) return;
            engine.current.flutterUntil = engine.current.time + 2;
            playSound('boing', settings);
            speak('Hello, butterfly!', settings);
            publish();
          }}
        >
          <svg viewBox="0 0 100 90" aria-hidden="true">
            <g className="picnic-wings">
              <path d="M48 44C2-16-9 47 33 52C-1 81 34 101 48 54Z" fill="#f1b97d" />
              <path d="M52 44C98-16 109 47 67 52C101 81 66 101 52 54Z" fill="#e6a4b2" />
              <g fill="#fff1cf">
                <ellipse cx="24" cy="32" rx="10" ry="13" transform="rotate(-35 24 32)" />
                <ellipse cx="77" cy="32" rx="10" ry="13" transform="rotate(35 77 32)" />
                <circle cx="29" cy="69" r="7" />
                <circle cx="71" cy="69" r="7" />
              </g>
            </g>
            <path d="M46 26v37q4 16 8 0V26" fill="#93775b" />
            <path
              d="m47 29-6-14m12 14 6-14"
              stroke="#93775b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="41" cy="15" r="3" fill="#93775b" />
            <circle cx="59" cy="15" r="3" fill="#93775b" />
          </svg>
        </button>
        {frame.phase === 'catch' &&
          frame.fruits.map((fruit) => (
            <button
              type="button"
              className="picnic-falling-fruit"
              key={fruit.id}
              style={{
                left: `${fruit.x}%`,
                top: `${fruit.y}%`,
                rotate: settings.calm
                  ? '0deg'
                  : `${Math.sin(frame.time * 2 + fruit.wobble) * 9}deg`,
              }}
              aria-label={`Guide basket to falling ${kind}`}
              disabled={paused}
              onClick={() => {
                guide(fruit.x, false);
                const target = engine.current.fruits.find((item) => item.id === fruit.id);
                if (target) target.y = Math.min(81, target.y + 23);
                publish();
              }}
            >
              <FruitArt kind={kind} />
            </button>
          ))}
        <div
          className={`picnic-basket ${frame.sparkle > 0 ? 'picnic-caught' : ''} ${frame.phase === 'served' ? 'picnic-basket-served' : ''}`}
          style={{ left: `${frame.phase === 'catch' ? frame.basket : 50}%` }}
          aria-hidden="true"
        >
          <Basket kind={kind} caught={frame.phase === 'served' ? 0 : frame.caught} />
          {frame.sparkle > 0 && <span className="picnic-catch-sparkle">✦</span>}
        </div>
        {frame.phase === 'served' && (
          <div className="picnic-delivery" aria-hidden="true">
            <FruitArt kind={kind} />
          </div>
        )}
        {frame.phase !== 'catch' && (
          <div className="picnic-finish" aria-live="polite">
            {frame.phase === 'ready' ? (
              <button
                type="button"
                className="picnic-serve"
                disabled={paused}
                onClick={serve}
                aria-label="Serve the fruit picnic"
              >
                <span aria-hidden="true">♡</span> Picnic time <span aria-hidden="true">➜</span>
              </button>
            ) : (
              <>
                <div className="picnic-yum" aria-hidden="true">
                  <span>♥</span>
                  <span>★</span>
                  <span>♥</span>
                </div>
                <button
                  type="button"
                  className="picnic-serve"
                  disabled={paused}
                  onClick={nextRound}
                  aria-label="Next fruit picnic"
                >
                  <span aria-hidden="true">↻</span> More fruit <span aria-hidden="true">➜</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="picnic-controls">
        <button
          type="button"
          aria-label="Move basket left"
          disabled={paused || frame.phase !== 'catch'}
          onClick={() => guide(engine.current.basket - 22, true)}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M21 6L10 16L21 26" />
          </svg>
        </button>
        <span className="picnic-control-hint">
          {frame.phase === 'catch' ? (
            <>
              <b>Catch the fruit!</b>
              <small>Drag the basket · tap fruit · press any key</small>
            </>
          ) : (
            <>
              <b>{frame.phase === 'ready' ? 'Someone is hungry…' : 'Yum! Thank you!'}</b>
              <small>
                {frame.phase === 'ready'
                  ? 'Give your fruit to Bear'
                  : 'A new fruit is ready to find'}
              </small>
            </>
          )}
        </span>
        <button
          type="button"
          aria-label="Move basket right"
          disabled={paused || frame.phase !== 'catch'}
          onClick={() => guide(engine.current.basket + 22, true)}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M11 6L22 16L11 26" />
          </svg>
        </button>
      </div>
    </section>
  );
}
