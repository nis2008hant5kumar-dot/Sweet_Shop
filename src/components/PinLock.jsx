import { useState } from 'react';
import { PIN } from '../utils.js';

export default function PinLock({ onUnlock }) {
  const [buf, setBuf]     = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function press(val) {
    // Light haptic feedback if available on device
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }

    setError('');
    setBuf(prev => {
      if (val === 'del') {
        return prev.slice(0, -1);
      }
      if (val === 'clr') {
        return '';
      }
      if (prev.length >= 4) return prev;

      const next = prev + val;
      
      if (next.length === 4) {
        if (next === PIN) {
          // Unlock immediately with a tiny delay so they see the final dot fill
          setTimeout(() => {
            onUnlock();
            setBuf('');
          }, 60);
        } else {
          // Trigger shake and clear buffer on mismatch
          setTimeout(() => {
            setBuf('');
            setError('❌ Incorrect PIN. Try again.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
          }, 100);
        }
      }
      return next;
    });
  }

  const keys = ['1','2','3','4','5','6','7','8','9','clr','0','del'];


  return (
    <div className="pin-overlay">
      <div className="pin-card">
        <div className="pin-lock-icon">🔐</div>
        <h2>Records Access</h2>
        <p>Enter your 4-digit PIN to access private shop records</p>

        <div className="pin-dots" aria-label="PIN indicator">
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < buf.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="pin-keypad">
          {keys.map(k => (
            <button
              key={k}
              className={`pin-key ${k === 'del' || k === 'clr' ? 'del' : ''}`}
              onClick={() => press(k)}
              id={`pin-${k}`}
            >
              {k === 'del' ? '⌫' : k.toUpperCase()}
            </button>
          ))}
        </div>

        <p className={`pin-error ${shake ? 'shake' : ''}`}>{error}</p>
        <p className="pin-hint">Default PIN: 1234</p>
      </div>
    </div>
  );
}
