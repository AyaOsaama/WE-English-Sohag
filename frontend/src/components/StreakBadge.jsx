export default function StreakBadge({ days = 0 }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 font-bold text-xs" title="Current learning streak">
      <span className="text-sm" aria-hidden="true">🔥</span>
      <span>{days}</span>
      <span className="hidden sm:inline font-medium text-amber-600 text-[11px]">{days === 1 ? 'Day' : 'Days'}</span>
    </div>
  );
}
