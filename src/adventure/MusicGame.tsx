import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, RotateCcw } from 'lucide-react';
import { Animal, Star } from './Art';
import { hush, playTone } from './audio';
import { useGameKeys } from './useGameKeys';
import type { GameProps } from './types';
export const songs = [
  {
    name: 'Twinkle, twinkle',
    picture: 'star',
    notes: [
      0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1, 0, 0, 4,
      4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0,
    ],
  },
  {
    name: 'Mary had a little lamb',
    picture: 'lamb',
    notes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4, 2, 1, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 0],
  },
  {
    name: 'Row your boat',
    picture: 'boat',
    notes: [0, 0, 0, 1, 2, 2, 1, 2, 3, 4, 7, 7, 7, 4, 4, 4, 2, 2, 2, 0, 0, 0, 4, 3, 2, 1, 0],
  },
];
const colors = [
  '#e89985',
  '#efb870',
  '#ead073',
  '#adc38b',
  '#87bdba',
  '#93b4cf',
  '#b8a0cd',
  '#d4a1bd',
];
function SongPicture({ picture }: { picture: string }) {
  return picture === 'star' ? (
    <Star />
  ) : picture === 'lamb' ? (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <g fill="#fff9e5" stroke="#d9cbac" strokeWidth="2">
        {[
          [30, 30],
          [50, 25],
          [70, 30],
          [25, 50],
          [75, 50],
          [30, 70],
          [50, 75],
          [70, 70],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="16" />
        ))}
      </g>
      <ellipse cx="50" cy="51" rx="23" ry="27" fill="#b69786" />
      <circle cx="42" cy="49" r="3" fill="#514542" />
      <circle cx="58" cy="49" r="3" fill="#514542" />
      <path d="M44 60q6 6 12 0" fill="none" stroke="#514542" strokeWidth="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M15 65h73L74 84H32Z" fill="#df9974" />
      <path
        d="M52 15v50m0-47-31 39h31m5-35 25 35H57"
        fill="#fff2cc"
        stroke="#bf9875"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M8 90q12-9 24 0 12-9 24 0 12-9 24 0" fill="none" stroke="#8cbdc4" strokeWidth="5" />
    </svg>
  );
}
export function MusicGame({ settings, paused, onCelebrate }: GameProps) {
  const [song, setSong] = useState(0),
    [index, setIndex] = useState(0),
    [free, setFree] = useState(false),
    [listening, setListening] = useState(false),
    [active, setActive] = useState(-1),
    [beat, setBeat] = useState(0);
  const current = songs[song],
    finished = index >= current.notes.length;
  const advanceRef = useRef<() => void>(() => {});
  const fingers = useRef(new Map<number, number>());
  function note(chosen?: number) {
    if (paused) return;
    if (!free && finished) {
      setIndex(0);
      setListening(false);
      return;
    }
    const n = free ? (chosen ?? beat % 8) : current.notes[index];
    playTone(n, settings, 0.55);
    setActive(n);
    setBeat((b) => b + 1);
    if (!free) {
      const next = index + 1;
      setIndex(next);
      if (next === current.notes.length) {
        setListening(false);
        onCelebrate(`Played ${current.name}`);
      }
    }
  }
  advanceRef.current = () => note();
  useEffect(() => {
    if (!listening || paused || !settings.sound) return;
    const t = setInterval(() => advanceRef.current(), 550);
    return () => clearInterval(t);
  }, [listening, paused, settings.sound]);
  useEffect(() => {
    if (!settings.sound) setListening(false);
  }, [settings.sound]);
  useEffect(() => {
    if (paused) fingers.current.clear();
  }, [paused]);
  useEffect(() => {
    if (active < 0 || paused) return;
    const t = setTimeout(() => setActive(-1), 330);
    return () => clearTimeout(t);
  }, [active, beat, paused]);
  useEffect(() => () => hush(), []);
  useGameKeys(paused, (key) => {
    setListening(false);
    const mapped = 'asdfghjk'.indexOf(key.toLowerCase());
    note(mapped < 0 ? key.charCodeAt(0) % 8 : mapped);
  });
  function choose(i: number) {
    if (paused) return;
    setSong(i);
    setIndex(0);
    setFree(false);
    setListening(false);
    setActive(-1);
    hush();
  }
  return (
    <div
      className={`music-game ${paused ? 'is-paused' : ''}`}
      data-testid="music-game"
      data-notes-played={index}
    >
      <div className="song-picker">
        {songs.map((s, i) => (
          <button
            key={s.name}
            onClick={() => choose(i)}
            aria-pressed={song === i && !free}
            disabled={paused}
          >
            <SongPicture picture={s.picture} />
            <span>{s.name}</span>
          </button>
        ))}
      </div>
      <div className="music-stage">
        <span className="music-note note-left" key={`left${beat}`} aria-hidden="true">
          ♪
        </span>
        <span className="music-note note-right" key={`right${beat}`} aria-hidden="true">
          ♫
        </span>
        <div className={`band-friend ${active >= 0 ? 'playing' : ''}`}>
          <Animal kind="bunny" />
        </div>
        <div className="song-scene">
          <SongPicture picture={current.picture} />
          <h2>
            {free ? 'Make your own music' : finished ? 'You played a whole song!' : current.name}
          </h2>
          <p>
            {free
              ? 'Every color has its own sound.'
              : finished
                ? 'A little round of applause for you.'
                : 'Press any key or piano color to play the song.'}
          </p>
        </div>
        <div className={`band-friend second ${active >= 0 ? 'playing' : ''}`}>
          <Animal />
        </div>
      </div>
      {!free && (
        <div
          className="song-progress"
          aria-label={`${index} of ${current.notes.length} notes played`}
        >
          <span style={{ width: `${(index / current.notes.length) * 100}%` }} />
        </div>
      )}
      <div
        className="piano"
        aria-label="Color piano"
        onPointerDown={(event) => {
          if (paused) return;
          const key = (event.target as Element).closest<HTMLElement>('[data-piano-key]');
          if (!key) return;
          const chosen = Number(key.dataset.pianoKey);
          event.currentTarget.setPointerCapture(event.pointerId);
          fingers.current.set(event.pointerId, chosen);
          setListening(false);
          note(chosen);
        }}
        onPointerMove={(event) => {
          if (paused || !fingers.current.has(event.pointerId)) return;
          const key = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>('[data-piano-key]');
          if (!key || !event.currentTarget.contains(key)) return;
          const chosen = Number(key.dataset.pianoKey);
          if (chosen === fingers.current.get(event.pointerId)) return;
          fingers.current.set(event.pointerId, chosen);
          note(chosen);
        }}
        onPointerUp={(event) => fingers.current.delete(event.pointerId)}
        onPointerCancel={(event) => fingers.current.delete(event.pointerId)}
        onLostPointerCapture={(event) => fingers.current.delete(event.pointerId)}
      >
        {colors.map((color, i) => (
          <button
            key={color}
            className={`${active === i ? 'active' : ''} ${!free && !finished && current.notes[index] === i ? 'next-note' : ''}`}
            style={{ background: color }}
            aria-label={`Piano key ${i + 1}`}
            data-piano-key={i}
            disabled={paused}
            onClick={(event) => {
              if (event.detail !== 0) return;
              setListening(false);
              note(i);
            }}
          >
            <span>{['do', 're', 'mi', 'fa', 'sol', 'la', 'ti', 'do'][i]}</span>
            <b>{i + 1}</b>
          </button>
        ))}
      </div>
      <div className="music-controls">
        <button
          className="small-action"
          disabled={paused}
          aria-pressed={free}
          onClick={() => {
            setFree((v) => !v);
            setListening(false);
            setIndex(0);
            hush();
          }}
        >
          <Music2 />
          {free ? 'Play a song' : 'Free play'}
        </button>
        {!free && (
          <button
            className="big-action"
            disabled={paused || (!settings.sound && !finished)}
            onClick={() => {
              if (finished) {
                setIndex(0);
                setActive(-1);
              } else setListening((v) => !v);
            }}
          >
            {finished ? <RotateCcw /> : listening ? <Pause /> : <Play />}
            {finished ? 'Play again' : listening ? 'Pause song' : 'Listen'}
          </button>
        )}
      </div>
    </div>
  );
}
