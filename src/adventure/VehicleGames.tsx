import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { playTone, speak } from './audio';
import { useGameKeys } from './useGameKeys';
import './vehicles.css';

const INK = '#243c56';
const paints = [
  { color: '#f16e55', name: 'Coral' },
  { color: '#64b8dd', name: 'Blue' },
  { color: '#f7cc58', name: 'Yellow' },
  { color: '#b796dc', name: 'Purple' },
];
type Body = 'buggy' | 'racer' | 'van';
type Wheel = 'round' | 'flower' | 'star';
type Vehicle = 'plane' | 'train';
const bodies: Body[] = ['buggy', 'racer', 'van'];
const wheels: Wheel[] = ['round', 'flower', 'star'];
const passengerColors = ['#f19369', '#f3c959', '#85bed3'];
const passengerNames = ['Fox', 'Chick', 'Elephant'];
const places = ['Apple farm', 'Rainbow mountain', 'Sunny beach'];

function Star({
  x = 0,
  y = 0,
  size = 1,
  color = '#ffdb60',
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        d="m0-23 7 15 17 3-12 12 2 17-14-8-14 8 2-17-12-12 17-3Z"
        fill={color}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="-5" cy="0" r="1.6" fill={INK} />
      <circle cx="5" cy="0" r="1.6" fill={INK} />
      <path d="M-4 7Q0 10 4 7" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
    </g>
  );
}

function Cloud({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} fill="#fffdf1">
      <path d="M0 32C-8 9 18 0 29 13 28-12 71-13 78 13 95-4 122 13 116 32Z" />
      <path d="M15 44h64" stroke="#fffdf1" strokeWidth="5" strokeLinecap="round" opacity=".55" />
    </g>
  );
}

function Tree({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        d="M0 0v86m0-36 17-16M0 62-17-18"
        stroke="#8c7460"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M-44 17C-57-6-39-24-23-21-24-53 19-58 28-26 61-34 68 13 44 26 19 44-28 45-44 17"
        fill="#72ae80"
      />
      <path
        d="M-23-12q-10 14 0 27m44-43q12 11 8 21"
        fill="none"
        stroke="#559369"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
  );
}

function WheelArt({
  style,
  x,
  y,
  turning = false,
}: {
  style: Wheel;
  x: number;
  y: number;
  turning?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={turning ? 'vg-wheel vg-wheel-turn' : 'vg-wheel'}>
        <circle r="27" fill={INK} />
        <circle r="19" fill="#fffbef" />
        <circle r="13" fill="#94bac4" />
        {style === 'star' ? (
          <path
            d="m0-15 4 10 11 1-9 7 3 11-9-7-9 7 3-11-9-7 11-1Z"
            fill="#f6cd5b"
            stroke={INK}
            strokeWidth="1.5"
          />
        ) : style === 'flower' ? (
          <g fill="#ee997f">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cy="-9" rx="4.5" ry="7" transform={`rotate(${angle})`} />
            ))}
            <circle r="5" fill="#f6d468" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth="3">
            <path d="M-14 0h28M0-14v28" />
            <circle r="6" fill="#f6d468" />
          </g>
        )}
      </g>
    </g>
  );
}

function CarArt({
  body = 'buggy',
  color = '#f16e55',
  wheel = 'round',
  moving = false,
}: {
  body?: Body;
  color?: string;
  wheel?: Wheel;
  moving?: boolean;
}) {
  return (
    <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="147" cy="171" rx="123" ry="12" fill={INK} opacity=".09" stroke="none" />
      {body === 'van' ? (
        <>
          <path d="M30 141V51q0-13 18-13h161q16 0 24 20l27 75q4 16-14 16H42Z" fill={color} />
          <path d="M55 54h72v55H54Zm91 0h58q11 0 16 17l13 38h-87Z" fill="#d9f3ed" />
          <path d="M141 122v27" fill="none" />
          <path d="M63 121h48" stroke="#fff9e6" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : body === 'racer' ? (
        <>
          <path d="m29 139 13-29 59-6 22-39h62l29 43 42 10 14 27H32Z" fill={color} />
          <path d="m127 77-17 29h84l-20-29Z" fill="#d9f3ed" />
          <path d="M47 102v-18m-15 0h37" fill="none" strokeWidth="7" strokeLinecap="round" />
          <path d="M176 114h44l-10 12h-34" fill="#fff9e6" stroke="none" />
        </>
      ) : (
        <>
          <path
            d="M25 136v-27q0-12 16-13h42l27-39q8-12 23-12h59q14 0 22 16l22 44 26 8v30H31Z"
            fill={color}
          />
          <path d="m121 59-25 42h46V59Zm34 0v42h65l-20-35q-5-7-13-7Z" fill="#d9f3ed" />
          <path d="M145 110v32" fill="none" />
          <path d="M157 117h13" fill="none" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      <path d="M26 143h232" strokeWidth="12" strokeLinecap="round" />
      <rect x="242" y="117" width="18" height="13" rx="5" fill="#fff1a1" />
      <rect x="28" y="111" width="11" height="12" rx="4" fill="#ee7970" />
      <g stroke="none">
        <circle cx="173" cy="82" r="16" fill="#f8cb87" />
        <ellipse cx="158" cy="69" rx="6" ry="9" fill="#f8cb87" />
        <ellipse cx="185" cy="69" rx="6" ry="9" fill="#f8cb87" />
        <circle cx="169" cy="82" r="2" fill={INK} />
        <circle cx="180" cy="82" r="2" fill={INK} />
        <path d="M170 89q5 5 9-1" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <WheelArt style={wheel} x={77} y={145} turning={moving} />
      <WheelArt style={wheel} x={218} y={145} turning={moving} />
    </g>
  );
}

function Passenger({
  index,
  x = 0,
  y = 0,
  size = 1,
}: {
  index: number;
  x?: number;
  y?: number;
  size?: number;
}) {
  const color = passengerColors[index];
  return (
    <g
      transform={`translate(${x} ${y}) scale(${size})`}
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      {index === 0 && (
        <>
          <path d="m-28-12-9-34 29 18M28-12l9-34L8-28" fill={color} />
          <path d="m-29-25-3-11 11 10m50 1 3-11-11 10" stroke="#fff5da" strokeWidth="5" />
        </>
      )}
      {index === 2 && (
        <>
          <ellipse cx="-31" cy="0" rx="20" ry="24" fill={color} />
          <ellipse cx="31" cy="0" rx="20" ry="24" fill={color} />
          <ellipse cx="-34" cy="0" rx="9" ry="14" fill="#c8deeb" stroke="none" />
          <ellipse cx="34" cy="0" rx="9" ry="14" fill="#c8deeb" stroke="none" />
        </>
      )}
      {index === 1 && <path d="M-9-27q-8-18 3-17l6 13q3-21 11-12l-5 15" fill={color} />}
      <ellipse cy="1" rx="32" ry="31" fill={color} />
      {index === 0 && (
        <path d="M-29-4Q-10-3 0 11 10-3 29-4Q26 28 0 31-26 28-29-4" fill="#fff2dd" stroke="none" />
      )}
      <circle cx="-12" cy="-3" r="3" fill={INK} stroke="none" />
      <circle cx="12" cy="-3" r="3" fill={INK} stroke="none" />
      {index === 2 ? (
        <path
          d="M-5 9v23q0 15 13 12l6-2"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d={index === 0 ? 'm-5 7 5 5 5-5Z' : 'm-7 8 7 8 7-8Z'}
            fill={index === 0 ? INK : '#f18b53'}
          />
          <path d="M-5 19q5 4 10 0" fill="none" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <circle cx="-21" cy="8" r="5" fill="#f2a295" stroke="none" opacity=".7" />
      <circle cx="21" cy="8" r="5" fill="#f2a295" stroke="none" opacity=".7" />
    </g>
  );
}

function TransportArt({
  vehicle,
  loaded = 0,
  moving = false,
  departed = 0,
}: {
  vehicle: Vehicle;
  loaded?: number;
  moving?: boolean;
  departed?: number;
}) {
  return vehicle === 'plane' ? (
    <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="176" cy="203" rx="113" ry="10" fill={INK} opacity=".07" stroke="none" />
      <path d="m63 118-40-72 33 2 69 80" fill="#f3be5b" />
      <path d="M32 132q45-18 101-28h137q25 0 46 30 6 13-9 24H74q-30-1-42-26Z" fill="#f6d571" />
      <path d="M279 110q17 8 26 25h-40v-25Z" fill="#b1dfde" />
      <path d="m165 133-78 62h47l104-63" fill="#ee916e" />
      <path d="m163 108-48-37h36l65 37" fill="#ee916e" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={117 + i * 44} cy="131" r="15" fill="#e4f3e7" />
          {i < loaded && i >= departed && (
            <Passenger index={i} x={117 + i * 44} y={133} size={0.34} />
          )}
        </g>
      ))}
      <path d="M316 137h18" strokeWidth="7" strokeLinecap="round" />
      <g className={moving ? 'vg-propeller' : ''} style={{ transformOrigin: '335px 137px' }}>
        <ellipse cx="335" cy="119" rx="6" ry="20" fill="#fff5df" />
        <ellipse cx="335" cy="155" rx="6" ry="20" fill="#fff5df" />
      </g>
      <path d="M62 163h33" fill="none" stroke="#fff3ce" strokeWidth="5" strokeLinecap="round" />
    </g>
  ) : (
    <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="181" cy="207" rx="168" ry="10" fill={INK} opacity=".07" stroke="none" />
      <path d="M23 155h279" strokeWidth="8" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 72} 0)`}>
          <rect x="10" y="112" width="66" height="69" rx="10" fill={passengerColors[i]} />
          <path d="M17 108h52" strokeWidth="10" strokeLinecap="round" />
          <rect x="24" y="121" width="38" height="35" rx="9" fill="#e8f1df" />
          {i < loaded && i >= departed && <Passenger index={i} x={43} y={140} size={0.43} />}
          <WheelArt style="round" x={26} y={183} turning={moving} />
          <WheelArt style="round" x={60} y={183} turning={moving} />
        </g>
      ))}
      <path d="M233 161V88h54v38h35q15 0 15 16v34H234Z" fill="#6caea6" />
      <path d="M225 89h70" strokeWidth="11" strokeLinecap="round" />
      <rect x="244" y="100" width="29" height="29" rx="6" fill="#dcf1df" />
      <path d="M309 126V95h17v35" fill="#f3c959" />
      <path d="M303 95h27" strokeWidth="6" strokeLinecap="round" />
      <circle cx="339" cy="147" r="10" fill="#f8dc7e" />
      <path d="m335 170 17 20h-28" fill="#e78668" />
      <WheelArt style="round" x={259} y={180} turning={moving} />
      <WheelArt style="round" x={309} y={180} turning={moving} />
    </g>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 70 60" aria-hidden="true">
      <path
        d="M12 30h42M39 13l18 17-18 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ReplayIcon() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M14 23a20 20 0 1 1-1 18M14 11v15h15"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PicnicMission() {
  return (
    <svg viewBox="0 0 160 65" aria-hidden="true">
      <rect
        x="6"
        y="26"
        width="42"
        height="30"
        rx="6"
        fill="#d59272"
        stroke={INK}
        strokeWidth="2.5"
      />
      <path d="M17 27V17q10-16 20 0v10" stroke={INK} strokeWidth="3" fill="none" />
      <path d="M7 35h40m-22-7v27" stroke="#f7d589" strokeWidth="5" />
      <path
        d="M61 35h27m-8-9 9 9-9 9"
        stroke={INK}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M115 30q-10-29-1-29 8 0 9 29m8 0q1-29 10-27 7 3-3 28"
        fill="#fff0d1"
        stroke={INK}
        strokeWidth="2.5"
      />
      <ellipse cx="127" cy="42" rx="25" ry="20" fill="#fff0d1" stroke={INK} strokeWidth="2.5" />
      <circle cx="119" cy="39" r="2.4" fill={INK} />
      <circle cx="135" cy="39" r="2.4" fill={INK} />
      <path d="m124 45 3 3 3-3" fill="#e89590" />
      <path d="M121 51q6 5 12 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BuildProgress({ step }: { step: number }) {
  return (
    <div className="vg-build-progress" aria-label={`Build step ${Math.min(step + 1, 3)} of 3`}>
      {['Shape', 'Color', 'Wheels'].map((label, index) => (
        <div
          key={label}
          className={`vg-step ${step === index ? 'vg-step-current' : ''} ${step > index ? 'vg-step-done' : ''}`}
        >
          <span>{step > index ? '✓' : index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

function RoadScene({
  body,
  color,
  wheel,
  distance,
  moving,
  done,
}: {
  body: Body;
  color: string;
  wheel: Wheel;
  distance: number;
  moving: boolean;
  done: boolean;
}) {
  return (
    <svg
      className="vg-scene"
      viewBox="0 0 960 430"
      role="img"
      aria-label={
        done
          ? 'Your custom car has delivered the picnic to a happy bunny'
          : 'Drive your custom car through the countryside to the picnic'
      }
    >
      <defs>
        <linearGradient id="vg-road-sky" x2="0" y2="1">
          <stop stopColor="#b8e3e4" />
          <stop offset="1" stopColor="#edf4d4" />
        </linearGradient>
        <pattern id="vg-picnic" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#fff0ce" />
          <path d="M0 0h11v22H0ZM0 0h22v11H0Z" fill="#e99481" opacity=".55" />
        </pattern>
      </defs>
      <rect width="960" height="430" fill="url(#vg-road-sky)" />
      <circle cx="813" cy="70" r="34" fill="#ffdc78" />
      <path
        d="M803 75q10 10 20 0"
        fill="none"
        stroke="#b9804b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="803" cy="65" r="3" fill="#b9804b" />
      <circle cx="823" cy="65" r="3" fill="#b9804b" />
      <Cloud x={70 - distance * 0.25} y={45} size={1.3} />
      <Cloud x={451 - distance * 0.4} y={82} size={0.8} />
      <path d="M0 230Q130 60 310 222 500 70 672 225 824 135 960 227V430H0Z" fill="#a8c897" />
      <path d="M0 275Q150 185 343 256 580 172 756 264 885 217 960 247V430H0Z" fill="#7fb08a" />
      <g className="vg-scenery" transform={`translate(${-distance * 5} 0)`}>
        {[80, 490, 1010, 1340].map((x, index) => (
          <Tree key={x} x={x} y={index % 2 ? 180 : 170} size={index % 2 ? 0.7 : 1} />
        ))}
        <g transform="translate(760 190)">
          <path d="M-50 65V-10l60-45 61 45v75Z" fill="#eeae7e" stroke={INK} strokeWidth="3" />
          <path
            d="m-65-8 74-56L85-8"
            stroke={INK}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="-7" y="16" width="30" height="49" rx="15" fill="#739999" />
          <rect x="-36" y="4" width="18" height="23" rx="4" fill="#fff1bd" />
          <rect x="36" y="4" width="18" height="23" rx="4" fill="#fff1bd" />
        </g>
      </g>
      <path d="M0 303Q360 285 960 303V416H0Z" fill="#dbb99a" />
      <path d="M0 298Q360 280 960 298M0 418h960" fill="none" stroke="#f8e4be" strokeWidth="10" />
      <path
        d="M-100 361h1160"
        stroke="#fff1d7"
        strokeWidth="6"
        strokeDasharray="38 36"
        strokeDashoffset={distance * 13}
      />
      {[20, 40, 60, 80, 95].map(
        (at, index) =>
          distance < at && (
            <g key={at} transform={`translate(${290 + (at - distance) * 11} 297)`}>
              <Star size={0.65} />
              <text y="-26" textAnchor="middle" fill={INK} fontSize="17" fontWeight="900">
                {index + 1}
              </text>
            </g>
          ),
      )}
      <g transform={`translate(${Math.max(460, 1330 - distance * 8.3)} 233)`}>
        <path d="M55 80h210l-25 47H34Z" fill="url(#vg-picnic)" stroke="#fff2d9" strokeWidth="4" />
        <path
          d="M191 42q-6-61 9-60 13 0 8 54m19 6q1-59 15-52 13 7-2 53"
          fill="#fff4df"
          stroke={INK}
          strokeWidth="3"
        />
        <ellipse cx="218" cy="61" rx="35" ry="32" fill="#fff4df" stroke={INK} strokeWidth="3" />
        <circle cx="207" cy="58" r="3" fill={INK} />
        <circle cx="229" cy="58" r="3" fill={INK} />
        <path d="m214 67 5 4 5-4" fill="#e99796" />
        <path
          d="M210 76q9 8 18 0"
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M36 36V-52m0 0h84v39H36" fill="#f6d273" stroke={INK} strokeWidth="3" />
        <path
          d="m49-38 12 11 21-17"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {done && (
          <g transform="translate(135 79)">
            <rect
              x="-28"
              y="-27"
              width="56"
              height="43"
              rx="7"
              fill="#e39070"
              stroke={INK}
              strokeWidth="3"
            />
            <path d="M-13-28v-12q13-19 26 0v12" stroke={INK} strokeWidth="4" fill="none" />
            <path d="M-26-13h52" stroke="#f7d585" strokeWidth="8" />
          </g>
        )}
      </g>
      <g className="vg-road-car" transform="translate(158 190) scale(.88)">
        <CarArt body={body} color={color} wheel={wheel} moving={moving} />
        {!done && (
          <g transform="translate(49 82)">
            <rect
              x="-25"
              y="-31"
              width="50"
              height="33"
              rx="6"
              fill="#ce9274"
              stroke={INK}
              strokeWidth="3"
            />
            <path d="M-23-21h47m-25-8V0" stroke="#f8d88c" strokeWidth="6" />
          </g>
        )}
      </g>
      <g fill="#fff0bd">
        {[34, 131, 620, 778, 928].map((x) => (
          <g key={x} transform={`translate(${x} 398)`}>
            <circle cx="-6" r="4" />
            <circle cx="6" r="4" />
            <circle cy="-6" r="4" />
            <circle cy="6" r="4" />
            <circle r="3" fill="#e2a169" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function GarageGame({ settings, paused, onCelebrate }: GameProps) {
  const [step, setStep] = useState(0);
  const [body, setBody] = useState<Body>('buggy');
  const [paint, setPaint] = useState(0);
  const [wheel, setWheel] = useState<Wheel>('round');
  const [phase, setPhase] = useState<'build' | 'ready' | 'drive' | 'done'>('build');
  const [distance, setDistance] = useState(0);
  const [holding, setHolding] = useState(false);
  const keyChoice = useRef(0);
  const stars = [20, 40, 60, 80, 95].filter((at) => distance >= at).length;
  const lastStars = useRef(0);

  function choose(index: number) {
    if (paused) return;
    playTone(step * 2 + index, settings);
    if (step === 0) {
      setBody(bodies[index % 3]);
      setStep(1);
      speak('Choose a color', settings);
    } else if (step === 1) {
      setPaint(index % 4);
      setStep(2);
      speak(paints[index % 4].name, settings);
    } else {
      setWheel(wheels[index % 3]);
      setPhase('ready');
      speak('Your car! Let’s take a picnic to bunny.', settings);
    }
  }
  function drive() {
    if (paused || phase !== 'drive') return;
    setDistance((value) => Math.min(100, value + 7));
    playTone(1 + stars, settings, 0.15);
  }
  function start() {
    if (paused) return;
    setDistance(0);
    lastStars.current = 0;
    setPhase('drive');
    playTone(4, settings);
    speak('Take the picnic to bunny! Tap or hold to drive.', settings);
  }
  function rebuild() {
    if (paused) return;
    setHolding(false);
    setDistance(0);
    setStep(0);
    setPhase('build');
  }

  useGameKeys(paused, (key) => {
    if (phase === 'build') choose(/^[1-4]$/.test(key) ? Number(key) - 1 : keyChoice.current++);
    else if (phase === 'ready' || phase === 'done') start();
    else drive();
  });
  useEffect(() => {
    if (!holding || paused || phase !== 'drive') return;
    const interval = window.setInterval(
      () => setDistance((value) => Math.min(100, value + 0.85)),
      120,
    );
    const stop = () => setHolding(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [holding, paused, phase]);
  useEffect(() => {
    if (paused) setHolding(false);
  }, [paused]);
  useEffect(() => {
    if (!paused && stars > lastStars.current) {
      lastStars.current = stars;
      playTone(stars + 4, settings);
      speak(String(stars), settings);
    }
  }, [stars, settings, paused]);
  useEffect(() => {
    if (!paused && distance >= 100 && phase === 'drive') {
      setHolding(false);
      setPhase('done');
      onCelebrate('Picnic delivered!');
      speak('You brought the picnic! Thank you!', settings);
    }
  }, [distance, phase, onCelebrate, settings, paused]);

  return (
    <section
      className={`vg-game ${settings.calm ? 'vg-calm' : ''} ${paused ? 'vg-paused' : ''}`}
      aria-label="Build a car and deliver a picnic"
      data-testid="garage-game"
    >
      <div className="vg-game-heading">
        <div>
          <span className="vg-eyebrow">YOUR CAR · YOUR ADVENTURE</span>
          <h2>
            {phase === 'build'
              ? ['Pick your car', 'Make it colorful', 'Choose your wheels'][step]
              : phase === 'ready'
                ? 'Made by you. Ready to roll?'
                : phase === 'done'
                  ? 'A picnic for bunny!'
                  : 'Take the picnic to bunny'}
          </h2>
        </div>
        {phase === 'build' ? (
          <BuildProgress step={step} />
        ) : (
          <div className="vg-star-count" aria-label={`${stars} of 5 stars collected`}>
            <svg viewBox="0 0 50 50" aria-hidden="true">
              <Star x={25} y={25} size={0.8} />
            </svg>
            <b>
              {stars}
              <span> / 5</span>
            </b>
          </div>
        )}
      </div>
      {phase === 'build' || phase === 'ready' ? (
        <>
          <div className="vg-garage-stage">
            <svg
              viewBox="0 0 960 355"
              role="img"
              aria-label={`${paints[paint].name} ${body} with ${wheel} wheels`}
            >
              <defs>
                <pattern id="vg-wall-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="2" fill="#dfc798" />
                </pattern>
              </defs>
              <rect width="960" height="355" fill="#fae6b8" />
              <rect
                x="48"
                y="23"
                width="210"
                height="174"
                rx="19"
                fill="url(#vg-wall-dots)"
                stroke="#e7ce9f"
                strokeWidth="5"
              />
              <path
                d="M90 76v55m-13-53q12 11 26 0M155 65v68m-15-68h30"
                stroke="#91aaa6"
                strokeWidth="15"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M205 71v61m-10-66h20v27h-20Z"
                stroke="#d3916d"
                fill="#d3916d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <rect
                x="735"
                y="37"
                width="172"
                height="129"
                rx="18"
                fill="#bce1dc"
                stroke="#fff5d9"
                strokeWidth="10"
              />
              <path d="M822 42v121m-81-56h160" stroke="#fff5d9" strokeWidth="9" />
              <circle cx="865" cy="69" r="15" fill="#f6d167" />
              <Cloud x={745} y={75} size={0.6} />
              <path d="M0 268h960v87H0Z" fill="#e8cda6" />
              <path d="M0 268h960" stroke="#d8bb94" strokeWidth="5" />
              <ellipse cx="480" cy="305" rx="252" ry="26" fill="#cdae90" opacity=".35" />
              <g transform="translate(278 65) scale(1.4)">
                <CarArt body={body} color={paints[paint].color} wheel={wheel} />
              </g>
              <g transform="translate(92 237)">
                <rect width="85" height="53" rx="8" fill="#dc9476" stroke={INK} strokeWidth="3" />
                <path d="M-6 15h97M31 0v53" stroke="#f4d487" strokeWidth="7" />
                <path d="M27-1v-15h30v15" fill="none" stroke={INK} strokeWidth="5" />
              </g>
              <g transform="translate(813 238)">
                <path d="m-25 53 20-63h20l20 63Z" fill="#ec9570" stroke={INK} strokeWidth="3" />
                <path d="M-18 30h42" stroke="#fff2d3" strokeWidth="13" />
                <path d="M-35 55h78" stroke={INK} strokeWidth="6" strokeLinecap="round" />
              </g>
            </svg>
          </div>
          {phase === 'build' ? (
            <div
              className="vg-choices"
              aria-label={['Choose car shape', 'Choose car color', 'Choose wheel style'][step]}
            >
              {step === 0 &&
                bodies.map((option, index) => (
                  <button
                    key={option}
                    className="vg-picture-choice"
                    onClick={() => choose(index)}
                    disabled={paused}
                    aria-label={`Choose ${option}`}
                  >
                    <svg viewBox="0 0 300 195" aria-hidden="true">
                      <CarArt body={option} color={paints[index].color} />
                    </svg>
                    <span>{['Little buggy', 'Speedy racer', 'Adventure van'][index]}</span>
                  </button>
                ))}
              {step === 1 &&
                paints.map((option, index) => (
                  <button
                    key={option.name}
                    className="vg-picture-choice vg-paint-choice"
                    onClick={() => choose(index)}
                    disabled={paused}
                    aria-label={`Paint car ${option.name.toLowerCase()}`}
                  >
                    <svg viewBox="0 0 110 105" aria-hidden="true">
                      <path
                        d="M53 7C44 26 20 43 20 65a34 34 0 0 0 68 0C88 43 66 28 53 7Z"
                        fill={option.color}
                        stroke={INK}
                        strokeWidth="3"
                      />
                      <path
                        d="M34 64q-3 12 8 18"
                        stroke="#fff9ec"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{option.name}</span>
                  </button>
                ))}
              {step === 2 &&
                wheels.map((option, index) => (
                  <button
                    key={option}
                    className="vg-picture-choice vg-wheel-choice"
                    onClick={() => choose(index)}
                    disabled={paused}
                    aria-label={`Choose ${option} wheels`}
                  >
                    <svg viewBox="0 0 100 95" aria-hidden="true">
                      <g transform="translate(50 45) scale(1.45)">
                        <WheelArt style={option} x={0} y={0} />
                      </g>
                    </svg>
                    <span>{['Round & round', 'Flower power', 'Super stars'][index]}</span>
                  </button>
                ))}
            </div>
          ) : (
            <div className="vg-bottom-bar">
              <button
                className="vg-small-action"
                onClick={rebuild}
                disabled={paused}
                aria-label="Build another car"
              >
                <ReplayIcon />
                <span>Build again</span>
              </button>
              <div className="vg-mission">
                <PicnicMission />
                <small>Bring bunny a picnic</small>
              </div>
              <button
                className="vg-go-button"
                onClick={start}
                disabled={paused}
                aria-label="Drive my car"
              >
                <ArrowIcon />
                <span>Let’s go!</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className="vg-road-stage"
            onPointerDown={(event) => {
              if (event.target instanceof Element && event.target.closest('button')) return;
              drive();
            }}
          >
            <RoadScene
              body={body}
              color={paints[paint].color}
              wheel={wheel}
              distance={distance}
              moving={holding && !paused}
              done={phase === 'done'}
            />
          </div>
          <div className="vg-route" aria-label={`Journey ${Math.round(distance)} percent complete`}>
            <span aria-hidden="true">⌂</span>
            <div>
              <i style={{ width: `${distance}%` }} />
            </div>
            <span aria-hidden="true">⚑</span>
          </div>
          <div className="vg-bottom-bar">
            <button
              className="vg-small-action"
              onClick={rebuild}
              disabled={paused}
              aria-label="Build a new car"
            >
              <ReplayIcon />
              <span>New car</span>
            </button>
            {phase === 'done' ? (
              <>
                <p className="vg-play-hint">
                  You made it.
                  <br />
                  <strong>Let’s go again!</strong>
                </p>
                <button
                  className="vg-go-button"
                  onClick={start}
                  disabled={paused}
                  aria-label="Drive again"
                >
                  <ReplayIcon />
                  <span>Again!</span>
                </button>
              </>
            ) : (
              <>
                <p className="vg-play-hint">
                  <strong>Tap, hold, or press a key</strong>
                  <br />
                  Every little push takes you closer.
                </p>
                <button
                  className="vg-go-button vg-pedal"
                  onPointerDown={(event) => {
                    if (paused) return;
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drive();
                    setHolding(true);
                  }}
                  onPointerUp={() => setHolding(false)}
                  onPointerCancel={() => setHolding(false)}
                  onClick={(event) => {
                    if (event.detail === 0) drive();
                  }}
                  disabled={paused}
                  aria-label="Accelerate. Tap or hold to drive"
                >
                  <ArrowIcon />
                  <span>GO!</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Landmark({ index, large = false }: { index: number; large?: boolean }) {
  return (
    <svg viewBox="0 0 160 140" className={large ? 'vg-landmark-large' : ''} aria-hidden="true">
      {index === 0 ? (
        <>
          <ellipse cx="80" cy="123" rx="70" ry="12" fill="#b7ca88" />
          <path d="M20 113V62l44-33 43 33v51Z" fill="#dc8e71" stroke={INK} strokeWidth="3" />
          <path
            d="m13 64 51-43 51 43"
            stroke={INK}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="51" y="76" width="26" height="37" rx="3" fill="#f8d69b" />
          <path d="m51 76 26 37m0-37-26 37" stroke="#dc8e71" strokeWidth="3" />
          <Tree x={128} y={51} size={0.52} />
          <g fill="#e87c64">
            <circle cx="112" cy="51" r="6" />
            <circle cx="138" cy="43" r="6" />
            <circle cx="133" cy="64" r="6" />
          </g>
        </>
      ) : index === 1 ? (
        <>
          <path
            d="M8 120 65 20l37 54 21-35 31 81Z"
            fill="#91b5aa"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="m45 55 20-35 24 36-14-8-9 11-9-13Z" fill="#fff5dc" />
          <path d="M16 82A65 65 0 0 1 143 82" fill="none" stroke="#ed987a" strokeWidth="10" />
          <path d="M24 82a57 57 0 0 1 111 0" fill="none" stroke="#f4ce74" strokeWidth="7" />
          <path d="M31 82a50 50 0 0 1 97 0" fill="none" stroke="#a7c891" strokeWidth="7" />
          <Cloud x={-5} y={74} size={0.45} />
          <Cloud x={110} y={74} size={0.45} />
        </>
      ) : (
        <>
          <circle cx="124" cy="31" r="21" fill="#f5cf67" />
          <path d="M4 108q52-39 150 0v27H4Z" fill="#7fc5cc" />
          <path d="M17 110q51-37 121 0Z" fill="#f5d594" />
          <path
            d="M74 111q16-52 6-71"
            fill="none"
            stroke="#9c8763"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M82 43Q49 7 27 48q25-7 55-5m0 0q20-40 53-12-28 0-53 12m0 0q-19 0-29 29 29-7 29-29m0 0q25-9 39 23-30-2-39-23"
            fill="#6fa989"
            stroke="#528d75"
            strokeWidth="2"
          />
          <path d="M24 124h29m47-1h32" stroke="#e4f6e5" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function JourneyScene({
  vehicle,
  progress,
  delivered,
  arriving,
}: {
  vehicle: Vehicle;
  progress: number;
  delivered: number;
  arriving: boolean;
}) {
  return (
    <svg
      className={`vg-scene ${arriving ? 'vg-at-stop' : ''}`}
      viewBox="0 0 960 430"
      role="img"
      aria-label={`${vehicle === 'plane' ? 'Flying' : 'Riding'} to ${places[Math.min(delivered, 2)]}`}
    >
      <defs>
        <linearGradient id="vg-trip-sky" x2="0" y2="1">
          <stop stopColor={vehicle === 'plane' ? '#a9dce3' : '#c4e4da'} />
          <stop offset="1" stopColor="#faf0c9" />
        </linearGradient>
      </defs>
      <rect width="960" height="430" fill="url(#vg-trip-sky)" />
      <circle cx="820" cy="64" r="31" fill="#ffdb76" />
      <Cloud x={70 - (progress % 33) * 2} y={52} size={1.2} />
      <Cloud x={595 - (progress % 33)} y={113} size={0.8} />
      <Cloud x={370} y={23} size={0.6} />
      <path d="M0 259 132 115 265 283 407 148 562 305 736 185 960 279V430H0Z" fill="#acc6ae" />
      <path d="m88 164 44-49 47 60-27-13-20 11-19-15Z" fill="#edf2de" />
      <path d="M0 304q156-93 309 0 235-120 403-14 154-43 248 18v122H0Z" fill="#85b69b" />
      <g className="vg-scenery" transform={`translate(${-((progress % 33) * 10)} 0)`}>
        {[90, 620, 1160].map((x) => (
          <Tree key={x} x={x} y={285} size={0.63} />
        ))}
      </g>
      <path d="M0 371q350-44 960 0v59H0Z" fill="#c2d39a" />
      {vehicle === 'train' ? (
        <>
          <path d="M0 351h960v41H0Z" fill="#d5b899" />
          <path d="M0 358h960M0 385h960" stroke={INK} strokeWidth="6" />
          <path
            d="M0 370h980"
            stroke="#8d7962"
            strokeWidth="50"
            strokeDasharray="8 29"
            strokeDashoffset={progress * 8}
          />
          <path d="M0 356h960M0 385h960" stroke="#e7e4c8" strokeWidth="3" />
          <g className="vg-journey-train" transform="translate(172 155) scale(1.08)">
            <TransportArt vehicle={vehicle} loaded={3} departed={delivered} moving={!arriving} />
          </g>
        </>
      ) : (
        <g
          className="vg-journey-plane"
          transform={`translate(170 ${100 - Math.sin(progress / 12) * 18}) scale(1.15)`}
        >
          <TransportArt vehicle={vehicle} loaded={3} departed={delivered} moving={!arriving} />
        </g>
      )}
      <g
        className="vg-journey-destination"
        transform={`translate(${arriving ? 678 : 980 - (progress % (100 / 3)) * 7.8} 231) scale(1.4)`}
      >
        <LandmarkDrawing index={Math.min(delivered, 2)} />
      </g>
      {arriving && (
        <g transform="translate(698 125)">
          <rect
            x="-25"
            y="-25"
            width="105"
            height="49"
            rx="20"
            fill="#fff8e4"
            stroke={INK}
            strokeWidth="3"
          />
          <path d="m7 24 8 16 8-16" fill="#fff8e4" />
          <text x="27" y="11" textAnchor="middle" fill={INK} fontSize="30" fontWeight="900">
            {['A', 'B', 'C'][Math.min(delivered, 2)]}
          </text>
        </g>
      )}
    </svg>
  );
}

function LandmarkDrawing({ index }: { index: number }) {
  return (
    <g>
      {index === 0 ? (
        <>
          <path d="M12 80V27L57-8l47 35v53Z" fill="#d99073" stroke={INK} strokeWidth="3" />
          <path d="m4 28 53-44 55 44" stroke={INK} strokeWidth="6" fill="none" />
          <rect x="43" y="43" width="30" height="37" fill="#f2d39f" />
          <path d="m43 43 30 37m0-37L43 80" stroke="#d99073" strokeWidth="3" />
          <Tree x={125} y={16} size={0.65} />
          <g fill="#e67f63">
            <circle cx="105" cy="13" r="6" />
            <circle cx="140" cy="25" r="6" />
          </g>
        </>
      ) : index === 1 ? (
        <>
          <path d="M-15 89 42-30l41 65 26-39 42 93Z" fill="#759c9d" stroke={INK} strokeWidth="3" />
          <path d="m26 4 16-34L62 2 48-6 42 5l-7-12Z" fill="#f8f1d9" />
          <path d="M-15 55A80 80 0 0 1 145 55" fill="none" stroke="#ef9e7e" strokeWidth="10" />
          <path d="M-7 55A72 72 0 0 1 137 55" fill="none" stroke="#f7d379" strokeWidth="7" />
        </>
      ) : (
        <>
          <ellipse cx="68" cy="80" rx="103" ry="20" fill="#7cc7cb" />
          <ellipse cx="68" cy="72" rx="66" ry="15" fill="#f5d292" />
          <path d="M65 72q14-42 3-75" stroke="#9a8160" strokeWidth="8" fill="none" />
          <path
            d="M70 4Q34-29 11 17q30-10 59-13 33-42 66-3-33-12-66 3Q49 6 38 35q24-7 32-31 28 1 44 28-33-1-44-28"
            fill="#639e81"
            stroke="#447e66"
            strokeWidth="2"
          />
        </>
      )}
    </g>
  );
}

export function TransportGame({ settings, paused, onCelebrate }: GameProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [phase, setPhase] = useState<'choose' | 'load' | 'travel' | 'arrive' | 'done'>('choose');
  const [loaded, setLoaded] = useState(0);
  const [progress, setProgress] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState('');
  const goal = (delivered + 1) * (100 / 3);

  function choose(next: Vehicle) {
    if (paused) return;
    setVehicle(next);
    setLoaded(0);
    setDelivered(0);
    setProgress(0);
    setHint('');
    setPhase('load');
    playTone(next === 'plane' ? 6 : 2, settings);
    speak('Three friends need a ride. Find fox.', settings);
  }
  function load(index: number) {
    if (paused || phase !== 'load') return;
    if (index !== loaded) {
      setHint(`Find ${passengerNames[loaded].toLowerCase()}`);
      speak(passengerNames[index], settings);
      playTone(index, settings);
      return;
    }
    setLoaded(loaded + 1);
    setHint('');
    playTone(loaded * 2 + 3, settings);
    if (loaded === 2) {
      setPhase('travel');
      speak('All aboard! Take our friends on an adventure.', settings);
    } else speak(`${loaded + 1}. Now find ${passengerNames[loaded + 1]}.`, settings);
  }
  function travel() {
    if (paused || phase !== 'travel') return;
    setProgress((value) => Math.min(goal, value + 7));
    playTone(delivered + 2, settings, 0.16);
  }
  function deliver() {
    if (paused || phase !== 'arrive') return;
    const next = delivered + 1;
    setDelivered(next);
    playTone(7 + delivered, settings);
    setHolding(false);
    if (next === 3) {
      setPhase('done');
      onCelebrate('Three happy friends!');
      speak('Three happy friends! What an adventure!', settings);
    } else {
      setPhase('travel');
      speak(`Goodbye ${passengerNames[delivered]}. Next stop, ${places[next]}.`, settings);
    }
  }
  function act() {
    if (phase === 'choose') choose('train');
    else if (phase === 'load') load(loaded);
    else if (phase === 'travel') travel();
    else if (phase === 'arrive') deliver();
    else if (vehicle) choose(vehicle);
  }
  useGameKeys(paused, (key) => {
    if (phase === 'choose') choose(key.toLowerCase() === 'p' || key === '2' ? 'plane' : 'train');
    else if (phase === 'load' && /^[1-3]$/.test(key)) load(Number(key) - 1);
    else act();
  });
  useEffect(() => {
    if (!paused && phase === 'travel' && progress >= goal - 0.01) {
      setPhase('arrive');
      setHolding(false);
      speak(`${places[delivered]}. ${passengerNames[delivered]} is here!`, settings);
    }
  }, [progress, goal, phase, delivered, settings, paused]);
  useEffect(() => {
    if (!holding || paused || phase !== 'travel') return;
    const interval = window.setInterval(
      () => setProgress((value) => Math.min(goal, value + 0.8)),
      120,
    );
    const stop = () => setHolding(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [holding, paused, phase, goal]);
  useEffect(() => {
    if (paused) setHolding(false);
  }, [paused]);

  return (
    <section
      className={`vg-game vg-transport ${settings.calm ? 'vg-calm' : ''} ${paused ? 'vg-paused' : ''}`}
      aria-label="Trains and planes adventure"
      data-testid="transport-game"
    >
      <div className="vg-game-heading">
        <div>
          <span className="vg-eyebrow">LITTLE FRIENDS · BIG ADVENTURES</span>
          <h2>
            {phase === 'choose'
              ? 'How shall we go?'
              : phase === 'load'
                ? 'Three friends need a ride'
                : phase === 'done'
                  ? 'Three very happy friends!'
                  : phase === 'arrive'
                    ? `Hello, ${places[delivered].toLowerCase()}!`
                    : `Next stop: ${places[delivered]}`}
          </h2>
        </div>
        {phase !== 'choose' && (
          <div className="vg-passenger-count">
            <b>{phase === 'load' ? loaded : delivered}</b>
            <span>
              / 3<br />
              {phase === 'load' ? 'aboard' : 'arrived'}
            </span>
          </div>
        )}
      </div>
      {phase === 'choose' ? (
        <div className="vg-transport-choices">
          <button
            onClick={() => choose('train')}
            disabled={paused}
            className="vg-vehicle-card vg-train-card"
            aria-label="Choose the train"
          >
            <svg viewBox="0 0 390 295" aria-hidden="true">
              <circle cx="194" cy="137" r="120" fill="#e6ecc8" />
              <Cloud x={41} y={33} size={0.7} />
              <path d="M0 236h390m-390 20h390" stroke="#c9b093" strokeWidth="7" />
              <g transform="translate(16 14)">
                <TransportArt vehicle="train" loaded={3} />
              </g>
            </svg>
            <span>Choo-choo train</span>
            <small>Toot! A trip through the countryside.</small>
            <i>
              <ArrowIcon />
            </i>
          </button>
          <button
            onClick={() => choose('plane')}
            disabled={paused}
            className="vg-vehicle-card vg-plane-card"
            aria-label="Choose the plane"
          >
            <svg viewBox="0 0 390 295" aria-hidden="true">
              <circle cx="194" cy="137" r="120" fill="#c6e6e6" />
              <Cloud x={213} y={26} size={1.1} />
              <Cloud x={14} y={171} size={0.8} />
              <g transform="translate(16 11)">
                <TransportArt vehicle="plane" loaded={3} />
              </g>
            </svg>
            <span>Sunny little plane</span>
            <small>Whoosh! An adventure in the clouds.</small>
            <i>
              <ArrowIcon />
            </i>
          </button>
        </div>
      ) : phase === 'load' ? (
        <>
          <div className="vg-boarding-stage">
            <div className="vg-boarding-vehicle">
              <svg viewBox="0 0 370 245" aria-label={`${loaded} passengers aboard`} role="img">
                <TransportArt vehicle={vehicle!} loaded={loaded} />
              </svg>
            </div>
            <div className="vg-seats" aria-label="Three passenger seats">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`vg-seat ${index === loaded ? 'vg-seat-next' : ''} ${index < loaded ? 'vg-seat-filled' : ''}`}
                  style={{ '--vg-seat-color': passengerColors[index] } as React.CSSProperties}
                >
                  <b>{index + 1}</b>
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <g opacity={index < loaded ? 1 : 0.23}>
                      <Passenger index={index} x={50} y={49} size={0.82} />
                    </g>
                  </svg>
                  {index < loaded && <i>✓</i>}
                </div>
              ))}
            </div>
          </div>
          <p className="vg-loading-caption" aria-live="polite">
            {hint || `Find ${passengerNames[loaded].toLowerCase()} for seat ${loaded + 1}`}
          </p>
          <div className="vg-choices vg-passengers">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                className={`vg-picture-choice ${index < loaded ? 'vg-already-boarded' : ''}`}
                onClick={() => load(index)}
                disabled={paused || index < loaded}
                aria-label={`Board ${passengerNames[index]}`}
              >
                <svg viewBox="0 0 120 110" aria-hidden="true">
                  <circle cx="60" cy="57" r="48" fill={`${passengerColors[index]}33`} />
                  <Passenger index={index} x={60} y={57} size={1.05} />
                </svg>
                <span>{index < loaded ? 'Aboard!' : passengerNames[index]}</span>
              </button>
            ))}
          </div>
        </>
      ) : phase === 'done' ? (
        <>
          <div className="vg-trip-complete">
            <div className="vg-arrival-friends">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <Landmark index={index} large />
                  <svg viewBox="0 0 110 110" aria-hidden="true">
                    <Passenger index={index} x={55} y={53} size={1.1} />
                  </svg>
                  <b>{['A', 'B', 'C'][index]}</b>
                </div>
              ))}
            </div>
            <p>
              Farm, mountain, beach.
              <br />
              <strong>You took everyone where they wanted to go.</strong>
            </p>
          </div>
          <div className="vg-bottom-bar">
            <button
              className="vg-small-action"
              onClick={() => {
                if (!paused) setPhase('choose');
              }}
              disabled={paused}
              aria-label="Choose another vehicle"
            >
              <ReplayIcon />
              <span>New ride</span>
            </button>
            <button
              className="vg-go-button"
              onClick={() => choose(vehicle!)}
              disabled={paused}
              aria-label="Take another trip"
            >
              <ArrowIcon />
              <span>Again!</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="vg-journey-stage"
            onPointerDown={(event) => {
              if (event.target instanceof Element && event.target.closest('button')) return;
              if (phase === 'travel') travel();
            }}
          >
            <JourneyScene
              vehicle={vehicle!}
              progress={progress}
              delivered={delivered}
              arriving={phase === 'arrive'}
            />
          </div>
          <div className="vg-trip-map" aria-label="Trip destinations">
            {places.map((place, index) => (
              <div
                key={place}
                className={
                  index === delivered ? 'vg-map-current' : index < delivered ? 'vg-map-done' : ''
                }
              >
                <span>{index < delivered ? '✓' : ['A', 'B', 'C'][index]}</span>
                <Landmark index={index} />
                <small>{place}</small>
              </div>
            ))}
          </div>
          <div className="vg-bottom-bar">
            <button
              className="vg-small-action"
              onClick={() => {
                if (!paused) {
                  setHolding(false);
                  setPhase('choose');
                }
              }}
              disabled={paused}
              aria-label="Choose another vehicle"
            >
              <ReplayIcon />
              <span>New ride</span>
            </button>
            {phase === 'arrive' ? (
              <>
                <p className="vg-play-hint">
                  <strong>A little stop for {passengerNames[delivered].toLowerCase()}</strong>
                  <br />
                  Tap your friend to say goodbye.
                </p>
                <button
                  className="vg-deliver-button"
                  onClick={deliver}
                  disabled={paused}
                  aria-label={`Let ${passengerNames[delivered]} off at ${places[delivered]}`}
                >
                  <svg viewBox="0 0 115 100" aria-hidden="true">
                    <Passenger index={delivered} x={48} y={50} size={0.8} />
                    <path
                      d="M87 44h20m-8-8 8 8-8 8"
                      stroke={INK}
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Here we are!</span>
                </button>
              </>
            ) : (
              <>
                <p className="vg-play-hint">
                  <strong>Tap, hold, or press a key</strong>
                  <br />
                  {vehicle === 'plane'
                    ? 'Off to discover somewhere new.'
                    : 'A little farther down the track.'}
                </p>
                <button
                  className="vg-go-button vg-pedal"
                  onPointerDown={(event) => {
                    if (paused) return;
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    travel();
                    setHolding(true);
                  }}
                  onPointerUp={() => setHolding(false)}
                  onPointerCancel={() => setHolding(false)}
                  onClick={(event) => {
                    if (event.detail === 0) travel();
                  }}
                  disabled={paused}
                  aria-label={
                    vehicle === 'plane' ? 'Fly. Tap or hold to fly' : 'Go. Tap or hold to ride'
                  }
                >
                  <ArrowIcon />
                  <span>{vehicle === 'plane' ? 'FLY!' : 'GO!'}</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
