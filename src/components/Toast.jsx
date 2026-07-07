import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'ok', visible }) {
  return (
    <div className={`toast ${type} ${visible ? 'show' : ''}`}>
      {type === 'ok'   && '✅ '}
      {type === 'warn' && '⚠️ '}
      {type === 'error'&& '❌ '}
      {message}
    </div>
  );
}

// Hook for easy toast usage
export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'ok', visible: false });

  const show = (message, type = 'ok') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  return { toast, show };
}
