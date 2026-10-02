import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Home, LockKeyhole, Volume2, VolumeX } from 'lucide-react';
import { loadPreferences, savePreferences } from './playroom/settings';
import { updateApp } from './playroom/offline';
import { games, type GameId } from './adventure/types';
import { Animal, GameArt, Star } from './adventure/Art';
import { ParentPanel } from './adventure/ParentPanel';
import { GarageGame, TransportGame } from './adventure/VehicleGames';
import { RunnerGame } from './adventure/RunnerGame';
import { SpaceGame } from './adventure/SpaceGame';
import { TreatsGame } from './adventure/TreatsGame';
import { DiscoveryGame } from './adventure/DiscoveryGame';
import { MusicGame } from './adventure/MusicGame';
import { SplashGame } from './adventure/SplashGame';
import { ArcadeGame } from './adventure/ArcadeGame';
import { hush, hushVoice, playTone, playSound, speak, unlockAudio } from './adventure/audio';
const components = {
  garage: GarageGame,
  runner: RunnerGame,
  space: SpaceGame,
  treats: TreatsGame,
  transport: TransportGame,
  letters: DiscoveryGame,
  music: MusicGame,
  splash: SplashGame,
  arcade: ArcadeGame,
};
function savedStamps(): GameId[] {
  try {
    const s: unknown = JSON.parse(localStorage.getItem('keylab2-adventure-stamps') || '[]');
    return Array.isArray(s) ? games.map((g) => g.id).filter((id) => s.includes(id)) : [];
  } catch {
    return [];
  }
}
export default function App() {
  const [settings, setSettings] = useState(loadPreferences),
    [active, setActive] = useState<GameId | null>(null),
    [visited, setVisited] = useState<GameId[]>([]),
    [wave, setWave] = useState(0),
    [stamps, setStamps] = useState(savedStamps),
    [parents, setParents] = useState(false),
    [holding, setHolding] = useState(false),
    [rest, setRest] = useState(false),
    [hidden, setHidden] = useState(document.hidden),
    [offline, setOffline] = useState(false),
    [update, setUpdate] = useState(false),
    [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    elapsed = useRef(0),
    playarea = useRef<HTMLDivElement>(null),
    lastGame = useRef<GameId | null>(null);
  const effective = useMemo(
    () => ({ ...settings, calm: settings.calm || reduced }),
    [settings, reduced],
  );
  const paused = parents || rest || hidden;
  const focusPlay = useCallback(
    () =>
      requestAnimationFrame(() => {
        if (playarea.current?.offsetParent) playarea.current.focus({ preventScroll: true });
        else
          document
            .querySelector<HTMLButtonElement>('.game-card[data-game]')
            ?.focus({ preventScroll: true });
      }),
    [],
  );
  useEffect(() => {
    savePreferences(settings);
    if (!settings.sound || settings.volume <= 0) hush();
    else if (!settings.narration) hushVoice();
  }, [settings]);
  useEffect(() => {
    try {
      localStorage.setItem('keylab2-adventure-stamps', JSON.stringify(stamps));
    } catch {
      /* Optional local keepsakes. */
    }
  }, [stamps]);
  useEffect(() => {
    if (paused) hush();
  }, [paused]);
  useEffect(() => {
    if (!active || paused || !settings.breakMinutes) return;
    const t = setInterval(() => {
      elapsed.current++;
      if (elapsed.current >= settings.breakMinutes * 60) setRest(true);
    }, 1000);
    return () => clearInterval(t);
  }, [active, paused, settings.breakMinutes]);
  useEffect(() => {
    let mounted = true;
    const vis = () => setHidden(document.hidden),
      ready = () => {
        if (mounted) setOffline(true);
      },
      changed = () => setUpdate(true);
    const media = matchMedia('(prefers-reduced-motion: reduce)'),
      motion = () => setReduced(media.matches);
    let controlled = !!navigator.serviceWorker?.controller;
    const controller = () => {
      if (controlled) setUpdate(true);
      controlled = true;
    };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('keylab-offline-ready', ready);
    window.addEventListener('keylab-update-ready', changed);
    navigator.serviceWorker?.addEventListener('controllerchange', controller);
    if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(ready);
    media.addEventListener('change', motion);
    return () => {
      mounted = false;
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', vis);
      window.removeEventListener('keylab-offline-ready', ready);
      window.removeEventListener('keylab-update-ready', changed);
      navigator.serviceWorker?.removeEventListener('controllerchange', controller);
      media.removeEventListener('change', motion);
      hush();
    };
  }, []);
  const celebrations = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [
          game.id,
          (_label: string) => setStamps((s) => (s.includes(game.id) ? s : [...s, game.id])),
        ]),
      ) as Record<GameId, (label: string) => void>,
    [],
  );
  function open(id: GameId) {
    if (rest) return;
    hush();
    playTone(4, settings);
    setVisited((previous) => (previous.includes(id) ? previous : [...previous, id]));
    setActive(id);
    const greetings: Record<GameId, string> = {
      garage: 'Let’s make a car!',
      runner: 'Ready for peekaboo?',
      space: 'Let’s fly to the planets!',
      treats: 'What shall we make?',
      transport: 'All aboard, friends!',
      letters: 'Let’s find something!',
      music: 'Let’s make music!',
      splash: 'Ready for a silly splash?',
      arcade: 'Bear would like a picnic!',
    };
    speak(greetings[id], settings, { interrupt: true });
    lastGame.current = id;
    window.scrollTo({ top: 0 });
    focusPlay();
  }
  function home() {
    hush();
    setActive(null);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(`.game-card[data-game="${lastGame.current}"]`)
        ?.focus({ preventScroll: true }),
    );
  }
  useEffect(() => {
    if (active || paused) return;
    const key = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat ||
        (e.target instanceof Element && e.target.closest('[data-ui]'))
      )
        return;
      const number = Number(e.key);
      if (number >= 1 && number <= 9) {
        e.preventDefault();
        open(games[number - 1].id);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  function startHold() {
    if (timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      setParents(true);
    }, 2500);
  }
  function stopHold() {
    clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
  }
  const info = games.find((g) => g.id === active);
  function greet() {
    setWave((v) => v + 1);
    playSound('giggle', settings);
    speak(
      settings.name
        ? `Hello, ${settings.name}! I’m Pip. Let’s play!`
        : 'Hello, little explorer! I’m Pip. Let’s play!',
      settings,
      { interrupt: true },
    );
  }
  return (
    <main
      className={`adventure-app single-screen ${effective.calm ? 'calm' : ''} ${settings.contrast ? 'contrast' : ''}`}
      data-offline-ready={offline}
      data-active-game={active ?? 'home'}
      onPointerDownCapture={() => unlockAudio(settings)}
      onKeyDownCapture={() => unlockAudio(settings)}
      onContextMenu={(event) => {
        if (!(event.target instanceof Element && event.target.closest('input,textarea')))
          event.preventDefault();
      }}
    >
      <header className="app-header" data-ui>
        {active ? (
          <button className="home-button" aria-label="Home — choose another game" onClick={home}>
            <Home />
            <span>Home</span>
          </button>
        ) : (
          <div className="brand">
            <span className="brand-face">
              <Animal kind="bunny" />
            </span>
            <span>
              keylab<sup>2</sup>
              <small>little hands, big adventures</small>
            </span>
          </div>
        )}
        {info && (
          <div className="game-heading">
            <span>{info.tag}</span>
            <h1>{info.name}</h1>
          </div>
        )}
        <div className="header-actions">
          <button
            className="icon-button sound-button"
            aria-label={settings.sound ? 'Turn sound off' : 'Turn sound on'}
            onClick={() => {
              const next = { ...settings, sound: !settings.sound };
              setSettings(next);
              if (next.sound) {
                unlockAudio(next);
                playTone(4, next);
              }
              focusPlay();
            }}
          >
            {settings.sound ? <Volume2 /> : <VolumeX />}
          </button>
          <button
            className={`parent-hold ${holding ? 'holding' : ''}`}
            aria-label="Hold for grown-up settings"
            title="Hold for 2.5 seconds"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              startHold();
            }}
            onPointerUp={() => {
              stopHold();
              if (!parents) focusPlay();
            }}
            onPointerCancel={stopHold}
            onLostPointerCapture={stopHold}
            onBlur={stopHold}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!e.repeat) startHold();
              }
            }}
            onKeyUp={() => {
              stopHold();
              if (!parents) focusPlay();
            }}
          >
            <LockKeyhole size={17} />
            <span>{holding ? 'Keep holding…' : 'Grown-ups'}</span>
            <i />
          </button>
        </div>
      </header>
      <div className="game-shell" hidden={!active}>
        <div
          ref={playarea}
          className="game-body"
          tabIndex={-1}
          inert={paused || !active}
          aria-label={`${info?.name ?? 'Adventure'} play area`}
        >
          {visited.map((id) => {
            const Game = components[id];
            const isActive = id === active;
            return (
              <div
                key={id}
                className="game-panel"
                data-panel={id}
                hidden={!isActive}
                inert={!isActive || paused}
              >
                <Game
                  settings={effective}
                  paused={paused || !isActive}
                  onCelebrate={celebrations[id]}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="playground" hidden={!!active} inert={parents || rest}>
        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR LITTLE WORLD OF PLAY</span>
            <h1>{settings.name ? `Hello, ${settings.name}!` : 'Where shall we go?'}</h1>
            <p>Pick a picture. Make a little magic.</p>
          </div>
          <button className="hello-friend" onClick={greet} aria-label="Say hello to Pip">
            <Animal key={wave} kind="bunny" />
            <span>Hello, friend!</span>
          </button>
        </section>
        <div className="game-grid">
          {games.map((game, i) => (
            <button
              key={game.id}
              data-game={game.id}
              className="game-card"
              aria-label={`Play ${game.name}`}
              onClick={() => open(game.id)}
              onKeyDown={(e) => {
                if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                  e.preventDefault();
                  const jump =
                    e.key === 'ArrowRight'
                      ? 1
                      : e.key === 'ArrowLeft'
                        ? -1
                        : e.key === 'ArrowDown'
                          ? 3
                          : -3;
                  document
                    .querySelector<HTMLButtonElement>(
                      `.game-card[data-game="${games[(i + jump + games.length) % games.length].id}"]`,
                    )
                    ?.focus();
                }
              }}
              style={{ '--card-color': game.color } as React.CSSProperties}
            >
              <div className="card-picture">
                <GameArt id={game.id} />
                <span className="card-number">{i + 1}</span>
                {stamps.includes(game.id) && (
                  <span className="adventure-stamp" aria-label="Adventure explored">
                    <Check size={15} />
                  </span>
                )}
              </div>
              <div className="card-label">
                <div>
                  <strong>{game.name}</strong>
                  <span>{game.action}</span>
                </div>
                <span className="card-play">
                  <ArrowRight />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="home-whisper">
          <Star />
          Made for little hands and big imaginations.
          <Star />
        </div>
      </div>
      {active && (
        <nav className="game-dock" aria-label="Switch adventures" data-ui inert={parents || rest}>
          <div className="dock-track">
            {games.map((game) => (
              <button
                key={game.id}
                aria-label={`Switch to ${game.name}`}
                aria-current={active === game.id ? 'page' : undefined}
                onClick={() => {
                  if (active !== game.id) open(game.id);
                  else focusPlay();
                }}
                style={{ '--dock-color': game.color } as React.CSSProperties}
              >
                <GameArt id={game.id} />
                <span>
                  {
                    (
                      {
                        garage: 'Cars',
                        runner: 'Run',
                        space: 'Space',
                        treats: 'Treats',
                        transport: 'Train',
                        letters: 'ABC',
                        music: 'Music',
                        splash: 'Splash',
                        arcade: 'Picnic',
                      } as const
                    )[game.id]
                  }
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
      {rest && (
        <div className="rest-overlay" role="status">
          <Animal kind="bunny" />
          <h2>A little time to rest.</h2>
          <p>Stretch, snuggle, and explore together.</p>
          <span>Hold Grown-ups to start fresh playtime.</span>
        </div>
      )}
      {parents && (
        <ParentPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => {
            setParents(false);
            focusPlay();
          }}
          offlineReady={offline}
          updateReady={update}
          onUpdate={() => {
            void navigator.serviceWorker?.getRegistration().then((r) => {
              if (r?.waiting) void updateApp(true);
              else window.location.reload();
            });
          }}
          breakTime={rest}
          onRestart={() => {
            elapsed.current = 0;
            setRest(false);
          }}
        />
      )}
    </main>
  );
}
