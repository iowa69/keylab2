import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { GameProps } from './types';
import { playTone, speak } from './audio';
import { useGameKeys } from './useGameKeys';
import './discovery.css';

type Mode = 'letters' | 'numbers' | 'colors';
type Picture =
  | 'apple'
  | 'butterfly'
  | 'cat'
  | 'dog'
  | 'elephant'
  | 'fish'
  | 'giraffe'
  | 'hedgehog'
  | 'lion'
  | 'moon'
  | 'rabbit'
  | 'turtle';
type Discovery = {
  picture: Picture;
  letter?: string;
  number?: number;
  color?: string;
  name: string;
};
type Session = {
  index: number;
  page: Discovery[];
  hints: number;
  phase: 'play' | 'found' | 'album';
  wrong: string | null;
};
type SafariState = { mode: Mode; sessions: Record<Mode, Session> };
const WORDS: { letter: string; picture: Picture; name: string }[] = [
  { letter: 'A', picture: 'apple', name: 'Apple' },
  { letter: 'B', picture: 'butterfly', name: 'Butterfly' },
  { letter: 'C', picture: 'cat', name: 'Cat' },
  { letter: 'D', picture: 'dog', name: 'Dog' },
  { letter: 'E', picture: 'elephant', name: 'Elephant' },
  { letter: 'F', picture: 'fish', name: 'Fish' },
  { letter: 'G', picture: 'giraffe', name: 'Giraffe' },
  { letter: 'H', picture: 'hedgehog', name: 'Hedgehog' },
  { letter: 'L', picture: 'lion', name: 'Lion' },
  { letter: 'M', picture: 'moon', name: 'Moon' },
  { letter: 'R', picture: 'rabbit', name: 'Rabbit' },
  { letter: 'T', picture: 'turtle', name: 'Turtle' },
];
const COLORS = [
  { name: 'Red', color: '#EF7880' },
  { name: 'Blue', color: '#71A8DB' },
  { name: 'Yellow', color: '#F0C75C' },
  { name: 'Green', color: '#78B993' },
  { name: 'Purple', color: '#B394D9' },
  { name: 'Orange', color: '#EFA365' },
];
const ANIMALS: Picture[] = ['rabbit', 'fish', 'turtle', 'cat', 'butterfly'];
const newSession = (): Session => ({ index: 0, page: [], hints: 0, phase: 'play', wrong: null });
function discoveryFor(mode: Mode, index: number): Discovery {
  if (mode === 'letters') return { ...WORDS[index % WORDS.length] };
  if (mode === 'numbers')
    return {
      picture: ANIMALS[index % ANIMALS.length],
      number: (index % 5) + 1,
      name: String((index % 5) + 1),
    };
  return { picture: 'butterfly', ...COLORS[index % COLORS.length] };
}

function Eyes({ y = 73, x = 80, wide = 19 }: { y?: number; x?: number; wide?: number }) {
  return (
    <g fill="#514A4C">
      <ellipse cx={x - wide} cy={y} rx="3.3" ry="4.5" />
      <ellipse cx={x + wide} cy={y} rx="3.3" ry="4.5" />
      <path
        d={`M${x - 7} ${y + 13}q7 9 14 0`}
        stroke="#514A4C"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
function PictureArt({
  kind,
  color,
  faded = false,
}: {
  kind: Picture;
  color?: string;
  faded?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 160 150"
      fill="none"
      aria-hidden="true"
      className={faded ? 'safari-art-faded' : undefined}
    >
      <ellipse cx="80" cy="136" rx="47" ry="7" fill="#78715412" />
      {kind === 'apple' && (
        <>
          <path
            d="M80 46C55 24 24 44 27 79C29 112 50 139 79 127C106 140 132 111 132 79C132 44 106 25 80 46Z"
            fill="#EF7880"
          />
          <path d="M81 44L84 18" stroke="#806248" strokeWidth="7" strokeLinecap="round" />
          <path d="M86 26C99 7 120 17 121 20C116 37 98 41 86 26Z" fill="#86B784" />
          <path d="M43 61Q36 78 44 91" stroke="#FFB0AD" strokeWidth="8" strokeLinecap="round" />
          <Eyes y={80} />
          <ellipse cx="48" cy="95" rx="9" ry="5" fill="#FCA7A0" />
          <ellipse cx="111" cy="95" rx="9" ry="5" fill="#FCA7A0" />
        </>
      )}
      {kind === 'butterfly' && (
        <>
          <path
            d="M73 70C28-6-7 43 34 82C-1 117 54 151 76 99M87 70C132-6 167 43 126 82C161 117 106 151 84 99"
            fill={color ?? '#B594D8'}
          />
          <path d="M42 47Q16 47 47 79L64 77Z M118 47Q144 47 113 79L96 77Z" fill="#FFFFFF60" />
          <circle cx="49" cy="107" r="12" fill="#F9DC94" />
          <circle cx="111" cy="107" r="12" fill="#F9DC94" />
          <path
            d="M74 49L64 32M86 49L96 32"
            stroke="#665561"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="70" y="46" width="20" height="78" rx="10" fill="#F4C884" />
          <Eyes y={59} wide={5} />
        </>
      )}
      {kind === 'cat' && (
        <>
          <path d="M41 62L34 19L72 44M89 44L127 19L120 66" fill="#DFB388" />
          <path d="M42 32L47 55L63 45M115 32L98 45L112 55" fill="#F6C5B4" />
          <rect x="30" y="42" width="100" height="88" rx="40" fill="#E8BC90" />
          <path d="M73 47L79 61L86 47" fill="#BE936B" />
          <Eyes y={79} />
          <path d="M74 90L80 97L86 90" fill="#AD776D" />
          <path
            d="M27 85L51 91M25 101L49 99M110 91L134 85M112 99L136 101"
            stroke="#A17C60"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'dog' && (
        <>
          <ellipse cx="39" cy="72" rx="20" ry="47" fill="#A9856C" transform="rotate(14 39 72)" />
          <ellipse cx="122" cy="72" rx="20" ry="47" fill="#A9856C" transform="rotate(-14 122 72)" />
          <rect x="40" y="28" width="81" height="103" rx="36" fill="#E5C39B" />
          <ellipse cx="61" cy="67" rx="19" ry="22" fill="#C29B7B" />
          <Eyes y={70} />
          <ellipse cx="80" cy="94" rx="25" ry="20" fill="#FAE4BC" />
          <path d="M67 110Q81 131 94 110" fill="#EFA5A0" />
          <ellipse cx="80" cy="90" rx="10" ry="7" fill="#655149" />
        </>
      )}
      {kind === 'elephant' && (
        <>
          <ellipse cx="34" cy="78" rx="30" ry="40" fill="#A6BCD1" />
          <ellipse cx="127" cy="78" rx="28" ry="40" fill="#A6BCD1" />
          <ellipse cx="33" cy="80" rx="18" ry="26" fill="#CDCFDF" />
          <ellipse cx="128" cy="80" rx="17" ry="26" fill="#CDCFDF" />
          <rect x="38" y="32" width="85" height="95" rx="40" fill="#B9CDDF" />
          <path
            d="M79 91V125Q79 147 107 135"
            stroke="#B9CDDF"
            strokeWidth="23"
            strokeLinecap="round"
          />
          <path d="M74 108L86 107M75 119L86 118" stroke="#97AFC9" strokeWidth="2" />
          <Eyes y={75} />
          <path d="M53 95L56 109L64 99M96 99L104 109L107 95" fill="#FFF4DB" />
        </>
      )}
      {kind === 'fish' && (
        <>
          <path d="M41 76L9 45Q-1 76 12 110L43 94" fill="#EBA967" />
          <ellipse cx="90" cy="81" rx="55" ry="43" fill={color ?? '#F3C779'} />
          <path d="M70 44Q87 7 108 45M78 120L99 136L110 118" fill="#EBA967" />
          <path d="M71 70Q47 78 70 98" fill="#FFDF9B" />
          <Eyes x={109} y={73} wide={15} />
          <circle cx="140" cy="45" r="6" stroke="#A4C4CE" strokeWidth="3" />
          <circle cx="149" cy="24" r="4" stroke="#A4C4CE" strokeWidth="2" />
        </>
      )}
      {kind === 'giraffe' && (
        <>
          <path d="M59 78L53 137H107L100 78" fill="#EBCB81" />
          <path d="M54 39L39 28L33 43L57 52M105 39L123 28L129 43L104 52" fill="#DCB76E" />
          <path d="M65 40L62 18M95 40L99 18" stroke="#D9B16B" strokeWidth="7" />
          <circle cx="62" cy="17" r="7" fill="#A98255" />
          <circle cx="100" cy="17" r="7" fill="#A98255" />
          <rect x="43" y="35" width="75" height="70" rx="28" fill="#F0CF86" />
          <ellipse cx="81" cy="90" rx="31" ry="20" fill="#F7DE9F" />
          <Eyes y={64} wide={17} />
          <path d="M59 112L72 111L77 123L63 127M91 104L104 108L101 124L88 121" fill="#BC945B" />
        </>
      )}
      {kind === 'hedgehog' && (
        <>
          <path
            d="M25 106L13 81L29 80L17 58L35 59L36 36L52 47L66 22L81 42L99 25L106 47L128 40L125 62L146 70L133 88L145 108Z"
            fill="#9F8273"
          />
          <path
            d="M24 106Q30 62 82 62Q125 61 137 108Q130 132 80 132Q38 131 24 106"
            fill="#E6C8A4"
          />
          <Eyes y={95} wide={23} />
          <ellipse cx="79" cy="112" rx="8" ry="6" fill="#69534D" />
          <ellipse cx="43" cy="114" rx="8" ry="4" fill="#F2B2A0" />
          <ellipse cx="117" cy="114" rx="8" ry="4" fill="#F2B2A0" />
        </>
      )}
      {kind === 'lion' && (
        <>
          <path
            d="M80 15L96 26L118 22L125 43L144 58L137 79L143 100L123 115L109 135L88 129L67 139L48 124L27 119L25 95L13 76L26 58L30 34L56 32Z"
            fill="#C8915B"
          />
          <circle cx="43" cy="51" r="16" fill="#E9C17A" />
          <circle cx="115" cy="51" r="16" fill="#E9C17A" />
          <rect x="40" y="42" width="80" height="79" rx="33" fill="#F0CB87" />
          <Eyes y={72} />
          <ellipse cx="80" cy="96" rx="22" ry="17" fill="#FADEAA" />
          <path d="M72 90L80 99L88 90Z" fill="#7F5A48" />
          <path
            d="M67 105Q74 109 80 101Q87 110 94 105"
            stroke="#7F5A48"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'moon' && (
        <>
          <path
            d="M105 19C45 0 11 53 31 102C49 143 108 149 137 103C88 120 52 64 105 19Z"
            fill="#F4D487"
          />
          <Eyes x={61} y={87} wide={15} />
          <path
            d="M122 35L126 46L138 47L128 54L132 66L122 59L111 66L115 54L105 47L118 46Z"
            fill="#D9BDEC"
          />
          <circle cx="126" cy="85" r="5" fill="#C4D9DF" />
        </>
      )}
      {kind === 'rabbit' && (
        <>
          <ellipse cx="59" cy="41" rx="17" ry="39" fill="#D9D5CA" transform="rotate(-9 59 41)" />
          <ellipse cx="99" cy="41" rx="17" ry="39" fill="#D9D5CA" transform="rotate(9 99 41)" />
          <ellipse cx="59" cy="37" rx="8" ry="28" fill="#EABDBC" transform="rotate(-9 59 37)" />
          <ellipse cx="99" cy="37" rx="8" ry="28" fill="#EABDBC" transform="rotate(9 99 37)" />
          <rect x="29" y="59" width="100" height="76" rx="35" fill="#E7E2D7" />
          <Eyes y={90} />
          <ellipse cx="80" cy="106" rx="6" ry="5" fill="#C68D8D" />
          <path d="M73 116L73 125L86 125L86 116" fill="#FFFDF6" />
          <ellipse cx="46" cy="109" rx="9" ry="5" fill="#EFC8BE" />
          <ellipse cx="113" cy="109" rx="9" ry="5" fill="#EFC8BE" />
        </>
      )}
      {kind === 'turtle' && (
        <>
          <ellipse cx="47" cy="121" rx="17" ry="12" fill="#9ABC83" />
          <ellipse cx="106" cy="121" rx="17" ry="12" fill="#9ABC83" />
          <path d="M21 101L8 111L28 115" fill="#9ABC83" />
          <path d="M27 110C12 28 124 25 125 110Z" fill={color ?? '#85B59A'} />
          <path
            d="M67 58L91 62L100 84L83 99L58 92L52 72Z"
            fill="#AFD1A6"
            stroke="#679681"
            strokeWidth="3"
          />
          <path
            d="M28 92L58 92M52 72L40 59M91 62L104 52M100 84L121 77M83 99L87 112"
            stroke="#679681"
            strokeWidth="3"
          />
          <rect x="100" y="81" width="48" height="40" rx="20" fill="#BCD2A1" />
          <Eyes x={127} y={93} wide={11} />
          <path d="M25 112H117" stroke="#63957F" strokeWidth="7" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PaintDrop({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" aria-hidden="true">
      <path d="M40 6C31 26 11 43 11 65C11 104 69 104 69 65C69 43 49 26 40 6Z" fill={color} />
      <path d="M24 65Q20 78 33 85" stroke="#FFFFFF70" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
function MiniDiscovery({ item }: { item: Discovery }) {
  return (
    <>
      <PictureArt kind={item.picture} color={item.color} />
      <b>{item.letter ?? item.number ?? ''}</b>
    </>
  );
}

export function DiscoveryGame({ settings, paused, onCelebrate }: GameProps) {
  const [state, setState] = useState<SafariState>(() => ({
    mode: 'letters',
    sessions: { letters: newSession(), numbers: newSession(), colors: newSession() },
  }));
  const latest = useRef(state);
  latest.current = state;
  const update = (next: SafariState) => {
    latest.current = next;
    setState(next);
  };
  const updateSession = (session: Session) => {
    const current = latest.current;
    update({ ...current, sessions: { ...current.sessions, [current.mode]: session } });
  };
  const win = () => {
    if (paused) return;
    const current = latest.current,
      session = current.sessions[current.mode];
    if (session.phase !== 'play') return;
    const item = discoveryFor(current.mode, session.index);
    const page = [...session.page, item];
    updateSession({
      ...session,
      page,
      hints: 0,
      wrong: null,
      phase: page.length === 3 ? 'album' : 'found',
    });
    playTone(page.length + 4, settings, 0.4);
    speak(
      item.letter
        ? `${item.letter}. ${item.name}!`
        : item.color
          ? `${item.name}!`
          : `${item.number}!`,
      settings,
    );
    if (page.length === 3) onCelebrate('Safari discoveries');
  };
  const next = () => {
    if (paused) return;
    const session = latest.current.sessions[latest.current.mode];
    if (session.phase === 'play') return;
    updateSession({
      ...session,
      index: session.index + 1,
      page: session.phase === 'album' ? [] : session.page,
      hints: 0,
      wrong: null,
      phase: 'play',
    });
    playTone(2, settings, 0.12);
  };
  const choose = (value: string) => {
    if (paused) return;
    const current = latest.current,
      session = current.sessions[current.mode];
    if (session.phase !== 'play') {
      next();
      return;
    }
    const answer = discoveryFor(current.mode, session.index);
    const expected = String(answer.letter ?? answer.number ?? answer.name).toLowerCase();
    if (value.toLowerCase() === expected) {
      win();
      return;
    }
    const hints = session.hints + 1;
    if (settings.mode === 'baby' && hints >= 3) {
      win();
      return;
    }
    updateSession({ ...session, hints, wrong: value });
    playTone(2, settings, 0.13);
    speak(
      current.mode === 'letters'
        ? `Find ${answer.letter}`
        : current.mode === 'numbers'
          ? String(answer.number)
          : answer.name,
      settings,
    );
  };
  useGameKeys(paused, (key) => {
    if (key === 'Escape') return;
    const current = latest.current,
      session = current.sessions[current.mode];
    if (session.phase !== 'play') {
      next();
      return;
    }
    const answer = discoveryFor(current.mode, session.index);
    choose(
      current.mode === 'colors' && key.toLowerCase() === answer.name[0].toLowerCase()
        ? answer.name
        : key,
    );
  });

  const mode = state.mode;
  const session = state.sessions[mode];
  const target = discoveryFor(mode, session.index);
  const choices: Discovery[] =
    mode === 'letters'
      ? [target, discoveryFor(mode, session.index + 1), discoveryFor(mode, session.index + 3)]
      : mode === 'numbers'
        ? [target, discoveryFor(mode, session.index + 1), discoveryFor(mode, session.index + 2)]
        : [target, discoveryFor(mode, session.index + 2), discoveryFor(mode, session.index + 4)];
  const rotated = [...choices.slice(session.index % 3), ...choices.slice(0, session.index % 3)];
  const answerValue = (item: Discovery) => String(item.letter ?? item.number ?? item.name);
  return (
    <section
      className={`discovery-game discovery-${mode} ${settings.calm ? 'discovery-calm' : ''} ${paused ? 'discovery-paused' : ''}`}
      aria-label="Discovery safari"
      data-testid="discovery-game"
      data-phase={session.phase}
      data-mode={mode}
    >
      <nav className="discovery-tabs" aria-label="Choose letters, numbers, or colors">
        <button
          type="button"
          aria-label="Discover letters"
          aria-pressed={mode === 'letters'}
          disabled={paused}
          onClick={() => {
            update({ ...latest.current, mode: 'letters' });
            playTone(0, settings);
          }}
        >
          <span className="discovery-tab-letters" aria-hidden="true">
            <i>A</i>
            <i>B</i>
          </span>
          <b>Letters</b>
        </button>
        <button
          type="button"
          aria-label="Discover numbers"
          aria-pressed={mode === 'numbers'}
          disabled={paused}
          onClick={() => {
            update({ ...latest.current, mode: 'numbers' });
            playTone(2, settings);
          }}
        >
          <span className="discovery-tab-numbers" aria-hidden="true">
            <b>1</b>
            <i />
            <i />
            <i />
          </span>
          <b>Numbers</b>
        </button>
        <button
          type="button"
          aria-label="Discover colors"
          aria-pressed={mode === 'colors'}
          disabled={paused}
          onClick={() => {
            update({ ...latest.current, mode: 'colors' });
            playTone(4, settings);
          }}
        >
          <span className="discovery-tab-colors" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>Colors</b>
        </button>
      </nav>
      <div
        className="discovery-album-trail"
        aria-label={`${session.page.length} of 3 discoveries on this page`}
        role="status"
      >
        <span className="discovery-trail-caption">My little discoveries</span>
        <div>
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className={`discovery-stamp ${session.page[index] ? 'discovery-stamp-filled' : ''}`}
              key={index}
            >
              {session.page[index] ? (
                <MiniDiscovery item={session.page[index]} />
              ) : (
                <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path
                    d="M20 8L23 16L32 17L25 23L27 32L20 27L12 32L14 23L7 17L17 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </span>
          ))}
        </div>
        <span className="discovery-page-count">
          {session.page.length}
          <small> / 3</small>
        </span>
      </div>

      {session.phase === 'album' ? (
        <div className="discovery-album-page">
          <div className="discovery-album-title">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path
                d="M24 3L30 17L45 19L34 29L37 45L24 37L10 45L14 29L3 19L18 17Z"
                fill="#EAC66E"
              />
            </svg>
            <h2>A page of little wonders!</h2>
          </div>
          <div className="discovery-finished-pictures">
            {session.page.map((item, index) => (
              <div
                className="discovery-album-picture"
                key={index}
                style={{ '--card-turn': `${index === 1 ? 3 : -3}deg` } as CSSProperties}
              >
                <MiniDiscovery item={item} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="discovery-next"
            disabled={paused}
            onClick={next}
            aria-label="Start a new discovery page"
          >
            <span aria-hidden="true">↻</span> More discoveries <span aria-hidden="true">➜</span>
          </button>
        </div>
      ) : (
        <div className="discovery-workspace">
          <div
            className={`discovery-target ${session.phase === 'found' ? 'discovery-target-found' : ''}`}
          >
            <svg
              className="discovery-leaf discovery-leaf-left"
              viewBox="0 0 60 90"
              fill="none"
              aria-hidden="true"
            >
              <path d="M51 82Q7 50 13 9Q65 12 51 82Z" fill="#AFC5A0" />
              <path
                d="M51 84L26 26M37 53L18 48M39 58L48 34"
                stroke="#839E7A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="discovery-target-prompt">
              {session.phase === 'found'
                ? 'Look what you found!'
                : mode === 'letters'
                  ? 'Find my letter'
                  : mode === 'numbers'
                    ? 'How many friends?'
                    : 'Find my color'}
            </span>
            {mode === 'letters' && (
              <div className="discovery-letter-target">
                <span className="discovery-huge-letter">{target.letter}</span>
                <div>
                  <PictureArt kind={target.picture} faded={session.phase === 'play'} />
                </div>
              </div>
            )}
            {mode === 'numbers' && (
              <div className="discovery-number-target">
                <div className="discovery-count-friends">
                  {Array.from({ length: target.number! }, (_, index) => (
                    <span key={index}>
                      <PictureArt kind={target.picture} />
                      <i>{session.phase === 'found' || session.hints > 0 ? index + 1 : ''}</i>
                    </span>
                  ))}
                </div>
                <span
                  className={`discovery-number-answer ${session.phase === 'found' || session.hints > 0 ? 'visible-answer' : ''}`}
                >
                  {session.phase === 'found' || session.hints > 0 ? target.number : '?'}
                </span>
              </div>
            )}
            {mode === 'colors' && (
              <div className="discovery-color-target">
                <div className="discovery-target-drop">
                  <PaintDrop color={target.color!} />
                </div>
                <div className="discovery-paint-friend">
                  <PictureArt
                    kind="butterfly"
                    color={session.phase === 'found' ? target.color : '#D5D2C9'}
                  />
                </div>
              </div>
            )}
            {session.phase === 'found' && (
              <span className="discovery-found-name">
                {mode === 'letters'
                  ? `${target.letter} is for ${target.name}`
                  : mode === 'numbers'
                    ? `${target.number} little ${target.number === 1 || target.picture === 'fish' ? target.picture : target.picture === 'butterfly' ? 'butterflies' : `${target.picture}s`}`
                    : `${target.name} butterfly!`}
              </span>
            )}
            {session.phase === 'play' && session.hints > 0 && (
              <span className="discovery-friendly-hint">
                {mode === 'letters'
                  ? 'These two letters look the same'
                  : mode === 'numbers'
                    ? 'Let’s count them together'
                    : 'Look for the same color'}
                <svg viewBox="0 0 30 20" aria-hidden="true">
                  <path d="M3 10H26M18 3L26 10L18 17" />
                </svg>
              </span>
            )}
          </div>

          <div className="discovery-choices-area">
            {session.phase === 'found' ? (
              <div className="discovery-found-action">
                <div className="discovery-found-star" aria-hidden="true">
                  ✦
                </div>
                <button
                  className="discovery-next"
                  type="button"
                  disabled={paused}
                  onClick={next}
                  aria-label="Find the next discovery"
                >
                  Find another <span aria-hidden="true">➜</span>
                </button>
                <small>Tap the arrow or press a key</small>
              </div>
            ) : (
              <>
                <div className="discovery-choices" aria-label="Choose the matching picture">
                  {rotated.map((choice) => {
                    const value = answerValue(choice),
                      correct = value === answerValue(target);
                    return (
                      <button
                        type="button"
                        key={value}
                        disabled={paused}
                        className={`discovery-choice ${session.hints > 0 && correct ? 'discovery-choice-help' : ''} ${session.wrong === value ? 'discovery-choice-nudge' : ''}`}
                        style={{ '--choice-color': choice.color ?? '#F3E3B8' } as CSSProperties}
                        aria-label={
                          mode === 'letters'
                            ? `${choice.letter} for ${choice.name}`
                            : mode === 'numbers'
                              ? `${choice.number} friends`
                              : `${choice.name} paint`
                        }
                        onClick={() => choose(value)}
                      >
                        {mode === 'letters' ? (
                          <>
                            <PictureArt kind={choice.picture} />
                            <strong>{choice.letter}</strong>
                            <span>{choice.name}</span>
                          </>
                        ) : mode === 'numbers' ? (
                          <>
                            <strong>{choice.number}</strong>
                            <span className="discovery-number-dots" aria-hidden="true">
                              {Array.from({ length: choice.number! }, (_, index) => (
                                <i key={index} />
                              ))}
                            </span>
                          </>
                        ) : (
                          <>
                            <PaintDrop color={choice.color!} />
                            <span>{choice.name}</span>
                          </>
                        )}
                        {session.hints > 0 && correct && (
                          <i className="discovery-hint-spark" aria-hidden="true">
                            ✦
                          </i>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="discovery-play-hint">
                  {mode === 'letters'
                    ? 'Match a picture · try a letter key'
                    : mode === 'numbers'
                      ? 'Count the friends · try a number key'
                      : 'Tap a color · paint a butterfly'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
