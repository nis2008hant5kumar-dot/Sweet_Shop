import { useState, useEffect } from 'react';
import SalesTab   from './SalesTab.jsx';
import MilkTab    from './MilkTab.jsx';
import OilTab     from './OilTab.jsx';
import SummaryTab from './SummaryTab.jsx';
import OrdersTab  from './OrdersTab.jsx';
import { DB }     from '../utils.js';

const TABS = [
  { id: 'orders',  label: '🛒 Orders' },
  { id: 'sales',   label: '📅 Daily Sales' },
  { id: 'milk',    label: '🥛 Milk Records' },
  { id: 'oil',     label: '🛢️ Oil Records' },
  { id: 'summary', label: '💰 Profit Summary' },
];

export default function Dashboard({ showToast, onExit }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [newOrderCount, setNewOrderCount] = useState(0);

  /* Count pending orders for the badge */
  function countPending() {
    return DB.get('orders').filter(o => o.status === 'pending').length;
  }

  useEffect(() => {
    setNewOrderCount(countPending());
    const interval = setInterval(() => setNewOrderCount(countPending()), 5000);
    const handleNew = () => setNewOrderCount(countPending());
    window.addEventListener('shreeRamNewOrder', handleNew);
    return () => {
      clearInterval(interval);
      window.removeEventListener('shreeRamNewOrder', handleNew);
    };
  }, []);

  return (
    <>
      <div className="dash-header">
        <h1>📊 Shop Records Dashboard</h1>
        <p>Private records — 'Shree Ram' Misthan Bhandar</p>
      </div>

      <nav className="dash-nav" aria-label="Dashboard sections">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`dash-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            id={`tab-${t.id}`}
          >
            {t.label}
            {t.id === 'orders' && newOrderCount > 0 && (
              <span className="order-tab-badge">{newOrderCount}</span>
            )}
          </button>
        ))}
        <button className="dash-tab logout" onClick={onExit} id="tab-logout">
          🚪 Exit
        </button>
      </nav>

      {activeTab === 'orders'  && <OrdersTab />}
      {activeTab === 'sales'   && <SalesTab   showToast={showToast} />}
      {activeTab === 'milk'    && <MilkTab    showToast={showToast} />}
      {activeTab === 'oil'     && <OilTab     showToast={showToast} />}
      {activeTab === 'summary' && <SummaryTab />}
    </>
  );
}
