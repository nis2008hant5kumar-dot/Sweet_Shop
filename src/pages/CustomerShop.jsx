import { useState, useCallback } from 'react';
import { PRICES, DB, dispatchOrderEvent } from '../utils.js';

/* ── Product catalogue ─────────────────────────────────────── */
const PRODUCTS = [
  { id: 'rasogula',       img: '/rasogula.png',       badge: '🍬 Sweet',  name: 'Rasogula',        desc: 'Soft spongy cottage cheese balls in sugar syrup.',                      piecePrice: PRICES.rasogula_piece,        kgPrice: PRICES.sweets_kg },
  { id: 'gulabjamun',    img: '/gulabjamun.png',    badge: '🟤 Sweet',  name: 'Gulabjamun',      desc: 'Golden milk dumplings soaked in rose-flavored sugar syrup.',            piecePrice: PRICES.gulabjamun_piece,      kgPrice: PRICES.sweets_kg },
  { id: 'samosa',        img: '/samosa.png',        badge: '🔺 Snack',  name: 'Samosa',           desc: 'Crispy pastry filled with spiced potatoes and peas.',                   piecePrice: PRICES.samosa_piece,          kgPrice: null },
  { id: 'boondi_laddu',  img: '/boondi_laddu.png',  badge: '🟡 Sweet',  name: 'Boondi Laddu',     desc: 'Golden gram flour pearls shaped into traditional sweet laddus.',         piecePrice: PRICES.boondi_laddu_piece,    kgPrice: PRICES.boondi_laddu_kg },
  { id: 'motichoor',     img: '/motichoor_laddu.png',badge: '🟡 Sweet',  name: 'Motichoor Laddu',  desc: 'Fine gram flour droplets cooked in pure ghee with cardamom.',            piecePrice: PRICES.motichoor_laddu_piece, kgPrice: PRICES.motichoor_laddu_kg },
  { id: 'besan_laddu',   img: '/besan_laddu.png',   badge: '🟡 Sweet',  name: 'Besan Laddu',      desc: 'Slow-roasted gram flour in ghee, topped with chopped nuts.',             piecePrice: PRICES.besan_laddu_piece,     kgPrice: PRICES.besan_laddu_kg },
  { id: 'cham_cham',     img: '/cham_cham.png',     badge: '🍬 Sweet',  name: 'Cham Cham',        desc: 'Soft paneer dumplings coated with coconut, filled with rich mawa.',      piecePrice: PRICES.cham_cham_piece,       kgPrice: PRICES.cham_cham_kg },
  { id: 'namkeen_paara', img: '/namkeen_paara.png', badge: '🔺 Snack',  name: 'Namkeen Paara',    desc: 'Crunchy diamond-cut crackers seasoned with carom seeds.',                piecePrice: null,                         kgPrice: PRICES.namkeen_paara_kg },
  { id: 'milk_cake',     img: '/milk_cake.png',     badge: '🥛 Sweet',  name: 'Milk Cake',        desc: 'Condensed milk slow-cooked to a caramelised perfect white-brown sweet.', piecePrice: PRICES.milk_cake_piece,       kgPrice: PRICES.milk_cake_kg },
];

const PAYMENT_METHODS = [
  { id: 'googlepay', icon: '🟢', label: 'Google Pay',  type: 'upi' },
  { id: 'phonepe',   icon: '💜', label: 'PhonePe',     type: 'upi' },
  { id: 'paytm',     icon: '🔵', label: 'Paytm',       type: 'upi' },
  { id: 'navipay',   icon: '🟠', label: 'Navi Pay',    type: 'upi' },
  { id: 'cod',       icon: '💵', label: 'Cash on Delivery', type: 'cod' },
];

/* ── Unit selector used inside each card ────────────────────── */
function UnitSelector({ product, cartEntry, onAdd, onRemove }) {
  const [unit, setUnit] = useState(product.piecePrice ? 'piece' : 'kg');
  const unitPrice = unit === 'piece' ? product.piecePrice : product.kgPrice;
  const qty = cartEntry?.find(e => e.unit === unit)?.qty || 0;

  return (
    <div className="product-order-area">
      {product.piecePrice && product.kgPrice && (
        <div className="unit-toggle">
          <button
            className={`unit-btn ${unit === 'piece' ? 'active' : ''}`}
            onClick={() => setUnit('piece')}
            id={`unit-piece-${product.id}`}
          >Per Piece</button>
          <button
            className={`unit-btn ${unit === 'kg' ? 'active' : ''}`}
            onClick={() => setUnit('kg')}
            id={`unit-kg-${product.id}`}
          >Per Kg</button>
        </div>
      )}
      <div className="price-qty-row">
        <span className="price-tag">₹{unitPrice}</span>
        <span className="price-unit">/{unit}</span>
        {qty === 0 ? (
          <button
            className="btn btn-primary btn-sm add-btn"
            onClick={() => onAdd(product, unit, unitPrice)}
            id={`add-${product.id}-${unit}`}
          >
            + Add
          </button>
        ) : (
          <div className="qty-control">
            <button className="qty-btn" onClick={() => onRemove(product, unit)} id={`dec-${product.id}-${unit}`}>−</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => onAdd(product, unit, unitPrice)} id={`inc-${product.id}-${unit}`}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function CustomerShop({ customer, onLogout }) {
  const [cart, setCart]           = useState({}); // { productId: [{unit, qty, price, name}] }
  const [showCart, setShowCart]   = useState(false);
  const [step, setStep]           = useState('shop'); // 'shop' | 'checkout' | 'success'
  const [payment, setPayment]     = useState('');
  const [address, setAddress]     = useState('');
  const [placingOrder, setPlacing]= useState(false);
  const [orderId, setOrderId]     = useState('');

  /* cart helpers */
  const addToCart = useCallback((product, unit, price) => {
    setCart(prev => {
      const entries = prev[product.id] ? [...prev[product.id]] : [];
      const idx = entries.findIndex(e => e.unit === unit);
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], qty: entries[idx].qty + 1 };
      } else {
        entries.push({ unit, qty: 1, price, name: product.name });
      }
      return { ...prev, [product.id]: entries };
    });
  }, []);

  const removeFromCart = useCallback((product, unit) => {
    setCart(prev => {
      const entries = (prev[product.id] || []).map(e =>
        e.unit === unit ? { ...e, qty: e.qty - 1 } : e
      ).filter(e => e.qty > 0);
      if (entries.length === 0) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: entries };
    });
  }, []);

  /* flat list of cart items */
  const cartItems = Object.entries(cart).flatMap(([pid, entries]) =>
    entries.map(e => ({ pid, ...e }))
  );
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  /* place order */
  function placeOrder() {
    if (!payment) return;
    setPlacing(true);
    setTimeout(() => {
      const order = DB.push('orders', {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cartItems,
        total: totalPrice,
        paymentMethod: payment,
        address: address.trim() || 'Counter pickup',
        status: 'pending',
        placedAt: new Date().toISOString(),
      });
      dispatchOrderEvent();
      setOrderId(String(Math.floor(order.id)).slice(-6));
      setCart({});
      setStep('success');
      setPlacing(false);
    }, 700);
  }

  /* ── Success screen ─────────────────────── */
  if (step === 'success') {
    return (
      <div className="order-success-bg">
        <div className="order-success-card">
          <div className="success-anim">✅</div>
          <h2>Order Placed!</h2>
          <p className="success-oid">Order #{orderId}</p>
          <p className="success-msg">
            Thank you, <strong>{customer.name}</strong>! Your order has been sent to the shop.
            We'll prepare it fresh for you. 🙏
          </p>
          <div className="success-payment">
            {PAYMENT_METHODS.find(p => p.id === payment)?.icon}&nbsp;
            {PAYMENT_METHODS.find(p => p.id === payment)?.label}
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => setStep('shop')}
            id="order-again-btn"
          >
            🛒 Order Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Checkout screen ────────────────────── */
  if (step === 'checkout') {
    return (
      <div className="checkout-overlay">
        <div className="checkout-modal">
          <div className="checkout-header">
            <button className="back-btn" onClick={() => setStep('shop')} id="checkout-back">← Back</button>
            <h2>🧾 Your Order</h2>
          </div>

          {/* Order summary */}
          <div className="checkout-items">
            {cartItems.map((item, i) => (
              <div key={i} className="checkout-item">
                <span className="ci-name">{item.name} <small>({item.unit})</small></span>
                <span className="ci-qty">×{item.qty}</span>
                <span className="ci-price">₹{item.qty * item.price}</span>
              </div>
            ))}
            <div className="checkout-total">
              <span>Total</span>
              <span className="ct-amount">₹{totalPrice}</span>
            </div>
          </div>

          {/* Address */}
          <div className="form-group" style={{ margin: '1rem 0 0.5rem' }}>
            <label className="form-label" htmlFor="delivery-address">Delivery / Notes (optional)</label>
            <input
              id="delivery-address"
              className="form-input"
              type="text"
              placeholder="e.g. Home delivery, Room 4 / Counter pickup"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Payment */}
          <p className="payment-label">💳 Choose Payment Method</p>
          <div className="payment-options">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.id}
                className={`payment-option ${payment === pm.id ? 'selected' : ''}`}
                onClick={() => setPayment(pm.id)}
                id={`pay-${pm.id}`}
              >
                <span className="pm-icon">{pm.icon}</span>
                <span className="pm-label">{pm.label}</span>
                {pm.type === 'upi' && <span className="pm-badge">UPI</span>}
              </button>
            ))}
          </div>

          {!payment && <p className="pay-hint">Please select a payment method to continue.</p>}

          <button
            className="btn btn-primary w-full confirm-btn"
            onClick={placeOrder}
            disabled={!payment || placingOrder}
            id="confirm-order-btn"
          >
            {placingOrder ? '⏳ Placing Order…' : `✅ Confirm Order · ₹${totalPrice}`}
          </button>
        </div>
      </div>
    );
  }

  /* ── Shop screen ────────────────────────── */
  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="shop-hero-title">
        <div className="hero-content">
          <span className="hero-emoji">🛕</span>
          <h1 className="hero-title" id="shop-hero-title">
            <span>'Shree Ram'</span><br />Aapna Misthan Bhandar
          </h1>
          <p className="hero-subtitle">Welcome, {customer.name} 👋 — Order fresh sweets!</p>
          <div className="hero-badge">🌿 Fresh &nbsp;•&nbsp; Pure &nbsp;•&nbsp; Delicious</div>
        </div>
      </section>

      {/* Products */}
      <section className="section" aria-labelledby="menu-heading">
        <h2 className="section-title" id="menu-heading">Our Special Items</h2>
        <p className="section-subtitle">Made fresh every day — add to cart and order!</p>

        <div className="products-grid">
          {PRODUCTS.map(p => (
            <article className="product-card" key={p.id}>
              <div className="product-img-wrap">
                <img src={p.img} alt={p.name} loading="lazy" />
                <span className="product-badge">{p.badge}</span>
              </div>
              <div className="product-info">
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.desc}</p>
                <UnitSelector
                  product={p}
                  cartEntry={cart[p.id]}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <div className="about-strip" role="complementary">
        <h2>Why Choose Shree Ram?</h2>
        <p>
          We use only the freshest milk and premium ingredients to craft our sweets and snacks.
          Every bite is made with devotion, tradition, and the warmth of home. 🙏
        </p>
      </div>

      <footer>
        <p>Made with ❤️ for <span>'Shree Ram' Aapna Misthan Bhandar</span> &nbsp;|&nbsp; Nishant's Shop</p>
      </footer>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          className="cart-fab"
          onClick={() => setStep('checkout')}
          id="cart-fab-btn"
        >
          🛒 <span className="cart-fab-count">{totalItems}</span>
          <span className="cart-fab-price">₹{totalPrice}</span>
          <span className="cart-fab-action">Checkout →</span>
        </button>
      )}
    </>
  );
}
