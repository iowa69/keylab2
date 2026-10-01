import { useEffect, useRef, useState } from 'react';
import { Check, Download, Maximize, RotateCcw, Volume2, X } from 'lucide-react';
import type { Preferences } from '../playroom/settings';
export function ParentPanel({
  settings,
  onChange,
  onClose,
  offlineReady,
  updateReady,
  onUpdate,
  breakTime,
  onRestart,
}: {
  settings: Preferences;
  onChange: (s: Preferences) => void;
  onClose: () => void;
  offlineReady: boolean;
  updateReady: boolean;
  onUpdate: () => void;
  breakTime: boolean;
  onRestart: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  function patch(s: Partial<Preferences>) {
    onChange({ ...settings, ...s });
  }
  return (
    <dialog
      className="parent-panel"
      ref={ref}
      onCancel={onClose}
      aria-labelledby="parent-title"
      data-ui
    >
      <button
        className="icon-button parent-close"
        aria-label="Close grown-up settings"
        onClick={onClose}
      >
        <X />
      </button>
      <span className="eyebrow">A MOMENT FOR GROWN-UPS</span>
      <h2 id="parent-title">Play, their way.</h2>
      <p>Choose a little help, gentle sounds, and time to pause.</p>
      <fieldset>
        <legend>A helping hand</legend>
        <div className="parent-modes">
          <button aria-pressed={settings.mode === 'baby'} onClick={() => patch({ mode: 'baby' })}>
            <strong>Little explorer</strong>
            <small>Extra help catching, matching & steering.</small>
          </button>
          <button
            aria-pressed={settings.mode === 'toddler'}
            onClick={() => patch({ mode: 'toddler' })}
          >
            <strong>I can do it!</strong>
            <small>More room to aim, choose & discover.</small>
          </button>
        </div>
      </fieldset>
      <label className="parent-row">
        <span>
          <strong>Gentle sound</strong>
          <small>Tunes and available on-device voices.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.sound}
          onChange={(e) => patch({ sound: e.target.checked })}
        />
      </label>
      <label className="parent-row">
        <span>
          <strong>
            <Volume2 size={16} /> Volume
          </strong>
          <small>Start with your device volume low, too.</small>
        </span>
        <input
          aria-label="Volume"
          type="range"
          min="0"
          max="1"
          step=".05"
          value={settings.volume}
          onChange={(e) => patch({ volume: Number(e.target.value) })}
        />
      </label>
      <label className="parent-row">
        <span>
          <strong>Calmer motion</strong>
          <small>Slower adventures and fewer flourishes.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.calm}
          onChange={(e) => patch({ calm: e.target.checked })}
        />
      </label>
      <label className="parent-row">
        <span>
          <strong>Stronger outlines</strong>
          <small>Make the controls stand out.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.contrast}
          onChange={(e) => patch({ contrast: e.target.checked })}
        />
      </label>
      <label className="parent-row">
        <span>
          <strong>A little rest</strong>
          <small>Pause after active play time.</small>
        </span>
        <select
          aria-label="Rest reminder"
          value={settings.breakMinutes}
          onChange={(e) => patch({ breakMinutes: Number(e.target.value) })}
        >
          <option value="0">Whenever we like</option>
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
        </select>
      </label>
      {breakTime && (
        <button
          className="big-action"
          onClick={() => {
            onRestart();
            onClose();
          }}
        >
          <RotateCcw />
          Start fresh playtime
        </button>
      )}
      <div className="parent-utilities">
        <button
          className="small-action"
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await document.documentElement.requestFullscreen();
              setMessage('All set.');
            } catch {
              setMessage('Use your browser’s Add to Home Screen option for more play space.');
            }
          }}
        >
          <Maximize />
          Fullscreen
        </button>
        {updateReady && (
          <button className="small-action" onClick={onUpdate}>
            <Download />
            Refresh game update
          </button>
        )}
      </div>
      <p className="parent-note" role="status">
        {message || (
          <>
            {offlineReady ? (
              <>
                <Check size={16} /> Ready for offline adventures.
              </>
            ) : (
              'Preparing offline adventures…'
            )}
          </>
        )}
      </p>
      <p className="parent-note">
        No ads, accounts, purchases, or external videos. Play together. Browser and system shortcuts
        can still leave the game.
      </p>
      <button className="big-action parent-done" onClick={onClose}>
        Back to playing <Check />
      </button>
    </dialog>
  );
}
