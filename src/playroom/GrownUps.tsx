import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Download,
  Heart,
  LockKeyhole,
  Maximize,
  Moon,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { toys, type Preferences } from './settings';
import { ToyIcon } from './ToyIcon';

function Switch({
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
    <div className="preference">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        role="switch"
        type="button"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
        className="switch"
      >
        <span>{checked && <Check size={12} />}</span>
      </button>
    </div>
  );
}
export function GrownUps({
  settings,
  onChange,
  onClose,
  offlineReady,
  breakTime,
  onRestart,
  updateReady,
  onUpdate,
}: {
  settings: Preferences;
  onChange: (s: Preferences) => void;
  onClose: () => void;
  offlineReady: boolean;
  breakTime: boolean;
  onRestart: () => void;
  updateReady: boolean;
  onUpdate: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'toys' | 'settings'>('toys');
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  function patch(value: Partial<Preferences>) {
    onChange({ ...settings, ...value });
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenMessage('All set. Return to play when you’re ready.');
    } catch {
      setFullscreenMessage(
        'Fullscreen isn’t available here. Your browser’s Add to Home Screen option gives you more space.',
      );
    }
  }
  return (
    <dialog
      className={`grown-up-dialog ${unlocked ? 'unlocked' : ''}`}
      ref={dialog}
      onCancel={onClose}
      aria-labelledby="grown-up-title"
      data-parent
    >
      <button className="close-button" aria-label="Close grown-up space" onClick={onClose}>
        <X size={21} />
      </button>
      {!unlocked ? (
        <div className="gate">
          <div className="parent-emblem">
            <LockKeyhole size={25} />
          </div>
          <span className="overline">A MOMENT FOR GROWN-UPS</span>
          <h1 id="grown-up-title">
            Their little world.
            <br />
            Your peace of mind.
          </h1>
          <p>One small question to keep little fingers in their playground.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (answer.trim() === '12') {
                setUnlocked(true);
              } else setError(true);
            }}
          >
            <label htmlFor="parent-answer">What is 7 + 5?</label>
            <input
              id="parent-answer"
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setError(false);
              }}
              aria-invalid={error}
              autoFocus
            />
            {error && (
              <p className="gate-error" role="alert">
                Try that once more.
              </p>
            )}
            <button className="primary-button" type="submit">
              Open grown-up space <ArrowLeft size={16} className="arrow-forward" />
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="parent-heading">
            <span className="overline">MADE FOR THEIR LITTLE HANDS</span>
            <h1 id="grown-up-title">Make room for wonder.</h1>
            <p>Set it up, settle in together, and let them explore.</p>
          </div>
          <div className="parent-tabs">
            <button aria-pressed={tab === 'toys'} onClick={() => setTab('toys')}>
              <Sparkles size={16} /> The toy box
            </button>
            <button aria-pressed={tab === 'settings'} onClick={() => setTab('settings')}>
              <Heart size={16} /> Play their way
            </button>
          </div>
          {tab === 'toys' ? (
            <>
              <div className="toy-picker">
                {toys.map((toy) => (
                  <button
                    key={toy.id}
                    className={`toy-choice ${settings.toy === toy.id ? 'selected' : ''}`}
                    aria-label={`Choose ${toy.name}`}
                    aria-pressed={settings.toy === toy.id}
                    onClick={() => patch({ toy: toy.id })}
                    style={{ '--tile-color': toy.color } as React.CSSProperties}
                  >
                    <div>
                      <ToyIcon toy={toy.id} />
                      {settings.toy === toy.id && (
                        <span className="selection-check">
                          <Check size={13} />
                        </span>
                      )}
                    </div>
                    <strong>{toy.name}</strong>
                    <span>{toy.verb}</span>
                  </button>
                ))}
              </div>
              <p className="toy-description">
                {toys.find((t) => t.id === settings.toy)?.description}
              </p>
              <div className="parent-tip">
                <Sparkles size={18} />
                <p>
                  Every key works. A tap, a swipe, a handful of keys: it all makes something happen.
                  There are no instructions for your child to follow.
                </p>
              </div>
            </>
          ) : (
            <div className="preferences">
              <div className="mode-choice">
                <span className="field-label">How do they like to play?</span>
                <div>
                  <button
                    aria-pressed={settings.mode === 'baby'}
                    onClick={() => patch({ mode: 'baby' })}
                  >
                    <span className="mode-dot baby" />
                    <strong>Baby</strong>
                    <small>Bigger toys. Instant responses.</small>
                  </button>
                  <button
                    aria-pressed={settings.mode === 'toddler'}
                    onClick={() => patch({ mode: 'toddler' })}
                  >
                    <span className="mode-dot toddler" />
                    <strong>Toddler</strong>
                    <small>A little more to discover.</small>
                  </button>
                </div>
              </div>
              <Switch
                label="Gentle sounds"
                description="A little plop, a soft boing, a musical note."
                checked={settings.sound}
                onChange={() => patch({ sound: !settings.sound })}
              />
              <div className="preference">
                <div>
                  <label htmlFor="play-volume">
                    <Volume2 size={15} /> Volume
                  </label>
                  <p>Start with your device volume low, too.</p>
                </div>
                <input
                  id="play-volume"
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={settings.volume}
                  onChange={(event) => patch({ volume: Number(event.target.value) })}
                />
              </div>
              <Switch
                label="Calmer movement"
                description="Still backgrounds and fewer little particles."
                checked={settings.calm}
                onChange={() => patch({ calm: !settings.calm })}
              />
              <Switch
                label="High contrast"
                description="Simple black, white, and red play."
                checked={settings.contrast}
                onChange={() => patch({ contrast: !settings.contrast })}
              />
              <div className="preference">
                <div>
                  <label htmlFor="break-reminder">
                    <Moon size={15} /> A little break
                  </label>
                  <p>Active play time. Grown-ups resume play.</p>
                </div>
                <select
                  id="break-reminder"
                  value={settings.breakMinutes}
                  onChange={(event) => patch({ breakMinutes: Number(event.target.value) })}
                >
                  <option value="0">Off</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>
              <button className="wide-button" onClick={() => void fullscreen()}>
                <Maximize size={16} /> Toggle fullscreen
              </button>
              {fullscreenMessage && (
                <p className="small-note" role="status">
                  {fullscreenMessage}
                </p>
              )}
              <div className="parent-tip">
                <ShieldCheck size={20} />
                <p>
                  No ads, accounts, cameras, or tracking. Preferences stay on this device.{' '}
                  {offlineReady
                    ? 'This playroom is ready offline.'
                    : 'Leave this open once to prepare offline play.'}
                </p>
              </div>
              <p className="small-note">
                The grown-up gate protects in-app controls. A website cannot lock browser or system
                controls. On iPhone or iPad, use Guided Access; on Android, use app pinning for
                device-level boundaries. Reduced-motion preferences are always respected.
              </p>
              {updateReady && (
                <button className="wide-button" onClick={onUpdate}>
                  <Download size={16} /> Load the updated playroom
                </button>
              )}
            </div>
          )}
          <div className="parent-bottom">
            <span>
              <Heart size={13} /> Best explored together.
            </span>
            <button
              className="primary-button"
              onClick={() => {
                if (breakTime) onRestart();
                onClose();
              }}
            >
              {breakTime ? 'Start fresh playtime' : 'Back to play'}{' '}
              <ArrowLeft size={16} className="arrow-forward" />
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
