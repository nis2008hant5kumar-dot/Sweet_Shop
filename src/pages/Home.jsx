export default function Home({ onNavigate }) {
  return (
    <>
      {/* Hero */}
      <section className="hero landing-hero" aria-labelledby="landing-title">
        <div className="hero-content">
          <span className="hero-emoji">🛕</span>
          <h1 className="hero-title" id="landing-title">
            <span>'Shree Ram'</span><br />Aapna Misthan Bhandar
          </h1>
          <p className="hero-subtitle">Made with Love &amp; Tradition since Day One</p>
          <div className="hero-badge">🌿 Fresh &nbsp;•&nbsp; Pure &nbsp;•&nbsp; Delicious</div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="landing-section" aria-labelledby="role-heading">
        <h2 className="section-title" id="role-heading">Welcome! Who are you?</h2>
        <p className="section-subtitle">Choose your role to get started</p>

        <div className="role-cards">
          {/* Customer Card */}
          <button
            className="role-card customer-card"
            onClick={() => onNavigate('customer-login')}
            id="role-customer"
          >
            <div className="role-card-icon">🛒</div>
            <h3 className="role-card-title">I'm a Customer</h3>
            <p className="role-card-desc">
              Browse our fresh sweets &amp; snacks, add items to cart, and place an order with your
              preferred payment method.
            </p>
            <div className="role-card-features">
              <span>✓ Browse Menu</span>
              <span>✓ Add to Cart</span>
              <span>✓ UPI / Cash Payment</span>
            </div>
            <div className="role-card-cta">Order Now →</div>
          </button>

          {/* Seller Card */}
          <button
            className="role-card seller-card"
            onClick={() => onNavigate('pin')}
            id="role-seller"
          >
            <div className="role-card-icon">🔒</div>
            <h3 className="role-card-title">I'm the Seller</h3>
            <p className="role-card-desc">
              Access private shop records, view incoming customer orders, track daily sales,
              milk &amp; oil entries, and profit summary.
            </p>
            <div className="role-card-features">
              <span>✓ View Orders</span>
              <span>✓ Daily Sales</span>
              <span>✓ Profit Reports</span>
            </div>
            <div className="role-card-cta">Enter Dashboard →</div>
          </button>
        </div>
      </section>

      {/* About strip */}
      <div className="about-strip" role="complementary">
        <h2>Why Choose Shree Ram?</h2>
        <p>
          We use only the freshest milk and premium ingredients to craft our sweets and snacks.
          Every bite is made with devotion, tradition, and the warmth of home. 🙏
        </p>
      </div>

      <footer>
        <p>
          Made with ❤️ for <span>'Shree Ram' Aapna Misthan Bhandar</span> &nbsp;|&nbsp; Nishant's Shop
        </p>
      </footer>
    </>
  );
}
