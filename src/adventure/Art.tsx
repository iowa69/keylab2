import type { SVGProps } from 'react';
import type { GameId } from './types';
type P = SVGProps<SVGSVGElement>;
export function Face({
  x = 50,
  y = 50,
  happy = true,
}: {
  x?: number;
  y?: number;
  happy?: boolean;
}) {
  return (
    <g fill="#4e3d38">
      <ellipse cx={x - 10} cy={y} rx="2.8" ry="3.6" />
      <ellipse cx={x + 10} cy={y} rx="2.8" ry="3.6" />
      <path
        d={happy ? `M${x - 6} ${y + 8}q6 8 12 0` : `M${x - 5} ${y + 10}h10`}
        fill="none"
        stroke="#4e3d38"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <ellipse cx={x - 18} cy={y + 7} rx="5" ry="3" fill="#ec9289" />
      <ellipse cx={x + 18} cy={y + 7} rx="5" ry="3" fill="#ec9289" />
    </g>
  );
}
export function Star(props: P) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path
        d="m50 8 13 26 29 4-21 21 5 30-26-14-26 14 5-30L8 38l29-4z"
        fill="#f8cf55"
        stroke="#e9b63d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Face x={50} y={48} />
    </svg>
  );
}
export function Animal({
  kind = 'bear',
  ...props
}: P & { kind?: 'bear' | 'cat' | 'pig' | 'duck' | 'bunny' }) {
  const color =
    kind === 'pig'
      ? '#f6b0b3'
      : kind === 'duck'
        ? '#f9d471'
        : kind === 'cat'
          ? '#f2bd79'
          : kind === 'bunny'
            ? '#f7efe1'
            : '#b48866';
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <ellipse cx="50" cy="88" rx="34" ry="7" fill="#473c3314" />
      {kind === 'bunny' ? (
        <g fill={color} stroke="#d8cbba" strokeWidth="2">
          <ellipse cx="34" cy="24" rx="11" ry="23" transform="rotate(-10 34 24)" />
          <ellipse cx="66" cy="24" rx="11" ry="23" transform="rotate(10 66 24)" />
          <path d="M33 10v22m34-22v22" stroke="#e6adaa" strokeWidth="6" strokeLinecap="round" />
        </g>
      ) : kind === 'cat' ? (
        <path d="m18 48 2-34 25 19h10l25-19 2 34" fill={color} />
      ) : (
        kind !== 'duck' && (
          <g fill={color}>
            <circle cx="25" cy="29" r="15" />
            <circle cx="75" cy="29" r="15" />
          </g>
        )
      )}
      <ellipse cx="50" cy="66" rx="31" ry="25" fill={color} />
      <rect x="15" y="29" width="70" height="52" rx="27" fill={color} />
      <Face x={50} y={48} />
      {kind === 'pig' && (
        <g>
          <ellipse cx="50" cy="63" rx="14" ry="10" fill="#df868f" />
          <circle cx="45" cy="63" r="2.5" fill="#9e5b68" />
          <circle cx="55" cy="63" r="2.5" fill="#9e5b68" />
        </g>
      )}
      {kind === 'duck' && <path d="M38 59q12-8 24 0-12 15-24 0" fill="#e78c48" />}
      <g fill={color}>
        <ellipse cx="30" cy="85" rx="11" ry="7" />
        <ellipse cx="70" cy="85" rx="11" ry="7" />
      </g>
    </svg>
  );
}
export function Rocket(props: P) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="m40 70 10 26 10-26" fill="#f5b749" />
      <path d="m30 48-15 22 20-2m35-20 15 22-20-2" fill="#ef7771" />
      <path d="M50 6Q24 27 32 72h36Q76 27 50 6" fill="#fff8e7" />
      <path d="M50 6Q39 15 35 28h30Q61 15 50 6" fill="#e87b72" />
      <circle cx="50" cy="43" r="13" fill="#85c7d4" stroke="#decfba" strokeWidth="5" />
      <path d="m45 39 7-3" stroke="#e8faf9" strokeWidth="3" strokeLinecap="round" />
      <rect x="38" y="67" width="24" height="8" rx="3" fill="#6e91a3" />
    </svg>
  );
}
export const planetColors = [
  '#b2a697',
  '#edbe88',
  '#78c3b6',
  '#db8d6c',
  '#d4ad8b',
  '#e8cb86',
  '#9edbd9',
  '#6c8ecc',
];
export function Planet({ index = 2, ...props }: P & { index?: number }) {
  const color = planetColors[index];
  return (
    <svg viewBox="0 0 100 100" {...props}>
      {index === 5 && (
        <ellipse
          cx="50"
          cy="52"
          rx="47"
          ry="15"
          fill="none"
          stroke="#c7a96d"
          strokeWidth="9"
          transform="rotate(-23 50 52)"
        />
      )}
      <circle cx="50" cy="50" r="33" fill={color} />
      {index === 2 ? (
        <g fill="#78a571">
          <path d="m28 29 19-9 9 14-8 15-20-3zM55 50l21 7-8 17-13 4-9-15z" />
        </g>
      ) : (
        <g stroke="#fff6e0" strokeWidth={index === 4 ? 9 : 5} opacity=".3" fill="none">
          <path d="M23 34q26 16 54 0M18 52q31 12 63-1M27 70q23 8 46-1" />
        </g>
      )}
      <Face x={50} y={49} />
      {index === 5 && <path d="M9 61Q40 77 92 36" fill="none" stroke="#e6cf9c" strokeWidth="7" />}
    </svg>
  );
}
export function Cone({ colors = ['#eab2bf', '#aa7960'], ...props }: P & { colors?: string[] }) {
  return (
    <svg viewBox="0 0 100 130" {...props}>
      <path d="m22 69 28 57 28-57" fill="#e6b578" stroke="#c88f57" strokeWidth="2" />
      <path
        d="m32 82 30 29m-23-36 28 27M68 82l-29 28m22-35-28 29"
        fill="none"
        stroke="#c88f57"
        strokeWidth="2"
      />
      {colors.map((color, i) => (
        <g key={i}>
          <path
            d={`M22 ${75 - i * 20}a28 26 0 0 1 56 0q0 10-10 5-9 8-18 0-9 8-18 0-10 5-10-5`}
            fill={color}
          />
          {i === colors.length - 1 && <Face x={50} y={61 - i * 20} />}
        </g>
      ))}
    </svg>
  );
}
function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      d="M-42 8a17 17 0 0 1 22-22 24 24 0 0 1 45 0A16 16 0 0 1 44 8Z"
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="#fffaf0"
      opacity=".7"
    />
  );
}
export function GameArt({ id, ...props }: P & { id: GameId }) {
  return (
    <svg viewBox="0 0 360 210" aria-hidden="true" {...props}>
      <Cloud x={55} y={39} scale={0.65} />
      <Cloud x={299} y={49} scale={0.9} />
      {id === 'garage' ? (
        <>
          <path d="M0 174Q90 139 177 172T360 165V210H0" fill="#d3b073" opacity=".6" />
          <rect x="248" y="38" width="69" height="103" rx="12" fill="#f7e6b7" />
          <path d="M254 65h57m-57 22h57m-57 22h57" stroke="#d8bd84" strokeWidth="6" />
          <path d="m63 131 29-59h95l43 59" fill="#e87965" />
          <path d="m111 81-20 43h106l-27-43" fill="#d7ecde" />
          <Animal kind="bunny" x="115" y="73" width="57" height="60" />
          <rect x="48" y="120" width="204" height="51" rx="20" fill="#e87965" />
          <rect x="225" y="131" width="25" height="13" rx="6" fill="#f8e7b4" />
          {[91, 208].map((x) => (
            <g key={x}>
              <circle cx={x} cy="170" r="25" fill="#4b5b5b" />
              <circle cx={x} cy="170" r="12" fill="#f7edcf" />
            </g>
          ))}
          <Star x="262" y="126" width="49" height="49" />
        </>
      ) : id === 'runner' ? (
        <>
          <path d="M0 106 36 59 93 132 128 74 185 137 272 65 360 119v91H0" fill="#83ad86" />
          <path d="m157 99-57 111h169L200 99" fill="#e6cd98" />
          <path d="m181 109-5 26m-5 17-10 48" stroke="#f9ebbb" strokeWidth="5" />
          {[33, 284].map((x) => (
            <g key={x}>
              <rect x={x + 14} y="90" width="12" height="83" rx="5" fill="#99775f" />
              <circle cx={x + 20} cy="83" r="34" fill="#639b77" />
              <circle cx={x + 6} cy="63" r="24" fill="#71aa82" />
            </g>
          ))}
          <Star x="199" y="60" width="50" height="50" />
          <Animal kind="bunny" x="132" y="107" width="88" height="94" />
          <path
            d="m108 161-16 11m143-23 17 7"
            stroke="#fffae4"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      ) : id === 'space' ? (
        <>
          <g fill="#fff8d1">
            {[
              [29, 75],
              [119, 33],
              [188, 172],
              [311, 112],
              [256, 26],
              [88, 174],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 5} />
            ))}
          </g>
          <Planet index={5} x="193" y="57" width="139" height="139" />
          <Planet index={2} x="22" y="118" width="78" height="78" />
          <Rocket
            x="72"
            y="22"
            width="143"
            height="169"
            style={{ transform: 'rotate(22deg)', transformOrigin: '140px 95px' }}
          />
        </>
      ) : id === 'treats' ? (
        <>
          <path d="M0 167q85-26 173 0t187 0v43H0" fill="#d598a4" />
          <Cone colors={['#a7755d', '#f4e5b8', '#e694a7']} x="37" y="21" width="118" height="173" />
          <rect
            x="206"
            y="78"
            width="91"
            height="116"
            rx="14"
            fill="#896454"
            transform="rotate(10 250 130)"
          />
          {[0, 1, 2].map((i) => (
            <g key={i} transform="rotate(10 250 130)">
              <rect x="214" y={86 + i * 33} width="32" height="26" rx="5" fill="#b18267" />
              <rect x="254" y={86 + i * 33} width="32" height="26" rx="5" fill="#b18267" />
            </g>
          ))}
          <path
            d="m182 47 4 11m-22-5 7 7m112-26-5 11"
            stroke="#fff5dd"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      ) : id === 'transport' ? (
        <>
          <path d="M0 173h360" stroke="#789fad" strokeWidth="7" />
          <path d="M0 184h360" stroke="#fff9e4" strokeWidth="5" strokeDasharray="13 12" />
          <g transform="translate(29 102)">
            <rect width="66" height="63" rx="10" fill="#e99069" />
            <rect x="8" y="8" width="48" height="28" rx="7" fill="#f9eccb" />
            <rect x="53" y="24" width="60" height="39" rx="7" fill="#e99069" />
            <path d="M79 24V4h16v20" fill="#e99069" />
            {[20, 87].map((x) => (
              <circle key={x} cx={x} cy="64" r="14" fill="#506976" />
            ))}
          </g>
          <g transform="translate(210 48) rotate(-14)">
            <path d="m-39 16 112 0q18 5 0 18H-30Z" fill="#fcf1d9" />
            <path d="m-3 19 35-42 18 1-14 42m-35 11 35 38 17-1-14-37" fill="#e77b70" />
            <circle cx="52" cy="25" r="6" fill="#80b6c7" />
          </g>
        </>
      ) : id === 'letters' ? (
        <>
          <path d="M0 174q85-26 173 0t187 0v43H0" fill="#b3bd77" />
          {[
            { x: 42, y: 65, c: '#ec9979', l: 'A' },
            { x: 123, y: 112, c: '#8fb7ad', l: '2' },
            { x: 209, y: 77, c: '#bd9dba', l: 'B' },
          ].map((a) => (
            <g
              key={a.l}
              transform={`translate(${a.x} ${a.y}) rotate(${a.l === 'A' ? -8 : 8} 40 40)`}
            >
              <rect width="81" height="81" rx="18" fill={a.c} />
              <rect x="7" y="6" width="67" height="66" rx="12" fill="#fff5dc" opacity=".5" />
              <text x="40" y="58" textAnchor="middle" fill="#fffaf0" fontSize="53" fontWeight="900">
                {a.l}
              </text>
            </g>
          ))}
          <path d="m296 50 15 25q11 22-15 22t-15-22z" fill="#e9847b" />
        </>
      ) : id === 'music' ? (
        <>
          <path d="M0 178q175-44 360 0v32H0" fill="#bc9ec9" />
          <rect x="64" y="117" width="231" height="72" rx="17" fill="#fbf4df" />
          {['#e78d79', '#efbd65', '#aabc78', '#8dbbb5', '#ac9bc4', '#d09cb4'].map((c, i) => (
            <rect key={c} x={74 + i * 35} y="129" width="29" height="48" rx="6" fill={c} />
          ))}
          <Animal x="127" y="29" width="103" height="98" />
          <g fill="#fff5db">
            <path d="M66 44v42a11 8 0 1 1-6-8V46l30-8v36a11 8 0 1 1-6-8V44Z" />
            <path d="M275 31v31a10 8 0 1 1-6-8V31Z" />
          </g>
        </>
      ) : id === 'splash' ? (
        <>
          <path d="M0 145q90-24 181 7t179-7v65H0" fill="#8cba9b" />
          <ellipse cx="166" cy="180" rx="109" ry="18" fill="#81bfc1" />
          <Animal kind="pig" x="170" y="66" width="111" height="114" />
          <g fill="#a18060">
            <circle cx="204" cy="135" r="9" />
            <circle cx="232" cy="111" r="8" />
          </g>
          <path d="M40 187v-36q0-32 30-32" fill="none" stroke="#e9ae69" strokeWidth="14" />
          <path d="m63 121 22-12" stroke="#629eb0" strokeWidth="17" strokeLinecap="round" />
          <path
            d="M91 108q59-91 116-13"
            fill="none"
            stroke="#eafaff"
            strokeWidth="9"
            strokeDasharray="4 15"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d="M0 163q90-24 181 7t179-7v47H0" fill="#aeae7e" />
          <Animal x="19" y="87" width="103" height="108" />
          <path d="m139 132 15 59h99l16-59" fill="#ba8a5a" />
          <path
            d="m147 150 114 0m-109 17h104m-87-31 4 50m23-50v50m25-50-4 50"
            stroke="#edc68d"
            strokeWidth="5"
          />
          {[
            [166, 61, '#de7c68'],
            [220, 91, '#e9b755'],
            [268, 36, '#919fc5'],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="22" fill={String(c)} />
              <path
                d={`m${x} ${Number(y) - 19}q0-14 12-15`}
                fill="none"
                stroke="#7c9a67"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
