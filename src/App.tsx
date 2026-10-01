import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Heart,
  Home,
  Keyboard,
  LockKeyhole,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
import { hush, playTone } from './adventure/audio';
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
        if (playarea.current) playarea.current.focus({ preventScroll: true });
        else
          document.querySelector<HTMLButtonElement>('[data-game]')?.focus({ preventScroll: true });
      }),
    [],
  );
  useEffect(() => {
    savePreferences(settings);
    if (!settings.sound) hush();
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
  const celebrate = useCallback(
    (_label: string) => {
      if (active) setStamps((s) => (s.includes(active) ? s : [...s, active]));
    },
    [active],
  );
  function open(id: GameId) {
    if (rest) return;
    hush();
    playTone(4, settings);
    setActive(id);
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
        .querySelector<HTMLButtonElement>(`[data-game="${lastGame.current}"]`)
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
  const info = games.find((g) => g.id === active),
    Game = active ? components[active] : null;
  return (
    <main
      className={`adventure-app ${effective.calm ? 'calm' : ''} ${settings.contrast ? 'contrast' : ''}`}
      data-offline-ready={offline}
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
              setSettings((s) => ({ ...s, sound: !s.sound }));
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
      {Game ? (
        <div className="game-shell">
          <div
            ref={playarea}
            className="game-body"
            tabIndex={-1}
            inert={paused}
            aria-label={`${info?.name} play area`}
          >
            <Game settings={effective} paused={paused} onCelebrate={celebrate} />
          </div>
          <div className="play-tip">
            <Keyboard size={15} />
            <span>Tap, swipe, or press keys. Let’s see what happens!</span>
            <span className="play-kind">
              {settings.mode === 'baby' ? 'A little helping hand' : 'Room to explore'}
            </span>
          </div>
        </div>
      ) : (
        <div className="playground" inert={parents || rest}>
          <section className="welcome">
            <div>
              <span className="eyebrow">A WHOLE LITTLE WORLD TO PLAY IN</span>
              <h1>Where shall we go?</h1>
              <p>Pick a picture. Make an adventure.</p>
            </div>
            <div className="welcome-friend">
              <Star />
              <span>Let’s play!</span>
            </div>
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
                    const columns = window.innerWidth < 660 ? 2 : 3;
                    const jump =
                      e.key === 'ArrowRight'
                        ? 1
                        : e.key === 'ArrowLeft'
                          ? -1
                          : e.key === 'ArrowDown'
                            ? columns
                            : -columns;
                    const next = (i + jump + games.length) % games.length;
                    document
                      .querySelector<HTMLButtonElement>(`[data-game="${games[next].id}"]`)
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
          <footer className="playground-footer">
            <span>
              <Heart size={15} /> Little adventures. Together.
            </span>
            <span>
              <Keyboard size={15} /> Pick a picture or press 1–9.
            </span>
            <span>
              <Star />
              {stamps.length}/9 adventures explored
            </span>
          </footer>
        </div>
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
