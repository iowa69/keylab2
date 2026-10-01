import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Animal, Star } from './Art';
import { playTone, speak } from './audio';
import type { GameProps } from './types';
import { useGameKeys } from './useGameKeys';
import './splash.css';

const friends = [
  { kind: 'pig', name: 'Pig', color: '#ec9d9e', x: 23, y: 55 },
  { kind: 'duck', name: 'Duck', color: '#e8bd62', x: 50, y: 61 },
  { kind: 'bunny', name: 'Bunny', color: '#b0a2c7', x: 77, y: 53 },
] as const;
type Friend = { washed: number; cleanAt: number | null; x: number; y: number; scale: number };
type SplashState = {
  time: number;
  round: number;
  lastHit: number;
  aim: { x: number; y: number };
  sprayUntil: number;
  finishedAt: number | null;
  friends: Friend[];
};

function freshPuddle(round = 0): SplashState {
  return {
    time: 0,
    round,
    lastHit: -10,
    aim: { x: 500, y: 350 },
    sprayUntil: 0,
    finishedAt: null,
    friends: friends.map((friend) => ({
      washed: 0,
      cleanAt: null,
      x: friend.x,
      y: friend.y,
      scale: 1,
    })),
  };
}
function takePicture(state: SplashState) {
  return {
    ...state,
    aim: { ...state.aim },
    friends: state.friends.map((friend) => ({ ...friend })),
  };
}

function Mud({ washed = 0, ...props }: { washed?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      {washed < 4 && <path d="M22 56q-9 4-6 12 5 8 14 3l4-8q-2-9-12-7" fill="#98735d" />}
      {washed < 3 && <path d="M64 33q-9 4-5 13 5 6 16 0 8-11-2-15z" fill="#9c775d" />}
      {washed < 2 && <path d="M53 75q-10-1-12 7 2 8 15 7 14-3 9-10-4-6-12-4" fill="#ad8564" />}
      {washed < 1 && (
        <g fill="#98735d">
          <path d="M64 59q-7 3-6 9 6 7 14 2 3-6-1-10z" />
          <circle cx="35" cy="40" r="4" />
          <circle cx="76" cy="55" r="3" />
        </g>
      )}
    </svg>
  );
}

function Meadow() {
  return (
    <svg
      className="splash-meadow"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="1000" height="600" fill="#d7ebde" />
      <path
        d="M55 123q-10-33 25-34 15-35 47-10 37-3 42 31zM647 71q-11-22 14-28 24-36 47-7 42-9 51 31z"
        fill="#fffaf0"
      />
      <path d="M0 207Q230 98 497 208T1000 187V600H0" fill="#b3d6b0" />
      <path d="M0 300Q230 167 500 287T1000 259V600H0" fill="#9cc8a1" />
      <path d="M0 459Q261 336 545 449T1000 403V600H0" fill="#aed2a7" />
      <g stroke="#fffae8" strokeWidth="9" strokeLinecap="round" opacity=".75">
        <path d="M23 212v69m57-74v64m57-68v58m732-56v58m57-73v65m57-78v71M1 234l150-15m697 19 151-28" />
      </g>
      <g fill="#729d76">
        <path d="m24 487 5-18 7 19 8-17 1 23m886 4 4-20 7 18 10-13-3 21M529 232l3-15 6 15 8-10-2 15" />
      </g>
      <g fill="#7bb9b9" opacity=".62">
        <ellipse cx="225" cy="419" rx="133" ry="28" />
        <ellipse cx="777" cy="396" rx="126" ry="24" />
        <ellipse cx="513" cy="459" rx="125" ry="25" />
      </g>
      <g fill="none" stroke="#c4e1cf" strokeWidth="4" strokeLinecap="round">
        <path d="M137 419q69 12 125 2m442-21q60 7 103 0m-366 59q61 11 115 0" />
      </g>
      {[
        [68, 350],
        [890, 346],
        [946, 483],
        [357, 283],
        [647, 286],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0v24" stroke="#78a275" strokeWidth="4" strokeLinecap="round" />
          <g fill={i % 2 ? '#f9e4ae' : '#f5d0bb'}>
            <circle cx="-6" cy="-2" r="6" />
            <circle cx="6" cy="-2" r="6" />
            <circle cx="0" cy="-8" r="6" />
            <circle cx="0" cy="4" r="6" />
          </g>
          <circle r="4" fill="#dba95c" />
        </g>
      ))}
    </svg>
  );
}

function WaterHose({ state, spraying }: { state: SplashState; spraying: boolean }) {
  const element = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const resize = () => {
      const bounds = node.getBoundingClientRect();
      setWidth((600 * bounds.width) / Math.max(1, bounds.height));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    return () => observer.disconnect();
  }, []);
  const target = { x: (state.aim.x / 1000) * width, y: state.aim.y };
  const origin = Math.max(58, width * 0.165);
  const angle = Math.atan2(target.y - 527, target.x - origin);
  const start = { x: origin + Math.cos(angle) * 52, y: 527 + Math.sin(angle) * 52 };
  const control = { x: (start.x + target.x) / 2, y: Math.min(start.y, target.y) - 65 };
  const curve = `M${start.x} ${start.y} Q${control.x} ${control.y} ${target.x} ${target.y}`;
  return (
    <svg
      className="splash-hose"
      ref={element}
      viewBox={`0 0 ${width} 600`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M-10 596C-13 445 ${origin - 81} 602 ${origin - 52} 544Q${origin - 30} 508 ${origin} 527`}
        fill="none"
        stroke="#b7824c"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d={`M-10 591C-13 440 ${origin - 81} 597 ${origin - 52} 539Q${origin - 30} 503 ${origin} 522`}
        fill="none"
        stroke="#ecc185"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <g transform={`translate(${origin} 527) rotate(${(angle * 180) / Math.PI})`}>
        <rect x="-11" y="-16" width="57" height="31" rx="12" fill="#5f91a3" />
        <rect x="27" y="-20" width="20" height="40" rx="5" fill="#7daeb6" />
        <path d="M7 13v22h20V14" fill="#d2ad71" />
        <path d="M-2-6h21" fill="none" stroke="#bce0d8" strokeWidth="5" strokeLinecap="round" />
      </g>
      {spraying && (
        <g>
          <path
            d={curve}
            fill="none"
            stroke="#76c6da"
            strokeWidth="13"
            opacity=".72"
            strokeLinecap="round"
          />
          <path d={curve} fill="none" stroke="#e1faff" strokeWidth="5" strokeLinecap="round" />
          {Array.from({ length: 12 }, (_, i) => {
            const t = (i / 12 + state.time * 1.2) % 1;
            const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * target.x;
            const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * target.y;
            return (
              <circle
                key={i}
                cx={x + Math.sin(i * 9) * 8}
                cy={y + Math.cos(i * 7) * 9}
                r={3 + (i % 3)}
                fill="#effcff"
              />
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const progress = (state.time * 2 + i / 9) % 1;
            const direction = (i * Math.PI * 2) / 9;
            return (
              <ellipse
                key={i}
                cx={target.x + Math.cos(direction) * (12 + progress * 48)}
                cy={target.y + Math.sin(direction) * (10 + progress * 35) + progress * 9}
                rx={3 + progress * 2}
                ry={6 - progress * 2}
                opacity={1 - progress}
                fill="#eafbfd"
                transform={`rotate(${i * 40} ${target.x + Math.cos(direction) * (12 + progress * 48)} ${target.y + Math.sin(direction) * (10 + progress * 35) + progress * 9})`}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}

export function SplashGame({ settings, paused, onCelebrate }: GameProps) {
  const stage = useRef<HTMLElement>(null);
  const state = useRef(freshPuddle());
  const latest = useRef({ settings, paused, onCelebrate });
  latest.current = { settings, paused, onCelebrate };
  const held = useRef<number | null>(null);
  const [view, setView] = useState(() => takePicture(state.current));
  const [caption, setCaption] = useState('Wash three muddy friends!');

  const squirt = (index?: number) => {
    const current = latest.current;
    const model = state.current;
    if (current.paused || document.hidden || model.finishedAt !== null) return;
    let target = index;
    if (target === undefined) {
      const bounds = stage.current?.getBoundingClientRect();
      let nearest = Infinity;
      model.friends.forEach((friend, i) => {
        if (friend.washed === 4) return;
        const dx = ((friend.x - model.aim.x / 10) * (bounds?.width ?? 1000)) / 100;
        const dy = ((friend.y - model.aim.y / 6) * (bounds?.height ?? 600)) / 100;
        const distance = Math.hypot(dx, dy);
        if (distance < Math.max(78, (bounds?.width ?? 1000) * 0.11) && distance < nearest) {
          nearest = distance;
          target = i;
        }
      });
    }
    model.sprayUntil = model.time + 0.48;
    if (
      target === undefined ||
      model.friends[target].washed === 4 ||
      model.time - model.lastHit < 0.32
    )
      return;
    const friend = model.friends[target];
    model.aim = { x: friend.x * 10, y: friend.y * 6 };
    friend.washed++;
    model.lastHit = model.time;
    playTone(friend.washed + target * 2, current.settings, 0.13);
    if (friend.washed === 4) {
      friend.cleanAt = model.time;
      const count = model.friends.filter((f) => f.washed === 4).length;
      setCaption(`${friends[target].name} is all clean!`);
      speak(`${count} clean ${count === 1 ? 'friend' : 'friends'}!`, current.settings);
      if (count === 3) {
        model.finishedAt = model.time;
        held.current = null;
        setCaption('All clean. Off we go!');
        current.onCelebrate('Three sparkling friends!');
      }
    } else
      setCaption(
        ['Splish, splash!', 'There goes the mud!', 'Nearly sparkling!'][friend.washed - 1],
      );
    setView(takePicture(model));
  };
  const squirtRef = useRef(squirt);
  squirtRef.current = squirt;
  useGameKeys(paused, () => {
    const index = state.current.friends.findIndex((friend) => friend.washed < 4);
    if (index >= 0) squirtRef.current(index);
  });

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      const current = latest.current;
      if (!current.paused && !document.hidden) {
        const model = state.current;
        model.time += dt;
        model.friends.forEach((friend, i) => {
          const original = friends[i];
          if (model.finishedAt !== null) {
            const t = Math.min(1, (model.time - model.finishedAt) / 1.1);
            const targetX =
              original.x + (current.settings.calm ? 0 : Math.sin(model.time * 1.5) * 3);
            const targetY = 48 + (current.settings.calm ? 0 : Math.sin(model.time * 5 + i * 2) * 2);
            friend.x += (targetX - friend.x) * Math.min(1, dt * 4);
            friend.y += (targetY - friend.y) * Math.min(1, dt * 4);
            friend.scale = 1 + t * 0.08;
          } else if (friend.cleanAt !== null) {
            const elapsed = model.time - friend.cleanAt;
            const t = Math.min(1, elapsed / 1.4);
            friend.x = original.x + Math.sin(t * Math.PI * 3) * (1 - t) * 8;
            friend.y =
              original.y -
              (original.y - 30) * t -
              (current.settings.calm ? 0 : Math.abs(Math.sin(elapsed * 10)) * (1 - t) * 4);
            friend.scale = 1 - t * 0.22;
          } else {
            const motion = current.settings.calm ? 0 : 1;
            // Little steps, then a rest: broad targets stay easy to aim at.
            const wander = Math.floor(model.time / 4) * 2 + Math.min(model.time % 4, 2);
            friend.x = original.x + Math.sin(wander * 0.8 + i * 2) * 2.2 * motion;
            friend.y = original.y + Math.sin(wander * 1.15 + i) * 1.2 * motion;
            friend.scale = 1;
          }
        });
        if (held.current !== null) squirtRef.current();
        if (now - lastPaint > 32) {
          setView(takePicture(model));
          lastPaint = now;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const release = () => {
      held.current = null;
    };
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, []);

  useEffect(() => {
    if (paused) held.current = null;
  }, [paused]);
  const aim = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    state.current.aim = {
      x: ((event.clientX - bounds.left) / bounds.width) * 1000,
      y: ((event.clientY - bounds.top) / bounds.height) * 600,
    };
  };
  const count = view.friends.filter((friend) => friend.washed === 4).length;
  const done = view.finishedAt !== null;
  const parade = done && view.time - view.finishedAt! > 1.4;
  const spraying = view.time < view.sprayUntil;

  return (
    <section
      ref={stage}
      className={`splash-game ${done ? 'splash-complete' : ''} ${settings.calm ? 'splash-is-calm' : ''}`}
      aria-label="Mischief meadow"
      data-testid="splash-game"
      onPointerDown={(event) => {
        if (
          paused ||
          done ||
          (event.target instanceof Element && event.target.closest('[data-splash-replay]'))
        )
          return;
        held.current = event.pointerId;
        aim(event);
        event.currentTarget.setPointerCapture(event.pointerId);
        const target =
          event.target instanceof Element ? event.target.closest('[data-friend]') : null;
        squirt(target ? Number(target.getAttribute('data-friend')) : undefined);
      }}
      onPointerMove={(event) => {
        if (held.current === event.pointerId && !paused) {
          aim(event);
          squirt();
        }
      }}
      onPointerUp={() => {
        held.current = null;
      }}
      onPointerCancel={() => {
        held.current = null;
      }}
    >
      <Meadow />
      <div className="splash-sun" aria-hidden="true" />
      <div className="splash-heading">
        <span className="splash-label">SQUIRT & GIGGLE</span>
        <h2>Mischief meadow</h2>
        <p>{caption}</p>
      </div>
      <div className="splash-progress" role="status" aria-label={`${count} of 3 friends washed`}>
        <div className="splash-progress-faces" aria-hidden="true">
          {view.friends.map((friend, i) => (
            <span key={i} className={friend.washed === 4 ? 'is-clean' : ''}>
              <Animal kind={friends[i].kind} />
              {friend.washed < 4 ? <Mud /> : <b>✓</b>}
            </span>
          ))}
        </div>
        <strong>
          {count}
          <small>/3 clean</small>
        </strong>
      </div>
      <div className="splash-friends">
        {view.friends.map((friend, i) => (
          <button
            type="button"
            key={i}
            data-friend={i}
            disabled={paused || friend.washed === 4}
            className={`splash-friend ${friend.washed === 4 ? 'is-clean' : ''}`}
            aria-label={`${friends[i].name}, ${friend.washed === 4 ? 'all clean' : `${4 - friend.washed} mud patches left`}`}
            style={{
              left: `${friend.x}%`,
              top: `${friend.y}%`,
              transform: `translate(-50%, -50%) scale(${friend.scale})`,
            }}
            onClick={(event) => {
              if (event.detail === 0) squirt(i);
            }}
          >
            <Animal kind={friends[i].kind} />
            <Mud washed={friend.washed} />
            {friend.washed === 4 ? (
              <span className="splash-sparkle">
                <Star />
                <svg viewBox="0 0 50 50" aria-hidden="true">
                  <path d="m25 4 5 15 15 6-15 5-5 16-5-16-16-5 16-6z" fill="#fff6bc" />
                </svg>
              </span>
            ) : (
              <span className="splash-mud-dots" aria-hidden="true">
                {[0, 1, 2, 3].map((dot) => (
                  <i key={dot} className={dot < friend.washed ? 'is-washed' : ''} />
                ))}
              </span>
            )}
            {friend.cleanAt !== null && !done && view.time - friend.cleanAt < 1.4 && (
              <svg className="splash-scamper" viewBox="0 0 100 100" aria-hidden="true">
                <path
                  d="M2 60h13M0 74h10M4 87h15"
                  fill="none"
                  stroke="#fff8db"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
      <WaterHose state={view} spraying={spraying} />
      {!done && (
        <div className="splash-instruction" aria-hidden="true">
          <svg viewBox="0 0 52 40">
            <path
              d="M4 34q8-35 39-15"
              fill="none"
              stroke="#74aaba"
              strokeWidth="4"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
            <path
              d="m42 11 5 12-13-2"
              fill="none"
              stroke="#74aaba"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>
            Hold & splash
            <br />
            <small>or press any key</small>
          </span>
        </div>
      )}
      {parade && (
        <div className="splash-finish">
          <span className="splash-finish-label">
            <Star />
            Three sparkling friends!
            <Star />
          </span>
          <button
            type="button"
            data-splash-replay
            onClick={() => {
              if (paused) return;
              state.current = freshPuddle(state.current.round + 1);
              setView(takePicture(state.current));
              setCaption('A new puddle. Splish, splash!');
              playTone(1, settings, 0.2);
            }}
            disabled={paused}
          >
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M31 17a12 12 0 1 0 0 9M31 7v10H21"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New puddle
          </button>
        </div>
      )}
      {paused && <div className="splash-pause">A little splash break</div>}
    </section>
  );
}
