import { useState } from 'react';
import { PIN } from '../utils.js';

export default function PinLock({ onUnlock }) {
  const [buf, setBuf]     = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function press(val) {
    if (val === 'del') {
      setBuf(b => b.slice(0, -1));
      return;
    }
    if (val === 'clr') { setBuf(''); return; }
    if (buf.length >= 4) return;

    const next = buf + val;
    setBuf(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (next === PIN) {
          setBuf('');
          onUnlock();
        } else {
          setBuf('');
          setError('❌ Incorrect PIN. Try again.');
          setShake(true);
          setTimeout(() => { setError(''); setShake(false); }, 2000);
        }
      }, 180);
    }
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
