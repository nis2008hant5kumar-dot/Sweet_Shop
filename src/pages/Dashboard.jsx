import { useState } from 'react';
import SalesTab   from './SalesTab.jsx';
import MilkTab    from './MilkTab.jsx';
import OilTab     from './OilTab.jsx';
import SummaryTab from './SummaryTab.jsx';

const TABS = [
  { id: 'sales',   label: '📅 Daily Sales' },
  { id: 'milk',    label: '🥛 Milk Records' },
  { id: 'oil',     label: '🛢️ Oil Records' },
  { id: 'summary', label: '💰 Profit Summary' },
];

export default function Dashboard({ showToast, onExit }) {
  const [activeTab, setActiveTab] = useState('sales');

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
          </button>
        ))}
        <button className="dash-tab logout" onClick={onExit} id="tab-logout">
          🚪 Exit
        </button>
      </nav>

      {activeTab === 'sales'   && <SalesTab   showToast={showToast} />}
      {activeTab === 'milk'    && <MilkTab    showToast={showToast} />}
      {activeTab === 'oil'     && <OilTab     showToast={showToast} />}
      {activeTab === 'summary' && <SummaryTab />}
    </>
  );
}
