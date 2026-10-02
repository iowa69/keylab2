import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Animal, Star } from './Art';
import { playSound, playTone, speak } from './audio';
import { RotateCcw, Palette } from 'lucide-react';
import type { GameProps } from './types';
import { useGameKeys } from './useGameKeys';
import './splash.css';

const friends = [
  { kind: 'pig', name: 'Pig', color: '#ec9d9e', x: 23, y: 55 },
  { kind: 'duck', name: 'Duck', color: '#e8bd62', x: 50, y: 61 },
  { kind: 'bunny', name: 'Bunny', color: '#b0a2c7', x: 77, y: 53 },
] as const;
type Spray = 'water' | 'bubbles' | 'rainbow' | 'wee';
const sprays: { id: Spray; name: string; color: string }[] = [
  { id: 'water', name: 'Water', color: '#76c6da' },
  { id: 'bubbles', name: 'Bubbles', color: '#c4b0e0' },
  { id: 'rainbow', name: 'Rainbow', color: '#eb9fbb' },
  { id: 'wee', name: 'Silly wee', color: '#eac65b' },
];
const themes = [
  { name: 'Meadow', sky: '#d7ebde', hill: '#b3d6b0', ground: '#9cc8a1', front: '#aed2a7' },
  { name: 'Candy garden', sky: '#f4dce5', hill: '#e0bad4', ground: '#ceafd0', front: '#e4c0d8' },
  { name: 'Moon puddles', sky: '#bdc9e3', hill: '#9baccd', ground: '#91a4c9', front: '#b3bfdb' },
];
type Friend = {
  washed: number;
  cleanAt: number | null;
  x: number;
  y: number;
  scale: number;
  reactionAt: number;
  coating: Spray | null;
};
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
      reactionAt: -10,
      coating: null,
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

function Meadow({ theme, pond }: { theme: number; pond: string }) {
  const palette = themes[theme];
  return (
    <svg
      className="splash-meadow"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="1000" height="600" fill={palette.sky} />
      <path
        d="M55 123q-10-33 25-34 15-35 47-10 37-3 42 31zM647 71q-11-22 14-28 24-36 47-7 42-9 51 31z"
        fill="#fffaf0"
      />
      <path d="M0 207Q230 98 497 208T1000 187V600H0" fill={palette.hill} />
      <path d="M0 300Q230 167 500 287T1000 259V600H0" fill={palette.ground} />
      <path d="M0 459Q261 336 545 449T1000 403V600H0" fill={palette.front} />
      <g stroke="#fffae8" strokeWidth="9" strokeLinecap="round" opacity=".75">
        <path d="M23 212v69m57-74v64m57-68v58m732-56v58m57-73v65m57-78v71M1 234l150-15m697 19 151-28" />
      </g>
      <g fill="#729d76">
        <path d="m24 487 5-18 7 19 8-17 1 23m886 4 4-20 7 18 10-13-3 21M529 232l3-15 6 15 8-10-2 15" />
      </g>
      <g fill={pond} opacity=".75" className="splash-pond-colors">
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

function WaterHose({
  state,
  spraying,
  spray,
}: {
  state: SplashState;
  spraying: boolean;
  spray: Spray;
}) {
  const color = sprays.find((item) => item.id === spray)!.color;
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
  const start =
    spray === 'wee'
      ? { x: width * 0.14, y: 555 }
      : { x: origin + Math.cos(angle) * 52, y: 527 + Math.sin(angle) * 52 };
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
      {spray !== 'wee' && (
        <>
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
        </>
      )}
      {spraying && (
        <g>
          <path
            d={curve}
            fill="none"
            stroke={color}
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
                fill={
                  spray === 'rainbow'
                    ? ['#f4a8bc', '#ffe5a0', '#9dd2c1', '#b9afdf'][i % 4]
                    : spray === 'wee'
                      ? '#fff0a4'
                      : '#effcff'
                }
              />
            );
          })}
          {spray === 'bubbles' &&
            Array.from({ length: 6 }, (_, i) => (
              <circle
                key={`b${i}`}
                cx={target.x + Math.sin(i * 8) * 45}
                cy={target.y - ((state.time * 45 + i * 20) % 110)}
                r={12 + (i % 3) * 4}
                fill="#fcf4ff55"
                stroke="#fffdf4"
                strokeWidth="3"
              />
            ))}
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

function SprayIcon({ spray }: { spray: Spray }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {spray === 'water' ? (
        <>
          <path d="M32 5 13 34a23 23 0 1 0 38 0Z" fill="#80c2d4" />
          <path
            d="M21 37q-7 12 5 17"
            stroke="#dff8fa"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : spray === 'bubbles' ? (
        <g fill="#d6c9ed" stroke="#fff9ff" strokeWidth="3">
          <circle cx="24" cy="39" r="19" />
          <circle cx="44" cy="21" r="14" />
          <circle cx="49" cy="49" r="10" />
        </g>
      ) : spray === 'rainbow' ? (
        <>
          <path d="M7 54a25 38 0 0 1 50 0" fill="none" stroke="#e69eaa" strokeWidth="9" />
          <path d="M16 54a16 29 0 0 1 32 0" fill="none" stroke="#f3cf78" strokeWidth="8" />
          <path d="M24 54a8 20 0 0 1 16 0" fill="none" stroke="#9bc5a6" strokeWidth="8" />
        </>
      ) : (
        <>
          <circle cx="23" cy="20" r="13" fill="#eab98e" />
          <path d="M11 34h24v24H11" fill="#9bc6cd" />
          <path d="M10 14q11-15 24 0" fill="#a87e55" />
          <circle cx="27" cy="21" r="2" fill="#715442" />
          <path
            d="M37 39q14-23 24 9"
            fill="none"
            stroke="#e5c454"
            strokeWidth="5"
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
          <path d="M5 55q4-17 16-5 12-18 25 3v11H5" fill="#8eb797" />
        </>
      )}
    </svg>
  );
}
function HiddenBoy() {
  return (
    <svg className="splash-hidden-boy" viewBox="0 0 180 200" aria-hidden="true">
      <path d="M46 105q17-18 51-5l21 54H31Z" fill="#82bdca" />
      <path
        d="M48 115q-19 18-23 32m74-37 20 15"
        fill="none"
        stroke="#e9b994"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <circle cx="73" cy="69" r="34" fill="#ebbb96" />
      <circle cx="103" cy="76" r="8" fill="#ebbb96" />
      <path d="M38 67q-5-48 41-39 31-3 31 32L91 47l-8 11-13-9-16 17Z" fill="#a47950" />
      <path d="m52 33-12-8m23 6-5-14" stroke="#a47950" strokeWidth="7" strokeLinecap="round" />
      <circle cx="87" cy="69" r="3.5" fill="#614a41" />
      <path
        d="M82 83q10 9 15-1"
        fill="none"
        stroke="#945d4e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="71" cy="81" r="6" fill="#e1a28f" />
      <path
        d="M0 184q-10-31 18-32-2-37 29-35 18-29 40-5 37-12 47 17 35-2 39 35 20 23-8 33H0Z"
        fill="#699e79"
      />
      <path d="M8 169q8-29 31-17 20-27 41-5 35-21 58 5 21-5 30 20" fill="#8cb78c" />
      <g fill="#bad09c">
        <ellipse cx="26" cy="168" rx="9" ry="5" transform="rotate(-30 26 168)" />
        <ellipse cx="118" cy="170" rx="10" ry="5" transform="rotate(25 118 170)" />
        <ellipse cx="73" cy="143" rx="7" ry="4" />
      </g>
    </svg>
  );
}
export function SplashGame({ settings, paused, onCelebrate }: GameProps) {
  const stage = useRef<HTMLDivElement>(null);
  const state = useRef(freshPuddle());
  const [spray, setSpray] = useState<Spray>('water'),
    [theme, setTheme] = useState(0),
    [pond, setPond] = useState('#7bb9b9');
  const latest = useRef({ settings, paused, onCelebrate, spray });
  latest.current = { settings, paused, onCelebrate, spray };
  const held = useRef<number | null>(null);
  const [view, setView] = useState(() => takePicture(state.current));
  const [caption, setCaption] = useState('Wash, splash, and make a mess!');
  const publish = () => setView(takePicture(state.current));
  const squirt = (index?: number, discrete = false) => {
    const current = latest.current,
      model = state.current;
    if (current.paused || document.hidden) return;
    let target = index;
    if (target === undefined) {
      const bounds = stage.current?.getBoundingClientRect();
      let nearest = Infinity;
      model.friends.forEach((friend, i) => {
        const dx = ((friend.x - model.aim.x / 10) * (bounds?.width ?? 1000)) / 100,
          dy = ((friend.y - model.aim.y / 6) * (bounds?.height ?? 600)) / 100;
        const distance = Math.hypot(dx, dy);
        if (distance < Math.max(65, (bounds?.width ?? 1000) * 0.13) && distance < nearest) {
          nearest = distance;
          target = i;
        }
      });
    }
    model.sprayUntil = model.time + 0.42;
    // Every new tap or key press gets a response, even on a slow device.
    // Only a held stream is limited by the animation clock.
    if (!discrete && model.time - model.lastHit < 0.32) return;
    model.lastHit = model.time;
    setPond(sprays.find((item) => item.id === current.spray)!.color);
    const laughing =
      target !== undefined &&
      (current.spray === 'wee' || current.spray === 'rainbow' || model.friends[target].washed >= 3);
    playSound(laughing ? 'giggle' : 'splash', current.settings);
    if (target === undefined) {
      publish();
      return;
    }
    const friend = model.friends[target];
    model.aim = { x: friend.x * 10, y: friend.y * 6 };
    friend.reactionAt = model.time;
    if (current.spray === 'water' || current.spray === 'bubbles') {
      friend.washed = Math.min(4, friend.washed + 1);
      friend.coating = current.spray === 'bubbles' ? 'bubbles' : null;
      if (friend.washed === 4) {
        friend.cleanAt = model.time;
        setCaption(`${friends[target].name} is sparkling clean!`);
      } else
        setCaption(['Splish, splash!', 'Bye-bye, mud!', 'Nearly sparkling!'][friend.washed - 1]);
      if (model.friends.every((f) => f.washed === 4) && model.finishedAt === null) {
        model.finishedAt = model.time;
        current.onCelebrate('Three sparkling friends!');
        speak('All clean! Hooray!', current.settings, { interrupt: true });
      }
    } else {
      friend.coating = current.spray;
      friend.washed = 0;
      friend.cleanAt = model.time;
      model.finishedAt = null;
      setCaption(current.spray === 'wee' ? 'Boo! Silly puddles!' : 'Rainbow friends!');

      speak(current.spray === 'wee' ? 'Boo! Hee hee!' : 'Rainbow splash!', current.settings);
    }
    publish();
  };
  const squirtRef = useRef(squirt);
  squirtRef.current = squirt;
  useGameKeys(paused, (key) => {
    if (key === 'Escape') return;
    const model = state.current;
    let index = model.friends.findIndex((friend) => friend.washed < 4);
    if (index < 0) index = Math.floor(model.time) % 3;
    squirtRef.current(index, true);
  });
  useEffect(() => {
    let frame = 0,
      previous = performance.now(),
      lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      const current = latest.current;
      if (!current.paused && !document.hidden) {
        const model = state.current;
        model.time += dt;
        model.friends.forEach((friend, i) => {
          const original = friends[i],
            motion = current.settings.calm ? 0 : 1;
          const elapsed = friend.cleanAt === null ? 10 : model.time - friend.cleanAt;
          if (elapsed < 2) {
            const flee = Math.sin(Math.min(1, elapsed / 2) * Math.PI);
            friend.x = original.x + Math.sin(i + 1) * flee * 13 * motion;
            friend.y =
              original.y - flee * 15 * motion - Math.abs(Math.sin(elapsed * 12)) * 2 * motion;
            friend.scale = 1 - flee * 0.12;
          } else {
            friend.x = original.x + Math.sin(model.time * 0.6 + i * 2) * 2.1 * motion;
            friend.y = original.y + Math.sin(model.time * 0.9 + i) * 1.1 * motion;
            friend.scale = 1;
          }
        });
        if (held.current !== null) squirtRef.current();
        if (now - lastPaint > 33) {
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
  const aim = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    state.current.aim = {
      x: Math.max(0, Math.min(1000, ((event.clientX - bounds.left) / bounds.width) * 1000)),
      y: Math.max(0, Math.min(600, ((event.clientY - bounds.top) / bounds.height) * 600)),
    };
  };
  const muddy = () => {
    if (paused) return;
    const model = state.current;
    model.finishedAt = null;
    model.round++;
    model.friends.forEach((friend) => {
      friend.washed = 0;
      friend.coating = null;
      friend.cleanAt = null;
    });
    setPond('#af896b');
    setCaption('Jump in the mud! Splodge!');
    playSound('boing', settings);
    publish();
  };
  const count = view.friends.filter((friend) => friend.washed === 4).length;
  return (
    <section
      className={`splash-game ${paused ? 'splash-paused' : ''} ${settings.calm ? 'splash-is-calm' : ''}`}
      aria-label="Mischief meadow"
      data-testid="splash-game"
      data-spray={spray}
      data-theme={theme}
      data-clean={count}
    >
      <div
        className="splash-stage"
        ref={stage}
        onPointerDown={(event) => {
          if (paused) return;
          held.current = event.pointerId;
          aim(event);
          event.currentTarget.setPointerCapture(event.pointerId);
          const target =
            event.target instanceof Element ? event.target.closest('[data-friend]') : null;
          squirt(target ? Number(target.getAttribute('data-friend')) : undefined, true);
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
        onLostPointerCapture={() => {
          held.current = null;
        }}
      >
        <Meadow theme={theme} pond={pond} />
        <div className="splash-sun" aria-hidden="true" />
        {theme === 2 && (
          <svg
            className="splash-theme-art"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="#fff4c7">
              {Array.from({ length: 15 }, (_, i) => (
                <path
                  key={i}
                  d={`m${40 + i * 66} ${35 + (i % 3) * 45} 3 8 8 3-8 3-3 8-3-8-8-3 8-3z`}
                />
              ))}
            </g>
            <ellipse
              cx="745"
              cy="140"
              rx="49"
              ry="13"
              stroke="#e4d8b2"
              strokeWidth="7"
              fill="none"
              transform="rotate(-20 745 140)"
            />
            <circle cx="745" cy="140" r="29" fill="#f0dda4" />
          </svg>
        )}
        {theme === 1 && (
          <svg
            className="splash-theme-art"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {[70, 910].map((x, i) => (
              <g key={x}>
                <path d={`M${x} 265v-106`} stroke="#fff5e7" strokeWidth="13" />
                <circle cx={x} cy="152" r="42" fill={i ? '#f0c97b' : '#e8a4b7'} />
                <path
                  d={`m${x - 25} 140q43-37 44 10-12 39-35 5 0-17 18-8`}
                  fill="none"
                  stroke="#fff5dc"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </svg>
        )}
        <div className="splash-heading">
          <p role="status">{caption}</p>
          <span>{count}/3 sparkling friends</span>
        </div>
        <div className="splash-friends">
          {view.friends.map((friend, i) => {
            const reacting = view.time - friend.reactionAt < 0.85;
            return (
              <button
                key={i}
                data-friend={i}
                type="button"
                disabled={paused}
                className={`splash-friend ${friend.washed === 4 ? 'is-clean' : ''}`}
                aria-label={`${friends[i].name}, ${friend.washed === 4 ? 'all clean' : `${4 - friend.washed} mud patches left`}`}
                style={{
                  left: `${friend.x}%`,
                  top: `${friend.y}%`,
                  transform: `translate(-50%, -50%) scale(${friend.scale})`,
                }}
                onClick={(event) => {
                  if (event.detail === 0) squirt(i, true);
                }}
              >
                <Animal kind={friends[i].kind} />
                <Mud
                  washed={
                    friend.coating === 'wee' || friend.coating === 'rainbow' ? 4 : friend.washed
                  }
                />
                {friend.coating && (
                  <svg viewBox="0 0 100 100" className="splash-coating" aria-hidden="true">
                    {friend.coating === 'bubbles' ? (
                      <g fill="#f8eeffb0" stroke="#fff8ff" strokeWidth="1.5">
                        <circle cx="23" cy="67" r="9" />
                        <circle cx="75" cy="70" r="10" />
                        <circle cx="65" cy="24" r="7" />
                      </g>
                    ) : (
                      <g opacity=".8">
                        <path
                          d="M21 65q-7 8 4 12l9-5-5-11z"
                          fill={friend.coating === 'wee' ? '#efd069' : '#ecadbd'}
                        />
                        <path
                          d="M70 33q-9-4-10 7 3 10 13 5 5-5-3-12"
                          fill={friend.coating === 'wee' ? '#efd069' : '#c4acda'}
                        />
                        <path
                          d="M58 75q-15-2-16 7 10 12 24 0z"
                          fill={friend.coating === 'wee' ? '#efd069' : '#a9d4b3'}
                        />
                      </g>
                    )}
                  </svg>
                )}
                {reacting && (
                  <>
                    <svg viewBox="0 0 100 100" className="splash-surprise" aria-hidden="true">
                      <ellipse cx="50" cy="67" rx="6" ry="7" fill="#735653" />
                      <ellipse cx="50" cy="69" rx="4" ry="3" fill="#eab1b2" />
                    </svg>
                    <span className="splash-boo">
                      {spray === 'water' ? 'Whee!' : spray === 'bubbles' ? 'Pop!' : 'Boo!'}
                    </span>
                  </>
                )}
                {friend.washed === 4 ? (
                  <span className="splash-sparkle">
                    <Star />
                  </span>
                ) : (
                  <span className="splash-mud-dots" aria-hidden="true">
                    {[0, 1, 2, 3].map((dot) => (
                      <i key={dot} className={dot < friend.washed ? 'is-washed' : ''} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {spray === 'wee' && <HiddenBoy />}
        <WaterHose state={view} spraying={view.time < view.sprayUntil} spray={spray} />
        <span className="splash-stage-hint" aria-hidden="true">
          Hold & splash
        </span>
      </div>
      <div className="splash-tools">
        <div className="splash-sprays" aria-label="Choose your spray">
          {sprays.map((item) => (
            <button
              key={item.id}
              aria-label={`Spray ${item.name.toLowerCase()}`}
              aria-pressed={spray === item.id}
              disabled={paused}
              onClick={() => {
                setSpray(item.id);
                held.current = null;
                playTone(2, settings, 0.1);
                speak(item.name, settings);
              }}
            >
              <SprayIcon spray={item.id} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <button
          className="splash-muddy"
          aria-label="New muddy puddle"
          disabled={paused}
          onClick={muddy}
        >
          <RotateCcw />
          <span>Mud again!</span>
        </button>
        <button
          className="splash-theme"
          aria-label={`Change meadow theme, now ${themes[theme].name}`}
          disabled={paused}
          onClick={() => {
            setTheme((n) => (n + 1) % themes.length);
            playSound('pop', settings);
          }}
        >
          <Palette />
          <span>{themes[theme].name}</span>
        </button>
      </div>
    </section>
  );
}
