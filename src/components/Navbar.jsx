export default function Navbar({ page, onNavigate, customer, onCustomerLogout }) {
  const isCustomerShop = page === 'customer-shop';
  const isDashboard    = page === 'dashboard';
  const isCustomerLogin= page === 'customer-login';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <span className="nav-brand-main">🛕 'Shree Ram' Misthan Bhandar</span>
        <span className="nav-brand-sub">Aapna Misthan Bhandar</span>
      </div>

      <ul className="nav-links" style={{ listStyle: 'none', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {/* Always show Home */}
        {!isCustomerShop && !isDashboard && (
          <li>
            <button
              className={`nav-link ${page === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
              id="nav-home"
            >
              🏠 Home
            </button>
          </li>
        )}

        {/* Customer shop — show customer name + logout */}
        {isCustomerShop && customer && (
          <>
            <li>
              <span className="nav-customer-name">👤 {customer.name}</span>
            </li>
            <li>
              <button
                className="nav-link"
                onClick={() => onNavigate('home')}
                id="nav-back-home"
              >
                🏠 Home
              </button>
            </li>
            <li>
              <button
                className="nav-link highlight"
                onClick={onCustomerLogout}
                id="nav-customer-logout"
              >
                🚪 Logout
              </button>
            </li>
          </>
        )}

        {/* Customer login page — back button */}
        {isCustomerLogin && (
          <li>
            <button
              className="nav-link"
              onClick={() => onNavigate('home')}
              id="nav-back-from-login"
            >
              ← Back
            </button>
          </li>
        )}

        {/* Normal pages — show My Records button */}
        {!isCustomerShop && !isDashboard && !isCustomerLogin && (
          <li>
            <button
              className="nav-link highlight"
              onClick={() => onNavigate('pin')}
              id="nav-records"
            >
              🔒 My Records
            </button>
          </li>
        )}

        {/* Dashboard — show back to home */}
        {isDashboard && (
          <li>
            <button
              className="nav-link"
              onClick={() => onNavigate('home')}
              id="nav-dash-home"
            >
              🏠 Home
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
