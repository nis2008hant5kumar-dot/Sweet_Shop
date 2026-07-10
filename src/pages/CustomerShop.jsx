import { useState, useCallback, useEffect } from 'react';
import { PRICES, DB, dispatchOrderEvent, fmt } from '../utils.js';
import '../customer.css';

/* ── Product catalogue ────────────────────────────────────── */
const PRODUCTS = [
  { id: 'rasogula',      img: '/rasogula.png',        cat: 'sweet', name: 'Rasogula',        desc: 'Soft spongy cottage cheese balls soaked in rose-flavored sugar syrup.',       piecePrice: PRICES.rasogula_piece,        kgPrice: PRICES.sweets_kg },
  { id: 'gulabjamun',   img: '/gulabjamun.png',      cat: 'sweet', name: 'Gulabjamun',      desc: 'Golden milk dumplings soaked in aromatic rose sugar syrup.',                  piecePrice: PRICES.gulabjamun_piece,      kgPrice: PRICES.sweets_kg },
  { id: 'samosa',       img: '/samosa.png',          cat: 'snack', name: 'Samosa',          desc: 'Crispy pastry filled with spiced potatoes and peas — perfect evening snack.', piecePrice: PRICES.samosa_piece,          kgPrice: null },
  { id: 'boondi_laddu', img: '/boondi_laddu.png',    cat: 'sweet', name: 'Boondi Laddu',    desc: 'Golden gram flour pearls shaped into traditional festive sweet laddus.',       piecePrice: PRICES.boondi_laddu_piece,    kgPrice: PRICES.boondi_laddu_kg },
  { id: 'motichoor',    img: '/motichoor_laddu.png', cat: 'sweet', name: 'Motichoor Laddu', desc: 'Fine gram flour droplets cooked in pure ghee with fragrant cardamom.',         piecePrice: PRICES.motichoor_laddu_piece, kgPrice: PRICES.motichoor_laddu_kg },
  { id: 'besan_laddu',  img: '/besan_laddu.png',     cat: 'sweet', name: 'Besan Laddu',     desc: 'Slow-roasted gram flour in pure ghee, topped with chopped pistachios.',        piecePrice: PRICES.besan_laddu_piece,     kgPrice: PRICES.besan_laddu_kg },
  { id: 'cham_cham',    img: '/cham_cham.png',       cat: 'sweet', name: 'Cham Cham',       desc: 'Soft paneer dumplings coated with coconut & filled with rich mawa cream.',     piecePrice: PRICES.cham_cham_piece,       kgPrice: PRICES.cham_cham_kg },
  { id: 'namkeen_paara',img: '/namkeen_paara.png',   cat: 'snack', name: 'Namkeen Paara',   desc: 'Crunchy diamond-cut crackers seasoned with carom seeds & black pepper.',       piecePrice: null,                         kgPrice: PRICES.namkeen_paara_kg },
  { id: 'milk_cake',    img: '/milk_cake.png',       cat: 'sweet', name: 'Milk Cake',       desc: 'Condensed milk slow-cooked to a perfect caramelised white-brown sweet.',       piecePrice: PRICES.milk_cake_piece,       kgPrice: PRICES.milk_cake_kg },
];

const CATEGORIES = [
  { id: 'all',   label: '🍽️ All Items' },
  { id: 'sweet', label: '🍬 Sweets'    },
  { id: 'snack', label: '🔺 Snacks'    },
];

const PAYMENT_METHODS = [
  { id: 'googlepay', icon: '🟢', label: 'Google Pay',       type: 'upi' },
  { id: 'phonepe',   icon: '💜', label: 'PhonePe',          type: 'upi' },
  { id: 'paytm',     icon: '🔵', label: 'Paytm',            type: 'upi' },
  { id: 'navipay',   icon: '🟠', label: 'Navi Pay',         type: 'upi' },
  { id: 'cod',       icon: '💵', label: 'Cash on Delivery', type: 'cod' },
];

const STATUS_STEPS = [
  { key: 'pending',   icon: '🛒', label: 'Order Placed',   sub: 'We have received your order!' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Preparing',      sub: 'Being freshly made just for you...' },
  { key: 'ready',     icon: '✅', label: 'Ready!',         sub: 'Your order is ready for pickup' },
  { key: 'delivered', icon: '🎉', label: 'Delivered!',     sub: 'Enjoy your sweets! 🙏 Thank you!' },
];

/* ── Pure Veg indicator dot ─── */
function VegDot() {
  return (
    <div style={{ width: 16, height: 16, border: '2px solid #0a7a35', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a7a35' }} />
    </div>
  );
}

/* ── Quantity control ─── */
function QtyCtrl({ qty, onAdd, onRemove, small }) {
  return (
    <div className={`z-qty-ctrl${small ? ' z-qty-sm' : ''}`}>
      <button className="z-qty-btn" onClick={e => { e.stopPropagation(); onRemove(); }} aria-label="Remove one">−</button>
      <span className="z-qty-num">{qty}</span>
      <button className="z-qty-btn" onClick={e => { e.stopPropagation(); onAdd(); }} aria-label="Add one">+</button>
    </div>
  );
}

/* ── Zomato-style Menu Item ─── */
function MenuItem({ product, cartEntry, onAdd, onRemove }) {
  const defaultUnit = product.piecePrice ? 'piece' : 'kg';
  const [unit, setUnit] = useState(defaultUnit);
  const unitPrice = unit === 'piece' ? product.piecePrice : product.kgPrice;
  const qty = cartEntry?.find(e => e.unit === unit)?.qty || 0;
  const hasVariants = product.piecePrice && product.kgPrice;

  return (
    <div className="z-menu-item">
      {/* Left: details */}
      <div className="z-item-left">
        <VegDot />
        <div className="z-item-name">{product.name}</div>
        <div className="z-item-price">
          ₹{unitPrice}
          <span className="z-price-unit">/ {unit}</span>
        </div>
        <div className="z-item-desc">{product.desc}</div>
        {hasVariants && (
          <div className="z-unit-pills">
            <button className={`z-unit-pill ${unit === 'piece' ? 'active' : ''}`} onClick={() => setUnit('piece')} id={`z-up-${product.id}`}>Piece</button>
            <button className={`z-unit-pill ${unit === 'kg' ? 'active' : ''}`} onClick={() => setUnit('kg')} id={`z-uk-${product.id}`}>Per Kg</button>
          </div>
        )}
      </div>
      {/* Right: image + add button */}
      <div className="z-item-right">
        <img
          src={product.img}
          alt={product.name}
          className="z-item-img"
          onError={e => { e.target.style.opacity = '0.3'; }}
          loading="lazy"
        />
        {qty === 0 ? (
          <button className="z-add-btn" onClick={() => onAdd(product, unit, unitPrice)} id={`z-add-${product.id}`}>ADD</button>
        ) : (
          <QtyCtrl qty={qty} onAdd={() => onAdd(product, unit, unitPrice)} onRemove={() => onRemove(product, unit)} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LIVE ORDER TRACKING PAGE
   ═══════════════════════════════════════ */
function TrackingPage({ orderId, orderStatus, orderTotal, onOrderAgain }) {
  const curIdx   = STATUS_STEPS.findIndex(s => s.key === orderStatus);
  const isDone   = orderStatus === 'delivered';

  return (
    <div className="z-track-page">
      {/* Header */}
      <div className="z-track-header">
        <div className="z-track-icon-wrap">
          <span style={{ fontSize: '2.5rem' }}>🛕</span>
        </div>
        <div className="z-track-shop">Shree Ram Misthan Bhandar</div>
        <div className="z-track-oid">Order #{orderId}</div>
        {!isDone && <div className="z-track-live-badge">🔴 LIVE TRACKING</div>}
      </div>

      {/* Status card */}
      <div className="z-track-card">
        <div className="z-track-status-title">
          {isDone ? '🎉 Your order has been delivered!' : '⏳ Tracking your order...'}
        </div>

        {/* Animated step indicator */}
        <div className="z-stepper">
          {STATUS_STEPS.map((step, i) => {
            const stepDone    = i < curIdx;
            const stepCurrent = i === curIdx;
            const isLast      = i === STATUS_STEPS.length - 1;
            return (
              <div key={step.key} className={`z-step${stepDone ? ' done' : ''}${stepCurrent ? ' current' : ''}`}>
                <div className="z-step-col">
                  <div className="z-step-dot">
                    {stepDone ? '✓' : step.icon}
                  </div>
                  {!isLast && <div className={`z-step-line${stepDone ? ' done' : ''}`} />}
                </div>
                <div className="z-step-body">
                  <div className="z-step-label">{step.label}</div>
                  {stepCurrent && <div className="z-step-sub">{step.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="z-track-amount">
          <span>Amount Paid</span>
          <strong style={{ color: '#C0392B', fontSize: '1.05rem' }}>{fmt(orderTotal)}</strong>
        </div>
      </div>

      {/* Live polling note */}
      {!isDone && (
        <div className="z-track-note">
          <div className="z-live-dot" />
          Status updates automatically every few seconds
        </div>
      )}

      {/* Delivered — order again */}
      {isDone && (
        <div className="z-delivered-anim">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎊</div>
          <div style={{ padding: '0 1.25rem' }}>
            <button className="z-confirm-btn" onClick={onOrderAgain} id="z-order-again">
              🛒 Order Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   CART PAGE
   ═══════════════════════════════════════ */
function CartPage({ cartItems, onAdd, onRemove, onBack, onCheckout }) {
  const subtotal   = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="z-empty-page">
        <span style={{ fontSize: '4rem' }}>🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add some delicious sweets or snacks to get started!</p>
        <button className="z-confirm-btn" style={{ marginTop: '0.75rem', padding: '0.85rem 2rem', width: 'auto' }} onClick={onBack}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="z-subpage">
      <div className="z-subpage-header">
        <button className="z-back-btn" onClick={onBack} aria-label="Back to menu">←</button>
        <h2>Your Cart</h2>
      </div>

      {/* Restaurant label */}
      <div className="z-restaurant-chip">
        <span>🛕</span>
        <div>
          <div className="z-rc-name">Shree Ram Misthan Bhandar</div>
          <div className="z-rc-sub">Pure Vegetarian · Sweets & Snacks</div>
        </div>
      </div>

      {/* Items */}
      <div className="z-cart-block">
        {cartItems.map((item, i) => (
          <div key={i} className="z-cart-row">
            <VegDot />
            <div className="z-cart-row-info">
              <div className="z-cr-item-name">{item.name}</div>
              <div className="z-cr-item-unit">per {item.unit}</div>
            </div>
            <QtyCtrl
              qty={item.qty}
              onAdd={() => {
                const p = PRODUCTS.find(p => p.id === item.pid);
                if (p) onAdd(p, item.unit, item.price);
              }}
              onRemove={() => {
                const p = PRODUCTS.find(p => p.id === item.pid);
                if (p) onRemove(p, item.unit);
              }}
              small
            />
            <div className="z-cr-item-price">₹{item.qty * item.price}</div>
          </div>
        ))}
      </div>

      {/* Bill */}
      <div className="z-bill-block">
        <div className="z-bill-header">Bill Details</div>
        <div className="z-bill-line"><span>Item Total</span><span>₹{subtotal}</span></div>
        <div className="z-bill-line"><span>Delivery Charge</span><span className="z-free-tag">FREE</span></div>
        <hr className="z-bill-hr" />
        <div className="z-bill-line z-bill-total-line">
          <span>To Pay</span>
          <span>₹{subtotal}</span>
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="z-bottom-action">
        <div>
          <div className="z-ba-title">{totalItems} {totalItems === 1 ? 'item' : 'items'} · ₹{subtotal}</div>
          <div className="z-ba-sub">No extra charges</div>
        </div>
        <button className="z-proceed-btn" onClick={onCheckout} id="z-to-checkout">
          Proceed to Pay →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════ */
function CheckoutPage({ cartItems, totalPrice, onBack, onPlaceOrder, placing }) {
  const [payment, setPayment] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div className="z-subpage">
      <div className="z-subpage-header">
        <button className="z-back-btn" onClick={onBack} aria-label="Back to cart">←</button>
        <h2>Checkout</h2>
      </div>

      {/* Delivery info */}
      <div className="z-checkout-section">
        <div className="z-cs-title">📍 Delivery / Pickup Info</div>
        <textarea
          className="z-textarea"
          placeholder="e.g. Home delivery — Room 4, Table 3, Counter pickup..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          rows={3}
          id="z-addr"
        />
      </div>

      {/* Payment */}
      <div className="z-checkout-section">
        <div className="z-cs-title">💳 Choose Payment Method</div>
        <div className="z-pay-list">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              className={`z-pay-opt${payment === pm.id ? ' sel' : ''}`}
              onClick={() => setPayment(pm.id)}
              id={`z-pm-${pm.id}`}
            >
              <span className="z-po-icon">{pm.icon}</span>
              <span className="z-po-label">{pm.label}</span>
              {pm.type === 'upi' && <span className="z-po-badge">UPI</span>}
              <span className={`z-po-check${payment === pm.id ? ' v' : ''}`}>✓</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="z-checkout-section">
        <div className="z-cs-title">🧾 Order Summary</div>
        {cartItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', fontSize: '0.83rem', color: '#555' }}>
            <span>{item.name} ({item.unit}) ×{item.qty}</span>
            <span style={{ fontWeight: 600 }}>₹{item.qty * item.price}</span>
          </div>
        ))}
        <hr className="z-bill-hr" style={{ margin: '0.75rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
          <span>Total</span>
          <span style={{ color: '#C0392B' }}>₹{totalPrice}</span>
        </div>
      </div>

      {/* Place order */}
      <div style={{ padding: '1rem 1.25rem 2rem' }}>
        {!payment && <div className="z-warn-text">⚠️ Select a payment method to continue</div>}
        <button
          className="z-confirm-btn"
          onClick={() => onPlaceOrder(payment, address)}
          disabled={!payment || placing}
          id="z-place-order"
        >
          {placing ? '⏳ Placing your order...' : `🎉 Place Order · ₹${totalPrice}`}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN CUSTOMER SHOP — ZOMATO STYLE
   ═══════════════════════════════════════════════════════════ */
export default function CustomerShop({ customer }) {
  const [cart, setCart]               = useState({});
  const [step, setStep]               = useState('menu'); // menu | cart | checkout | tracking
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [placing, setPlacing]         = useState(false);
  const [orderId, setOrderId]         = useState('');
  const [orderDbId, setOrderDbId]     = useState(null);
  const [orderTotal, setOrderTotal]   = useState(0);
  const [orderStatus, setOrderStatus] = useState('pending');

  /* ── Cart helpers ─── */
  const addToCart = useCallback((product, unit, price) => {
    setCart(prev => {
      const entries = prev[product.id] ? [...prev[product.id]] : [];
      const idx     = entries.findIndex(e => e.unit === unit);
      if (idx >= 0) entries[idx] = { ...entries[idx], qty: entries[idx].qty + 1 };
      else          entries.push({ unit, qty: 1, price, name: product.name });
      return { ...prev, [product.id]: entries };
    });
  }, []);

  const removeFromCart = useCallback((product, unit) => {
    setCart(prev => {
      const entries = (prev[product.id] || [])
        .map(e => e.unit === unit ? { ...e, qty: e.qty - 1 } : e)
        .filter(e => e.qty > 0);
      if (!entries.length) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: entries };
    });
  }, []);

  /* Flat cart array */
  const cartItems  = Object.entries(cart).flatMap(([pid, entries]) => entries.map(e => ({ pid, ...e })));
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  /* Filtered products */
  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat    = category === 'all' || p.cat === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── Place order ─── */
  function placeOrder(payment, address) {
    if (!payment) return;
    setPlacing(true);
    setTimeout(() => {
      const order = DB.push('orders', {
        customerId:    customer.id,
        customerName:  customer.name,
        customerPhone: customer.phone,
        items:         cartItems,
        total:         totalPrice,
        paymentMethod: payment,
        address:       address.trim() || 'Counter pickup',
        status:        'pending',
        placedAt:      new Date().toISOString(),
      });
      dispatchOrderEvent();
      setOrderId(String(Math.floor(order.id)).slice(-6));
      setOrderDbId(order.id);
      setOrderTotal(totalPrice);
      setOrderStatus('pending');
      setCart({});
      setStep('tracking');
      setPlacing(false);
    }, 900);
  }

  /* ── Poll order status when tracking ─── */
  useEffect(() => {
    if (step !== 'tracking' || !orderDbId) return;
    const poll = setInterval(() => {
      const found = DB.get('orders').find(o => o.id === orderDbId);
      if (found) setOrderStatus(found.status);
    }, 3000);
    return () => clearInterval(poll);
  }, [step, orderDbId]);

  /* ── Subpage routing ─── */
  if (step === 'tracking') {
    return (
      <TrackingPage
        orderId={orderId}
        orderStatus={orderStatus}
        orderTotal={orderTotal}
        onOrderAgain={() => { setStep('menu'); setOrderId(''); setOrderDbId(null); }}
      />
    );
  }
  if (step === 'cart') {
    return (
      <CartPage
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onBack={() => setStep('menu')}
        onCheckout={() => setStep('checkout')}
      />
    );
  }
  if (step === 'checkout') {
    return (
      <CheckoutPage
        cartItems={cartItems}
        totalPrice={totalPrice}
        onBack={() => setStep('cart')}
        onPlaceOrder={placeOrder}
        placing={placing}
      />
    );
  }

  /* ════════════════════════════
     MENU PAGE
     ════════════════════════════ */
  return (
    <div className="z-app">

      {/* ── Restaurant Banner ── */}
      <div className="z-banner" role="banner">
        <div className="z-banner-overlay" aria-hidden="true" />
        <div className="z-banner-content">
          <span className="z-banner-emoji" aria-hidden="true">🛕</span>
          <h1 className="z-banner-name">Shree Ram Misthan Bhandar</h1>
          <div className="z-banner-tags">
            <span className="z-btag">🍬 Sweets</span>
            <span className="z-btag">🔺 Snacks</span>
            <span className="z-btag">🌿 Pure Veg</span>
            <span className="z-btag">📦 Daily Fresh</span>
          </div>
          <div className="z-banner-meta">
            <span>⭐ 4.8</span>
            <span className="z-meta-dot">·</span>
            <span>Local Pickup</span>
            <span className="z-meta-dot">·</span>
            <span>Fresh Every Day</span>
          </div>
        </div>
        {/* Info chips row */}
        <div className="z-banner-info-row">
          <div className="z-info-chip">
            <span className="z-ic-val">⭐ 4.8</span>
            <span className="z-ic-lbl">Rating</span>
          </div>
          <div className="z-info-chip">
            <span className="z-ic-val">🌿 100%</span>
            <span className="z-ic-lbl">Pure Veg</span>
          </div>
          <div className="z-info-chip">
            <span className="z-ic-val">🕐 Daily</span>
            <span className="z-ic-lbl">Fresh</span>
          </div>
        </div>
        <div className="z-banner-welcome">
          👋 Hi, <strong>&nbsp;{customer.name}</strong>! What would you like today?
        </div>
      </div>

      {/* ── Sticky Search + Category ── */}
      <div className="z-sticky-top">
        <div className="z-search-bar">
          <span className="z-si" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="z-search-in"
            placeholder="Search sweets, snacks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="z-search"
            aria-label="Search menu"
          />
          {search && (
            <button className="z-s-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>
        <div className="z-cat-row" role="tablist" aria-label="Menu categories">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`z-cat-btn${category === c.id ? ' on' : ''}`}
              onClick={() => setCategory(c.id)}
              id={`z-cat-${c.id}`}
              role="tab"
              aria-selected={category === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Items ── */}
      <div className="z-menu-wrap" role="main">
        {filteredProducts.length === 0 ? (
          <div className="z-no-results">
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <p>No results for "<strong>{search}</strong>"</p>
            <button style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#C0392B', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem' }} onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          filteredProducts.map(product => (
            <MenuItem
              key={product.id}
              product={product}
              cartEntry={cart[product.id]}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      {/* Spacer so content doesn't hide behind floating bar */}
      {totalItems > 0 && <div style={{ height: '80px' }} aria-hidden="true" />}

      {/* ── Floating Cart Bar ── */}
      {totalItems > 0 && (
        <button
          className="z-cart-fab"
          onClick={() => setStep('cart')}
          id="z-open-cart"
          aria-label={`View cart: ${totalItems} items, ₹${totalPrice}`}
        >
          <div className="z-cfab-left">
            <span className="z-cfab-count">{totalItems}</span>
            <span className="z-cfab-items">{totalItems === 1 ? 'item' : 'items'} added</span>
          </div>
          <span className="z-cfab-center">View Cart →</span>
          <span className="z-cfab-price">₹{totalPrice}</span>
        </button>
      )}
    </div>
  );
}
