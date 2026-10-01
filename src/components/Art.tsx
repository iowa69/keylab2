import { useId } from 'react';
import type { AnimalName, WorldId } from '../lib/worlds';

export function Face({
  x = 0,
  y = 0,
  scale = 1,
  happy = true,
}: {
  x?: number;
  y?: number;
  scale?: number;
  happy?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#394744">
      <ellipse cx="-10" cy="0" rx="2.6" ry="3.5" />
      <ellipse cx="10" cy="0" rx="2.6" ry="3.5" />
      <path
        d={happy ? 'M-5 10q5 6 10 0' : 'M-4 10h8'}
        fill="none"
        stroke="#394744"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="-18" cy="9" rx="5" ry="3" fill="#e99691" opacity=".6" />
      <ellipse cx="18" cy="9" rx="5" ry="3" fill="#e99691" opacity=".6" />
    </g>
  );
}

export function Star({
  x = 0,
  y = 0,
  size = 30,
  color = '#edc873',
  face = false,
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  face?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 50})`}>
      <path
        d="M0-46 14-16 46-12 23 11 28 44 0 28-28 44-23 11-46-12-14-16Z"
        fill={color}
        stroke={color}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {face && <Face y={2} scale={0.8} />}
    </g>
  );
}

export function Flower({
  x = 0,
  y = 0,
  size = 1,
  color = '#eca49f',
  letter = '',
  tilt = 0,
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  letter?: string;
  tilt?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        d={`M0 0Q${tilt * 2} 60 ${tilt} 135`}
        fill="none"
        stroke="#7c996f"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M0 94Q-55 91-49 55Q-13 52 0 94" fill="#9bb384" />
      <path d="M0 70Q45 68 47 36Q10 37 0 70" fill="#87a377" />
      <g transform={`rotate(${tilt})`}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-29"
            rx="22"
            ry="26"
            transform={`rotate(${a})`}
            fill={color}
          />
        ))}
        <circle r="29" fill="#f9e9af" />
        {letter ? (
          <text
            textAnchor="middle"
            y="13"
            fill="#695e43"
            fontFamily="Nunito, sans-serif"
            fontWeight="900"
            fontSize="38"
          >
            {letter}
          </text>
        ) : (
          <Face y={-4} scale={0.8} />
        )}
      </g>
    </g>
  );
}

export function Animal({
  kind = 'fox',
  x = 0,
  y = 0,
  size = 1,
}: {
  kind?: AnimalName;
  x?: number;
  y?: number;
  size?: number;
}) {
  const colors = {
    fox: '#d78f61',
    bunny: '#e9d7c8',
    bear: '#bb987d',
    cat: '#d9b375',
    frog: '#9bb886',
    owl: '#ac9ac1',
  };
  const color = colors[kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cx="0" cy="74" rx="55" ry="9" fill="#465f45" opacity=".1" />
      {kind === 'fox' && (
        <>
          <path d="M32 64Q100 68 78 12Q49 15 48 42Z" fill={color} />
          <path d="M78 12Q82 29 77 41L60 25Z" fill="#fcf3df" />
        </>
      )}
      {kind === 'cat' && (
        <path
          d="M27 65Q74 80 70 35"
          stroke={color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="0" cy="40" rx="37" ry="37" fill={color} />
      <ellipse cx="0" cy="44" rx="22" ry="24" fill="#fff4df" />
      {kind === 'bunny' ? (
        <>
          <ellipse cx="-22" cy="-49" rx="13" ry="36" fill={color} transform="rotate(-12 -22 -49)" />
          <ellipse cx="22" cy="-49" rx="13" ry="36" fill={color} transform="rotate(12 22 -49)" />
          <ellipse cx="-22" cy="-50" rx="6" ry="25" fill="#dcaeaa" />
          <ellipse cx="22" cy="-50" rx="6" ry="25" fill="#dcaeaa" />
        </>
      ) : kind === 'bear' ? (
        <>
          <circle cx="-33" cy="-29" r="18" fill={color} />
          <circle cx="33" cy="-29" r="18" fill={color} />
          <circle cx="-33" cy="-29" r="10" fill="#d4bba2" />
          <circle cx="33" cy="-29" r="10" fill="#d4bba2" />
        </>
      ) : kind === 'frog' ? (
        <>
          <circle cx="-25" cy="-30" r="19" fill={color} />
          <circle cx="25" cy="-30" r="19" fill={color} />
        </>
      ) : (
        <>
          <path
            d="M-40 0-37-48-8-25M40 0 37-48 8-25"
            fill={color}
            stroke={color}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="M-33-28-31-39-18-24M33-28 31-39 18-24" fill="#e7b3a4" />
        </>
      )}
      <ellipse cx="0" cy="0" rx="45" ry="38" fill={color} />
      {kind === 'fox' && (
        <path d="M-43-6Q-20-5 0 17Q20-5 43-6Q38 37 0 38Q-38 37-43-6" fill="#fff4df" />
      )}
      {kind === 'owl' && (
        <>
          <ellipse cx="-18" cy="-3" rx="22" ry="24" fill="#f5e8d9" />
          <ellipse cx="18" cy="-3" rx="22" ry="24" fill="#f5e8d9" />
        </>
      )}
      {kind === 'bear' && <ellipse cx="0" cy="13" rx="20" ry="15" fill="#e7ceae" />}
      <Face y={kind === 'frog' ? -16 : -3} scale={1.2} />
      {kind !== 'frog' && <path d="M-4 9Q0 7 4 9L0 14Z" fill="#55514a" />}
      {kind === 'cat' && (
        <path
          d="M-23 12-47 7m24 14-24 4M23 12l24-5M23 21l24 4"
          stroke="#8d775a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="-23" cy="69" rx="16" ry="9" fill={color} />
      <ellipse cx="23" cy="69" rx="16" ry="9" fill={color} />
    </g>
  );
}

function Cloud({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} fill="#fffef5" opacity=".86">
      <rect x="-49" y="0" width="100" height="27" rx="14" />
      <circle cx="-19" cy="0" r="23" />
      <circle cx="15" cy="-9" r="30" />
    </g>
  );
}
function Grass({ x, y, color = '#9caf83' }: { x: number; y: number; color?: string }) {
  return (
    <path
      d={`M${x} ${y}q-5-21-13-23m13 23q0-26 9-31m-9 31q10-19 20-20`}
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  );
}
function Butterfly({ x, y, color = '#dba882' }: { x: number; y: number; color?: string }) {
  return (
    <g className="butterfly" transform={`translate(${x} ${y}) rotate(-18)`}>
      <path
        d="M0 0C-43-35-45 19-5 14C-32 32-7 45 3 15C26 36 43 15 10 8C47-5 17-34 0 0"
        fill={color}
      />
      <path
        d="m0 0 9 18M0 0l-2-10m2 10 6-7"
        stroke="#877459"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function Rocket({
  x = 0,
  y = 0,
  size = 1,
  color = '#b8a4cf',
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size}) rotate(18)`}>
      <path d="M-15 48Q0 101 15 48" fill="#edbf6f" />
      <path d="M-7 48Q0 78 7 48" fill="#ffecd0" />
      <path d="M-24 6Q-51 26-39 51L-17 38M24 6Q51 26 39 51L17 38" fill={color} />
      <path d="M0-68Q-38-27-24 40Q0 52 24 40Q38-27 0-68" fill="#fff6e8" />
      <path d="M0-68Q-17-50-24-27H24Q17-50 0-68" fill={color} />
      <circle cy="1" r="17" fill="#9bbdca" />
      <circle cx="-4" cy="-4" r="7" fill="#d9ebed" />
      <path d="M-22 41h44" stroke={color} strokeWidth="9" strokeLinecap="round" />
    </g>
  );
}

export function WorldArt({
  world,
  compact = false,
  hero = false,
}: {
  world: WorldId;
  compact?: boolean;
  hero?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={`world-art ${hero ? 'hero-art' : ''}`}
      viewBox={compact ? '380 30 560 385' : '0 0 1000 460'}
      preserveAspectRatio={hero ? 'xMaxYMax meet' : 'xMidYMid slice'}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky${id}`} x2="0" y2="1">
          <stop
            stopColor={world === 'space' ? '#e6def2' : world === 'bubbles' ? '#e0eff2' : '#edf2e3'}
          />
          <stop offset="1" stopColor={world === 'space' ? '#f1eaf7' : '#f2f5e6'} />
        </linearGradient>
      </defs>
      {world === 'garden' && (
        <>
          <rect x="-1000" width="2000" height="460" fill={`url(#sky${id})`} />
          <g className="sun-drift">
            <circle cx="842" cy="95" r="46" fill="#f2d180" />
            <Face x={842} y={95} scale={0.75} />
            <g stroke="#e8c673" strokeWidth="3" strokeLinecap="round">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <path key={a} d="M842 35v-8" transform={`rotate(${a} 842 95)`} />
              ))}
            </g>
          </g>
          <Cloud x={600} y={86} size={0.68} />
          <Cloud x={955} y={172} size={0.65} />
          <path
            d="M-1000 378Q-500 300 0 378Q170 270 346 354Q477 275 650 342Q807 259 1000 344V460H-1000Z"
            fill="#dce7c9"
          />
          <path
            d="M-1000 412Q-500 360 0 412Q159 342 330 401Q474 327 640 398Q819 330 1000 380V460H-1000Z"
            fill="#c9d8b4"
          />
          <path
            d="M-1000 449Q-500 420 0 449Q211 405 402 446Q666 384 1000 434V460H-1000Z"
            fill="#b8cea1"
          />
          <g className="plant-sway">
            <Flower x={568} y={250} size={1.15} color="#e9aaa5" letter="A" tilt={-8} />
          </g>
          <g className="plant-sway delay">
            <Flower x={756} y={222} size={1.05} color="#e8c774" letter="B" tilt={10} />
          </g>
          <Flower x={903} y={300} size={0.8} color="#b6a5ce" letter="C" tilt={-10} />
          <Flower x={437} y={348} size={0.45} color="#ebca82" />
          <Flower x={981} y={370} size={0.5} color="#eba29e" />
          <Animal kind="fox" x={679} y={365} size={0.74} />
          <Butterfly x={666} y={181} />
          <Butterfly x={945} y={238} color="#b4a4c7" />
          <g transform="translate(842 403)">
            <path d="M-4 0v-22" stroke="#f9e8ce" strokeWidth="12" strokeLinecap="round" />
            <path d="M-29-23Q-6-63 21-23Z" fill="#cc8d76" />
            <circle cx="-9" cy="-34" r="4" fill="#f7e8cd" />
            <circle cx="5" cy="-29" r="3" fill="#f7e8cd" />
          </g>
          <g transform="translate(506 407)">
            <path
              d="M-24 7H22q11-2 11-12"
              stroke="#aba577"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="-6" cy="-4" r="15" fill="#dab783" />
            <path d="M-10-5q10-9 13 1t-9 8" stroke="#b98e63" strokeWidth="2" fill="none" />
            <path d="M29-4v-9m6 9 4-9" stroke="#aba577" strokeWidth="2" />
          </g>
          {[125, 360, 476, 791, 936].map((x, i) => (
            <Grass key={x} x={x} y={420 + (i % 2) * 18} />
          ))}
          {[72, 285, 414, 611, 814, 953].map((x, i) => (
            <g key={x} transform={`translate(${x} ${410 + (i % 3) * 16})`}>
              <path d="M0 0v9" stroke="#93aa7d" strokeWidth="2" />
              <circle r="4" fill={i % 2 ? '#f9edbb' : '#faf6df'} />
            </g>
          ))}
        </>
      )}
      {world === 'bubbles' && (
        <>
          <rect width="1000" height="460" fill="#e1eff1" />
          <Cloud x={470} y={100} size={0.75} />
          <Cloud x={851} y={58} size={0.7} />
          <path d="M0 352Q150 310 310 359T650 350T1000 346V460H0Z" fill="#b4d6d9" />
          <path d="M0 393Q130 352 290 400T610 390T1000 393V460H0Z" fill="#96c0c7" />
          {[
            { x: 570, y: 173, r: 66, c: '#cedfeb' },
            { x: 744, y: 109, r: 43, c: '#ecdbe2' },
            { x: 807, y: 255, r: 78, c: '#d8e4da' },
            { x: 468, y: 295, r: 35, c: '#e6dce9' },
            { x: 921, y: 148, r: 25, c: '#e8e5cb' },
          ].map((b) => (
            <g key={b.x} className="bubble-float">
              <circle
                cx={b.x}
                cy={b.y}
                r={b.r}
                fill={b.c}
                fillOpacity=".65"
                stroke="#fff"
                strokeOpacity=".85"
                strokeWidth="3"
              />
              <path
                d={`M${b.x - b.r * 0.65} ${b.y - b.r * 0.18}q0 ${-b.r * 0.45} ${b.r * 0.4} ${-b.r * 0.52}`}
                fill="none"
                stroke="#fff"
                strokeWidth="6"
                strokeLinecap="round"
                opacity=".75"
              />
              <Face x={b.x} y={b.y + 5} scale={b.r / 65} />
            </g>
          ))}
          <g transform="translate(638 362)">
            <ellipse rx="40" ry="27" fill="#eac971" />
            <circle cx="27" cy="-29" r="24" fill="#eac971" />
            <path d="m45-29 22 9-22 7" fill="#d99c69" />
            <circle cx="32" cy="-34" r="3" fill="#4e574e" />
            <path d="M-17-7q28-12 30 13" fill="none" stroke="#d5b05c" strokeWidth="3" />
          </g>
          <path
            d="M850 428q15-40-3-63m14 57q33-31 22-52M402 428q-16-29-5-47"
            stroke="#639a9b"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {world === 'space' && (
        <>
          <rect width="1000" height="460" fill="#e8e1f2" />
          {Array.from({ length: 22 }, (_, i) => (
            <Star
              key={i}
              x={50 + ((i * 137) % 930)}
              y={30 + ((i * 71) % 360)}
              size={i % 3 === 0 ? 9 : 4}
              color={i % 2 ? '#fff9ea' : '#c6b7d7'}
            />
          ))}
          <g transform="translate(535 175) rotate(-18)">
            <ellipse rx="100" ry="30" fill="none" stroke="#baa6ce" strokeWidth="15" />
            <circle r="61" fill="#cebadf" />
            <path d="M-89 14Q0 55 89 14" fill="none" stroke="#baa6ce" strokeWidth="13" />
            <Face y={-7} />
          </g>
          <Rocket x={757} y={193} size={1.32} />
          <Star x={906} y={92} size={33} face />
          <Star x={618} y={319} size={24} face />
          <path d="M0 442Q200 340 380 436Q696 330 1000 413V460H0Z" fill="#d0c3e0" />
          <ellipse cx="788" cy="429" rx="59" ry="13" fill="#c1b0d4" />
          <text
            x="889"
            y="328"
            fill="#a38bbd"
            fontFamily="Nunito"
            fontSize="63"
            fontWeight="900"
            transform="rotate(12 889 328)"
          >
            3
          </text>
          <text
            x="395"
            y="290"
            fill="#b1a0c7"
            fontFamily="Nunito"
            fontSize="40"
            fontWeight="900"
            transform="rotate(-12 395 290)"
          >
            1
          </text>
        </>
      )}
      {world === 'music' && (
        <>
          <rect width="1000" height="460" fill="#f9edd8" />
          <circle cx="835" cy="110" r="55" fill="#f0d093" />
          <Cloud x={484} y={91} size={0.7} />
          <path d="M0 380Q180 322 399 377T800 369T1000 373V460H0Z" fill="#e9dab5" />
          <g transform="translate(638 281) rotate(-10)">
            {['#d7948a', '#e7b575', '#e5ca7f', '#aabb97', '#95b7bd', '#b19cc5'].map((c, i) => (
              <g key={c}>
                <rect
                  x={i * 43 - 120}
                  y={i * 8 - 65}
                  width="38"
                  height={156 - i * 13}
                  rx="10"
                  fill={c}
                />
                <circle cx={i * 43 - 101} cy={i * 8 - 52} r="3" fill="#fff8e8" />
              </g>
            ))}
          </g>
          <g stroke="#a88462" strokeWidth="8" strokeLinecap="round">
            <path d="m539 364 97-89m93 76-51-94" />
          </g>
          <circle cx="640" cy="270" r="18" fill="#dfad78" />
          <circle cx="675" cy="252" r="18" fill="#dfad78" />
          {[
            [472, 180, -12],
            [776, 166, 15],
            [859, 285, -10],
          ].map(([x, y, a], i) => (
            <text
              key={x}
              x={x}
              y={y}
              fontSize={i === 1 ? '85' : '58'}
              fill={['#bc91a4', '#a5af81', '#bfa0bb'][i]}
              transform={`rotate(${a} ${x} ${y})`}
            >
              ♪
            </text>
          ))}
          <Flower x={921} y={347} size={0.49} color="#e9b776" />
          <Grass x={438} y={400} />
        </>
      )}
      {world === 'shapes' && (
        <>
          <rect width="1000" height="460" fill="#f6e6e1" />
          <path d="M0 405Q269 340 485 405Q758 347 1000 397V460H0Z" fill="#ead3cb" />
          <g transform="translate(548 265) rotate(-12)">
            <rect x="-68" y="-68" width="136" height="136" rx="25" fill="#a8b99d" />
            <Face y={4} scale={1.4} />
          </g>
          <g transform="translate(732 155) rotate(9)">
            <path
              d="M0-76 78 65H-78Z"
              fill="#e5bd76"
              stroke="#e5bd76"
              strokeWidth="20"
              strokeLinejoin="round"
            />
            <Face y={24} scale={1.3} />
          </g>
          <circle cx="847" cy="318" r="61" fill="#c7acce" />
          <Face x={847} y={319} scale={1.3} />
          <Star x={482} y={93} size={24} color="#deaaa0" />
          <Star x={925} y={129} size={23} color="#a9bec6" />
          {[
            [671, 362],
            [423, 206],
            [887, 208],
            [591, 112],
          ].map(([x, y], i) => (
            <path
              key={x}
              d={`M${x} ${y}l8-14`}
              stroke={['#d3a18f', '#bbc1a1', '#d6bd82', '#c6b0c6'][i]}
              strokeWidth="7"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
      {world === 'animals' && (
        <>
          <rect width="1000" height="460" fill="#e8efe2" />
          <Cloud x={661} y={75} size={0.8} />
          <circle cx="879" cy="99" r="35" fill="#ebd392" />
          <path d="M0 385Q167 300 403 382Q707 296 1000 370V460H0Z" fill="#cfdcbd" />
          <path d="M0 443Q370 361 658 423T1000 414V460H0Z" fill="#bbceaa" />
          <g transform="translate(440 212)">
            <path d="M0 175V-80" stroke="#b49b74" strokeWidth="17" strokeLinecap="round" />
            <ellipse cy="-16" rx="65" ry="100" fill="#a8be97" />
            <path
              d="M0 70V-67m0 67 28-29M0 27l-32-24"
              fill="none"
              stroke="#8da67e"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <Animal x={583} y={301} size={1.05} kind="bunny" />
          <Animal x={758} y={309} size={1.12} kind="fox" />
          <Animal x={903} y={317} size={0.7} kind="frog" />
          <Butterfly x={737} y={149} />
          <Flower x={493} y={363} size={0.35} color="#e4b788" />
          <Grass x={675} y={398} />
          <Grass x={946} y={420} />
        </>
      )}
    </svg>
  );
}

export function MiniFlower() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <g transform="translate(22 22)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cy="-11" rx="8" ry="10" transform={`rotate(${a})`} fill="#e9bf68" />
        ))}
        <circle r="9" fill="#fff2bd" />
        <Face y={-2} scale={0.32} />
      </g>
    </svg>
  );
}
