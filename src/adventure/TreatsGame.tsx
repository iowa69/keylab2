import { useState } from 'react';
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Animal, Cone, Face } from './Art';
import { playTone, speak } from './audio';
import { usePlayTimer } from './usePlayTimer';
import { useGameKeys } from './useGameKeys';
import type { GameProps } from './types';
const flavors = [
  { name: 'Strawberry', color: '#e7a4b5' },
  { name: 'Vanilla', color: '#f3e1a7' },
  { name: 'Chocolate', color: '#a8755d' },
  { name: 'Mint', color: '#a0c7aa' },
  { name: 'Blueberry', color: '#a9a4cd' },
];
function Chocolate({ pieces = 3, decorated = false }: { pieces?: number; decorated?: boolean }) {
  return (
    <svg viewBox="0 0 150 200" aria-hidden="true">
      <rect x="14" y="11" width="122" height="177" rx="16" fill="#cfb09a" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect
            x={24 + (i % 2) * 53}
            y={22 + Math.floor(i / 2) * 53}
            width="46"
            height="46"
            rx="8"
            fill={i < pieces * 2 ? '#9e6c50' : '#b79780'}
          />
          {i < pieces * 2 && (
            <path
              d={`m${31 + (i % 2) * 53} ${57 + Math.floor(i / 2) * 53}v-27h29`}
              fill="none"
              stroke="#c2906b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          {decorated && (
            <g fill="#f7d487">
              <circle cx={37 + (i % 2) * 53} cy={38 + Math.floor(i / 2) * 53} r="4" />
              <circle cx={54 + (i % 2) * 53} cy={52 + Math.floor(i / 2) * 53} r="3" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}
export function TreatsGame({ settings, paused, onCelebrate }: GameProps) {
  const [kind, setKind] = useState<'icecream' | 'chocolate'>('icecream'),
    [scoops, setScoops] = useState<string[]>([]),
    [sprinkles, setSprinkles] = useState(false),
    [phase, setPhase] = useState<'make' | 'serve' | 'yum'>('make'),
    [friend, setFriend] = useState(0);
  usePlayTimer(phase === 'serve', paused, 1100, () => {
    setPhase('yum');
    onCelebrate('Made a treat for a friend');
    speak('Yummy! Thank you!', settings);
    playTone(7, settings);
  });
  function reset(next = kind) {
    if (paused) return;
    setKind(next);
    setScoops([]);
    setSprinkles(false);
    setPhase('make');
  }
  function add(color: string) {
    if (paused || phase !== 'make' || scoops.length === 3) return;
    setScoops((s) => [...s, color]);
    playTone(scoops.length * 2 + 2, settings);
    speak(String(scoops.length + 1), settings);
  }
  function decorate() {
    if (paused || scoops.length < 3 || phase !== 'make') return;
    setSprinkles(true);
    playTone(6, settings);
  }
  function serve() {
    if (paused || scoops.length < 3 || phase !== 'make') return;
    setPhase('serve');
    playTone(4, settings);
  }
  function advance() {
    if (phase === 'yum') {
      setFriend((friend + 1) % 3);
      reset();
    } else if (scoops.length < 3) add(flavors[(scoops.length + friend) % flavors.length].color);
    else if (!sprinkles) decorate();
    else serve();
  }
  useGameKeys(paused, advance);
  return (
    <div
      className={`treats-game ${paused ? 'is-paused' : ''}`}
      data-testid="treats-game"
      data-phase={phase}
    >
      <div className="treats-switch" aria-label="Choose a treat">
        <button
          aria-pressed={kind === 'icecream'}
          onClick={() => reset('icecream')}
          disabled={paused}
        >
          <Cone />
          <span>Ice cream</span>
        </button>
        <button
          aria-pressed={kind === 'chocolate'}
          onClick={() => reset('chocolate')}
          disabled={paused}
        >
          <Chocolate />
          <span>Chocolate</span>
        </button>
      </div>
      <div className="sweet-awning" aria-hidden="true" />
      <div className="treats-stage">
        <div className="treat-order">
          <span>{phase === 'yum' ? 'THANK YOU!' : 'ONE FOR OUR FRIEND'}</span>
          <div>
            {[0, 1, 2].map((i) => (
              <span key={i} className={scoops.length > i ? 'done' : ''}>
                {scoops.length > i ? <Check /> : i + 1}
              </span>
            ))}
          </div>
          <p>
            {phase === 'yum'
              ? 'Yum, yum, yum!'
              : scoops.length < 3
                ? kind === 'icecream'
                  ? 'Choose 3 delicious scoops'
                  : 'Fill the chocolate mould'
                : !sprinkles
                  ? 'Add a little sparkle'
                  : 'Time to share!'}
          </p>
        </div>
        <div className={`treat-product ${phase}`}>
          {kind === 'icecream' ? (
            <Cone colors={scoops} />
          ) : (
            <Chocolate pieces={scoops.length} decorated={sprinkles} />
          )}
          {sprinkles && kind === 'icecream' && (
            <svg className="sprinkles" viewBox="0 0 100 130" aria-hidden="true">
              {Array.from({ length: 18 }, (_, i) => (
                <path
                  key={i}
                  d={`m${29 + ((i * 13) % 44)} ${18 + ((i * 19) % 48)} 3 4`}
                  stroke={['#f9d66c', '#ef847e', '#8babc8'][i % 3]}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          )}
          {scoops.length === 0 && kind === 'icecream' && <span className="scoop-ghost">+</span>}
        </div>
        <div className={`treat-friend ${phase}`}>
          <span className="friend-bubble">
            {phase === 'yum' ? (
              <>
                <Check /> Yum!
              </>
            ) : phase === 'serve' ? (
              <>
                <Sparkles /> Mmm!
              </>
            ) : (
              <>
                {kind === 'icecream' ? (
                  <Cone colors={['#e7a4b5', '#f3e1a7', '#a8755d']} />
                ) : (
                  <Chocolate />
                )}
                <span>please!</span>
              </>
            )}
          </span>
          <Animal kind={(['bunny', 'bear', 'cat'] as const)[friend]} />
        </div>
      </div>
      <div className="treat-controls">
        {phase === 'yum' ? (
          <button
            className="big-action"
            disabled={paused}
            onClick={() => {
              setFriend((friend + 1) % 3);
              reset();
            }}
          >
            <RotateCcw />
            Make another
            <ArrowRight />
          </button>
        ) : phase === 'serve' ? (
          <p role="status">A happy treat for a happy friend!</p>
        ) : scoops.length < 3 ? (
          kind === 'icecream' ? (
            <div className="flavor-picker">
              {flavors.map((f) => (
                <button
                  key={f.name}
                  aria-label={`Add ${f.name.toLowerCase()} scoop`}
                  disabled={paused}
                  onClick={() => add(f.color)}
                >
                  <svg viewBox="0 0 70 65">
                    <path
                      d="M8 48a27 27 0 0 1 54 0q0 8-9 5-9 7-18 0-9 7-18 0-9 3-9-5"
                      fill={f.color}
                    />
                    <Face x={35} y={34} />
                  </svg>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              className="big-action chocolate-pour"
              disabled={paused}
              onClick={() => add('#a8755d')}
            >
              <Chocolate pieces={1} />
              Pour chocolate <span>{scoops.length}/3</span>
            </button>
          )
        ) : (
          <div className="serve-controls">
            <button className="decorate-button" disabled={paused || sprinkles} onClick={decorate}>
              <Sparkles />
              {sprinkles ? 'So sparkly!' : 'Sprinkles'}
            </button>
            <button className="big-action" disabled={paused} onClick={serve}>
              Serve to our friend
              <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
