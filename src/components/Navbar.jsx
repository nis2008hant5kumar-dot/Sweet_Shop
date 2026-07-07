export default function Navbar({ page, onNavigate }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <span className="nav-brand-main">🛕 'Shree Ram' Misthan Bhandar</span>
        <span className="nav-brand-sub">Aapna Misthan Bhandar</span>
      </div>
      <ul className="nav-links" style={{ listStyle: 'none', display: 'flex', gap: '0.25rem' }}>
        <li>
          <button
            className={`nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
            id="nav-home"
          >
            🏠 Home
          </button>
        </li>
        <li>
          <button
            className={`nav-link highlight ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('pin')}
            id="nav-records"
          >
            🔒 My Records
          </button>
        </li>
      </ul>
    </nav>
  );
}
