import { useEffect, useRef } from 'react';
import { PlayEngine } from './engine';
import { render } from './render';
import { quiet, sound } from './sound';
import { toys, type Preferences } from './settings';

export function CanvasPlayroom({
  settings,
  paused,
  onPlay,
  onMinute,
  onReady,
}: {
  settings: Preferences;
  paused: boolean;
  onPlay: () => void;
  onMinute: () => void;
  onReady?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<PlayEngine | null>(null);
  const preferences = useRef(settings);
  preferences.current = settings;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const playCallback = useRef(onPlay);
  playCallback.current = onPlay;
  const minuteCallback = useRef(onMinute);
  minuteCallback.current = onMinute;
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  useEffect(() => {
    engine.current?.configure(settings);
  }, [settings]);
  useEffect(() => {
    if (paused) {
      engine.current?.cancelFingers();
      quiet();
    }
  }, [paused]);
  useEffect(() => {
    const surface = canvas.current!;
    const ctx = surface.getContext('2d', { alpha: false });
    if (!ctx) {
      surface.dataset.error = 'canvas-unavailable';
      return;
    }
    const e = new PlayEngine(
      preferences.current,
      surface.clientWidth,
      surface.clientHeight,
      (toy, tone) => sound(toy, tone, preferences.current),
    );
    engine.current = e;
    let raf = 0,
      lastTime = 0,
      seconds = 0,
      lastMetrics = 0,
      wheelAt = -1000;
    let dpr = 1,
      disposed = false;
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(rect.width * dpr);
      surface.height = Math.round(rect.height * dpr);
      e.resize(rect.width, rect.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx, e);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    resize();
    const updateMetrics = () => {
      surface.dataset.interactions = String(e.interactions);
      surface.dataset.entities = String(e.friends.length);
      surface.dataset.particles = String(e.particles.length);
      surface.dataset.ribbons = String(e.ribbons.length);
      surface.dataset.discoveries = String(e.discoveries);
      surface.dataset.fingers = String(e.fingers.size);
      surface.dataset.toy = e.scene;
      surface.dataset.mode = e.settings.mode;
      surface.dataset.calm = String(e.settings.calm);
    };
    function frame(now: number) {
      if (disposed) return;
      const dt = lastTime ? Math.max((now - lastTime) / 1000, 0) : 0;
      lastTime = now;
      if (!pausedRef.current && !document.hidden) {
        e.step(dt);
        seconds += dt;
        while (seconds >= 60) {
          seconds -= 60;
          minuteCallback.current();
        }
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx!, e);
      if (now - lastMetrics > 120) {
        updateMetrics();
        lastMetrics = now;
      }
      if (!document.hidden) raf = requestAnimationFrame(frame);
    }
    const visible = () => {
      e.cancelFingers();
      quiet();
      cancelAnimationFrame(raf);
      lastTime = 0;
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    const position = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const down = (event: PointerEvent) => {
      if (pausedRef.current) return;
      event.preventDefault();
      surface.focus({ preventScroll: true });
      surface.setPointerCapture(event.pointerId);
      e.down(event.pointerId, position(event));
      playCallback.current();
      updateMetrics();
    };
    const move = (event: PointerEvent) => {
      if (pausedRef.current) return;
      e.move(event.pointerId, position(event));
      updateMetrics();
    };
    const up = (event: PointerEvent) => {
      e.up(event.pointerId, event.type !== 'pointerup');
      if (surface.hasPointerCapture(event.pointerId))
        surface.releasePointerCapture(event.pointerId);
      updateMetrics();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (pausedRef.current || event.key === 'Tab') return;
      if (
        event.target instanceof Element &&
        event.target.closest('[data-parent]') &&
        (event.key === ' ' || event.key === 'Enter')
      )
        return;
      if (event.cancelable) event.preventDefault();
      if (event.repeat || event.isComposing) return;
      e.keyboard();
      playCallback.current();
      updateMetrics();
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (pausedRef.current || performance.now() - wheelAt < 95) return;
      wheelAt = performance.now();
      e.scroll(event.deltaY || event.deltaX);
      playCallback.current();
      updateMetrics();
    };
    const context = (event: Event) => event.preventDefault();
    surface.addEventListener('pointerdown', down);
    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerup', up);
    surface.addEventListener('pointercancel', up);
    surface.addEventListener('lostpointercapture', up);
    surface.addEventListener('contextmenu', context);
    surface.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', keyboard, { capture: true });
    document.addEventListener('visibilitychange', visible);
    updateMetrics();
    surface.focus({ preventScroll: true });
    readyCallback.current?.();
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      e.cancelFingers();
      engine.current = null;
      quiet();
      surface.removeEventListener('pointerdown', down);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerup', up);
      surface.removeEventListener('pointercancel', up);
      surface.removeEventListener('lostpointercapture', up);
      surface.removeEventListener('contextmenu', context);
      surface.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', keyboard, { capture: true });
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);
  return (
    <canvas
      ref={canvas}
      className="sensory-canvas"
      tabIndex={0}
      role="img"
      aria-label={`${toys.find((t) => t.id === settings.toy)?.name}. Touch, drag, swipe, or press any key to play. Hold the grown-up button for settings.`}
    >
      Your browser needs canvas support to play. Please use a current browser.
    </canvas>
  );
}
