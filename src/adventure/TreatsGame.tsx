import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, RotateCcw, Sparkles, Undo2 } from 'lucide-react';
import { playSound, speak } from './audio';
import { usePlayTimer } from './usePlayTimer';
import { useGameKeys } from './useGameKeys';
import type { GameProps } from './types';
import './treats.css';

type Dessert = 'cone' | 'split' | 'chocolate';
type Ingredient = { id: string; name: string; color: string; type: 'scoop' | 'topping' };
const ingredients: Ingredient[] = [
  { id: 'strawberry', name: 'Strawberry', color: '#ed93ae', type: 'scoop' },
  { id: 'vanilla', name: 'Vanilla', color: '#ffe5a2', type: 'scoop' },
  { id: 'chocolate', name: 'Chocolate', color: '#a46d50', type: 'scoop' },
  { id: 'mint', name: 'Mint', color: '#87caaa', type: 'scoop' },
  { id: 'blueberry', name: 'Blueberry', color: '#a196d5', type: 'scoop' },
  { id: 'mango', name: 'Mango', color: '#f6b75e', type: 'scoop' },
  { id: 'bubblegum', name: 'Bubblegum', color: '#86c9dc', type: 'scoop' },
  { id: 'watermelon', name: 'Watermelon', color: '#f17888', type: 'scoop' },
  { id: 'sprinkles', name: 'Sprinkles', color: '#ee87a6', type: 'topping' },
  { id: 'cherry', name: 'Cherry', color: '#d85069', type: 'topping' },
  { id: 'cookie', name: 'Cookie', color: '#c49057', type: 'topping' },
  { id: 'sauce', name: 'Choc sauce', color: '#815443', type: 'topping' },
  { id: 'pickle', name: 'Pickle!', color: '#8bb75a', type: 'topping' },
  { id: 'fish', name: 'Fish!', color: '#85b9ce', type: 'topping' },
  { id: 'carrot', name: 'Carrot!', color: '#ed9a48', type: 'topping' },
  { id: 'banana', name: 'Banana', color: '#f1d062', type: 'topping' },
];
const customers = [
  { name: 'Bunny', color: '#e8c7ab', shirt: '#a5cbb5' },
  { name: 'Bear', color: '#c78e63', shirt: '#ecb66f' },
  { name: 'Cat', color: '#a9b8d2', shirt: '#d3a1c7' },
  { name: 'Pig', color: '#e9a5af', shirt: '#88bfcb' },
];
function FoodArt({ item, className }: { item: Ingredient; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {item.type === 'scoop' ? (
        <>
          <path
            d="M10 53C6 15 69 10 71 51Q74 66 61 60Q51 71 40 61Q29 70 20 60Q8 66 10 53"
            fill={item.color}
            stroke="#78534325"
            strokeWidth="1.5"
          />
          <path
            d="M21 36q5-12 17-13"
            fill="none"
            stroke="#fff6e5"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".55"
          />
          {item.id === 'chocolate' && (
            <g fill="#744834">
              <circle cx="26" cy="49" r="3" />
              <circle cx="52" cy="32" r="4" />
              <circle cx="51" cy="54" r="3" />
            </g>
          )}
          {item.id === 'watermelon' && (
            <g fill="#724444">
              <ellipse cx="27" cy="45" rx="2" ry="4" />
              <ellipse cx="50" cy="38" rx="2" ry="4" />
              <ellipse cx="45" cy="58" rx="2" ry="4" />
            </g>
          )}
        </>
      ) : item.id === 'fish' ? (
        <>
          <path d="m17 40-13-15v30z" fill="#76abc3" />
          <path d="M15 40q28-41 59 0-31 41-59 0" fill="#a4cede" />
          <path d="m40 24 8-12 10 16m-16 27 7 12 8-13" fill="#76abc3" />
          <circle cx="60" cy="36" r="3" fill="#38586a" />
          <path d="M42 25q-9 15 0 30" fill="none" stroke="#76abc3" strokeWidth="3" />
        </>
      ) : item.id === 'pickle' ? (
        <>
          <rect
            x="23"
            y="9"
            width="34"
            height="62"
            rx="17"
            fill="#8cb955"
            transform="rotate(24 40 40)"
          />
          <g fill="#618f3f">
            <circle cx="44" cy="21" r="3" />
            <circle cx="30" cy="37" r="3" />
            <circle cx="42" cy="46" r="3" />
            <circle cx="32" cy="60" r="3" />
          </g>
          <path d="m48 13 7-6" stroke="#6b9345" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : item.id === 'carrot' ? (
        <>
          <path d="M23 24q19-18 33 3L32 72Z" fill="#ed9a48" />
          <path
            d="m39 23 1-17m4 17L56 9m-21 12L26 8"
            stroke="#75a75a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="m27 35 13 3m-10 11 9 3" stroke="#ce7839" strokeWidth="3" />
        </>
      ) : item.id === 'banana' ? (
        <>
          <path d="M16 15q1 45 49 35-21 38-49 11Q0 40 16 15" fill="#f5d46b" />
          <path d="M17 25q4 35 37 33" fill="none" stroke="#dfb851" strokeWidth="3" />
          <path d="m15 18 2-8m46 40 6-3" stroke="#947342" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : item.id === 'cookie' ? (
        <>
          <circle cx="40" cy="41" r="28" fill="#d9ad74" />
          <g fill="#895a44">
            <circle cx="29" cy="28" r="5" />
            <circle cx="53" cy="34" r="4" />
            <circle cx="40" cy="51" r="5" />
            <circle cx="24" cy="48" r="3" />
            <circle cx="56" cy="53" r="3" />
          </g>
        </>
      ) : item.id === 'cherry' ? (
        <>
          <circle cx="30" cy="51" r="16" fill="#e36e80" />
          <circle cx="55" cy="52" r="17" fill="#cb4d66" />
          <path d="M30 38q14-13 16-28 2 19 10 28" fill="none" stroke="#618d58" strokeWidth="4" />
          <path d="M47 17q4-19 23-10-3 16-23 10" fill="#82ae65" />
          <path d="m23 44 4-3" stroke="#ffc7d1" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : item.id === 'sauce' ? (
        <>
          <path
            d="M14 37q12-18 26-13 19-9 26 9v17q-5 17-12 0v-6q-6-8-8 4v14q-9 18-15-2V46q-7-8-8 4-9 7-9-6"
            fill="#815443"
          />
          <path
            d="M22 32q12-9 22-4"
            stroke="#b88869"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <g strokeWidth="7" strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`m${15 + (i % 4) * 16} ${20 + Math.floor(i / 4) * 18} ${i % 2 ? 5 : -4} 7`}
              stroke={['#ed8eaa', '#efc354', '#89bfb1', '#a994cf'][i % 4]}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
function DessertArt({
  kind,
  scoops,
  toppings,
}: {
  kind: Dessert;
  scoops: Ingredient[];
  toppings: Ingredient[];
}) {
  const count = scoops.length;
  const step = Math.min(36, 255 / Math.max(1, count - 1));
  const top =
    kind === 'cone'
      ? 282 - Math.max(0, count - 1) * step
      : kind === 'split'
        ? 246 - Math.floor(Math.max(0, count - 1) / 3) * 31
        : 160;
  return (
    <svg className="sweet-dessert-art" viewBox="0 0 320 400" aria-hidden="true">
      <ellipse cx="160" cy="374" rx={kind === 'cone' ? 56 : 139} ry="11" fill="#966d5420" />
      {kind === 'cone' ? (
        <>
          <path d="m116 291 44 81 44-81" fill="#dca361" stroke="#b37e48" strokeWidth="3" />
          <path
            d="m123 305 53 49m-35-58 43 43m-45 13 53-51m-44 18 19-20"
            stroke="#b9874f"
            strokeWidth="3"
          />
          <path d="M116 292h88" stroke="#f2c88d" strokeWidth="10" strokeLinecap="round" />
        </>
      ) : kind === 'split' ? (
        <>
          <path d="M28 302q132 95 264 0l-21 49H51Z" fill="#98cbd1" />
          <path
            d="M36 303q112 37 246-13"
            fill="none"
            stroke="#fff9ea"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M34 251q66 89 252-7-78 135-252 7"
            fill="#f3cf63"
            stroke="#dcb553"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <rect x="42" y="166" width="236" height="189" rx="22" fill="#d3a779" />
          <rect x="50" y="173" width="220" height="175" rx="15" fill="#9b6750" />
          {Array.from({ length: 18 }, (_, i) => (
            <g key={i} data-chocolate-piece={i < scoops.length ? 'filled' : 'empty'}>
              <rect
                x={59 + (i % 3) * 69}
                y={182 + Math.floor(i / 3) * 26}
                width="63"
                height="22"
                rx="7"
                fill={scoops[i]?.color ?? '#bb896a'}
              />
              <path
                d={`m${66 + (i % 3) * 69} ${198 + Math.floor(i / 3) * 26}v-10h48`}
                fill="none"
                stroke="#fff7df"
                strokeWidth="3"
                opacity=".23"
              />
            </g>
          ))}
        </>
      )}
      {kind !== 'chocolate' &&
        scoops.map((item, i) => {
          const x = kind === 'cone' ? 160 + Math.sin(i * 1.8) * 4 : 85 + (i % 3) * 75;
          const y = kind === 'cone' ? 282 - i * step : 246 - Math.floor(i / 3) * 31;
          return (
            <g key={i} className="sweet-added-scoop" transform={`translate(${x - 48} ${y - 56})`}>
              <svg viewBox="0 0 80 80" width="96" height="96">
                <FoodArt item={item} />
              </svg>
            </g>
          );
        })}
      {toppings.map((item, i) => (
        <g
          key={i}
          transform={`translate(${(kind === 'cone' ? 130 : 65) + ((i % 3) - 1) * (kind === 'cone' ? 24 : 52)} ${Math.max(4, top - 54) - Math.floor(i / 3) * 19}) rotate(${((i % 3) - 1) * 16} 30 30)`}
        >
          <svg viewBox="0 0 80 80" width="61" height="61">
            <FoodArt item={item} />
          </svg>
        </g>
      ))}
      {count === 0 && (
        <g opacity=".65">
          <path
            d={kind === 'cone' ? 'M120 261a40 38 0 0 1 80 0' : 'M110 223a40 38 0 0 1 80 0'}
            fill="none"
            stroke="#c79479"
            strokeWidth="4"
            strokeDasharray="5 9"
          />
          <path
            d={`M160 ${kind === 'cone' ? 239 : 201}v26m-13-13h26`}
            stroke="#c79479"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
function SweetFriend({
  index,
  emotion,
}: {
  index: number;
  emotion: 'make' | 'serve' | 'yum' | 'yuck';
}) {
  const c = customers[index];
  return (
    <svg viewBox="0 0 180 230" className={`sweet-friend-art emotion-${emotion}`} aria-hidden="true">
      <ellipse cx="90" cy="214" rx="68" ry="9" fill="#8e695a18" />
      <g className="sweet-friend-body">
        <ellipse cx="90" cy="175" rx="51" ry="39" fill={c.shirt} />
        <ellipse cx="54" cy="210" rx="24" ry="12" fill={c.color} />
        <ellipse cx="126" cy="210" rx="24" ry="12" fill={c.color} />
        <path d="M78 152h24l-5 46H84Z" fill="#fff6dd" opacity=".7" />
        <ellipse cx="35" cy="170" rx="18" ry="25" fill={c.color} transform="rotate(25 35 170)" />
        <ellipse className="sweet-wave" cx="147" cy="155" rx="16" ry="26" fill={c.color} />
      </g>
      <g className="sweet-friend-head">
        {index === 0 ? (
          <>
            <ellipse cx="55" cy="42" rx="17" ry="40" fill={c.color} transform="rotate(-9 55 42)" />
            <ellipse
              cx="122"
              cy="41"
              rx="17"
              ry="40"
              fill={c.color}
              transform="rotate(10 122 41)"
            />
            <path d="M55 20v29m66-29v29" stroke="#dfaaa1" strokeWidth="10" strokeLinecap="round" />
          </>
        ) : index === 2 ? (
          <path d="m34 82-6-49 39 28h44l40-28-6 49" fill={c.color} />
        ) : (
          <>
            <circle cx="45" cy="63" r="23" fill={c.color} />
            <circle cx="136" cy="63" r="23" fill={c.color} />
            <circle cx="45" cy="63" r="12" fill="#dfa79b" />
            <circle cx="136" cy="63" r="12" fill="#dfa79b" />
          </>
        )}
        <rect x="27" y="57" width="126" height="99" rx="46" fill={c.color} />
        <ellipse cx="49" cy="117" rx="13" ry="8" fill="#df9990" opacity=".55" />
        <ellipse cx="131" cy="117" rx="13" ry="8" fill="#df9990" opacity=".55" />
        {emotion === 'yuck' ? (
          <>
            <path
              d="m58 90 12 8-12 7m64-15-12 8 12 7"
              stroke="#654d48"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="m68 133 11-7 11 6 11-6 12 7"
              stroke="#654d48"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M86 130v10q9 12 17-1v-9" fill="#e9858f" />
          </>
        ) : (
          <>
            <g className="sweet-blink">
              <ellipse cx="65" cy="99" rx="5" ry="7" fill="#574a46" />
              <ellipse cx="115" cy="99" rx="5" ry="7" fill="#574a46" />
            </g>
            {emotion === 'make' ? (
              <path
                d="M77 125q13 14 26 0"
                stroke="#674a45"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <g className="sweet-chew">
                <ellipse
                  cx="90"
                  cy="128"
                  rx="17"
                  ry={emotion === 'serve' ? 18 : 12}
                  fill="#765047"
                />
                <path d="M78 135q12-10 24 0" fill="#ef9a9b" />
              </g>
            )}
          </>
        )}
        {index === 3 ? (
          <>
            <ellipse cx="90" cy="115" rx="19" ry="12" fill="#d98796" />
            <circle cx="84" cy="114" r="3" fill="#915c68" />
            <circle cx="97" cy="114" r="3" fill="#915c68" />
          </>
        ) : (
          <path d="m85 112 5 5 5-5" fill="#74574e" />
        )}
        {index === 2 && (
          <g stroke="#778fa9" strokeWidth="3" strokeLinecap="round">
            <path d="m36 113-18-3m18 12-18 3m126-12 18-3m-18 12 18 3" />
          </g>
        )}
      </g>
    </svg>
  );
}
export function TreatsGame({ settings, paused, onCelebrate }: GameProps) {
  const [kind, setKind] = useState<Dessert>('cone');
  const [scoops, setScoops] = useState<Ingredient[]>([]),
    [toppings, setToppings] = useState<Ingredient[]>([]);
  const [tray, setTray] = useState<'scoop' | 'topping'>('scoop');
  const [phase, setPhase] = useState<'make' | 'serve' | 'yum' | 'yuck'>('make');
  const [friend, setFriend] = useState(0),
    [served, setServed] = useState(0);
  const [drag, setDrag] = useState<{ item: Ingredient; x: number; y: number } | null>(null);
  const creation = useRef<HTMLButtonElement>(null);
  const held = useRef<{
    pointer: number;
    item: Ingredient;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const preventClick = useRef(false);
  const silly = toppings.some(
    (item) => item.id === 'pickle' || (item.id === 'fish' && friend !== 2),
  );
  usePlayTimer(phase === 'serve', paused, 1050, () => {
    setPhase(silly ? 'yuck' : 'yum');
    setServed((n) => n + 1);
    playSound(silly ? 'yuck' : 'giggle', settings);
    speak(
      silly
        ? 'Oops! No, thank you!'
        : friend === 2 && toppings.some((item) => item.id === 'fish')
          ? 'Fish! Purrfect!'
          : 'Yummy! Thank you!',
      settings,
      { interrupt: true },
    );
    onCelebrate('Shared a homemade treat');
  });
  useEffect(() => {
    if (paused) {
      held.current = null;
      setDrag(null);
    }
  }, [paused]);
  const reset = (next = kind) => {
    if (paused) return;
    setKind(next);
    setScoops([]);
    setToppings([]);
    setPhase('make');
  };
  const add = (item: Ingredient) => {
    if (paused || phase === 'serve') return;
    if (phase !== 'make') {
      setScoops(item.type === 'scoop' ? [item] : []);
      setToppings(item.type === 'topping' ? [item] : []);
      setPhase('make');
    } else if (item.type === 'scoop') setScoops((old) => (old.length < 18 ? [...old, item] : old));
    else setToppings((old) => (old.length < 9 ? [...old, item] : [...old.slice(1), item]));
    playSound('pop', settings);
    speak(item.name.replace('!', ''), settings);
  };
  const serve = () => {
    if (paused || !scoops.length || phase !== 'make') return;
    setPhase('serve');
    playSound('whoosh', settings);
  };
  const nextFriend = () => {
    if (paused || phase === 'serve') return;
    setFriend((n) => (n + 1) % customers.length);
    if (phase !== 'make') reset();
    playSound('giggle', settings);
  };
  useGameKeys(paused, (key) => {
    if (key === 'Escape') return;
    if (phase === 'yum' || phase === 'yuck') {
      nextFriend();
      return;
    }
    if (key === 'Enter' || key === ' ') {
      if (scoops.length) serve();
      else add(ingredients[0]);
      return;
    }
    if (scoops.length >= 5) {
      serve();
      return;
    }
    add(ingredients[(scoops.length + friend) % 8]);
  });
  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const pointer = held.current;
    if (!pointer || pointer.pointer !== event.pointerId) return;
    if (pointer.moved) {
      preventClick.current = true;
      const bounds = creation.current?.getBoundingClientRect();
      if (
        bounds &&
        event.clientX >= bounds.left - 30 &&
        event.clientX <= bounds.right + 30 &&
        event.clientY >= bounds.top - 30 &&
        event.clientY <= bounds.bottom + 30
      )
        add(pointer.item);
    }
    held.current = null;
    setDrag(null);
  };
  const label =
    phase === 'yuck'
      ? 'Oops! No, thank you!'
      : phase === 'yum'
        ? 'Yum! Thank you!'
        : phase === 'serve'
          ? 'Nom, nom, nom…'
          : scoops.length === 18
            ? 'A towering treat!'
            : scoops.length
              ? 'More scoops? Or share it!'
              : 'Make anything you like!';
  return (
    <section
      className={`sweet-studio ${paused ? 'sweet-paused' : ''} ${settings.calm ? 'sweet-calm' : ''}`}
      data-testid="treats-game"
      data-phase={phase}
      data-scoops={scoops.length}
      data-served={served}
      aria-label="The sweet shop"
    >
      <div className="sweet-topbar">
        <div className="sweet-kinds" aria-label="Choose a dessert">
          {(['cone', 'split', 'chocolate'] as const).map((value) => (
            <button
              key={value}
              onClick={() => reset(value)}
              disabled={paused || phase === 'serve'}
              aria-pressed={kind === value}
              aria-label={
                value === 'cone'
                  ? 'Make ice cream'
                  : value === 'split'
                    ? 'Make a banana split'
                    : 'Make chocolate'
              }
            >
              <DessertArt
                kind={value}
                scoops={[ingredients[value === 'chocolate' ? 2 : 0], ingredients[1]]}
                toppings={[]}
              />
              <span>
                {value === 'cone' ? 'Cone' : value === 'split' ? 'Banana split' : 'Chocolate'}
              </span>
            </button>
          ))}
        </div>
        <button
          className="sweet-clear"
          aria-label="Start a fresh treat"
          onClick={() => reset()}
          disabled={paused || phase === 'serve'}
        >
          <RotateCcw />
        </button>
      </div>
      <div className="sweet-scene">
        <div className="sweet-awning-v5" aria-hidden="true" />
        <p className="sweet-caption" role="status">
          {label}
        </p>
        <button
          className={`sweet-creation phase-${phase} ${drag ? 'sweet-drop-ready' : ''}`}
          ref={creation}
          aria-label={`Your ${kind === 'split' ? 'banana split' : kind === 'cone' ? 'ice cream' : 'chocolate'}, ${scoops.length} scoops. Tap to add another scoop.`}
          disabled={paused || phase === 'serve'}
          onClick={() => add(ingredients[(scoops.length + friend) % 8])}
        >
          <DessertArt kind={kind} scoops={scoops} toppings={toppings} />
          <span className="sweet-count" aria-label={`${scoops.length} scoops`}>
            {scoops.length}
            <small>{kind === 'chocolate' ? 'flavours' : 'scoops'}</small>
          </span>
        </button>
        <button
          className={`sweet-customer ${phase}`}
          onClick={nextFriend}
          disabled={paused || phase === 'serve'}
          aria-label={`Say hello to ${customers[friend].name}, or choose another friend`}
        >
          <span className="sweet-speech">
            {phase === 'yuck'
              ? 'Bleugh!'
              : phase === 'yum'
                ? 'Yummy!'
                : phase === 'serve'
                  ? 'Mmm…'
                  : 'Hello!'}
            {phase === 'yuck' ? <span aria-hidden="true">?</span> : <Sparkles aria-hidden="true" />}
          </span>
          <SweetFriend index={friend} emotion={phase} />
          <span className="sweet-customer-name">
            {customers[friend].name} <ArrowRight />
          </span>
        </button>
        <div className="sweet-actions">
          <button
            aria-label="Remove the last ingredient"
            className="sweet-undo"
            disabled={paused || phase !== 'make' || (!scoops.length && !toppings.length)}
            onClick={() => {
              if (toppings.length) setToppings((old) => old.slice(0, -1));
              else setScoops((old) => old.slice(0, -1));
            }}
          >
            <Undo2 />
          </button>
          <button
            className="sweet-serve"
            onClick={
              phase === 'yum' || phase === 'yuck'
                ? () => {
                    nextFriend();
                    reset();
                  }
                : serve
            }
            disabled={paused || phase === 'serve' || (phase === 'make' && !scoops.length)}
            aria-label={
              phase === 'yum' || phase === 'yuck' ? 'Make another treat' : 'Serve to our friend'
            }
          >
            {phase === 'yum' || phase === 'yuck' ? <RotateCcw /> : <Sparkles />}
            <span>{phase === 'yum' || phase === 'yuck' ? 'Make another' : 'Share a taste'}</span>
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className="sweet-pantry">
        <div className="sweet-tray-tabs">
          <button
            aria-pressed={tray === 'scoop'}
            onClick={() => setTray('scoop')}
            disabled={paused}
          >
            Scoops <span aria-hidden="true">● ● ●</span>
          </button>
          <button
            aria-pressed={tray === 'topping'}
            onClick={() => setTray('topping')}
            disabled={paused}
          >
            Silly toppings <Sparkles />
          </button>
          <small>Tap or drag</small>
        </div>
        <div className="sweet-ingredients">
          {ingredients
            .filter((item) => item.type === tray)
            .map((item) => (
              <button
                key={item.id}
                aria-label={`Add ${item.name.toLowerCase().replace('!', '')}${item.type === 'scoop' ? ' scoop' : ''}`}
                disabled={
                  paused ||
                  phase === 'serve' ||
                  (item.type === 'scoop' && scoops.length >= 18 && phase === 'make')
                }
                onPointerDown={(event) => {
                  if (paused) return;
                  preventClick.current = false;
                  held.current = {
                    pointer: event.pointerId,
                    item,
                    x: event.clientX,
                    y: event.clientY,
                    moved: false,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  const pointer = held.current;
                  if (!pointer || pointer.pointer !== event.pointerId || paused) return;
                  if (Math.hypot(pointer.x - event.clientX, pointer.y - event.clientY) > 9)
                    pointer.moved = true;
                  if (pointer.moved) setDrag({ item, x: event.clientX, y: event.clientY });
                }}
                onPointerUp={finishDrag}
                onPointerCancel={() => {
                  held.current = null;
                  setDrag(null);
                  preventClick.current = true;
                }}
                onLostPointerCapture={() => {
                  held.current = null;
                  setDrag(null);
                }}
                onClick={() => {
                  if (preventClick.current) {
                    preventClick.current = false;
                    return;
                  }
                  add(item);
                }}
              >
                <FoodArt item={item} />
                <span>{item.name}</span>
              </button>
            ))}
        </div>
      </div>
      {drag && (
        <div className="sweet-drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <FoodArt item={drag.item} />
        </div>
      )}
    </section>
  );
}
