import { useState, useEffect, useCallback } from 'react';
import { DB, today, fmt } from '../utils.js';

const STATUS_LABELS = {
  pending:    { label: '🕐 Pending',    cls: 'status-pending' },
  preparing:  { label: '👨‍🍳 Preparing', cls: 'status-preparing' },
  ready:      { label: '✅ Ready',      cls: 'status-ready' },
  delivered:  { label: '🎉 Delivered',  cls: 'status-delivered' },
};

const PAYMENT_ICONS = {
  googlepay: '🟢',
  phonepe:   '💜',
  paytm:     '🔵',
  navipay:   '🟠',
  cod:       '💵',
};
const PAYMENT_LABELS = {
  googlepay: 'Google Pay',
  phonepe:   'PhonePe',
  paytm:     'Paytm',
  navipay:   'Navi Pay',
  cod:       'Cash on Delivery',
};

function timeSince(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

export default function OrdersTab({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'ready' | 'delivered'

  const loadOrders = useCallback(() => {
    const all = DB.get('orders').sort((a, b) => b.id - a.id);
    setOrders(all);
  }, []);

  /* Initial load + polling every 5 s */
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  /* Custom event from same tab when customer places order */
  useEffect(() => {
    window.addEventListener('shreeRamNewOrder', loadOrders);
    return () => window.removeEventListener('shreeRamNewOrder', loadOrders);
  }, [loadOrders]);

  /* Auto-save order total to Daily Sales when delivered */
  function saveOrderToSales(order) {
    const dateKey = today();
    const note    = `Order #${String(Math.floor(order.id)).slice(-6)} — ${order.customerName}`;
    const allSales = DB.get('sales');
    const existing = allSales.find(r => r.date === dateKey && r.orderId === order.id);
    if (existing) return; // already saved (guard against double-click)

    DB.push('sales', {
      date:    dateKey,
      earning: order.total,
      note,
      orderId: order.id,         // tag so we can de-dup
      source:  'order',
    });

    if (showToast) showToast(`💰 ${fmt(order.total)} auto-saved to Daily Sales!`, 'ok');
  }

  function updateStatus(id, newStatus) {
    // Find the order before updating so we can read its data
    const order = DB.get('orders').find(o => o.id === id);
    DB.update('orders', id, { status: newStatus });

    // When delivered → auto-save to sales
    if (newStatus === 'delivered' && order) {
      saveOrderToSales(order);
    }

    loadOrders();
  }

  function deleteOrder(id) {
    if (!window.confirm('Delete this order record?')) return;
    DB.remove('orders', id);
    loadOrders();
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="dash-body">
      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-box">
          <div className="stat-val">{orders.length}</div>
          <div className="stat-lbl">Total Orders</div>
        </div>
        <div className={`stat-box ${pendingCount > 0 ? 'warn' : 'green'}`}>
          <div className="stat-val">{pendingCount}</div>
          <div className="stat-lbl">Pending</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{orders.filter(o => o.status === 'preparing').length}</div>
          <div className="stat-lbl">Preparing</div>
        </div>
        <div className="stat-box green">
          <div className="stat-val">{orders.filter(o => o.status === 'delivered').length}</div>
          <div className="stat-lbl">Delivered</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
        <label>Filter:</label>
        {['all', 'pending', 'preparing', 'ready', 'delivered'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
            id={`order-filter-${f}`}
            style={{ textTransform: 'capitalize' }}
          >
            {f === 'all' ? '📋 All' : STATUS_LABELS[f]?.label}
          </button>
        ))}
        <button className="btn btn-sm btn-ghost" onClick={loadOrders} id="orders-refresh" style={{ marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>{filter === 'all' ? 'No orders yet. Waiting for customers…' : `No ${filter} orders.`}</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => {
            const { label, cls } = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            const oid = String(Math.floor(order.id)).slice(-6);
            const pm  = PAYMENT_ICONS[order.paymentMethod] || '💳';
            const pml = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;
            return (
              <div key={order.id} className={`order-card ${order.status}`}>
                {/* Card header */}
                <div className="order-card-head">
                  <div className="order-id-block">
                    <span className="order-id">#{oid}</span>
                    <span className={`status-chip ${cls}`}>{label}</span>
                  </div>
                  <span className="order-time">{timeSince(order.placedAt)}</span>
                </div>

                {/* Customer info */}
                <div className="order-customer">
                  <span>👤 <strong>{order.customerName}</strong></span>
                  <span>📞 {order.customerPhone}</span>
                </div>

                {/* Items */}
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span className="oi-name">{item.name} <small>({item.unit})</small></span>
                      <span className="oi-qty">×{item.qty}</span>
                      <span className="oi-price">₹{item.qty * item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-card-foot">
                  <div className="order-total-row">
                    <span className="ot-label">Total</span>
                    <span className="ot-amount">₹{order.total}</span>
                  </div>
                  <div className="order-meta">
                    <span>{pm} {pml}</span>
                    {order.address && <span>📍 {order.address}</span>}
                  </div>
                </div>

                {/* Status actions */}
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button className="btn btn-sm btn-green" onClick={() => updateStatus(order.id, 'preparing')} id={`status-preparing-${oid}`}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-sm btn-green" onClick={() => updateStatus(order.id, 'ready')} id={`status-ready-${oid}`}>
                      ✅ Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-sm btn-primary" onClick={() => updateStatus(order.id, 'delivered')} id={`status-delivered-${oid}`}>
                      🎉 Mark Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="delivered-done">Order completed 🎊</span>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(order.id)} id={`del-order-${oid}`} style={{ marginLeft: 'auto' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
