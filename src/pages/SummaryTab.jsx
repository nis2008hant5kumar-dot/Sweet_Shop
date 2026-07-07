import { useState } from 'react';
import { DB, fmt, within6Months, currentMonth, formatMonth, getAvailableMonths } from '../utils.js';

export default function SummaryTab() {
  const allMonths = getAvailableMonths();
  const [month, setMonth] = useState(currentMonth());

  const sales   = within6Months(DB.get('sales')).filter(r => r.date.startsWith(month));
  const milk    = within6Months(DB.get('milk')).filter(r => r.date.startsWith(month));
  const oil     = within6Months(DB.get('oil')).filter(r => r.date.startsWith(month));
  const milkPay = within6Months(DB.get('milkPayments')).filter(r => r.date.startsWith(month));
  const oilPay  = within6Months(DB.get('oilPayments')).filter(r => r.date.startsWith(month));

  const salesEarning = sales.reduce((s, r) => s + (r.earning || 0), 0);
  const milkCost     = milk.reduce((s, r) => s + (r.total   || 0), 0);
  const oilCost      = oil.reduce((s,  r) => s + (r.total   || 0), 0);
  const totalExpense = milkCost + oilCost;
  const netProfit    = salesEarning - totalExpense;

  const milkPaidMonth = milkPay.reduce((s, r) => s + (r.amount || 0), 0);
  const oilPaidMonth  = oilPay.reduce((s,  r) => s + (r.amount || 0), 0);

  // All-time (last 6 months)
  const allSales   = within6Months(DB.get('sales'));
  const allMilk    = within6Months(DB.get('milk'));
  const allOil     = within6Months(DB.get('oil'));
  const allMilkPay = within6Months(DB.get('milkPayments'));
  const allOilPay  = within6Months(DB.get('oilPayments'));

  const allEarning  = allSales.reduce((s, r) => s + (r.earning || 0), 0);
  const allMilkCost = allMilk.reduce((s, r) => s + (r.total   || 0), 0);
  const allOilCost  = allOil.reduce((s,  r) => s + (r.total   || 0), 0);
  const allProfit   = allEarning - allMilkCost - allOilCost;

  const milkOutstanding = allMilkCost - allMilkPay.reduce((s, r) => s + (r.amount || 0), 0);
  const oilOutstanding  = allOilCost  - allOilPay.reduce((s,  r) => s + (r.amount || 0), 0);

  const availMonths = allMonths.length > 0 ? allMonths : [currentMonth()];

  return (
    <div className="dash-body">

      {/* Month Report */}
      <div className="card">
        <div className="card-title">💰 Monthly Profit / Loss Report</div>
        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <label>Select Month:</label>
          <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
            {availMonths.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>

        {/* Top stats */}
        <div className="stat-grid">
          <div className="stat-box green">
            <div className="stat-val">{fmt(salesEarning)}</div>
            <div className="stat-lbl">Sales Earned</div>
          </div>
          <div className="stat-box red">
            <div className="stat-val">{fmt(milkCost)}</div>
            <div className="stat-lbl">Milk Cost</div>
          </div>
          <div className="stat-box red">
            <div className="stat-val">{fmt(oilCost)}</div>
            <div className="stat-lbl">Oil Cost</div>
          </div>
          <div className={`stat-box ${netProfit >= 0 ? 'green' : 'red'}`}>
            <div className="stat-val">{fmt(Math.abs(netProfit))}</div>
            <div className="stat-lbl">{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Category</th><th>Details</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>💰 Daily Sales Earnings</td>
                <td style={{ color: '#888', fontSize: '0.8rem' }}>{sales.length} day(s) recorded</td>
                <td className="td-green">{fmt(salesEarning)}</td>
              </tr>
              <tr style={{ background: '#f9fafb' }}>
                <td colSpan={2}><strong>Total Earnings</strong></td>
                <td className="td-green"><strong>{fmt(salesEarning)}</strong></td>
              </tr>
              <tr>
                <td>🥛 Milk Purchases</td>
                <td style={{ color: '#888', fontSize: '0.8rem' }}>{milk.length} purchase(s)</td>
                <td className="td-red">−{fmt(milkCost)}</td>
              </tr>
              <tr>
                <td>🛢️ Oil Purchases</td>
                <td style={{ color: '#888', fontSize: '0.8rem' }}>{oil.length} purchase(s)</td>
                <td className="td-red">−{fmt(oilCost)}</td>
              </tr>
              <tr style={{ background: '#f9fafb' }}>
                <td colSpan={2}><strong>Total Expenses</strong></td>
                <td className="td-red"><strong>−{fmt(totalExpense)}</strong></td>
              </tr>
              <tr style={{ background: '#fffbf0' }}>
                <td colSpan={2}>
                  <strong>{netProfit >= 0 ? '🟢 NET PROFIT' : '🔴 NET LOSS'}</strong>
                </td>
                <td className={netProfit >= 0 ? 'td-green' : 'td-red'}>
                  <strong>{netProfit < 0 ? '−' : ''}{fmt(Math.abs(netProfit))}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vendor payments this month */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#555', marginBottom: '0.75rem' }}>
            💳 Vendor Payment Status — {formatMonth(month)}
          </div>
          <div className="stat-grid">
            <div className={`stat-box ${milkCost - milkPaidMonth > 0 ? 'warn' : 'green'}`}>
              <div className="stat-val">{fmt(Math.max(0, milkCost - milkPaidMonth))}</div>
              <div className="stat-lbl">Milk Pending</div>
            </div>
            <div className={`stat-box ${oilCost - oilPaidMonth > 0 ? 'warn' : 'green'}`}>
              <div className="stat-val">{fmt(Math.max(0, oilCost - oilPaidMonth))}</div>
              <div className="stat-lbl">Oil Pending</div>
            </div>
            <div className="stat-box green">
              <div className="stat-val">{fmt(milkPaidMonth + oilPaidMonth)}</div>
              <div className="stat-lbl">Total Paid</div>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Overview */}
      <div className="card">
        <div className="card-title">📆 All-Time Overview (Last 6 Months)</div>
        <div className="stat-grid">
          <div className="stat-box green">
            <div className="stat-val">{fmt(allEarning)}</div>
            <div className="stat-lbl">Total Earnings</div>
          </div>
          <div className="stat-box red">
            <div className="stat-val">{fmt(allMilkCost + allOilCost)}</div>
            <div className="stat-lbl">Total Expenses</div>
          </div>
          <div className={`stat-box ${allProfit >= 0 ? 'green' : 'red'}`}>
            <div className="stat-val">{fmt(Math.abs(allProfit))}</div>
            <div className="stat-lbl">{allProfit >= 0 ? 'Total Profit' : 'Total Loss'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{allSales.length}</div>
            <div className="stat-lbl">Days Recorded</div>
          </div>
        </div>

        {/* Total outstanding to vendors */}
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#555', margin: '1rem 0 0.75rem' }}>
          ⚠️ Total Outstanding to Vendors (All-Time)
        </div>
        <div className="stat-grid">
          <div className={`stat-box ${milkOutstanding > 0 ? 'warn' : 'green'}`}>
            <div className="stat-val">{fmt(Math.max(0, milkOutstanding))}</div>
            <div className="stat-lbl">Milk Vendor Owed</div>
          </div>
          <div className={`stat-box ${oilOutstanding > 0 ? 'warn' : 'green'}`}>
            <div className="stat-val">{fmt(Math.max(0, oilOutstanding))}</div>
            <div className="stat-lbl">Oil Vendor Owed</div>
          </div>
          <div className={`stat-box ${(milkOutstanding + oilOutstanding) > 0 ? 'red' : 'green'}`}>
            <div className="stat-val">{fmt(Math.max(0, milkOutstanding + oilOutstanding))}</div>
            <div className="stat-lbl">Total Owed</div>
          </div>
        </div>
      </div>

    </div>
  );
}
