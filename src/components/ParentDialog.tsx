import { useEffect, useRef, useState } from 'react';
import { Check, Heart, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import type { Settings } from '../lib/worlds';
import { hush } from '../lib/audio';

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        className="toggle"
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
      >
        <span>{checked && <Check size={12} />}</span>
      </button>
    </div>
  );
}
export function ParentDialog({
  settings,
  setSettings,
  onClose,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [step, setStep] = useState<'hold' | 'question' | 'settings'>('hold');
  const [holding, setHolding] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    hush();
    return () => {
      clearTimeout(holdTimer.current);
    };
  }, []);
  function startHold() {
    if (holdTimer.current) return;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      setStep('question');
      setHolding(false);
      holdTimer.current = undefined;
    }, 3000);
  }
  function stopHold() {
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    setHolding(false);
  }
  function patch(value: Partial<Settings>) {
    setSettings({ ...settings, ...value });
  }
  return (
    <dialog
      ref={dialog}
      className="parent-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="parent-title"
    >
      <button
        className="icon-button close-dialog"
        aria-label="Close grown-up settings"
        onClick={onClose}
      >
        <X size={21} />
      </button>
      <span className="dialog-icon">
        <LockKeyhole size={24} />
      </span>
      <span className="eyebrow">JUST FOR GROWN-UPS</span>
      <h2 id="parent-title">A little care behind the play.</h2>
      {step === 'hold' && (
        <div className="parent-gate">
          <p>A quiet, happy place to explore. Make it feel just right for your little one.</p>
          <button
            className={`hold-button ${holding ? 'holding' : ''}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              startHold();
            }}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
            onLostPointerCapture={stopHold}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!e.repeat) startHold();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') stopHold();
            }}
            onBlur={stopHold}
          >
            <span>{holding ? 'Just a little longer…' : 'Hold for 3 seconds to continue'}</span>
            <i />
          </button>
          <p className="small-note">A tiny gate to keep curious fingers in their playground.</p>
        </div>
      )}
      {step === 'question' && (
        <form
          className="parent-question"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(answer) === 12 && answer.trim()) setStep('settings');
            else setError(true);
          }}
        >
          <p>One little grown-up question.</p>
          <label htmlFor="gate-answer">What is 7 + 5?</label>
          <input
            id="gate-answer"
            inputMode="numeric"
            pattern="[0-9]*"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            autoComplete="off"
            autoFocus
            aria-invalid={error}
            aria-describedby={error ? 'gate-error' : undefined}
          />
          {error && (
            <p id="gate-error" className="error-text">
              Give that another try.
            </p>
          )}
          <button className="primary-button" type="submit">
            Open settings <LockKeyhole size={16} />
          </button>
        </form>
      )}
      {step === 'settings' && (
        <div className="parent-settings">
          <Toggle
            label="Play sounds"
            description="Soft, musical sounds for little discoveries."
            checked={settings.sound}
            onChange={() => {
              patch({ sound: !settings.sound });
              hush();
            }}
          />
          <div className="setting-row">
            <div>
              <label htmlFor="volume">Volume</label>
              <p>Start low and adjust your device volume too.</p>
            </div>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => patch({ volume: Number(e.target.value) })}
            />
          </div>
          <Toggle
            label="Calm mode"
            description="Less motion, no confetti, the same little wonders."
            checked={settings.calm}
            onChange={() => patch({ calm: !settings.calm })}
          />
          <Toggle
            label="Say it aloud"
            description="English letters and words with an installed device voice."
            checked={settings.narration}
            onChange={() => patch({ narration: !settings.narration })}
          />
          <div className="setting-row">
            <div>
              <label htmlFor="break-time">A gentle break</label>
              <p>A soft reminder to stretch after active play.</p>
            </div>
            <select
              id="break-time"
              value={settings.breakMinutes}
              onChange={(e) => patch({ breakMinutes: Number(e.target.value) })}
            >
              <option value="0">Whenever you like</option>
              <option value="5">After 5 minutes</option>
              <option value="10">After 10 minutes</option>
              <option value="15">After 15 minutes</option>
            </select>
          </div>
          <div className="parent-note">
            <ShieldCheck size={21} />
            <p>
              No ads, accounts, cameras, or tracking. Settings stay on this device. After the first
              complete load, the playground works offline.
            </p>
          </div>
          <p className="small-note">
            Best explored together, around ages 1–5. Fullscreen helps with keyboard play, but
            browser and system shortcuts can still leave the app. Escape pauses play. Narration
            needs an English voice installed on your device.
          </p>
          <button className="primary-button done-button" onClick={onClose}>
            All set. Let’s play. <Heart size={16} />
          </button>
        </div>
      )}
    </dialog>
  );
}
