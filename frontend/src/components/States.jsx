export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500" role="status">
      <span className="w-5 h-5 border-2 border-we-200 border-t-we-600 rounded-full animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center" role="alert">
      <div className="text-sm font-bold text-rose-700">Something went wrong</div>
      <p className="text-xs text-rose-600 mt-1">{error?.message || 'Please try again.'}</p>
      {onRetry && <button onClick={onRetry} className="mt-3 px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100">Try again</button>}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, children }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
      <div className="text-3xl" aria-hidden="true">{icon}</div>
      <div className="text-sm font-bold text-slate-800 mt-2">{title}</div>
      {children && <p className="text-xs text-slate-500 mt-1">{children}</p>}
    </div>
  );
}

// Standard page wrapper: shows loading / error, then children(data).
export function Async({ state, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  return children(state.data);
}

export function PageHeader({ badge, badgeClass = 'bg-we-100 text-we-700', title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {badge && <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badgeClass}`}>{badge}</span>}
          <h1 className="text-2xl font-bold text-we-900">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
