// ─── Storage Helpers ─────────────────────────────────────────
export const DB = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem('shreeRam_' + key) || '[]'); }
    catch { return []; }
  },
  set: (key, val) => localStorage.setItem('shreeRam_' + key, JSON.stringify(val)),
  push: (key, item) => {
    const arr = DB.get(key);
    item.id = Date.now() + Math.random();
    arr.push(item);
    DB.set(key, arr);
    return item;
  },
  remove: (key, id) => {
    DB.set(key, DB.get(key).filter(i => i.id !== id));
  }
};

// ─── 6-Month Filter ───────────────────────────────────────────
export function within6Months(records) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return records.filter(r => r.date >= cutoffStr);
}

// ─── Formatters ───────────────────────────────────────────────
export const fmt   = (n) => '₹' + Number(n || 0).toFixed(2);
export const fmtN  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
export const today = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7);

export function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatMonth(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[+mo - 1]} ${y}`;
}

export function getAvailableMonths() {
  const months = new Set();
  ['sales', 'milk', 'oil'].forEach(key => {
    DB.get(key).forEach(r => { if (r.date) months.add(r.date.slice(0, 7)); });
  });
  return Array.from(months).sort().reverse();
}

// ─── Config ───────────────────────────────────────────────────
export const PRICES = {
  rasogula_piece:   12,
  gulabjamun_piece: 12,
  samosa_piece:     10,
  sweets_kg:        250,   // ₹250 per kg for both rasogula & gulabjamun
  boondi_laddu_piece: 10,
  boondi_laddu_kg:    220,
  motichoor_laddu_piece: 12,
  motichoor_laddu_kg:    260,
  besan_laddu_piece:  12,
  besan_laddu_kg:     240,
  cham_cham_piece:    14,
  cham_cham_kg:       280,
  namkeen_paara_kg:   180,
  milk_cake_piece:    15,
  milk_cake_kg:       380,
};

export const PIN = '1234';
