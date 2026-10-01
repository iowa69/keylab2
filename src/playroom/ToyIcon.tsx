import type { ToyId } from './settings';

export function ToyIcon({ toy }: { toy: ToyId }) {
  return (
    <svg viewBox="0 0 100 80" aria-hidden="true" className="toy-icon">
      {toy === 'sea' && (
        <>
          <circle cx="48" cy="39" r="30" fill="#8bd0da" />
          <circle cx="48" cy="39" r="28" fill="#d8f4ed" stroke="#fff" strokeWidth="2" />
          <path d="M32 40 21 31v18Z" fill="#f1b770" />
          <ellipse cx="49" cy="40" rx="19" ry="14" fill="#ffc66d" />
          <path
            d="M28 31q2-10 10-12"
            stroke="#fff"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="78" cy="18" r="8" fill="#e9fcf8" />
          <circle cx="61" cy="56" r="3" fill="#fff" />
        </>
      )}
      {toy === 'bounce' && (
        <>
          <rect
            x="45"
            y="28"
            width="37"
            height="37"
            rx="11"
            fill="#b39aea"
            transform="rotate(10 62 46)"
          />
          <circle cx="30" cy="48" r="22" fill="#ffb36d" />
          <path
            d="M57 8 77 36H39Z"
            stroke="#6acfc5"
            strokeWidth="6"
            fill="#6acfc5"
            strokeLinejoin="round"
          />
        </>
      )}
      {toy === 'paint' && (
        <>
          {['#f091a9', '#ffcc74', '#78d1c6', '#b49ce7'].map((c, i) => (
            <path
              key={c}
              d={`M${15 + i * 9} 64C${8 + i * 9} ${-4 + i * 9} ${94 - i * 9} ${-4 + i * 9} ${86 - i * 9} 64`}
              fill="none"
              stroke={c}
              strokeWidth="8"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
      {toy === 'peek' && (
        <>
          <ellipse cx="48" cy="42" rx="26" ry="31" fill="#a3c989" />
          <path
            d="M23 40 31 46 41 39 50 46 60 39 74 44"
            fill="none"
            stroke="#e7f1d4"
            strokeWidth="3"
          />
          <circle cx="36" cy="25" r="4" fill="#d5e8b6" />
          <circle cx="58" cy="32" r="5" fill="#d5e8b6" />
          <circle cx="54" cy="59" r="5" fill="#d5e8b6" />
        </>
      )}
      {toy === 'garden' && (
        <>
          <path d="M51 70V33" stroke="#7baa6f" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="40" cy="55" rx="13" ry="6" fill="#97c27d" transform="rotate(30 40 55)" />
          <g transform="translate(50 29)">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cy="-13" rx="10" ry="13" fill="#f195a7" transform={`rotate(${a})`} />
            ))}
            <circle r="13" fill="#ffdb89" />
          </g>
        </>
      )}
      {toy === 'stars' && (
        <>
          <path
            d="M50 8 62 29 86 34 69 52 72 75 50 64 28 75 31 52 14 34 38 29Z"
            fill="#ffdc88"
            stroke="#ffdc88"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="87" cy="15" r="3" fill="#b6a6e2" />
          <circle cx="11" cy="62" r="3" fill="#b6a6e2" />
        </>
      )}
      {toy !== 'paint' && (
        <g
          fill="#3d5361"
          transform={`translate(${toy === 'garden' ? 0 : toy === 'bounce' ? -18 : 0} ${toy === 'garden' ? -9 : toy === 'stars' ? 5 : 0})`}
        >
          <ellipse cx="43" cy="36" rx="2" ry="3" />
          <ellipse cx="55" cy="36" rx="2" ry="3" />
          <path
            d="M46 44q3 3 6 0"
            fill="none"
            stroke="#3d5361"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
