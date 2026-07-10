import { useState } from 'react';
import { CustomerAuth } from '../utils.js';

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
      setError('Please fill all fields.'); return;
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit phone number.'); return;
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
    }, 400);
  }

  return (
    <div className="cust-login-bg">
      <div className="cust-login-card">
        {/* Header */}
        <div className="cust-login-header">
          <span className="cust-login-icon">🛕</span>
          <h1 className="cust-login-shop">Shree Ram</h1>
          <p className="cust-login-sub">Aapna Misthan Bhandar</p>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
            id="auth-tab-signup"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Your Name</label>
              <input
                id="auth-name"
                className="form-input"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-phone">Phone Number</label>
            <input
              id="auth-phone"
              className="form-input"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
              autoComplete="tel"
              inputMode="numeric"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass">Password</label>
            <input
              id="auth-pass"
              className="form-input"
              type="password"
              placeholder="Min 4 characters"
              value={password}
              onChange={e => setPass(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full auth-submit"
            id="auth-submit"
            disabled={loading}
          >
            {loading ? '⏳ Please wait…' : mode === 'login' ? '🔓 Sign In' : '🎉 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login'
            ? <>New here? <button className="auth-link" onClick={() => { setMode('signup'); setError(''); }}>Create an account</button></>
            : <>Already have an account? <button className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
}
