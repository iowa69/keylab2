import { useEffect, useRef } from 'react';
/** A one-shot scene timer that keeps its remaining time when play is paused. */
export function usePlayTimer(enabled: boolean, paused: boolean, delay: number, onDone: () => void) {
  const remaining = useRef(delay),
    done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    remaining.current = delay;
  }, [enabled, delay]);
  useEffect(() => {
    if (!enabled || paused) return;
    const started = performance.now();
    const t = setTimeout(() => {
      remaining.current = 0;
      done.current();
    }, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [enabled, paused, delay]);
}
