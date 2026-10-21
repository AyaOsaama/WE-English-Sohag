import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message, type = 'info') => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);
  const styles = { success: 'border-emerald-500', error: 'border-rose-500', info: 'border-we-600' };
  const icons = { success: '🎉', error: '⚠️', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-in pointer-events-auto bg-white p-4 rounded-2xl shadow-xl border-l-4 ${styles[t.type] || styles.info} flex items-center gap-3`}>
            <span className="text-lg" aria-hidden="true">{icons[t.type] || icons.info}</span>
            <div className="text-xs font-semibold text-slate-800 flex-1">{t.message}</div>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600 text-xs" aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
