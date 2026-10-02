import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { GameProps } from './types';
import { playTone, playSound, speak } from './audio';
import { useGameKeys } from './useGameKeys';
import './vehicles.css';

const INK = '#243c56';
const paints = [
  { color: '#f16e55', name: 'Red' },
  { color: '#64b8dd', name: 'Blue' },
  { color: '#f7cc58', name: 'Yellow' },
  { color: '#b796dc', name: 'Purple' },
  { color: '#7abd93', name: 'Green' },
  { color: '#f2a7c4', name: 'Pink' },
];
type Body = 'buggy' | 'racer' | 'van';
type Wheel = 'round' | 'flower' | 'star';
type Vehicle = 'plane' | 'train';
type Roof = 'none' | 'flower' | 'rocket' | 'party';
type Decal = 'star' | 'heart' | 'rainbow';
type Toy = 'bubbles' | 'teddy' | 'confetti';
type Food = 'apple' | 'banana' | 'fish' | 'poop';
const bodies: Body[] = ['buggy', 'racer', 'van'];
const wheels: Wheel[] = ['round', 'flower', 'star'];
const roofs: Roof[] = ['none', 'flower', 'rocket', 'party'];
const decals: Decal[] = ['star', 'heart', 'rainbow'];
const toys: Toy[] = ['bubbles', 'teddy', 'confetti'];
const foods: Food[] = ['apple', 'banana', 'fish', 'poop'];
const passengerColors = ['#f19369', '#f3c959', '#85bed3'];
const passengerNames = ['Fox', 'Chick', 'Elephant'];
const favorites: Food[] = ['apple', 'fish', 'banana'];
const worlds = [
  {
    name: 'Apple orchard',
    sky: '#cdebe8',
    hill: '#acd49d',
    ground: '#76b18e',
    road: '#d4af88',
    coach: 'Garden',
    color: '#90c9a2',
  },
  {
    name: 'Candy mountain',
    sky: '#f7dbe6',
    hill: '#d1b0dd',
    ground: '#ba9ad0',
    road: '#ebcba6',
    coach: 'Sweet shop',
    color: '#eeabc3',
  },
  {
    name: 'Sunny beach',
    sky: '#bfebf0',
    hill: '#8ccdd7',
    ground: '#f5d890',
    road: '#ddba89',
    coach: 'Ocean',
    color: '#8dc8df',
  },
  {
    name: 'Dinosaur valley',
    sky: '#e9ecbd',
    hill: '#a4c590',
    ground: '#79a690',
    road: '#baa285',
    coach: 'Jungle',
    color: '#b4cc81',
  },
  {
    name: 'Snowy village',
    sky: '#dce8f7',
    hill: '#bdcddb',
    ground: '#eef5f5',
    road: '#b5cbd7',
    coach: 'Snow',
    color: '#c1cbe8',
  },
  {
    name: 'Starry moon',
    sky: '#364566',
    hill: '#7983a8',
    ground: '#adb1cd',
    road: '#8b94b8',
    coach: 'Space',
    color: '#b9a1d8',
  },
];
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
  mood = 'neutral',
}: {
  index: number;
  mood?: 'neutral' | 'happy' | 'yuck';
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
      <g className="vg-blink">
        {mood === 'happy' ? (
          <path
            d="M-17-1q5-9 10 0M7-1q5-9 10 0"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle cx="-12" cy="-3" r="3" fill={INK} stroke="none" />
            <circle cx="12" cy="-3" r="3" fill={INK} stroke="none" />
          </>
        )}
      </g>
      {mood === 'yuck' && (
        <path d="m-18-13 10 4m16 0 10-4" fill="none" strokeWidth="3" strokeLinecap="round" />
      )}
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
          <path
            d={
              mood === 'yuck'
                ? 'M-7 24q7-10 14 0'
                : mood === 'happy'
                  ? 'M-8 17q8 17 16 0Z'
                  : 'M-5 19q5 4 10 0'
            }
            fill={mood === 'happy' ? '#755053' : 'none'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <circle cx="-21" cy="8" r="5" fill="#f2a295" stroke="none" opacity=".7" />
      <circle cx="21" cy="8" r="5" fill="#f2a295" stroke="none" opacity=".7" />
    </g>
  );
}

function FoodArt({ food }: { food: Food }) {
  return (
    <svg viewBox="-40 -40 80 80" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        {food === 'apple' && (
          <>
            <path d="M0-18C-38-38-39 17-16 29q9 6 16 0 7 6 16 0C39 17 38-38 0-18" fill="#ed7665" />
            <path d="M0-18q-2-14 8-17" fill="none" strokeWidth="5" />
            <path d="M6-24q6-21 23-9-9 16-23 9" fill="#70af76" />
            <path
              d="M-21-6q-7 10-1 18"
              fill="none"
              stroke="#ffb49f"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        )}
        {food === 'banana' && (
          <>
            <path d="M-23-26Q-35 20 15 24 33 22 31 0 16 23-10-14Z" fill="#fbd670" />
            <path d="M-19-18Q-17 18 24 13" fill="none" stroke="#d5a750" />
            <path d="m-24-26 8-4 6 16-10 2" fill="#9d8259" />
          </>
        )}
        {food === 'fish' && (
          <>
            <path d="m18 0 17-20v40Z" fill="#f0b583" />
            <ellipse cx="-7" rx="26" ry="19" fill="#92cbd1" />
            <path d="m-9-18 11-10 4 10m-15 36 11 10 4-10" fill="#f0b583" />
            <circle cx="-19" cy="-3" r="3" fill={INK} />
            <path d="M-27 7q6 4 8 0M3-12q7 12 0 24" fill="none" />
          </>
        )}
        {food === 'poop' && (
          <>
            <path
              d="M-29 26q-15-12 5-23-9-13 12-20-5-11 7-17 0 11 14 15 15 5 10 16 20 6 10 18 16 18-5 19Z"
              fill="#9e775b"
            />
            <path d="M-22 4h39M-23 19h44" fill="none" stroke="#815e4c" />
            <circle cx="-9" cy="6" r="3" fill={INK} />
            <circle cx="9" cy="6" r="3" fill={INK} />
            <path d="M-5 13q5 5 10 0" fill="none" />
          </>
        )}
      </g>
    </svg>
  );
}
function ToyArt({ toy }: { toy: Toy }) {
  return (
    <svg viewBox="-40 -40 80 80" aria-hidden="true">
      {toy === 'bubbles' ? (
        <g fill="#d9f5f1" stroke="#6bbfc9" strokeWidth="3">
          <circle cx="-12" cy="9" r="20" />
          <circle cx="17" cy="-16" r="14" />
          <circle cx="20" cy="23" r="10" />
          <path
            d="M-23 3q4-10 11-9M10-18q4-5 8-5"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : toy === 'teddy' ? (
        <g fill="#d7a373" stroke={INK} strokeWidth="2.5">
          <circle cx="-20" cy="-23" r="10" />
          <circle cx="20" cy="-23" r="10" />
          <ellipse cy="18" rx="20" ry="20" />
          <circle cy="-9" r="25" />
          <ellipse cy="1" rx="12" ry="9" fill="#ffe7b9" />
          <circle cx="-9" cy="-13" r="2.5" fill={INK} />
          <circle cx="9" cy="-13" r="2.5" fill={INK} />
          <path d="m-4-3 4 4 4-4" fill={INK} />
        </g>
      ) : (
        <g strokeWidth="7" strokeLinecap="round">
          {['#ed7665', '#f3cf63', '#82bfc8', '#b49bd9', '#91bf8e'].map((color, i) => (
            <g key={color} transform={`rotate(${i * 72})`} stroke={color}>
              <path d="M0-15v-17M0 9l6 8" />
              <circle cx="16" cy="-15" r="3" fill={color} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
function DecalArt({ decal }: { decal: Decal }) {
  return (
    <g>
      {decal === 'star' ? (
        <Star size={0.7} />
      ) : decal === 'heart' ? (
        <path
          d="M0 18C-46-7-12-38 0-15 12-38 46-7 0 18"
          fill="#ffecdb"
          stroke={INK}
          strokeWidth="2"
        />
      ) : (
        <g fill="none" strokeWidth="7">
          <path d="M-24 17a24 24 0 0 1 48 0" stroke="#f6cc65" />
          <path d="M-17 17a17 17 0 0 1 34 0" stroke="#ef937f" />
          <path d="M-10 17a10 10 0 0 1 20 0" stroke="#92c9bc" />
        </g>
      )}
    </g>
  );
}
function RoofArt({ roof }: { roof: Roof }) {
  return (
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      {roof === 'flower' ? (
        <>
          <path d="M0 0v-24" stroke="#519477" strokeWidth="6" />
          <g transform="translate(0 -37)" fill="#f0a0ba">
            {[0, 60, 120, 180, 240, 300].map((n) => (
              <ellipse key={n} cy="-11" rx="7" ry="13" transform={`rotate(${n})`} />
            ))}
            <circle r="9" fill="#ffe28a" />
          </g>
        </>
      ) : roof === 'rocket' ? (
        <g transform="rotate(25)">
          <path d="m-9-10-10 14h38L9-10" fill="#ef9078" />
          <path d="M-10 0v-27L0-42l10 15V0Z" fill="#fff1d8" />
          <circle cy="-21" r="6" fill="#86cbd8" />
          <path d="m-6 1 6 19L6 1" fill="#ffd373" />
        </g>
      ) : roof === 'party' ? (
        <>
          <path d="M-25 0 0-57 25 0Z" fill="#b69cdc" />
          <path d="m-15-22 28-3M-21-9l39-4" stroke="#ffe39c" strokeWidth="7" />
          <circle cy="-57" r="7" fill="#ecaaad" />
        </>
      ) : (
        <path d="M-20-5h40" stroke="#91a3a5" strokeWidth="6" strokeLinecap="round" />
      )}
    </g>
  );
}
function CustomCar({
  body,
  color,
  wheel,
  roof,
  decal,
  moving = false,
}: {
  body: Body;
  color: string;
  wheel: Wheel;
  roof: Roof;
  decal: Decal;
  moving?: boolean;
}) {
  return (
    <g>
      <CarArt body={body} color={color} wheel={wheel} moving={moving} />
      <g transform={`translate(142 ${body === 'van' ? 37 : body === 'racer' ? 65 : 46})`}>
        <RoofArt roof={roof} />
      </g>
      <g transform="translate(115 126) scale(.55)">
        <DecalArt decal={decal} />
      </g>
    </g>
  );
}
function WorldArt({ index, distance = 0 }: { index: number; distance?: number }) {
  const w = worlds[index % worlds.length],
    shift = distance % 350;
  return (
    <g>
      <rect width="1000" height="450" fill={w.sky} />
      <circle cx="862" cy="68" r="34" fill={index === 5 ? '#fff4c5' : '#ffe291'} />
      <g fill={INK}>
        <circle cx="851" cy="63" r="3" />
        <circle cx="873" cy="63" r="3" />
        <path
          d="M851 75q11 10 22 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <Cloud x={80 - shift * 0.1} y={55} />
      <Cloud x={530 - shift * 0.14} y={30} size={0.8} />
      <path d="M0 247Q170 77 360 230 570 40 755 224 870 111 1000 206V450H0Z" fill={w.hill} />
      <path d="M0 288Q260 192 520 267 740 191 1000 275V450H0Z" fill={w.ground} />
      {[-1, 0, 1, 2, 3].map((n) => (
        <g key={n} transform={`translate(${n * 350 - shift} 0)`}>
          {index === 0 && (
            <>
              <Tree x={110} y={221} size={0.85} />
              {[
                [-18, -13],
                [22, 9],
                [-17, 24],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={110 + x}
                  cy={205 + y}
                  r="9"
                  fill="#ed8270"
                  stroke={INK}
                  strokeWidth="1.8"
                />
              ))}
            </>
          )}
          {index === 1 && (
            <>
              <path d="M106 293V177" stroke="#f7eddf" strokeWidth="12" />
              <circle cx="106" cy="165" r="40" fill="#edb3c3" stroke="#fcf4dc" strokeWidth="7" />
              <path
                d="M89 148q48-4 18 38-22 8-18-17 3-8 13-3"
                fill="none"
                stroke="#fff2d3"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </>
          )}
          {index === 2 && (
            <>
              <path d="M107 290q-6-60 9-114" fill="none" stroke="#b39065" strokeWidth="13" />
              <path
                d="M115 177q-56-59-68 7 27-22 68-7 35-55 68-6-34-8-68 6 3-48 26-42"
                fill="#78b591"
                stroke="#59896e"
                strokeWidth="3"
              />
            </>
          )}
          {index === 3 && (
            <g transform="translate(90 222)">
              <path
                d="M-40 52q-23-73 45-55 19-77 43-52 6 18-11 32L23 30l20 29H23L7 41l-23 2-6 17h-19Z"
                fill="#b3d480"
                stroke={INK}
                strokeWidth="3"
              />
              <circle cx="41" cy="-39" r="3" fill={INK} />
              <path d="M-25 1 0-16l15 24" fill="#efc071" stroke={INK} strokeWidth="2" />
            </g>
          )}
          {index === 4 && (
            <>
              <path d="M62 289v-63l44-45 51 45v63Z" fill="#d69b9b" stroke={INK} strokeWidth="3" />
              <path
                d="m49 231 57-58 64 59"
                fill="none"
                stroke="#fffbec"
                strokeWidth="17"
                strokeLinecap="round"
              />
              <rect x="95" y="245" width="25" height="44" rx="12" fill="#ffe4a3" />
            </>
          )}
          {index === 5 && (
            <>
              <g transform="translate(114 138) rotate(-20)">
                <circle r="43" fill="#d5afcf" />
                <ellipse rx="71" ry="17" fill="none" stroke="#f0d8af" strokeWidth="9" />
              </g>
              <Star x={232} y={66} size={0.4} />
              <Star x={290} y={151} size={0.3} />
            </>
          )}
        </g>
      ))}
      <path d="M0 329Q500 310 1000 329v121H0Z" fill={w.road} />
      <path d="M0 329Q500 310 1000 329" fill="none" stroke="#fff2d5" strokeWidth="8" />
      <path
        d="M0 399h1000"
        stroke="#fff2d5"
        strokeWidth="5"
        strokeDasharray="40 40"
        strokeDashoffset={distance * 2}
      />
    </g>
  );
}
function Icon({ name }: { name: 'go' | 'stop' | 'home' | 'horn' | 'swap' | 'bin' }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === 'go' ? (
          <path d="M22 12 46 30 22 48Z" fill="currentColor" />
        ) : name === 'stop' ? (
          <>
            <path d="M21 14v32M39 14v32" strokeWidth="9" />
          </>
        ) : name === 'home' ? (
          <>
            <path d="m7 28 23-19 23 19M14 23v29h32V23" />
            <path d="M25 52V34h11v18" />
          </>
        ) : name === 'horn' ? (
          <>
            <path d="M8 29h16l17-15v34L24 34H8Z" fill="#f8d46f" />
            <path d="M48 21q10 10 0 20" />
          </>
        ) : name === 'bin' ? (
          <>
            <path d="M17 21v29h27V21M11 18h39M24 10h15M25 29v12M35 29v12" />
          </>
        ) : (
          <>
            <path d="M9 22h40L39 12M51 38H11l10 10" />
          </>
        )}
      </g>
    </svg>
  );
}

export function GarageGame({ settings, paused, onCelebrate }: GameProps) {
  const [body, setBody] = useState<Body>('buggy'),
    [paint, setPaint] = useState(0),
    [wheel, setWheel] = useState<Wheel>('round'),
    [roof, setRoof] = useState<Roof>('flower'),
    [decal, setDecal] = useState<Decal>('star');
  const [tab, setTab] = useState(0),
    [driving, setDriving] = useState(false),
    [running, setRunning] = useState(false),
    [distance, setDistance] = useState(0),
    [toy, setToy] = useState<Toy>('bubbles'),
    [tosses, setTosses] = useState<{ id: number; toy: Toy; age: number }[]>([]),
    [greeting, setGreeting] = useState(false);
  const tick = useRef({
    distance: 0,
    tosses: [] as { id: number; toy: Toy; age: number }[],
    last: 0,
    nextId: 0,
    world: 0,
  });
  const world = Math.floor(distance / 1100) % worlds.length,
    stars = Math.floor(distance / 95);
  function toss() {
    if (paused || !driving) return;
    const item = { id: ++tick.current.nextId, toy, age: 0 };
    tick.current.tosses = [...tick.current.tosses.slice(-8), item];
    setTosses([...tick.current.tosses]);
    playTone(toy === 'teddy' ? 3 : 8, settings);
  }
  function greet() {
    if (paused) return;
    setGreeting(true);
    playSound('horn', settings);
    speak(`Hello, ${passengerNames[world % 3]}!`, settings, { interrupt: true });
  }
  function choose() {
    if (paused) return;
    playTone(3 + tab, settings);
    if (tab === 0) setBody(bodies[(bodies.indexOf(body) + 1) % 3]);
    if (tab === 1) setPaint((paint + 1) % paints.length);
    if (tab === 2) setWheel(wheels[(wheels.indexOf(wheel) + 1) % 3]);
    if (tab === 3) setRoof(roofs[(roofs.indexOf(roof) + 1) % 4]);
    if (tab === 4) setDecal(decals[(decals.indexOf(decal) + 1) % 3]);
  }
  useEffect(() => {
    if (paused) return;
    let frame = 0;
    tick.current.last = 0;
    const animate = (now: number) => {
      const t = tick.current,
        dt = t.last ? Math.max(0, Math.min((now - t.last) / 1000, 0.05)) : 0;
      t.last = now;
      if (driving && running) {
        t.distance += dt * 95;
        setDistance(t.distance);
        const next = Math.floor(t.distance / 1100);
        if (next !== t.world) {
          t.world = next;
          setGreeting(false);
          onCelebrate(`Road trip: ${worlds[next % worlds.length].name}`);
          speak(`Hello, ${worlds[next % worlds.length].name}!`, settings);
        }
      }
      if (t.tosses.length) {
        t.tosses = t.tosses.map((p) => ({ ...p, age: p.age + dt })).filter((p) => p.age < 2.4);
        setTosses([...t.tosses]);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused, driving, running, onCelebrate, settings]);
  useGameKeys(paused, (key) => {
    if (!driving) {
      if (key === 'Enter' || key === ' ') {
        setDriving(true);
        setRunning(true);
      } else if (key === 'ArrowRight') setTab((tab + 1) % 5);
      else choose();
    } else if (key === 'h' || key === 'H') greet();
    else if (key === 'ArrowUp') {
      setRunning((v) => !v);
    } else {
      setRunning(true);
      toss();
    }
  });
  const custom = { body, color: paints[paint].color, wheel, roof, decal };
  return (
    <section
      className={`vg-game vg-garage ${paused ? 'vg-paused' : ''} ${settings.calm ? 'vg-calm' : ''}`}
      data-game="garage"
      data-driving={driving}
      data-world={world}
      data-distance={Math.floor(distance)}
    >
      <div className="vg-title">
        <div>
          <span className="vg-kicker">
            {driving ? 'THE ROAD GOES ON & ON' : 'A CAR THAT IS ALL YOURS'}
          </span>
          <h2>{driving ? worlds[world].name : 'Make your car!'}</h2>
        </div>
        {driving ? (
          <div className="vg-tally">
            <svg viewBox="-30 -30 60 60">
              <Star />
            </svg>
            <b>{stars}</b>
          </div>
        ) : (
          <button className="vg-mini" onClick={choose} disabled={paused} aria-label="Surprise me">
            <svg viewBox="-30 -30 60 60">
              <Star color="#c7a7df" />
            </svg>
          </button>
        )}
      </div>
      <div className="vg-main-scene vg-garage-scene" data-testid="garage-scene">
        <svg viewBox="0 0 1000 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {driving ? (
            <WorldArt index={world} distance={distance} />
          ) : (
            <>
              <rect width="1000" height="450" fill="#f5e3c4" />
              <rect x="94" y="25" width="812" height="338" rx="42" fill="#eed1a6" />
              <rect x="120" y="46" width="760" height="295" rx="30" fill="#d7e5d4" />
              {[76, 116, 156].map((y) => (
                <path key={y} d={`M125 ${y}h750`} stroke="#c5d7c4" strokeWidth="3" />
              ))}
              <rect y="349" width="1000" height="101" fill="#dbb695" />
              <ellipse cx="504" cy="386" rx="240" ry="26" fill="#ae9076" opacity=".2" />
              <path
                d="M80 337V198h96v139m648 0V198h96v139"
                fill="#dfa16f"
                stroke={INK}
                strokeWidth="3"
              />
              <path
                d="M99 225h58m-58 38h58m692-38h58m-58 38h58"
                stroke="#fff0d1"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="826" cy="110" r="28" fill="#fff5dc" stroke={INK} strokeWidth="3" />
              <path d="M826 90v20l14 9" stroke={INK} strokeWidth="4" fill="none" />
            </>
          )}
        </svg>
        <svg
          className={`vg-custom-car ${driving ? 'vg-car-on-road' : ''} ${driving && running ? 'vg-car-bob' : ''}`}
          viewBox="0 -35 290 225"
          aria-hidden="true"
        >
          <CustomCar {...custom} moving={driving && running} />
        </svg>
        {driving &&
          tosses.map((t) => (
            <div
              className="vg-flying-toy"
              key={t.id}
              style={{
                left: `${40 + t.age * 19}%`,
                bottom: `${27 + Math.sin((t.age / 2.4) * Math.PI) * 34}%`,
                transform: `rotate(${t.age * 100}deg)`,
                opacity: Math.min(1, (2.4 - t.age) * 2),
              }}
            >
              <ToyArt toy={t.toy} />
            </div>
          ))}
        {driving && (
          <>
            <button
              className="vg-window-button"
              aria-label={`Throw ${toy} from the window`}
              onClick={toss}
              disabled={paused}
            >
              <ToyArt toy={toy} />
              <span>Throw!</span>
            </button>
            <button
              className="vg-friend-button"
              aria-label={`Say hello to ${passengerNames[world % 3]}`}
              onClick={greet}
              disabled={paused}
            >
              <svg viewBox="-70 -110 140 180" aria-hidden="true">
                <g className={greeting ? 'vg-friend-wave' : 'vg-friend-breathe'}>
                  <path
                    d="M-20 40q-25-33-35-5m74 5q25-33 35-5"
                    fill="none"
                    stroke={passengerColors[world % 3]}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <ellipse cy="34" rx="25" ry="28" fill={passengerColors[world % 3]} />
                  <Passenger index={world % 3} size={0.85} />
                </g>
                {greeting && (
                  <g transform="translate(0 -78)">
                    <rect x="-51" y="-20" width="102" height="39" rx="19" fill="#fff9e9" />
                    <text y="6" textAnchor="middle" fill={INK} fontWeight="900" fontSize="22">
                      Hello!
                    </text>
                  </g>
                )}
              </svg>
            </button>
            <div className="vg-road-label">{world + 1} / 6 worlds · keep exploring</div>
          </>
        )}
      </div>
      {!driving ? (
        <>
          <div className="vg-build-tabs" role="tablist" aria-label="Car parts">
            {['Shape', 'Color', 'Wheels', 'Hat', 'Sticker'].map((label, i) => (
              <button
                role="tab"
                aria-selected={tab === i}
                key={label}
                onClick={() => {
                  if (!paused) setTab(i);
                }}
                disabled={paused}
              >
                <svg viewBox="-35 -35 70 70">
                  {i === 0 ? (
                    <g transform="translate(-34 -21) scale(.24)">
                      <CarArt color={paints[paint].color} />
                    </g>
                  ) : i === 1 ? (
                    <>
                      <circle r="23" fill={paints[paint].color} />
                      <circle cx="-6" cy="-8" r="7" fill="white" opacity=".6" />
                    </>
                  ) : i === 2 ? (
                    <WheelArt style={wheel} x={0} y={0} />
                  ) : i === 3 ? (
                    <g transform="translate(0 22) scale(.8)">
                      <RoofArt roof={roof} />
                    </g>
                  ) : (
                    <DecalArt decal={decal} />
                  )}
                </svg>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="vg-options">
            {tab === 0
              ? bodies.map((b) => (
                  <button
                    key={b}
                    aria-label={`Choose ${b}`}
                    aria-pressed={body === b}
                    disabled={paused}
                    onClick={() => {
                      setBody(b);
                      playTone(3, settings);
                      speak(b, settings);
                    }}
                  >
                    <svg viewBox="0 0 290 180">
                      <CarArt body={b} color={paints[paint].color} />
                    </svg>
                  </button>
                ))
              : tab === 1
                ? paints.map((p, i) => (
                    <button
                      key={p.name}
                      aria-label={`Paint ${p.name.toLowerCase()}`}
                      aria-pressed={paint === i}
                      disabled={paused}
                      onClick={() => {
                        setPaint(i);
                        playTone(i, settings);
                        speak(p.name, settings);
                      }}
                    >
                      <svg viewBox="-30 -30 60 60">
                        <circle r="24" fill={p.color} stroke={INK} strokeWidth="2" />
                        <circle cx="-7" cy="-8" r="6" fill="white" opacity=".65" />
                      </svg>
                    </button>
                  ))
                : tab === 2
                  ? wheels.map((w) => (
                      <button
                        key={w}
                        aria-label={`Choose ${w} wheels`}
                        aria-pressed={wheel === w}
                        disabled={paused}
                        onClick={() => {
                          setWheel(w);
                          playTone(5, settings);
                        }}
                      >
                        <svg viewBox="-38 -38 76 76">
                          <WheelArt style={w} x={0} y={0} />
                        </svg>
                      </button>
                    ))
                  : tab === 3
                    ? roofs.map((r) => (
                        <button
                          key={r}
                          aria-label={`Choose ${r} hat`}
                          aria-pressed={roof === r}
                          disabled={paused}
                          onClick={() => {
                            setRoof(r);
                            playTone(7, settings);
                          }}
                        >
                          <svg viewBox="-42 -65 84 84">
                            <RoofArt roof={r} />
                          </svg>
                        </button>
                      ))
                    : decals.map((d) => (
                        <button
                          key={d}
                          aria-label={`Choose ${d} sticker`}
                          aria-pressed={decal === d}
                          disabled={paused}
                          onClick={() => {
                            setDecal(d);
                            playTone(9, settings);
                          }}
                        >
                          <svg viewBox="-40 -40 80 80">
                            <DecalArt decal={d} />
                          </svg>
                        </button>
                      ))}
            <button
              className="vg-start-button"
              aria-label="Let's drive"
              disabled={paused}
              onClick={() => {
                setDriving(true);
                setRunning(true);
                speak('Beep beep! Let’s go!', settings);
                playTone(8, settings);
              }}
            >
              <Icon name="go" />
              <span>Let's go!</span>
            </button>
          </div>
        </>
      ) : (
        <div className="vg-controls">
          <button
            aria-label="Back to garage"
            onClick={() => {
              setDriving(false);
              setRunning(false);
            }}
            disabled={paused}
          >
            <Icon name="home" />
            <span>Garage</span>
          </button>
          <button aria-label="Beep the horn" onClick={greet} disabled={paused}>
            <Icon name="horn" />
            <span>Beep!</span>
          </button>
          <div className="vg-toy-choices">
            {toys.map((t) => (
              <button
                aria-label={`Choose ${t}`}
                key={t}
                aria-pressed={toy === t}
                disabled={paused}
                onClick={() => {
                  setToy(t);
                  playTone(6, settings);
                }}
              >
                <ToyArt toy={t} />
              </button>
            ))}
          </div>
          <button
            className="vg-start-button"
            aria-label={running ? 'Pause driving' : 'Keep driving'}
            disabled={paused}
            onClick={() => setRunning((v) => !v)}
          >
            <Icon name={running ? 'stop' : 'go'} />
            <span>{running ? 'Stop' : 'Go!'}</span>
          </button>
        </div>
      )}
    </section>
  );
}

function CoachBadge({ index }: { index: number }) {
  return (
    <svg viewBox="-25 -25 50 50" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        {index === 0 ? (
          <>
            <path d="M0 20V0" stroke="#548b6d" strokeWidth="5" />
            {[0, 72, 144, 216, 288].map((n) => (
              <ellipse key={n} cy="-9" rx="6" ry="11" fill="#f1aec0" transform={`rotate(${n})`} />
            ))}
            <circle r="7" fill="#f8d772" />
          </>
        ) : index === 1 ? (
          <>
            <path d="m-3 10-5 13" stroke="#947566" strokeWidth="5" />
            <circle cy="-4" r="15" fill="#efb1c3" />
            <path d="M-6-8q20-2 8 11-10 1-4-8" stroke="#fff3dc" fill="none" strokeWidth="4" />
          </>
        ) : index === 2 ? (
          <>
            <path
              d="M-20 1q10-15 20 0t20 0M-20 14q10-15 20 0t20 0"
              stroke="#639fbb"
              fill="none"
              strokeWidth="6"
            />
            <circle cx="11" cy="-14" r="7" fill="#ffe293" stroke="none" />
          </>
        ) : index === 3 ? (
          <>
            <path d="M-15 19Q-26-17 20-20q1 41-35 39" fill="#82b783" />
            <path d="m-15 19 28-31M-1 3l-9-6" fill="none" />
          </>
        ) : index === 4 ? (
          <g stroke="#728ba9" strokeWidth="4">
            {[0, 60, 120].map((n) => (
              <path key={n} d="M0-20v40m-6-32 6 5 6-5m-12 24 6-5 6 5" transform={`rotate(${n})`} />
            ))}
          </g>
        ) : (
          <Star size={0.8} />
        )}
      </g>
    </svg>
  );
}

function EngineArt({ vehicle }: { vehicle: Vehicle }) {
  return (
    <svg viewBox="0 0 150 180" aria-hidden="true">
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        {vehicle === 'train' ? (
          <>
            <path d="M16 146V53h63v40h44q15 0 15 18v45H17Z" fill="#6aada2" />
            <path d="M8 52h79" strokeWidth="11" strokeLinecap="round" />
            <rect x="28" y="66" width="37" height="40" rx="9" fill="#dcf0df" />
            <path d="M110 96V60h18v40" fill="#f1c967" />
            <path d="M105 58h30" strokeWidth="7" strokeLinecap="round" />
            <circle cx="139" cy="122" r="11" fill="#ffe293" />
            <path d="m137 146 13 20h-31" fill="#ea987a" />
            <WheelArt style="star" x={42} y={154} turning />
            <WheelArt style="round" x={109} y={154} turning />
            <path d="M42 91q4 9 14 0" fill="none" />
            <circle cx="36" cy="81" r="3" fill={INK} />
            <circle cx="57" cy="81" r="3" fill={INK} />
          </>
        ) : (
          <>
            <ellipse cx="60" cy="93" rx="32" ry="37" fill="#f7dfa0" />
            <path d="M72 92h32" strokeWidth="10" />
            <g
              className="vg-wheel-turn"
              style={{ transformOrigin: '112px 92px', transformBox: 'view-box' }}
            >
              <ellipse cx="112" cy="61" rx="10" ry="36" fill="#ec957b" />
              <ellipse cx="112" cy="123" rx="10" ry="36" fill="#ec957b" />
            </g>
            <circle cx="112" cy="92" r="12" fill="#ffe8aa" />
          </>
        )}
      </g>
    </svg>
  );
}
function CatArt({ meow = false }: { meow?: boolean }) {
  return (
    <svg viewBox="-45 -55 90 105" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <path
          d="M25 31q33 6 13-27"
          fill="none"
          stroke="#d59b77"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <ellipse cy="23" rx="25" ry="22" fill="#d59b77" />
        <path d="m-26-9-3-36L-9-28q10-4 18 0l21-17-4 37" fill="#d59b77" />
        <ellipse cy="-10" rx="30" ry="25" fill="#d59b77" />
        <path d="M-15-30v13M0-34v15m15-13v15" stroke="#a27055" strokeWidth="5" />
        <g className="vg-blink">
          <circle cx="-12" cy="-8" r="3" fill={INK} />
          <circle cx="12" cy="-8" r="3" fill={INK} />
        </g>
        <path d="m-4 0 4 4 4-4" fill="#e7aba6" />
        {meow ? (
          <ellipse cy="10" rx="6" ry="7" fill="#6f5452" />
        ) : (
          <path d="M-8 8q8 9 16 0" fill="none" />
        )}
        <path d="M-20 1-37-3m18 11-17 3M20 1l17-4M19 8l17 3" strokeWidth="2" />
      </g>
    </svg>
  );
}

type PassengerReaction = { kind: 'happy' | 'yuck'; age: number; label: string };
export function TransportGame({ settings, paused, onCelebrate }: GameProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null),
    [seats, setSeats] = useState<(number | null)[]>([null, null, null]),
    [selected, setSelected] = useState<number | null>(0),
    [travelling, setTravelling] = useState(false),
    [distance, setDistance] = useState(0);
  const [inventory, setInventory] = useState<Record<Food, number>>({
      apple: 0,
      banana: 0,
      fish: 0,
      poop: 0,
    }),
    [heldFood, setHeldFood] = useState<Food | null>(null),
    [meals, setMeals] = useState(0),
    [reactions, setReactions] = useState<Record<number, PassengerReaction>>({}),
    [meowing, setMeowing] = useState(false),
    [binMessage, setBinMessage] = useState(false);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; pointer: number } | null>(
    null,
  );
  const gesture = useRef<{
      id: number;
      pointer: number;
      startX: number;
      startY: number;
      moved: boolean;
      target: HTMLButtonElement;
    } | null>(null),
    justDragged = useRef(false);
  const sim = useRef({
    distance: 0,
    last: 0,
    world: 0,
    meowTime: 0,
    binTime: 0,
    reactions: {} as Record<number, PassengerReaction>,
  });
  const world = Math.floor(distance / 1400) % worlds.length,
    boarded = seats.filter((n) => n !== null).length;
  function board(id: number, seat: number) {
    if (paused) return;
    setSeats((old) => {
      const next = old.map((v) => (v === id ? null : v));
      next[seat] = id;
      return next;
    });
    setSelected(null);
    playTone(id + 5, settings);
    speak(`Hello ${passengerNames[id]}! All aboard!`, settings, { interrupt: true });
  }
  function collect(food: Food) {
    if (paused) return;
    setInventory((old) => ({ ...old, [food]: Math.min(9, old[food] + 1) }));
    setHeldFood(food);
    playTone(food === 'poop' ? 1 : 6, settings);
    speak(food === 'poop' ? 'Oops! Poop goes in the bin.' : `${food}! Who is hungry?`, settings, {
      interrupt: true,
    });
  }
  function feed(seat: number) {
    if (paused) return;
    const friend = seats[seat];
    if (friend === null) return;
    if (!heldFood || inventory[heldFood] === 0) {
      speak(`${passengerNames[friend]} wants ${favorites[friend]}.`, settings, { interrupt: true });
      playTone(5, settings);
      return;
    }
    const food = heldFood,
      good = food === favorites[friend];
    setInventory((old) => ({ ...old, [food]: Math.max(0, old[food] - 1) }));
    setHeldFood(null);
    const r: PassengerReaction = {
      kind: good ? 'happy' : 'yuck',
      age: 0,
      label: good ? 'Yummy!' : food === 'poop' ? 'Poo! No!' : 'No, thank you!',
    };
    sim.current.reactions = { ...sim.current.reactions, [friend]: r };
    setReactions({ ...sim.current.reactions });
    playSound(good ? 'giggle' : 'yuck', settings);
    speak(
      good
        ? `Yummy ${food}! Thank you!`
        : food === 'poop'
          ? 'Yuck! Poop is not food. In the bin!'
          : `No, thank you! I like ${favorites[friend]}.`,
      settings,
      { interrupt: true },
    );
    if (good) {
      setMeals((n) => n + 1);
      if ((meals + 1) % 3 === 0) onCelebrate('Three happy travelling friends!');
    }
  }
  function cat() {
    if (paused) return;
    sim.current.meowTime = 1.8;
    setMeowing(true);
    playSound('meow', settings);
  }
  function compost() {
    if (paused) return;
    if (heldFood) {
      setInventory((old) => ({ ...old, [heldFood]: Math.max(0, old[heldFood] - 1) }));
      setHeldFood(null);
    }
    sim.current.binTime = 1.8;
    setBinMessage(true);
    playSound('pop', settings);
    speak('In the bin! Thank you!', settings, { interrupt: true });
  }
  function seatTap(seat: number) {
    if (paused) return;
    if (selected !== null) {
      board(selected, seat);
      return;
    }
    if (travelling) {
      feed(seat);
      return;
    }
    const friend = seats[seat];
    if (friend !== null) {
      setSelected(friend);
      speak(`Hello ${passengerNames[friend]}`, settings, { interrupt: true });
    } else {
      const missing = [0, 1, 2].find((n) => !seats.includes(n));
      if (missing !== undefined) board(missing, seat);
    }
  }
  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, id: number) {
    if (paused || gesture.current) return;
    event.preventDefault();
    gesture.current = {
      id,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      target: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, x: event.clientX, y: event.clientY, pointer: event.pointerId });
  }
  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId || paused) return;
    if (Math.hypot(event.clientX - g.startX, event.clientY - g.startY) > 7) g.moved = true;
    setDrag({ id: g.id, x: event.clientX, y: event.clientY, pointer: g.pointer });
  }
  function endDrag(event: ReactPointerEvent<HTMLButtonElement>, cancel = false) {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (g.target.hasPointerCapture(event.pointerId))
      g.target.releasePointerCapture(event.pointerId);
    if (cancel || paused) return;
    justDragged.current = true;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-coach-seat]');
    if (target) {
      board(g.id, Number(target.dataset.coachSeat));
    } else if (!g.moved) {
      setSelected(g.id);
      setHeldFood(null);
      playTone(g.id + 3, settings);
    }
    queueMicrotask(() => {
      justDragged.current = false;
    });
  }
  useEffect(() => {
    if (!paused) return;
    const g = gesture.current;
    if (g && g.target.hasPointerCapture(g.pointer)) g.target.releasePointerCapture(g.pointer);
    gesture.current = null;
    setDrag(null);
  }, [paused]);
  useEffect(() => {
    if (paused) return;
    let frame = 0;
    sim.current.last = 0;
    const animate = (now: number) => {
      const s = sim.current,
        dt = s.last ? Math.max(0, Math.min((now - s.last) / 1000, 0.05)) : 0;
      s.last = now;
      if (travelling) {
        s.distance += dt * 74;
        setDistance(s.distance);
        const next = Math.floor(s.distance / 1400);
        if (next !== s.world) {
          s.world = next;
          speak(`Next stop! ${worlds[next % worlds.length].name}!`, settings);
          onCelebrate(`All aboard: ${worlds[next % worlds.length].name}`);
        }
      }
      if (s.meowTime > 0) {
        s.meowTime -= dt;
        if (s.meowTime <= 0) setMeowing(false);
      }
      if (s.binTime > 0) {
        s.binTime -= dt;
        if (s.binTime <= 0) setBinMessage(false);
      }
      if (Object.keys(s.reactions).length) {
        s.reactions = Object.fromEntries(
          Object.entries(s.reactions)
            .map(([key, r]) => [key, { ...r, age: r.age + dt }])
            .filter(([, r]) => (r as PassengerReaction).age < 2),
        );
        setReactions({ ...s.reactions });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused, travelling, settings, onCelebrate]);
  useGameKeys(paused, (key) => {
    if (!vehicle) {
      setVehicle(key === 'p' ? 'plane' : 'train');
      return;
    }
    if (key === 'm') {
      cat();
      return;
    }
    if (!travelling) {
      const missing = [0, 1, 2].find((n) => !seats.includes(n));
      const empty = seats.findIndex((n) => n === null);
      if (missing !== undefined && empty >= 0) board(missing, empty);
      else {
        setSelected(null);
        setTravelling(true);
        playSound('horn', settings);
      }
      return;
    }
    if (heldFood) {
      const seat = seats.findIndex((friend) => friend !== null && favorites[friend] === heldFood);
      if (heldFood === 'poop') compost();
      else feed(seat >= 0 ? seat : seats.findIndex((n) => n !== null));
    } else {
      const friends = seats.filter((friend): friend is number => friend !== null);
      if (friends.length) collect(favorites[friends[meals % friends.length]]);
    }
  });
  const coachThemes = [worlds[world], worlds[(world + 1) % 6], worlds[(world + 2) % 6]];
  return (
    <section
      className={`vg-game vg-transport ${paused ? 'vg-paused' : ''} ${settings.calm ? 'vg-calm' : ''}`}
      data-game="transport"
      data-vehicle={vehicle ?? 'choice'}
      data-boarded={boarded}
      data-distance={Math.floor(distance)}
      data-meals={meals}
    >
      <div className="vg-title">
        <div>
          <span className="vg-kicker">
            {vehicle
              ? travelling
                ? 'A JOURNEY WITH YOUR FRIENDS'
                : 'DRAG A FRIEND INTO A WINDOW'
              : 'WHERE SHALL WE GO?'}
          </span>
          <h2>{vehicle ? (travelling ? worlds[world].name : 'All aboard!') : 'Away we go!'}</h2>
        </div>
        {vehicle && (
          <div className="vg-tally">
            <svg viewBox="-35 -35 70 70">
              <path d="M0 24C-51-9-13-41 0-17 13-41 51-9 0 24" fill="#efaba9" />
            </svg>
            <b>{meals}</b>
          </div>
        )}
      </div>
      {!vehicle ? (
        <div className="vg-transport-choose">
          {(['train', 'plane'] as Vehicle[]).map((v) => (
            <button
              className="vg-vehicle-pick"
              key={v}
              aria-label={`Choose ${v}`}
              onClick={() => {
                setVehicle(v);
                speak(
                  v === 'train' ? 'Choo choo! All aboard!' : 'Let’s fly! All aboard!',
                  settings,
                  { interrupt: true },
                );
                playSound(v === 'train' ? 'horn' : 'whoosh', settings);
              }}
              disabled={paused}
            >
              <svg viewBox="0 0 350 290">
                <Cloud x={170} y={24} size={0.9} />
                {v === 'train' ? (
                  <g transform="translate(205 54) scale(1.05)">
                    <foreignObject width="150" height="180">
                      <EngineArt vehicle="train" />
                    </foreignObject>
                  </g>
                ) : (
                  <>
                    <path d="M29 127 5 63h35l60 75" fill="#f2bd70" stroke={INK} strokeWidth="3" />
                    <path
                      d="M24 147q40-27 80-29h170q46 7 55 41-3 26-43 24H83q-37-5-59-36Z"
                      fill="#f4d479"
                      stroke={INK}
                      strokeWidth="3"
                    />
                    <path
                      d="m160 156-88 71h56l112-73M157 118l-47-52h39l81 54"
                      fill="#eea18b"
                      stroke={INK}
                      strokeWidth="3"
                    />
                    {[100, 158, 216].map((x) => (
                      <circle
                        key={x}
                        cx={x}
                        cy="145"
                        r="16"
                        fill="#e1efe5"
                        stroke={INK}
                        strokeWidth="3"
                      />
                    ))}
                  </>
                )}
                {v === 'train' &&
                  [0, 1].map((i) => (
                    <g key={i} transform={`translate(${15 + i * 98} 120)`}>
                      <rect
                        width="86"
                        height="85"
                        rx="13"
                        fill={passengerColors[i]}
                        stroke={INK}
                        strokeWidth="3"
                      />
                      <rect x="16" y="12" width="54" height="44" rx="9" fill="#e6efd7" />
                      <Passenger index={i} x={43} y={37} size={0.53} />
                      <WheelArt style="round" x={21} y={88} />
                      <WheelArt style="star" x={66} y={88} />
                    </g>
                  ))}
              </svg>
              <strong>{v === 'train' ? 'Happy train' : 'Little plane'}</strong>
              <span>{v === 'train' ? 'Choo choo!' : 'Up, up, and away!'}</span>
              <Icon name="go" />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="vg-main-scene vg-transport-stage" data-testid="transport-scene">
            <svg viewBox="0 0 1000 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <WorldArt index={world} distance={distance} />
              {vehicle === 'train' && (
                <g stroke="#465b61">
                  <path d="M0 407h1000" strokeWidth="10" />
                  <path
                    d="M0 419h1000"
                    strokeWidth="13"
                    strokeDasharray="12 25"
                    strokeDashoffset={distance * 2}
                  />
                </g>
              )}
            </svg>
            {!travelling && (
              <div className="vg-boarding-instruction">Pick a friend · pop them in a window</div>
            )}
            {travelling &&
              foods.map((f, i) => (
                <button
                  key={f}
                  className="vg-floating-food"
                  style={{ left: `${7 + i * 23}%` }}
                  disabled={paused}
                  aria-label={`Collect ${f}`}
                  onClick={() => {
                    setSelected(null);
                    collect(f);
                  }}
                >
                  <FoodArt food={f} />
                </button>
              ))}
            <div
              className={`vg-train-layout ${vehicle === 'plane' ? 'vg-plane-layout' : ''} ${travelling ? 'vg-moving' : ''}`}
            >
              {seats.map((friend, i) => (
                <button
                  key={i}
                  data-coach-seat={i}
                  data-empty={friend === null}
                  data-ready={selected !== null || heldFood !== null}
                  className={`vg-coach ${friend !== null && reactions[friend] ? `vg-${reactions[friend].kind}` : ''}`}
                  style={{ '--coach': coachThemes[i].color } as React.CSSProperties}
                  aria-label={`${coachThemes[i].coach} coach ${i + 1}${friend === null ? ', empty' : `, ${passengerNames[friend]}`}`}
                  onClick={() => seatTap(i)}
                  disabled={paused}
                >
                  <span className="vg-coach-window">
                    {friend === null ? (
                      <span className="vg-seat-nudge">+</span>
                    ) : (
                      <svg viewBox="-52 -55 104 110" aria-hidden="true">
                        <g className="vg-friend-breathe">
                          <ellipse cy="36" rx="26" ry="23" fill={passengerColors[friend]} />
                          <Passenger
                            index={friend}
                            size={0.88}
                            mood={reactions[friend]?.kind ?? 'neutral'}
                          />
                        </g>
                        {reactions[friend]?.kind === 'happy' && (
                          <g fill="#eb929e">
                            <path
                              d="M-32-29q-15-16-20-3-3 9 20 22 23-13 20-22-5-13-20 3"
                              transform="translate(24 -10) scale(.6)"
                            />
                          </g>
                        )}
                      </svg>
                    )}
                  </span>
                  <span className="vg-seat-label">
                    <CoachBadge index={(world + i) % 6} />
                    {coachThemes[i].coach}
                  </span>
                  {friend !== null && travelling && !reactions[friend] && (
                    <span className="vg-feed-wish">
                      <FoodArt food={favorites[friend]} />
                    </span>
                  )}
                  {friend !== null && reactions[friend] && (
                    <span className="vg-reaction">{reactions[friend].label}</span>
                  )}
                </button>
              ))}
              <div className="vg-engine">
                <EngineArt vehicle={vehicle} />
                <button
                  className="vg-cat"
                  aria-label="Pet the rooftop cat"
                  onClick={cat}
                  disabled={paused}
                >
                  <CatArt meow={meowing} />
                </button>
                {meowing && <span className="vg-cat-speech">Meow!</span>}
              </div>
            </div>
            {binMessage && <div className="vg-boarding-instruction">All tidy! Thank you!</div>}
          </div>
          {!travelling ? (
            <div className="vg-passenger-dock">
              {passengerNames.map((name, i) => (
                <button
                  key={name}
                  className="vg-passenger-button"
                  data-boarded={seats.includes(i)}
                  aria-label={`Board ${name}`}
                  aria-pressed={selected === i}
                  onPointerDown={(e) => startDrag(e, i)}
                  onPointerMove={moveDrag}
                  onPointerUp={(e) => endDrag(e)}
                  onPointerCancel={(e) => endDrag(e, true)}
                  onLostPointerCapture={() => {
                    if (gesture.current?.id === i) {
                      gesture.current = null;
                      setDrag(null);
                    }
                  }}
                  onClick={(e) => {
                    if (e.detail === 0 && !paused && !justDragged.current) {
                      setSelected(i);
                      setHeldFood(null);
                    }
                  }}
                  disabled={paused}
                >
                  <svg viewBox="-57 -60 114 112">
                    <Passenger index={i} />
                  </svg>
                  <span>{name}</span>
                </button>
              ))}
              <button
                className="vg-passenger-button vg-start-button"
                aria-label={vehicle === 'train' ? 'Start train journey' : 'Start plane journey'}
                onClick={() => {
                  setSelected(null);
                  if (boarded === 0) {
                    setSeats([0, 1, 2]);
                  }
                  setTravelling(true);
                  playSound(vehicle === 'train' ? 'horn' : 'whoosh', settings);
                  speak('Let’s go!', settings, { interrupt: true });
                }}
                disabled={paused}
              >
                <Icon name="go" />
                <span>Let's go!</span>
              </button>
            </div>
          ) : (
            <div className="vg-controls">
              <button
                aria-label="Change passengers"
                disabled={paused}
                onClick={() => {
                  setTravelling(false);
                  setHeldFood(null);
                }}
              >
                <Icon name="stop" />
                <span>Station</span>
              </button>
              <div className="vg-inventory" aria-label="Collected food">
                {foods.map((f) => (
                  <button
                    key={f}
                    data-empty={inventory[f] === 0}
                    aria-label={`Feed with ${f}, ${inventory[f]} collected`}
                    aria-pressed={heldFood === f}
                    disabled={paused || inventory[f] === 0}
                    onClick={() => {
                      setSelected(null);
                      setHeldFood(f);
                      playTone(4, settings);
                    }}
                  >
                    <FoodArt food={f} />
                    <small>{inventory[f]}</small>
                  </button>
                ))}
              </div>
              <button aria-label="Put it in the bin" disabled={paused} onClick={compost}>
                <Icon name="bin" />
                <span>Bin</span>
              </button>
            </div>
          )}
          <div className="vg-transport-foot">
            <button
              className="vg-swap-button"
              aria-label="Choose a different vehicle"
              onClick={() => {
                setTravelling(false);
                setVehicle(null);
                setHeldFood(null);
                setSelected(null);
              }}
              disabled={paused}
            >
              <Icon name="swap" />
            </button>
            <span>
              {travelling
                ? heldFood
                  ? 'Tap a friend to share!'
                  : 'Pick a snack. Feed a friend.'
                : selected === null
                  ? 'Ready? Off we go!'
                  : `${passengerNames[selected]} is ready for a seat`}
            </span>
            {travelling && (
              <button
                className="vg-swap-button"
                aria-label="Say choo choo"
                onClick={() => {
                  if (!paused) playSound('horn', settings);
                }}
                disabled={paused}
              >
                <Icon name="horn" />
              </button>
            )}
          </div>
        </>
      )}
      {drag && (
        <div className="vg-drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <svg viewBox="-55 -60 110 110">
            <Passenger index={drag.id} />
          </svg>
        </div>
      )}
    </section>
  );
}
