import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Planet, Rocket, Star } from './Art';
import { playTone, speak } from './audio';
import { usePlayTimer } from './usePlayTimer';
import { useGameKeys } from './useGameKeys';
import type { GameProps } from './types';
export const planets = [
  ['Mercury', 'The closest planet to the Sun.'],
  ['Venus', 'The hottest planet.'],
  ['Earth', 'Our home, with land and oceans.'],
  ['Mars', 'The red planet.'],
  ['Jupiter', 'The biggest planet.'],
  ['Saturn', 'Look at those beautiful rings!'],
  ['Uranus', 'A planet that spins on its side.'],
  ['Neptune', 'The farthest planet from the Sun.'],
];
export function SpaceGame({ settings, paused, onCelebrate }: GameProps) {
  const [destination, setDestination] = useState(0),
    [fuel, setFuel] = useState<number[]>([]),
    [phase, setPhase] = useState<'fuel' | 'fly' | 'visit'>('fuel'),
    [visited, setVisited] = useState<number[]>([]);
  usePlayTimer(phase === 'fly', paused, settings.calm ? 750 : 2100, () => {
    setPhase('visit');
    setVisited((v) => (v.includes(destination) ? v : [...v, destination]));
    playTone(7, settings);
    speak(`Hello ${planets[destination][0]}. ${planets[destination][1]}`, settings);
    onCelebrate(`Visited ${planets[destination][0]}`);
  });
  function choose(index: number) {
    if (paused) return;
    setDestination(index);
    setFuel([]);
    setPhase('fuel');
    playTone(index, settings);
  }
  function collect(index: number) {
    if (paused || phase !== 'fuel' || fuel.includes(index)) return;
    const next = [...fuel, index];
    setFuel(next);
    playTone(2 + next.length * 2, settings);
    if (next.length === 3) setPhase('fly');
  }
  function advance() {
    if (phase === 'visit') choose((destination + 1) % 8);
    else collect([0, 1, 2].find((i) => !fuel.includes(i)) ?? 0);
  }
  useGameKeys(paused, advance);
  return (
    <div
      className={`space-game ${phase} ${paused ? 'is-paused' : ''}`}
      data-testid="space-game"
      data-phase={phase}
    >
      <div className="space-goal">
        <Rocket />
        <div>
          <span>{phase === 'visit' ? 'YOU FOUND A NEW WORLD' : 'OUR NEXT ADVENTURE'}</span>
          <h2>
            {phase === 'visit' ? `Hello, ${planets[destination][0]}!` : planets[destination][0]}
          </h2>
        </div>
        <div className="fuel-meter" aria-label={`${fuel.length} of 3 fuel stars`}>
          {[0, 1, 2].map((i) => (
            <Star key={i} style={{ opacity: fuel.includes(i) ? 1 : 0.25 }} />
          ))}
        </div>
      </div>
      <div className="space-scene">
        <svg
          className="space-stars"
          viewBox="0 0 900 360"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {Array.from({ length: 42 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 137 + 22) % 900}
              cy={(i * 97 + 31) % 360}
              r={i % 5 === 0 ? 3 : 1.5}
              fill="#fff3ce"
              opacity={0.3 + (i % 4) * 0.15}
            />
          ))}
          <path
            d="M0 308Q410 360 860 130"
            fill="none"
            stroke="#bfb4df"
            opacity=".25"
            strokeDasharray="7 12"
            strokeWidth="2"
          />
        </svg>
        <div className="space-world">
          <Planet index={destination} />
        </div>
        <div className="space-rocket">
          <Rocket />
        </div>
        {phase === 'fuel' &&
          [0, 1, 2].map((i) => (
            <button
              key={i}
              className={`fuel-star fuel-${i} ${fuel.includes(i) ? 'collected' : ''}`}
              disabled={paused || fuel.includes(i)}
              onClick={() => collect(i)}
              aria-label={`Collect fuel star ${i + 1}`}
            >
              <Star />
              <span>{fuel.includes(i) ? <Check /> : i + 1}</span>
            </button>
          ))}
        {phase === 'visit' && (
          <div className="planet-postcard" role="status">
            <span className="postcard-stamp">
              <Check /> DISCOVERED
            </span>
            <p>{planets[destination][1]}</p>
            <button
              className="big-action"
              onClick={() => choose((destination + 1) % 8)}
              disabled={paused}
            >
              <Rocket />
              Next planet
              <ArrowRight />
            </button>
          </div>
        )}
        <p className="space-hint">
          {phase === 'fuel'
            ? 'Tap 3 stars to power your rocket'
            : phase === 'fly'
              ? 'Whoosh! Here we go…'
              : `${visited.length} of 8 worlds explored`}
        </p>
      </div>
      <div className="planet-picker" aria-label="Choose a planet">
        {planets.map(([name], i) => (
          <button
            key={name}
            aria-label={`Explore ${name}`}
            aria-pressed={destination === i}
            disabled={paused}
            onClick={() => choose(i)}
          >
            <Planet index={i} />
            <span>{name}</span>
            {visited.includes(i) && <Check className="planet-check" size={17} />}
          </button>
        ))}
      </div>
    </div>
  );
}
