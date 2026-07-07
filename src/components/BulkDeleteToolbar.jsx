/**
 * BulkDeleteToolbar
 * Shows when ≥1 row is selected. Displays count + Delete + Clear buttons.
 */
export default function BulkDeleteToolbar({ count, total, onDeleteSelected, onClear }) {
  if (count === 0) return null;

  return (
    <div className="bulk-toolbar">
      <span className="sel-count">
        ☑️ {count} of {total} selected
      </span>
      <button className="btn btn-danger btn-sm" onClick={onDeleteSelected}>
        🗑 Delete Selected ({count})
      </button>
      <button className="btn btn-ghost btn-sm" onClick={onClear}>
        ✕ Clear Selection
      </button>
    </div>
  );
}
