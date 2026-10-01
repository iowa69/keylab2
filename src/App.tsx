import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Keyboard,
  LockKeyhole,
  Shuffle,
  Sparkles,
  Sprout,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { MiniFlower, WorldArt } from './components/Art';
import { ParentDialog } from './components/ParentDialog';
import { Playground } from './components/Playground';
import { readSettings, worlds, type WorldId } from './lib/worlds';
import { hush, playNote } from './lib/audio';

export default function App() {
  const [active, setActive] = useState<WorldId | null>(null);
  const [settings, setSettings] = useState(readSettings);
  const [parentsOpen, setParentsOpen] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [systemCalm, setSystemCalm] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const world = worlds.find((w) => w.id === active);
  const effectiveSettings = { ...settings, calm: settings.calm || systemCalm };
  useEffect(() => {
    try {
      localStorage.setItem('keylab2-settings', JSON.stringify(settings));
    } catch {
      /* Private sessions can still play. */
    }
    if (!settings.sound) hush();
  }, [settings]);
  useEffect(() => {
    const ready = () => setOfflineReady(true);
    window.addEventListener('keylab-offline-ready', ready);
    if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(ready);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setSystemCalm(media.matches);
    media.addEventListener('change', change);
    return () => {
      window.removeEventListener('keylab-offline-ready', ready);
      media.removeEventListener('change', change);
    };
  }, []);
  function openWorld(id: WorldId) {
    setActive(id);
    playNote('C', id, settings);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function goHome() {
    setActive(null);
    hush();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <div className={`app ${effectiveSettings.calm ? 'calm' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to play worlds
      </a>
      <header className="site-header page-width" data-ui>
        <button className="brand" aria-label="Keylab 2 home" onClick={goHome}>
          <span className="brand-icon">
            <span>k</span>
            <i />
          </span>
          <span>
            keylab<span className="brand-two">2</span>
            <small>a little world of wonder</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button className={`nav-link ${!active ? 'active' : ''}`} onClick={goHome}>
            The playground
          </button>
          <button className="nav-link parents-link" onClick={() => setParentsOpen(true)}>
            For grown-ups <Heart size={13} />
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button sound-button"
            aria-label={settings.sound ? 'Mute sounds' : 'Turn on sounds'}
            aria-pressed={settings.sound}
            onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
          >
            {settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button className="parent-button" onClick={() => setParentsOpen(true)}>
            <LockKeyhole size={15} />
            <span>Grown-ups</span>
          </button>
        </div>
      </header>
      {world ? (
        <Playground
          key={world.id}
          world={world}
          settings={effectiveSettings}
          onBack={goHome}
          onNext={() =>
            openWorld(worlds[(worlds.findIndex((w) => w.id === world.id) + 1) % worlds.length].id)
          }
          blocked={parentsOpen}
        />
      ) : (
        <main id="main-content" className="home page-width">
          <section className="intro">
            <div className="intro-eyebrow">
              <span />
              <span>SMALL HANDS. WONDER-FILLED WORLDS.</span>
              <span />
            </div>
            <h1>
              Little keys.{' '}
              <span>
                Big discoveries.
                <svg viewBox="0 0 420 18" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M4 11Q196-5 415 7"
                    fill="none"
                    stroke="#edcd7f"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p>
              A happy little place to tap, giggle, and grow.
              <br className="mobile-break" /> No wrong keys. Just wonder.
            </p>
          </section>
          <section className="hero" aria-labelledby="hero-title">
            <WorldArt world="garden" hero />
            <div className="hero-content">
              <span className="hero-tag">
                <Sprout size={14} /> A LITTLE EVERYDAY MAGIC
              </span>
              <h2 id="hero-title">
                Let curiosity
                <br />
                bloom.
              </h2>
              <p>
                One little keypress.
                <br /> A whole garden of possibilities.
              </p>
              <button className="primary-button" onClick={() => openWorld('garden')}>
                Play in the garden <ArrowRight size={18} />
              </button>
              <span className="hero-hint">
                <Keyboard size={15} /> Made for tiny fingers. And big imaginations.
              </span>
            </div>
            <span className="hero-sticker">
              <Sparkles size={15} /> Every key grows something!
            </span>
          </section>
          <section className="worlds-section" aria-labelledby="worlds-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FOLLOW THEIR CURIOSITY</span>
                <h2 id="worlds-title">Where shall we play?</h2>
                <p>Six little worlds. So much to discover.</p>
              </div>
              <button
                className="surprise-button"
                onClick={() => openWorld(worlds[Math.floor(Math.random() * worlds.length)].id)}
              >
                <Shuffle size={16} /> Surprise me
              </button>
            </div>
            <div className="world-grid">
              {worlds.map((w, index) => (
                <button
                  className={`world-card world-${w.id}`}
                  key={w.id}
                  onClick={() => openWorld(w.id)}
                  style={
                    {
                      '--card-color': w.color,
                      '--card-ink': w.ink,
                      '--card-delay': `${index * 55}ms`,
                    } as React.CSSProperties
                  }
                  aria-label={`Play ${w.name}`}
                >
                  <div className="card-art">
                    <WorldArt world={w.id} compact />
                    <span className="card-category">{w.tag}</span>
                    <span className="card-play">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                  <div className="card-copy">
                    <h3>{w.name}</h3>
                    <p>{w.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="reassurance">
            <div className="reassurance-flower">
              <MiniFlower />
            </div>
            <div>
              <h2>Little fingers, you’re doing great.</h2>
              <p>
                No scores. No time limits. No getting it wrong.
                <br className="desktop-break" /> Just a little freedom to see what happens.
              </p>
            </div>
            <div className="reassurance-tags">
              <span>
                <Check size={15} /> Made for ages 1–5
              </span>
              <span>
                <Check size={15} /> Keyboard & touch friendly
              </span>
              <span>
                <Check size={15} /> Best discovered together
              </span>
            </div>
          </section>
          <button
            className="how-to-play"
            onClick={() => {
              document
                .getElementById('worlds-title')
                ?.scrollIntoView({ behavior: effectiveSettings.calm ? 'instant' : 'smooth' });
            }}
          >
            <span>Pick a world. Press a key. Let the magic happen.</span>
            <ArrowDown size={15} />
          </button>
        </main>
      )}
      <footer className="site-footer page-width">
        <span className="footer-love">
          <Heart size={14} /> Made with love, for little minds.
        </span>
        <span className="footer-privacy">No ads. No accounts. Just play.</span>
        <span className="footer-offline">
          <WifiOff size={14} /> {offlineReady ? 'Ready for offline play' : 'Made for offline play'}
        </span>
        <button className="footer-parent" onClick={() => setParentsOpen(true)}>
          A note for grown-ups <ChevronRight size={14} />
        </button>
      </footer>
      {parentsOpen && (
        <ParentDialog
          settings={settings}
          setSettings={setSettings}
          onClose={() => setParentsOpen(false)}
        />
      )}
    </div>
  );
}
