import { PRICES } from '../utils.js';

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
            piecePrice={PRICES.rasogula_piece}
            kgPrice={PRICES.sweets_kg}
          />
          <ProductCard
            img="/gulabjamun.png"
            alt="Fresh Gulabjamun"
            badge="🟤 Sweet"
            name="Gulabjamun"
            desc="Rich golden-brown milk dumplings soaked in rose-flavored sugar syrup, garnished with cardamom. Pure indulgence."
            piecePrice={PRICES.gulabjamun_piece}
            kgPrice={PRICES.sweets_kg}
          />
          <ProductCard
            img="/samosa.png"
            alt="Crispy Samosa"
            badge="🔺 Snack"
            name="Samosa"
            desc="Crispy golden pastry shell filled with perfectly spiced potatoes and peas. Best enjoyed with our homemade chutneys."
            piecePrice={PRICES.samosa_piece}
            kgPrice={null}
          />
          <ProductCard
            img="/boondi_laddu.png"
            alt="Boondi Laddu"
            badge="🟡 Sweet"
            name="Boondi Laddu"
            desc="Golden pearls of gram flour fried to perfection, dipped in flavored sugar syrup, and shaped into delicious traditional laddus."
            piecePrice={PRICES.boondi_laddu_piece}
            kgPrice={PRICES.boondi_laddu_kg}
          />
          <ProductCard
            img="/motichoor_laddu.png"
            alt="Motichoor Laddu"
            badge="🟡 Sweet"
            name="Motichoor Laddu"
            desc="Made with extremely fine gram flour droplets, cooked in pure ghee, and blended with cardamom and melon seeds."
            piecePrice={PRICES.motichoor_laddu_piece}
            kgPrice={PRICES.motichoor_laddu_kg}
          />
          <ProductCard
            img="/besan_laddu.png"
            alt="Besan Laddu"
            badge="🟡 Sweet"
            name="Besan Laddu"
            desc="Rich, aromatic laddus made by slow-roasting gram flour in pure ghee, sweetened, and topped with chopped nuts."
            piecePrice={PRICES.besan_laddu_piece}
            kgPrice={PRICES.besan_laddu_kg}
          />
          <ProductCard
            img="/cham_cham.png"
            alt="Cham Cham Sweet"
            badge="🍬 Sweet"
            name="Cham Cham"
            desc="Soft, oblong paneer dumplings cooked in sugar syrup, coated with desiccated coconut, and filled with rich mawa."
            piecePrice={PRICES.cham_cham_piece}
            kgPrice={PRICES.cham_cham_kg}
          />
          <ProductCard
            img="/namkeen_paara.png"
            alt="Namkeen Paara"
            badge="🔺 Snack"
            name="Namkeen Paara"
            desc="Crispy, crunchy, and savory diamond-cut crackers seasoned with ajwain (carom seeds). The perfect companion for tea."
            piecePrice={null}
            kgPrice={PRICES.namkeen_paara_kg}
          />
          <ProductCard
            img="/milk_cake.png"
            alt="Milk Cake"
            badge="🥛 Sweet"
            name="Milk Cake"
            desc="A rich, grain-textured sweet made of condensed milk, slow-cooked until caramelized to a perfect white and brown gradient."
            piecePrice={PRICES.milk_cake_piece}
            kgPrice={PRICES.milk_cake_kg}
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
          {piecePrice && (
            <>
              <span className="price-tag">₹{piecePrice}</span>
              <span className="price-unit">per piece</span>
            </>
          )}
          {piecePrice && kgPrice && <span className="price-divider">|</span>}
          {kgPrice && (
            <>
              <span className="price-tag">₹{kgPrice}</span>
              <span className="price-unit">per kg</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
