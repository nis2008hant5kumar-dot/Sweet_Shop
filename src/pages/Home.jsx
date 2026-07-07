export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <span className="hero-emoji">🛕</span>
          <h1 className="hero-title" id="hero-title">
            <span>'Shree Ram'</span><br />Aapna Misthan Bhandar
          </h1>
          <p className="hero-subtitle">Made with Love &amp; Tradition since Day One</p>
          <div className="hero-badge">🌿 Fresh &nbsp;•&nbsp; Pure &nbsp;•&nbsp; Delicious</div>
        </div>
      </section>

      {/* Products */}
      <section className="section" aria-labelledby="products-heading">
        <h2 className="section-title" id="products-heading">Our Special Items</h2>
        <p className="section-subtitle">Made fresh every day with pure ingredients</p>

        <div className="products-grid">
          <ProductCard
            img="/rasogula.png"
            alt="Fresh Rasogula"
            badge="🍬 Sweet"
            name="Rasogula"
            desc="Soft, spongy cottage cheese balls soaked in delicate sugar syrup. A timeless Indian classic that melts in your mouth."
            piecePrice={12}
            kgPrice={250}
          />
          <ProductCard
            img="/gulabjamun.png"
            alt="Fresh Gulabjamun"
            badge="🟤 Sweet"
            name="Gulabjamun"
            desc="Rich golden-brown milk dumplings soaked in rose-flavored sugar syrup, garnished with cardamom. Pure indulgence."
            piecePrice={12}
            kgPrice={250}
          />
          <ProductCard
            img="/samosa.png"
            alt="Crispy Samosa"
            badge="🔺 Snack"
            name="Samosa"
            desc="Crispy golden pastry shell filled with perfectly spiced potatoes and peas. Best enjoyed with our homemade chutneys."
            piecePrice={10}
            kgPrice={null}
          />
        </div>
      </section>

      {/* About Strip */}
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

function ProductCard({ img, alt, badge, name, desc, piecePrice, kgPrice }) {
  return (
    <article className="product-card">
      <div className="product-img-wrap">
        <img src={img} alt={alt} loading="lazy" />
        <span className="product-badge">{badge}</span>
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-desc">{desc}</p>
        <div className="product-price">
          <span className="price-tag">₹{piecePrice}</span>
          <span className="price-unit">per piece</span>
          {kgPrice && (
            <>
              <span className="price-divider">|</span>
              <span className="price-tag">₹{kgPrice}</span>
              <span className="price-unit">per kg</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
