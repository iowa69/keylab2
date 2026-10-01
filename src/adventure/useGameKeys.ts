import { useEffect, useRef } from 'react';
export function useGameKeys(paused: boolean, onKey: (key: string) => void) {
  const handler = useRef(onKey);
  handler.current = onKey;
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        paused ||
        event.repeat ||
        event.isComposing ||
        event.key === 'Tab' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
      const element = event.target;
      if (
        element instanceof Element &&
        (element.closest('input,select,textarea,[contenteditable=true],[data-ui]') ||
          (element.closest('button') && ['Enter', ' '].includes(event.key)))
      )
        return;
      if (event.cancelable) event.preventDefault();
      handler.current(event.key);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [paused]);
}
