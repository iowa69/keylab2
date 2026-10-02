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
  | 'turtle'
  | 'icecream'
  | 'jellyfish'
  | 'kite'
  | 'nest'
  | 'orange'
  | 'pear'
  | 'queen'
  | 'strawberry'
  | 'umbrella'
  | 'volcano'
  | 'whale'
  | 'xylophone'
  | 'yoyo'
  | 'zebra';
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
  { letter: 'I', picture: 'icecream', name: 'Ice cream' },
  { letter: 'J', picture: 'jellyfish', name: 'Jellyfish' },
  { letter: 'K', picture: 'kite', name: 'Kite' },
  { letter: 'L', picture: 'lion', name: 'Lion' },
  { letter: 'M', picture: 'moon', name: 'Moon' },
  { letter: 'N', picture: 'nest', name: 'Nest' },
  { letter: 'O', picture: 'orange', name: 'Orange' },
  { letter: 'P', picture: 'pear', name: 'Pear' },
  { letter: 'Q', picture: 'queen', name: 'Queen' },
  { letter: 'R', picture: 'rabbit', name: 'Rabbit' },
  { letter: 'S', picture: 'strawberry', name: 'Strawberry' },
  { letter: 'T', picture: 'turtle', name: 'Turtle' },
  { letter: 'U', picture: 'umbrella', name: 'Umbrella' },
  { letter: 'V', picture: 'volcano', name: 'Volcano' },
  { letter: 'W', picture: 'whale', name: 'Whale' },
  { letter: 'X', picture: 'xylophone', name: 'Xylophone' },
  { letter: 'Y', picture: 'yoyo', name: 'Yo-yo' },
  { letter: 'Z', picture: 'zebra', name: 'Zebra' },
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
      {kind === 'icecream' && (
        <>
          <path d="M48 77h64l-26 59q-6 10-12 0Z" fill="#D9A46F" />
          <path
            d="m56 94 37 32m-31-20 25 22m17-35-34 30m29-14-20 18"
            stroke="#BA855B"
            strokeWidth="3"
          />
          <circle cx="56" cy="67" r="24" fill="#F3B4C6" />
          <circle cx="104" cy="67" r="24" fill="#B6D5B5" />
          <circle cx="80" cy="39" r="26" fill="#FFF0CD" />
          <path d="M65 21q13-9 24 0" stroke="#FFF9E7" strokeWidth="7" strokeLinecap="round" />
          <Eyes y={62} wide={20} />
          <circle cx="83" cy="11" r="8" fill="#E87F86" />
        </>
      )}
      {kind === 'jellyfish' && (
        <>
          <g stroke="#B6A2CF" strokeWidth="9" strokeLinecap="round">
            <path d="M47 80q-22 20 0 32t-4 24M70 81q-12 21 1 32t-2 24M92 83q16 20 1 34t9 18M113 79q24 24 1 40" />
          </g>
          <path
            d="M27 79C20 7 139 7 133 79q-10 17-23 2-15 20-29 1-16 20-28 0-18 16-26-3"
            fill="#E5AFCD"
          />
          <path d="M44 51q7-17 20-18" stroke="#F5D4E3" strokeWidth="9" strokeLinecap="round" />
          <Eyes y={58} />
        </>
      )}
      {kind === 'kite' && (
        <>
          <path d="M81 98q-37 6-18 23t-15 22" stroke="#8D8AA9" strokeWidth="3" />
          <path d="m63 113-11-6 2 14 9-8 12-4-3 12Z" fill="#B69ACF" />
          <path d="m80 9 50 42-50 51-50-51Z" fill="#F2CD7C" />
          <path d="m80 9 50 42H80ZM80 51v51L30 51Z" fill="#EBA29D" />
          <path d="M80 9v93M30 51h100" stroke="#A98A6B" strokeWidth="2.5" />
          <Eyes y={52} wide={16} />
        </>
      )}
      {kind === 'nest' && (
        <>
          <ellipse cx="80" cy="105" rx="65" ry="24" fill="#AA8767" />
          <ellipse cx="55" cy="82" rx="20" ry="26" fill="#E5D6B7" />
          <ellipse cx="101" cy="80" rx="21" ry="29" fill="#F0DCA2" />
          <path d="m48 86 7 8 7-8m32-2 7 8 7-8" fill="#DEA569" />
          <g fill="#655B50">
            <circle cx="47" cy="76" r="3" />
            <circle cx="63" cy="76" r="3" />
            <circle cx="93" cy="74" r="3" />
            <circle cx="109" cy="74" r="3" />
          </g>
          <path d="M15 105q65 16 130 0-12 39-65 34-57 4-65-34" fill="#C3A080" />
          <g stroke="#967A62" strokeWidth="4" strokeLinecap="round">
            <path d="m26 113 77 16m-64 1 85-18M21 102l105 29M49 106l88 7" />
          </g>
          <path d="M25 86q-20-18-7-36 22 9 15 36" fill="#91B495" />
        </>
      )}
      {kind === 'orange' && (
        <>
          <circle cx="80" cy="83" r="52" fill="#EFB370" />
          <path d="M79 32q-1-15 9-22" stroke="#9C825E" strokeWidth="6" strokeLinecap="round" />
          <path d="M84 25q20-28 43-5-17 19-43 5" fill="#8DBB93" />
          <path d="M43 61q-11 13-8 27" stroke="#F9D295" strokeWidth="8" strokeLinecap="round" />
          <Eyes y={82} />
          <g fill="#D99859">
            {[
              [42, 105],
              [52, 115],
              [67, 122],
              [102, 116],
              [118, 100],
              [120, 76],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="2" />
            ))}
          </g>
        </>
      )}
      {kind === 'pear' && (
        <>
          <path
            d="M61 41q19-23 37 0 4 28 23 45 33 49-40 51-73-2-44-48 21-25 24-48"
            fill="#C4D59C"
          />
          <path d="M79 30q-3-14 6-23" stroke="#957B5F" strokeWidth="7" strokeLinecap="round" />
          <path d="M85 22q17-27 39-12-10 25-39 12" fill="#80A984" />
          <path d="M48 88q-13 24 5 30" stroke="#DDE8B8" strokeWidth="8" strokeLinecap="round" />
          <Eyes y={91} />
          <ellipse cx="49" cy="108" rx="8" ry="4" fill="#DDAAA0" />
          <ellipse cx="110" cy="108" rx="8" ry="4" fill="#DDAAA0" />
        </>
      )}
      {kind === 'queen' && (
        <>
          <path d="M36 78 27 32l34 24m38-1 34-23-9 48" fill="#D5B594" />
          <rect x="28" y="53" width="104" height="83" rx="37" fill="#E3C6A5" />
          <path d="m42 45-6-26 22 11L80 7l22 23 22-11-6 26Z" fill="#EFCA73" />
          <path d="M42 47h76" stroke="#D6AA56" strokeWidth="8" strokeLinecap="round" />
          <circle cx="80" cy="32" r="7" fill="#B397CF" />
          <circle cx="51" cy="34" r="4" fill="#DF9DA6" />
          <circle cx="109" cy="34" r="4" fill="#91BBAA" />
          <Eyes y={87} />
          <path d="m75 99 5 6 5-6" fill="#BE9291" />
          <path
            d="m32 93 16 6m-16 8 16-2m64-6 16-6m-16 12 16 2"
            stroke="#AE8F79"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'strawberry' && (
        <>
          <path d="M28 67C18 20 141 20 132 67q-16 60-52 72Q43 124 28 67" fill="#EA8E95" />
          <path d="m80 43-27-17 8 24-29-6 17 19 31-12 31 12 17-19-30 6 9-24Z" fill="#88B897" />
          <path d="M80 42q-8-13 0-26" stroke="#6D9A7C" strokeWidth="6" strokeLinecap="round" />
          <Eyes y={79} />
          <g fill="#F9DFAC">
            {[
              [44, 68],
              [113, 65],
              [38, 87],
              [120, 88],
              [48, 108],
              [111, 108],
              [66, 120],
              [91, 126],
            ].map(([x, y]) => (
              <ellipse key={x} cx={x} cy={y} rx="2.3" ry="3.8" />
            ))}
          </g>
        </>
      )}
      {kind === 'umbrella' && (
        <>
          <path
            d="M80 19v101q0 25 21 17 10-4 6-15"
            stroke="#A78576"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M15 82Q27 14 80 22q54-8 65 60-16-14-32 0-16-14-33 0-16-14-32 0-17-14-33 0"
            fill="#9CC9CF"
          />
          <path d="M80 22Q48 37 48 82m32-60q33 15 33 60" stroke="#739EA8" strokeWidth="3" />
          <path d="M48 82q4-46 32-60v60q-16-14-32 0" fill="#F0CF8C" />
          <Eyes y={62} wide={15} />
          <path
            d="m32 14-5 8m107-1-5 8m18 73-5 8"
            stroke="#AECAD7"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'volcano' && (
        <>
          <path d="M14 134 59 51h42l45 83Z" fill="#BBA3B7" />
          <path d="m59 51 21-9 21 9 14 28-18-9-17 14-14-15-21 10Z" fill="#E9B2AB" />
          <ellipse cx="80" cy="51" rx="21" ry="8" fill="#9B7B8E" />
          <path d="M76 37q-24-18-7-27 11-7 18 5 22-13 26 4 3 15-29 18" fill="#EDD3CD" />
          <path d="M72 21q-4-8 3-9" stroke="#FAE5D7" strokeWidth="5" strokeLinecap="round" />
          <Eyes y={109} wide={19} />
          <path d="M24 134h112" stroke="#9CB893" strokeWidth="9" strokeLinecap="round" />
        </>
      )}
      {kind === 'whale' && (
        <>
          <path
            d="M125 74q6-33 29-29 6 20-14 32 5 41-39 53-70 19-82-24C4 49 87 27 116 79Z"
            fill="#94BDCF"
          />
          <path d="M24 102q28 41 81 16-11 28-44 18-27-6-37-34" fill="#D7E7DD" />
          <path d="M78 113q11-18 24-5-1 16-24 17" fill="#73A3BA" />
          <Eyes x={54} y={81} wide={14} />
          <path
            d="M67 39q0-22-19-22m20 21q5-29 25-22"
            stroke="#B6D3E0"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="44" cy="14" r="5" fill="#B6D3E0" />
          <circle cx="98" cy="13" r="5" fill="#B6D3E0" />
        </>
      )}
      {kind === 'xylophone' && (
        <>
          <path
            d="m25 115 110-37m-113 57 119-40"
            stroke="#A08169"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {['#DDA0AE', '#E5B777', '#D5CE88', '#9FC7B4', '#A0BBD7', '#C1A9D4'].map((c, i) => (
            <g key={c} transform={`translate(${28 + i * 19} ${100 - i * 6}) rotate(-16)`}>
              <rect x="-9" y={-28 + i * 2} width="18" height={60 - i * 3} rx="5" fill={c} />
              <circle cy={-18 + i * 2} r="2" fill="#FFF6E6" />
              <circle cy="18" r="2" fill="#FFF6E6" />
            </g>
          ))}
          <path
            d="m35 19 63 62m24-62L66 78"
            stroke="#AD8C73"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="33" cy="17" r="11" fill="#DBAFB9" />
          <circle cx="125" cy="16" r="11" fill="#ABCABB" />
        </>
      )}
      {kind === 'yoyo' && (
        <>
          <path
            d="M103 8q-57 18-25 42t5 37"
            stroke="#A58B79"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse cx="89" cy="100" rx="42" ry="35" fill="#A990C0" transform="rotate(-16 89 100)" />
          <path d="m48 92 40 21" stroke="#766384" strokeWidth="9" />
          <ellipse cx="69" cy="92" rx="39" ry="35" fill="#E8B9BD" transform="rotate(-16 69 92)" />
          <ellipse cx="69" cy="92" rx="25" ry="22" fill="#F4D5CD" />
          <Eyes x={69} y={87} wide={10} />
          <path
            d="m116 72 12-10m-1 34 14 4M31 53l-10-8"
            stroke="#DAC381"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'zebra' && (
        <>
          <path d="M48 48q-28-43-12-43 21 1 25 39m40 0q6-41 24-39 17 2-13 44" fill="#DDDCD5" />
          <path
            d="m40 14 9 24m69-23-11 23"
            stroke="#A8A1A5"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M70 31 68 12l10 8L84 8l5 17 11-8-6 21" fill="#6B6875" />
          <rect x="40" y="34" width="80" height="101" rx="36" fill="#F1EDE0" />
          <path
            d="m42 59 20 9-22 6m3 11 18 8-15 9m72-43-20 9 22 6m-3 11-18 8 15 9M74 36l6 22 7-22"
            fill="#77727D"
          />
          <ellipse cx="80" cy="115" rx="31" ry="21" fill="#C9C3C6" />
          <Eyes y={80} wide={17} />
          <ellipse cx="68" cy="113" rx="3" ry="4" fill="#817985" />
          <ellipse cx="91" cy="113" rx="3" ry="4" fill="#817985" />
          <path d="M73 125q7 5 14 0" stroke="#817985" strokeWidth="2.5" strokeLinecap="round" />
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
