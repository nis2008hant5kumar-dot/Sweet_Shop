import { useState, useCallback } from 'react';
import { DB, fmt, fmtDate, today, currentMonth, within6Months, formatMonth } from '../utils.js';
import BulkDeleteToolbar from '../components/BulkDeleteToolbar.jsx';

export default function SalesTab({ showToast }) {
  const [refresh, setRefresh]           = useState(0);
  const [monthFilter, setMonthFilter]   = useState(currentMonth());
  const [selected, setSelected]         = useState(new Set());

  const reload = useCallback(() => { setRefresh(r => r + 1); setSelected(new Set()); }, []);

  const allRecords = within6Months(DB.get('sales'));
  const monthRec   = allRecords
    .filter(r => r.date.startsWith(monthFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalEarning = monthRec.reduce((s, r) => s + (r.earning || 0), 0);
  const allChecked   = monthRec.length > 0 && monthRec.every(r => selected.has(r.id));

  function toggleAll() {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(monthRec.map(r => r.id)));
  }
  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function deleteSelected() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected record(s)?`)) return;
    selected.forEach(id => DB.remove('sales', id));
    showToast(`${selected.size} record(s) deleted`, 'warn');
    reload();
  }
  function deleteSingle(id) {
    if (!confirm('Delete this record?')) return;
    DB.remove('sales', id);
    showToast('Record deleted', 'warn');
    reload();
  }

  // Monthly totals for stat boxes
  const allMonthRecords = within6Months(DB.get('sales'));
  const thisMonthAll    = allMonthRecords.filter(r => r.date.startsWith(currentMonth()));
  const thisMonthTotal  = thisMonthAll.reduce((s, r) => s + (r.earning || 0), 0);

  return (
    <div className="dash-body">

      {/* Daily Earning Entry Form */}
      <DailyEarningForm showToast={showToast} onSaved={reload} />

      {/* This Month Summary */}
      <div className="card">
        <div className="card-title">📊 This Month ({formatMonth(currentMonth())})</div>
        <div className="stat-grid">
          <div className="stat-box green">
            <div className="stat-val">{fmt(thisMonthTotal)}</div>
            <div className="stat-lbl">Total Earned</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{thisMonthAll.length}</div>
            <div className="stat-lbl">Days Recorded</div>
          </div>
          <div className="stat-box gold">
            <div className="stat-val">
              {thisMonthAll.length > 0 ? fmt(thisMonthTotal / thisMonthAll.length) : '₹0'}
            </div>
            <div className="stat-lbl">Daily Average</div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="card-title">📋 Daily Earning Records (Last 6 Months)</div>
        <div className="filter-bar">
          <label>Month:</label>
          <input
            type="month"
            value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); setSelected(new Set()); }}
          />
          <span style={{ fontSize: '0.82rem', color: '#888', marginLeft: '0.5rem' }}>
            Total: <strong style={{ color: 'var(--green)' }}>{fmt(monthRec.reduce((s,r) => s+(r.earning||0), 0))}</strong>
          </span>
        </div>

        {monthRec.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No earning records for this month.</p>
          </div>
        ) : (
          <>
            <BulkDeleteToolbar
              count={selected.size}
              total={monthRec.length}
              onDeleteSelected={deleteSelected}
              onClear={() => setSelected(new Set())}
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="cb-cell">
                      <input
                        type="checkbox"
                        className="row-cb"
                        checked={allChecked}
                        onChange={toggleAll}
                        title="Select all"
                      />
                    </th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Earning</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {monthRec.map(r => (
                    <tr key={r.id} className={selected.has(r.id) ? 'selected-row' : ''}>
                      <td className="cb-cell">
                        <input
                          type="checkbox"
                          className="row-cb"
                          checked={selected.has(r.id)}
                          onChange={() => toggleOne(r.id)}
                        />
                      </td>
                      <td>{fmtDate(r.date)}</td>
                      <td style={{ color: '#888', fontSize: '0.8rem' }}>
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                      </td>
                      <td className="td-green" style={{ fontSize: '1rem' }}>{fmt(r.earning)}</td>
                      <td style={{ color: '#888', fontSize: '0.82rem' }}>
                        {r.source === 'order'
                          ? <span title={r.note}><span style={{ background:'#e8f5e9', color:'#2e7d32', borderRadius:'4px', padding:'0.1rem 0.35rem', fontSize:'0.7rem', fontWeight:700, marginRight:'0.3rem' }}>🛒 Auto</span>{r.note}</span>
                          : r.note || '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteSingle(r.id)}
                        >🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Footer total row */}
                <tfoot>
                  <tr style={{ background: '#fffbf0', fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: '0.75rem 0.9rem', color: '#555' }}>
                      📅 {monthRec.length} day(s) — {formatMonth(monthFilter)}
                    </td>
                    <td style={{ padding: '0.75rem 0.9rem', color: 'var(--green)', fontSize: '1rem' }}>
                      {fmt(monthRec.reduce((s, r) => s + (r.earning || 0), 0))}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

/* ─── Daily Earning Form ──────────────────────────────────── */
function DailyEarningForm({ showToast, onSaved }) {
  const [date,    setDate]    = useState(today());
  const [earning, setEarning] = useState('');
  const [note,    setNote]    = useState('');

  function save() {
    if (!date)     { showToast('Please select a date', 'warn'); return; }
    if (!+earning || +earning <= 0) { showToast('Please enter today\'s earning', 'warn'); return; }

    // Check if a record already exists for this date
    const existing = DB.get('sales').find(r => r.date === date);
    if (existing) {
      if (!confirm(`A record for ${fmtDate(date)} already exists (${fmt(existing.earning)}). Add another entry?`)) return;
    }

    DB.push('sales', { date, earning: +earning, note: note.trim() });
    showToast('Earning recorded! 💰', 'ok');
    setEarning('');
    setNote('');
    onSaved();
  }

  return (
    <div className="card">
      <div className="card-title">💰 Daily Earning Record</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
            id="earn-date"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Earning for the Day (₹)</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.5"
            value={earning}
            placeholder="e.g. 1500"
            onChange={e => setEarning(e.target.value)}
            id="earn-amount"
            style={{ fontSize: '1.05rem', fontWeight: 600 }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Note (Optional)</label>
          <input
            className="form-input"
            type="text"
            value={note}
            placeholder="e.g. Festival day, holiday..."
            onChange={e => setNote(e.target.value)}
            id="earn-note"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={save} id="earn-save-btn"
          style={{ flex: '1 1 140px' }}>
          💾 Save Earning
        </button>
        {+earning > 0 && (
          <div className="form-preview" style={{ flex: '1 1 140px', textAlign: 'center' }}>
            {fmtDate(date)} → <strong>{fmt(+earning)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
