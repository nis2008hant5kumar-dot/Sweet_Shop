import { useState } from 'react';
import { CustomerAuth } from '../utils.js';
import '../customer.css';

export default function CustomerLogin({ onLogin }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'signup'
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Please fill in all fields.'); return;
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit mobile number.'); return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.'); return;
    }

    setLoading(true);
    setTimeout(() => {
      let result;
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        result = CustomerAuth.register(name.trim(), phone.trim(), password);
      } else {
        result = CustomerAuth.login(phone.trim(), password);
      }
      setLoading(false);
      if (result.ok) {
        onLogin(result.customer);
      } else {
        setError(result.msg);
      }
    }, 500);
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setName('');
    setPhone('');
    setPass('');
  }

  return (
    <div className="zl-page">

      {/* Brand section */}
      <div className="zl-brand">
        <span className="zl-brand-emoji">🛕</span>
        <div className="zl-brand-name">Shree Ram<br />Misthan Bhandar</div>
        <div className="zl-brand-tag">Fresh Sweets & Snacks — Made Daily with Love 🙏</div>
      </div>

      {/* Login / Signup card */}
      <div className="zl-card">
        <div className="zl-card-title">
          {mode === 'login' ? '👋 Welcome back!' : '🎉 Create your account'}
        </div>

        {/* Mode tabs */}
        <div className="zl-tabs">
          <button
            className={`zl-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
            id="zl-tab-login"
          >
            Sign In
          </button>
          <button
            className={`zl-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => switchMode('signup')}
            id="zl-tab-signup"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="zl-form" noValidate>

          {/* Name — signup only */}
          {mode === 'signup' && (
            <div className="zl-field">
              <label className="zl-label" htmlFor="zl-name">Full Name</label>
              <div className="zl-input-wrap">
                <span className="zl-input-icon">👤</span>
                <input
                  id="zl-name"
                  className="zl-input"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="zl-field">
            <label className="zl-label" htmlFor="zl-phone">Mobile Number</label>
            <div className="zl-input-wrap">
              <span className="zl-input-icon">📱</span>
              <input
                id="zl-phone"
                className="zl-input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Password */}
          <div className="zl-field">
            <label className="zl-label" htmlFor="zl-pass">Password</label>
            <div className="zl-input-wrap">
              <span className="zl-input-icon">🔒</span>
              <input
                id="zl-pass"
                className="zl-input"
                type="password"
                placeholder={mode === 'signup' ? 'Create a password (min 4 chars)' : 'Your password'}
                value={password}
                onChange={e => setPass(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="zl-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="zl-submit-btn"
            id="zl-submit"
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login'
                ? '🔓 Sign In →'
                : '🎉 Create Account →'}
          </button>
        </form>

        {/* Switch mode */}
        <p className="zl-switch">
          {mode === 'login'
            ? <>New here?{' '}<button className="zl-switch-btn" onClick={() => switchMode('signup')} id="zl-to-signup">Create an account</button></>
            : <>Already have an account?{' '}<button className="zl-switch-btn" onClick={() => switchMode('login')} id="zl-to-login">Sign in</button></>
          }
        </p>
      </div>

    </div>
  );
}
