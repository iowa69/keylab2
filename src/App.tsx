import { useCallback, useEffect, useRef, useState } from 'react';
import { Hand, Heart, Keyboard, LockKeyhole, Sparkles } from 'lucide-react';
import { CanvasPlayroom } from './playroom/CanvasPlayroom';
import { GrownUps } from './playroom/GrownUps';
import { loadPreferences, savePreferences } from './playroom/settings';
import { quiet } from './playroom/sound';
import { updateApp } from './playroom/offline';

export default function App() {
  const [settings, setSettings] = useState(loadPreferences);
  const [parentsOpen, setParentsOpen] = useState(false);
  const [played, setPlayed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [breakTime, setBreakTime] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const minutes = useRef(0);
  const preferences = useRef(settings);
  preferences.current = settings;
  const settingsButton = useRef<HTMLButtonElement>(null);
  const effectiveSettings = { ...settings, calm: settings.calm || reducedMotion };
  useEffect(() => {
    savePreferences(settings);
    if (!settings.sound) quiet();
  }, [settings]);
  useEffect(() => {
    let active = true;
    const offline = () => {
      if (active) setOfflineReady(true);
    };
    const update = () => setUpdateReady(true);
    let hadController = !!navigator.serviceWorker?.controller;
    const controlled = () => {
      if (hadController) setUpdateReady(true);
      hadController = true;
    };
    window.addEventListener('keylab-offline-ready', offline);
    window.addEventListener('keylab-update-ready', update);
    if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(offline);
    navigator.serviceWorker?.addEventListener('controllerchange', controlled);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReducedMotion(media.matches);
    media.addEventListener('change', changed);
    return () => {
      active = false;
      clearTimeout(holdTimer.current);
      window.removeEventListener('keylab-offline-ready', offline);
      window.removeEventListener('keylab-update-ready', update);
      navigator.serviceWorker?.removeEventListener('controllerchange', controlled);
      media.removeEventListener('change', changed);
    };
  }, []);
  const onPlay = useCallback(() => setPlayed(true), []);
  const onMinute = useCallback(() => {
    minutes.current++;
    if (
      preferences.current.breakMinutes > 0 &&
      minutes.current >= preferences.current.breakMinutes
    ) {
      setBreakTime(true);
      quiet();
    }
  }, []);
  function startHold() {
    if (holdTimer.current) return;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = undefined;
      setHolding(false);
      setParentsOpen(true);
      quiet();
    }, 3000);
  }
  function stopHold() {
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    setHolding(false);
  }
  function closeParents() {
    setParentsOpen(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLCanvasElement>('canvas')?.focus({ preventScroll: true }),
    );
  }
  const dark = settings.toy === 'stars' || settings.contrast;
  return (
    <main
      className={`playroom ${dark ? 'dark' : ''} ${effectiveSettings.calm ? 'calm' : ''} ${breakTime ? 'taking-break' : ''}`}
      data-offline-ready={offlineReady}
    >
      <CanvasPlayroom
        settings={effectiveSettings}
        paused={parentsOpen || breakTime}
        onPlay={onPlay}
        onMinute={onMinute}
      />
      <div className="playroom-brand" aria-label="Keylab 2">
        <span className="brand-mark">
          <i />
          <i />
          <b />
        </span>
        <span>
          keylab<sup>2</sup>
        </span>
        <small>a little world of wonder</small>
      </div>
      <button
        ref={settingsButton}
        data-parent
        className={`grown-up-hold ${holding ? 'holding' : ''}`}
        aria-label="Hold for 3 seconds for grown-ups"
        title="Hold for 3 seconds for grown-ups"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          startHold();
        }}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onLostPointerCapture={stopHold}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!event.repeat) startHold();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter' || event.key === ' ') stopHold();
        }}
        onBlur={stopHold}
      >
        <span className="hold-fill" />
        <LockKeyhole size={15} />
        <span>{holding ? 'Keep holding…' : 'Grown-ups'}</span>
        <i className="hold-dots">
          <b />
          <b />
          <b />
        </i>
      </button>
      {!played && !breakTime && (
        <div className="welcome-whisper" aria-hidden="true">
          <span className="welcome-icons">
            <Hand size={19} />
            <span>+</span>
            <Keyboard size={21} />
          </span>
          <h1>Little hands. Big wonder.</h1>
          <p>Touch, swipe, or press any key.</p>
          <span className="whisper-subtitle">
            <Sparkles size={12} /> It all makes something happen.
          </span>
        </div>
      )}
      {breakTime && (
        <div className="rest-screen" role="status">
          <div className="sleepy-friend">
            <span className="sleepy-eye" />
            <span className="sleepy-eye" />
            <i />
            <b>z</b>
            <b>z</b>
          </div>
          <h1>A little time to rest.</h1>
          <p>Stretch, snuggle, and explore together.</p>
          <span>
            <Heart size={14} /> Hold Grown-ups to start a fresh playtime.
          </span>
        </div>
      )}
      <span className="sr-only" role="status">
        {offlineReady ? 'Ready for offline play' : 'Preparing offline play'}
      </span>
      {parentsOpen && (
        <GrownUps
          settings={settings}
          onChange={setSettings}
          onClose={closeParents}
          offlineReady={offlineReady}
          breakTime={breakTime}
          onRestart={() => {
            minutes.current = 0;
            setBreakTime(false);
          }}
          updateReady={updateReady}
          onUpdate={() => {
            void navigator.serviceWorker?.getRegistration().then((registration) => {
              if (registration?.waiting) void updateApp(true);
              else window.location.reload();
            });
          }}
        />
      )}
    </main>
  );
}
