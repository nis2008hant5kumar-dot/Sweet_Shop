import { useState, useCallback } from 'react';
import { DB, fmt, fmtDate, today, currentMonth, within6Months, formatMonth } from '../utils.js';
import BulkDeleteToolbar from '../components/BulkDeleteToolbar.jsx';

export default function MilkTab({ showToast }) {
  const [refresh, setRefresh]         = useState(0);
  const [monthFilter, setMonthFilter] = useState(currentMonth());
  const [selPurch, setSelPurch]       = useState(new Set());
  const [selPay,   setSelPay]         = useState(new Set());

  const reload = useCallback(() => {
    setRefresh(r => r + 1);
    setSelPurch(new Set());
    setSelPay(new Set());
  }, []);

  const allPurchases = within6Months(DB.get('milk'));
  const allPayments  = within6Months(DB.get('milkPayments'));

  const totalPurchased = allPurchases.reduce((s, r) => s + (r.total  || 0), 0);
  const totalPaid      = allPayments.reduce((s,  r) => s + (r.amount || 0), 0);
  const outstanding    = totalPurchased - totalPaid;

  const monthPurchases = allPurchases
    .filter(r => r.date.startsWith(monthFilter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthPayments  = allPayments
    .filter(r => r.date.startsWith(monthFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const monthPurchTotal = monthPurchases.reduce((s, r) => s + (r.total  || 0), 0);
  const monthPayTotal   = monthPayments.reduce((s,  r) => s + (r.amount || 0), 0);

  // ── Helpers ──────────────────────────────────────────────
  function toggle(set, setFn, id) {
    setFn(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll(rows, set, setFn) {
    if (rows.every(r => set.has(r.id))) setFn(new Set());
    else setFn(new Set(rows.map(r => r.id)));
  }
  function bulkDelete(dbKey, set, label) {
    if (!set.size) return;
    if (!confirm(`Delete ${set.size} ${label} record(s)?`)) return;
    set.forEach(id => DB.remove(dbKey, id));
    showToast(`${set.size} record(s) deleted`, 'warn');
    reload();
  }
  function deleteSingle(dbKey, id) {
    if (!confirm('Delete this record?')) return;
    DB.remove(dbKey, id); showToast('Deleted', 'warn'); reload();
  }

  return (
    <div className="dash-body">

      {/* Add Purchase */}
      <AddPurchaseForm
        label="🥛 Add Milk Purchase"
        unit="Litre"
        dbKey="milk"
        showToast={showToast}
        onSaved={reload}
      />

      {/* Outstanding Balance Banner */}
      <BalanceBanner outstanding={outstanding} totalPurchased={totalPurchased} totalPaid={totalPaid} />

      {/* Record Payment */}
      <AddPaymentForm
        label="Record Milk Payment"
        dbKey="milkPayments"
        outstanding={outstanding}
        showToast={showToast}
        onSaved={reload}
      />

      {/* Month Stats */}
      <div className="card">
        <div className="card-title">📊 Monthly Overview ({formatMonth(monthFilter)})</div>
        <div className="filter-bar">
          <label>Month:</label>
          <input type="month" value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); setSelPurch(new Set()); setSelPay(new Set()); }} />
        </div>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-val">{monthPurchases.reduce((s,r)=>s+(r.qty||0),0).toFixed(1)} L</div>
            <div className="stat-lbl">Milk Bought</div>
          </div>
          <div className="stat-box red">
            <div className="stat-val">{fmt(monthPurchTotal)}</div>
            <div className="stat-lbl">Purchase Total</div>
          </div>
          <div className="stat-box green">
            <div className="stat-val">{fmt(monthPayTotal)}</div>
            <div className="stat-lbl">Paid This Month</div>
          </div>
          <div className={`stat-box ${monthPurchTotal - monthPayTotal > 0 ? 'warn' : 'green'}`}>
            <div className="stat-val">{fmt(Math.max(0, monthPurchTotal - monthPayTotal))}</div>
            <div className="stat-lbl">Month Balance</div>
          </div>
        </div>
      </div>

      {/* Purchase Records */}
      <div className="card">
        <div className="card-title">📋 Milk Purchase Records</div>
        {monthPurchases.length === 0 ? (
          <EmptyState icon="🥛" text="No milk purchases this month." />
        ) : (
          <>
            <BulkDeleteToolbar
              count={selPurch.size} total={monthPurchases.length}
              onDeleteSelected={() => bulkDelete('milk', selPurch, 'purchase')}
              onClear={() => setSelPurch(new Set())}
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="cb-cell">
                      <input type="checkbox" className="row-cb"
                        checked={monthPurchases.length > 0 && monthPurchases.every(r => selPurch.has(r.id))}
                        onChange={() => toggleAll(monthPurchases, selPurch, setSelPurch)} />
                    </th>
                    <th>Date</th><th>Vendor</th><th>Qty</th><th>Rate/L</th><th>Total</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {monthPurchases.map(r => (
                    <tr key={r.id} className={selPurch.has(r.id) ? 'selected-row' : ''}>
                      <td className="cb-cell">
                        <input type="checkbox" className="row-cb"
                          checked={selPurch.has(r.id)} onChange={() => toggle(selPurch, setSelPurch, r.id)} />
                      </td>
                      <td>{fmtDate(r.date)}</td>
                      <td>{r.vendor || '—'}</td>
                      <td>{r.qty} L</td>
                      <td>{fmt(r.price)}/L</td>
                      <td className="td-red">{fmt(r.total)}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteSingle('milk', r.id)}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Payment Records */}
      <div className="card">
        <div className="card-title">✅ Payment Records — Milk Vendor</div>
        {monthPayments.length === 0 ? (
          <EmptyState icon="💰" text="No payments recorded this month." />
        ) : (
          <>
            <BulkDeleteToolbar
              count={selPay.size} total={monthPayments.length}
              onDeleteSelected={() => bulkDelete('milkPayments', selPay, 'payment')}
              onClear={() => setSelPay(new Set())}
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="cb-cell">
                      <input type="checkbox" className="row-cb"
                        checked={monthPayments.length > 0 && monthPayments.every(r => selPay.has(r.id))}
                        onChange={() => toggleAll(monthPayments, selPay, setSelPay)} />
                    </th>
                    <th>Date</th><th>Amount Paid</th><th>Note</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {monthPayments.map(r => (
                    <tr key={r.id} className={selPay.has(r.id) ? 'selected-row' : ''}>
                      <td className="cb-cell">
                        <input type="checkbox" className="row-cb"
                          checked={selPay.has(r.id)} onChange={() => toggle(selPay, setSelPay, r.id)} />
                      </td>
                      <td>{fmtDate(r.date)}</td>
                      <td className="td-green">{fmt(r.amount)}</td>
                      <td>{r.note || '—'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteSingle('milkPayments', r.id)}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

/* ─── Shared Sub-components (also used in OilTab) ─────────── */

export function AddPurchaseForm({ label, unit, dbKey, showToast, onSaved }) {
  const [date,   setDate]   = useState(today());
  const [vendor, setVendor] = useState('');
  const [qty,    setQty]    = useState('');
  const [price,  setPrice]  = useState('');

  const total = (+qty || 0) * (+price || 0);

  function save() {
    if (!date)   { showToast('Please select a date', 'warn'); return; }
    if (!+qty)   { showToast('Please enter quantity', 'warn'); return; }
    if (!+price) { showToast('Please enter price', 'warn'); return; }
    DB.push(dbKey, { date, vendor: vendor || 'Unknown Vendor', qty: +qty, price: +price, unit, total });
    showToast('Purchase record saved!', 'ok');
    setQty(''); setPrice(''); setVendor('');
    onSaved();
  }

  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={date} max={today()} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Vendor Name</label>
          <input className="form-input" type="text" value={vendor} placeholder="e.g. Ram Dairy" onChange={e => setVendor(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Quantity ({unit})</label>
          <input className="form-input" type="number" min="0" step="0.5" value={qty} placeholder="0" onChange={e => setQty(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Price per {unit} (₹)</label>
          <input className="form-input" type="number" min="0" step="0.5" value={price} placeholder="0" onChange={e => setPrice(e.target.value)} />
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={save}>💾 Save Record</button>
        {total > 0 && <div className="form-preview">Total: {fmt(total)}</div>}
      </div>
    </div>
  );
}

export function BalanceBanner({ outstanding, totalPurchased, totalPaid }) {
  const isPaid = outstanding <= 0;
  return (
    <div className={`balance-banner ${isPaid ? 'paid' : 'owe'}`}>
      <div>
        <div className="b-label">{isPaid ? '✅ All Paid!' : '⚠️ Outstanding Balance'}</div>
        <div style={{ fontSize:'0.75rem', color:'#777', marginTop:'0.2rem' }}>
          Total Bought: {fmt(totalPurchased)} &nbsp;|&nbsp; Total Paid: {fmt(totalPaid)}
        </div>
      </div>
      <div>
        <div className="b-amount">{fmt(Math.abs(outstanding))}</div>
        <div style={{ fontSize:'0.7rem', color:'#888', textAlign:'right' }}>
          {isPaid ? (outstanding < 0 ? 'Overpaid' : 'Balance Zero') : 'You Owe'}
        </div>
      </div>
    </div>
  );
}

export function AddPaymentForm({ label, dbKey, outstanding, showToast, onSaved }) {
  const [date,   setDate]   = useState(today());
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');

  function save() {
    if (!date)    { showToast('Please select a date', 'warn'); return; }
    if (!+amount) { showToast('Please enter payment amount', 'warn'); return; }
    DB.push(dbKey, { date, amount: +amount, note });
    showToast('Payment recorded!', 'ok');
    setAmount(''); setNote('');
    onSaved();
  }

  return (
    <div className="payment-section">
      <div className="payment-title">💳 {label}</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Payment Date</label>
          <input className="form-input" type="date" value={date} max={today()} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Amount Paid (₹)</label>
          <input className="form-input" type="number" min="0" step="0.5" value={amount}
            placeholder={outstanding > 0 ? `Outstanding: ₹${outstanding.toFixed(2)}` : 'Enter amount'}
            onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Note (Optional)</label>
          <input className="form-input" type="text" value={note} placeholder="e.g. Partial payment" onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
        <button className="btn btn-green" onClick={save}>✅ Record Payment</button>
        {+amount > 0 && (
          <div className="form-preview" style={{ borderColor:'var(--green)', color:'var(--green)' }}>
            Paying: {fmt(+amount)} &nbsp;→&nbsp; Remaining: {fmt(Math.max(0, outstanding - +amount))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
