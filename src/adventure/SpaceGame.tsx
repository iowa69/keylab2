import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Volume2 } from 'lucide-react';
import { Face, Rocket, Star } from './Art';
import { playSound, playTone, speak } from './audio';
import { useGameKeys } from './useGameKeys';
import { usePlayTimer } from './usePlayTimer';
import {
  advanceSpace,
  assistSpace,
  collectSpace,
  createSpaceState,
  steerSpace,
  type SpaceKind,
  type SpaceState,
} from './spaceModel';
import type { GameProps } from './types';
import './space.css';
// Short factual descriptions based on https://science.nasa.gov/solar-system/planets/ .
// This is a storybook space journey; sizes, distances and the flight route are not to scale.
export const planets = [
  ['Mercury', 'Mercury is closest to the Sun.'],
  ['Venus', 'Venus is very, very hot.'],
  ['Earth', 'Earth is our home. Look at the blue oceans!'],
  ['Mars', 'Mars is the red planet.'],
  ['Jupiter', 'Jupiter is the biggest planet.'],
  ['Saturn', 'Saturn has beautiful rings.'],
  ['Uranus', 'Uranus rolls on its side.'],
  ['Neptune', 'Neptune is far from the Sun.'],
];
const routes = [
  { name: 'The starlight trail', sky: '#263557', cloud: '#6a72aa', glow: '#a7daeb' },
  { name: 'The peach nebula', sky: '#473253', cloud: '#b57792', glow: '#f2d0ae' },
  { name: 'The blue galaxy', sky: '#243c55', cloud: '#539796', glow: '#c3ebd5' },
  { name: 'The violet swirl', sky: '#343051', cloud: '#8e75b0', glow: '#e1bfe2' },
];
function snapshot(state: SpaceState) {
  return { ...state, objects: state.objects.map((item) => ({ ...item })) };
}
function Planet({ index }: { index: number }) {
  const colors = [
    '#b4aba3',
    '#e6bb8c',
    '#79b9d9',
    '#d88469',
    '#d7b28f',
    '#e7ce94',
    '#a2d9d6',
    '#7698d5',
  ];
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {index === 5 && (
        <ellipse
          cx="50"
          cy="53"
          rx="46"
          ry="16"
          transform="rotate(-23 50 53)"
          fill="none"
          stroke="#bd9c69"
          strokeWidth="8"
        />
      )}
      <circle cx="50" cy="50" r="34" fill={colors[index]} />
      {index === 0 || index === 3 ? (
        <g fill={index === 0 ? '#978f8b' : '#b76757'} opacity=".6">
          <circle cx="31" cy="32" r="8" />
          <circle cx="67" cy="27" r="5" />
          <circle cx="72" cy="60" r="8" />
          <circle cx="39" cy="75" r="5" />
          <circle cx="26" cy="57" r="3" />
          <path d="M21 29q9-10 16-3" fill="none" stroke="#f3d5bb" strokeWidth="2" />
        </g>
      ) : index === 2 ? (
        <g fill="#81ac7f">
          <path d="m26 30 13-9 16 2 4 10-14 5-1 11-15-6-9 5 1-12zM49 57l19-4 11 8-10 13-8 5-8-11z" />
          <path d="M39 19q14-6 26 1l-12 6Z" fill="#f3f5e7" />
        </g>
      ) : index === 4 ? (
        <>
          <path
            d="M22 31q24 9 54 0M17 46q35 8 66 0M19 63q28 9 60-1M30 77q20 4 40-1"
            fill="none"
            stroke="#b98973"
            strokeWidth="6"
          />
          <path d="M22 38q23 6 56 0M21 69q27 5 55-2" fill="none" stroke="#f4dfb6" strokeWidth="4" />
          <ellipse cx="68" cy="64" rx="9" ry="5" fill="#c57e6c" />
        </>
      ) : index === 6 ? (
        <g transform="rotate(78 50 50)">
          <path
            d="M22 31q28 10 55 0M17 48q33 11 65 0M24 68q26 8 53-1"
            fill="none"
            stroke="#d7f0e4"
            strokeWidth="4"
            opacity=".5"
          />
        </g>
      ) : (
        <g
          stroke={index === 7 ? '#a6c5eb' : '#f8e1b7'}
          strokeWidth={index === 1 ? 7 : 4}
          opacity=".5"
          fill="none"
        >
          <path d="M23 32q24 10 54 0M17 49q33 10 66 0M24 68q26 6 52-1" />
        </g>
      )}
      <path d="M65 20A34 34 0 0 1 65 80q24-27 0-60" fill="#3d3858" opacity=".08" />
      <Face x={50} y={48} />
      {index === 5 && (
        <path
          d="M8 61Q39 78 92 37"
          fill="none"
          stroke="#efd9a6"
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
function SpaceThing({ kind, waving = false }: { kind: SpaceKind; waving?: boolean }) {
  if (kind === 'star') return <Star />;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {kind === 'asteroid' ? (
        <>
          <path
            d="m17 23 25-12 30 7 17 25-7 34-26 13-28-9L9 53Z"
            fill="#b4a4bf"
            stroke="#d1c3d9"
            strokeWidth="3"
          />
          <circle cx="31" cy="31" r="9" fill="#95869f" />
          <circle cx="69" cy="63" r="12" fill="#a18daf" />
          <circle cx="33" cy="70" r="5" fill="#d6c5dc" />
          <Face x={51} y={47} />
        </>
      ) : kind === 'alien' ? (
        <>
          <path d="M25 54Q13 15 49 13q36 2 27 41" fill="#c5ede7" opacity=".7" />
          <path d="m47 30 2-18" stroke="#75c6aa" strokeWidth="4" />
          <circle cx="49" cy="11" r="5" fill="#eac275" />
          <path d="M32 49V34q18-18 36 0v15" fill="#8dd0ae" />
          <circle cx="42" cy="36" r="4" fill="#36565a" />
          <circle cx="59" cy="36" r="4" fill="#36565a" />
          <path
            d="M44 44q7 7 13 0"
            stroke="#36565a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={waving ? 'M66 43 83 20m-3 7 8-1' : 'M65 42 83 36m-5 2 5-10'}
            fill="none"
            stroke="#8dd0ae"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="60" rx="43" ry="15" fill="#b8a8df" />
          <path d="M13 62q37 29 74 0" fill="#9586c2" />
          {[28, 50, 72].map((x) => (
            <circle key={x} cx={x} cy="62" r="4" fill="#ffe8a9" />
          ))}
          <path d="m32 78 18 13 18-13" fill="#c8f0ce" opacity=".5" />
        </>
      ) : kind === 'comet' ? (
        <>
          <path d="m30 65 7-60 13 32L75 3 61 54 94 23 73 80" fill="#bce9e8" opacity=".45" />
          <path d="m35 69 13-49 5 42 30-36-17 53" fill="#e7faed" />
          <circle cx="47" cy="71" r="23" fill="#badedb" />
          <circle cx="42" cy="68" r="5" fill="#e8f7ef" />
          <path
            d="M37 80q9 6 16-1"
            fill="none"
            stroke="#67989b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="50"
            cy="50"
            rx="43"
            ry="23"
            transform="rotate(-24 50 50)"
            fill="none"
            stroke="#c8a2d8"
            strokeWidth="9"
            opacity=".6"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="32"
            ry="18"
            transform="rotate(20 50 50)"
            fill="none"
            stroke="#f4c37c"
            strokeWidth="6"
          />
          <circle cx="50" cy="50" r="21" fill="#191f37" />
          <path
            d="M10 65Q51 34 91 35"
            fill="none"
            stroke="#ead6f4"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
export function SpaceGame({ settings, paused, onCelebrate }: GameProps) {
  const [destination, setDestination] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [phase, setPhase] = useState<'fly' | 'visit'>('fly');
  const [view, setView] = useState(() => snapshot(createSpaceState()));
  const [caption, setCaption] = useState('Catch six stars. Meet a planet!');
  const [greeted, setGreeted] = useState(-1);
  const [planetGreeting, setPlanetGreeting] = useState(false);
  usePlayTimer(planetGreeting, paused, 700, () => setPlanetGreeting(false));
  const model = useRef(createSpaceState());
  const latest = useRef({ settings, paused, onCelebrate, destination, phase });
  latest.current = { settings, paused, onCelebrate, destination, phase };
  const field = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const messageUntil = useRef(0);
  function choose(index: number) {
    if (paused || document.hidden) return;
    model.current = createSpaceState();
    setDestination(index);
    setPhase('fly');
    setView(snapshot(model.current));
    setCaption(`Let's fly to ${planets[index][0]}!`);
    setGreeted(-1);
    messageUntil.current = 3;
    playSound('whoosh', settings);
    speak(`Let's fly to ${planets[index][0]}!`, settings, { interrupt: true });
  }
  function announce() {
    if (paused || document.hidden) return;
    setPlanetGreeting(true);
    playTone(destination + 2, settings, 0.18);
    speak(`Hello, ${planets[destination][0]}! ${planets[destination][1]}`, settings, {
      interrupt: true,
    });
  }
  function collect(id: number) {
    if (paused || phase !== 'fly' || document.hidden) return;
    const object = model.current.objects.find((item) => item.id === id);
    if (!collectSpace(model.current, id)) return;
    playTone(model.current.stars + 2, settings, 0.2);
    if (object?.kind === 'alien') {
      setGreeted(id);
      setCaption('Hello, little space friend!');
      speak('Hello, little space friend! Thank you!', settings, { interrupt: true });
    } else
      setCaption(`${model.current.stars} bright ${model.current.stars === 1 ? 'star' : 'stars'}!`);
    messageUntil.current = model.current.time + 2;
    setView(snapshot(model.current));
  }
  function assist() {
    if (paused || document.hidden) return;
    if (phase === 'visit') {
      choose((destination + 1) % 8);
      return;
    }
    const id = assistSpace(model.current);
    if (id !== null) collect(id);
  }
  function steer(direction: number) {
    if (paused || phase !== 'fly' || document.hidden) return;
    steerSpace(model.current, model.current.targetX + direction * 18);
    playTone(direction < 0 ? 1 : 3, settings, 0.09);
  }
  useGameKeys(paused, (key) => {
    if (key === 'ArrowLeft' || key.toLowerCase() === 'a') steer(-1);
    else if (key === 'ArrowRight' || key.toLowerCase() === 'd') steer(1);
    else if (key === 'ArrowUp')
      steerSpace(model.current, model.current.targetX, model.current.targetY - 12);
    else if (key === 'ArrowDown')
      steerSpace(model.current, model.current.targetX, model.current.targetY + 12);
    else assist();
  });
  useEffect(() => {
    if (paused) pointer.current = null;
  }, [paused]);
  useEffect(() => {
    let previous = performance.now(),
      lastPaint = 0,
      frame = 0;
    const tick = (now: number) => {
      const dt = (now - previous) / 1000;
      previous = now;
      const current = latest.current;
      if (!current.paused && !document.hidden && current.phase === 'fly') {
        const state = model.current;
        const events = advanceSpace(
          state,
          dt,
          current.settings.mode === 'baby',
          current.settings.calm,
        );
        if (events.collected) {
          playTone(state.stars + 2, current.settings, 0.18);
          setCaption(events.hello ? 'Hello, little space friend!' : `${state.stars} bright stars!`);
          if (events.hello) speak('Hello, little space friend!', current.settings);
          messageUntil.current = state.time + 2;
        }
        if (events.bumped || events.swirled) {
          playSound('boing', current.settings);
          setCaption(
            events.swirled ? 'Wheee! Round and round!' : 'Boing! Your bubble keeps you safe.',
          );
          messageUntil.current = state.time + 2;
        }
        if (events.arrived) {
          setPhase('visit');
          setVisited((old) =>
            old.includes(current.destination) ? old : [...old, current.destination],
          );
          current.onCelebrate(`Hello ${planets[current.destination][0]}!`);
          playSound('cheer', current.settings);
          speak(
            `Hello, ${planets[current.destination][0]}! ${planets[current.destination][1]}`,
            current.settings,
            { interrupt: true },
          );
        }
        if (state.time > messageUntil.current)
          setCaption(
            state.stars >= 6 ? 'Here comes our planet!' : 'Drag your rocket. Catch the stars!',
          );
        if (now - lastPaint > 32 || events.arrived) {
          setView(snapshot(state));
          lastPaint = now;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    steerSpace(
      model.current,
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    );
  };
  const route = routes[destination % routes.length];
  return (
    <section
      className={`space-adventure ${paused ? 'space-is-paused' : ''} ${settings.calm ? 'space-is-calm' : ''}`}
      style={
        {
          '--space-sky': route.sky,
          '--space-cloud': route.cloud,
          '--space-glow': route.glow,
        } as CSSProperties
      }
      data-testid="space-game"
      data-phase={phase}
      data-fuel={view.stars}
      data-time={view.time.toFixed(2)}
    >
      <div className="space-flight-header">
        <div className="space-destination">
          <Planet index={destination} />
          <div>
            <span>{phase === 'visit' ? 'HELLO, LITTLE WORLD' : 'FLYING TO'}</span>
            <h2>
              {phase === 'visit' ? `Hello, ${planets[destination][0]}!` : planets[destination][0]}
            </h2>
          </div>
        </div>
        <div className="space-star-meter" aria-label={`${view.stars} of 6 fuel stars`}>
          {Array.from({ length: 6 }, (_, i) => (
            <Star key={i} style={{ opacity: i < view.stars ? 1 : 0.24 }} />
          ))}
        </div>
      </div>
      <div
        className={`space-flight-field ${phase === 'visit' ? 'is-visiting' : ''}`}
        ref={field}
        role={phase === 'fly' ? 'application' : undefined}
        aria-label={
          phase === 'fly' ? 'Drag the rocket to collect stars and dodge space rocks' : undefined
        }
        tabIndex={phase === 'fly' ? 0 : -1}
        onPointerDown={(event) => {
          if (
            paused ||
            phase !== 'fly' ||
            (event.target instanceof Element && event.target.closest('button'))
          )
            return;
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          point(event);
        }}
        onPointerMove={(event) => {
          if (!paused && pointer.current === event.pointerId && phase === 'fly') point(event);
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        <svg
          className="space-galaxy"
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <ellipse
            cx="780"
            cy="190"
            rx="350"
            ry="105"
            fill="var(--space-cloud)"
            opacity=".12"
            transform="rotate(-32 780 190)"
          />
          <ellipse
            cx="780"
            cy="190"
            rx="240"
            ry="62"
            fill="none"
            stroke="var(--space-cloud)"
            strokeWidth="28"
            opacity=".15"
            transform="rotate(-32 780 190)"
          />
          <ellipse
            cx="780"
            cy="190"
            rx="150"
            ry="35"
            fill="none"
            stroke="var(--space-glow)"
            strokeWidth="12"
            opacity=".12"
            transform="rotate(-32 780 190)"
          />
          <circle cx="781" cy="188" r="19" fill="var(--space-glow)" opacity=".2" />
          {Array.from({ length: 62 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 137 + 19) % 1000}
              cy={(i * 97 + view.time * ((i % 3) + 1) * 2) % 650}
              r={i % 7 === 0 ? 2.7 : 1.3}
              fill="#fff7d5"
              opacity={0.3 + (i % 4) * 0.17}
            />
          ))}
          <path
            d="M0 420Q160 340 300 520T710 530"
            fill="none"
            stroke="var(--space-cloud)"
            strokeWidth="85"
            opacity=".07"
          />
        </svg>
        {phase === 'fly' ? (
          <>
            <span className="space-route-label">{route.name}</span>
            <div
              className="space-far-planet"
              style={{
                transform: `scale(${0.7 + view.stars * 0.08})`,
                opacity: 0.2 + view.stars * 0.065,
              }}
            >
              <Planet index={destination} />
            </div>
            {view.objects.map((object) => (
              <button
                key={object.id}
                type="button"
                aria-label={
                  object.kind === 'star'
                    ? `Collect fuel star ${object.id + 1}`
                    : object.kind === 'alien'
                      ? 'Say hello to the alien'
                      : object.kind === 'blackhole'
                        ? 'A swirling black hole'
                        : object.kind === 'asteroid'
                          ? 'A bouncy asteroid'
                          : 'A passing comet'
                }
                className={`space-object space-object-${object.kind}`}
                disabled={paused || view.stars >= 6}
                style={{
                  left: `${object.x}%`,
                  top: `${object.y}%`,
                  transform: `translate(-50%,-50%) rotate(${object.kind === 'asteroid' ? view.time * 13 : object.kind === 'blackhole' ? view.time * 30 : Math.sin(view.time * 2 + object.phase) * 5}deg)`,
                }}
                onClick={() => {
                  if (paused) return;
                  if (object.kind === 'star' || object.kind === 'alien') collect(object.id);
                  else {
                    model.current.shield = 1.2;
                    model.current.objects = model.current.objects.filter(
                      (item) => item.id !== object.id,
                    );
                    playSound('boing', settings);
                    setCaption(
                      object.kind === 'blackhole'
                        ? 'A black hole. Swirly, swirly!'
                        : 'Boing! Away you go!',
                    );
                    messageUntil.current = model.current.time + 2;
                  }
                }}
              >
                <SpaceThing
                  kind={object.kind}
                  waving={greeted === object.id || Math.sin(view.time * 4) > 0}
                />
              </button>
            ))}
            <div
              className={`space-pilot ${view.shield > 0 ? 'is-shielded' : ''} ${view.stars >= 6 ? 'is-arriving' : ''}`}
              data-testid="space-rocket"
              data-x={view.x.toFixed(1)}
              data-y={view.y.toFixed(1)}
              style={{
                left: `${view.x}%`,
                top: `${view.y}%`,
                transform: `translate(-50%,-50%) rotate(${view.swirl > 0 ? (1.1 - view.swirl) * 300 : (view.targetX - view.x) * 0.5}deg)`,
              }}
            >
              <div className="space-pilot-bubble" />
              <Rocket />
              <span
                className="space-engine-glow"
                style={{ transform: `scaleY(${1 + Math.sin(view.time * 14) * 0.14})` }}
              />
            </div>
            <div className="space-flight-hint" aria-live="off">
              {caption}
            </div>
            <div className="space-flight-controls">
              <button
                type="button"
                aria-label="Steer rocket left"
                disabled={paused}
                onClick={() => steer(-1)}
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                className="space-tractor"
                aria-label="Help rocket catch a star"
                disabled={paused || view.stars >= 6}
                onClick={assist}
              >
                <Star />
                <span>Catch!</span>
              </button>
              <button
                type="button"
                aria-label="Steer rocket right"
                disabled={paused}
                onClick={() => steer(1)}
              >
                <ArrowRight />
              </button>
            </div>
          </>
        ) : (
          <div className="space-discovery" role="status">
            <div className="space-orbit">
              <button
                type="button"
                className={`space-planet-portrait ${planetGreeting ? 'is-greeting' : ''}`}
                disabled={paused}
                aria-label={`Hear about ${planets[destination][0]}`}
                onClick={announce}
              >
                <Planet index={destination} />
              </button>
              <div className="space-orbit-rocket">
                <Rocket />
              </div>
            </div>
            <div className="space-discovery-copy">
              <span className="space-visited-badge">
                <Check size={17} /> {visited.length} / 8 worlds
              </span>
              <p>{planets[destination][1]}</p>
              <div className="space-visit-actions">
                <button
                  type="button"
                  className="space-listen"
                  disabled={paused || !settings.sound}
                  onClick={announce}
                  aria-label="Say the planet name again"
                >
                  <Volume2 />
                </button>
                <button
                  type="button"
                  className="space-next"
                  disabled={paused}
                  onClick={() => choose((destination + 1) % 8)}
                >
                  <Rocket />
                  Next planet
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-planet-strip" aria-label="Choose a planet">
        {planets.map(([name], i) => (
          <button
            type="button"
            key={name}
            aria-label={`Explore ${name}`}
            aria-pressed={destination === i}
            disabled={paused}
            onClick={() => choose(i)}
          >
            <Planet index={i} />
            <span>{name}</span>
            {visited.includes(i) && <Check className="space-planet-check" size={13} />}
          </button>
        ))}
      </div>
    </section>
  );
}
