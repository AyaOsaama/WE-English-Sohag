export default function XPBadge({ xp = 0 }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-we-700 font-bold text-xs" title="Total XP">
      <span className="text-sm" aria-hidden="true">⚡</span>
      <span>{xp.toLocaleString()}</span>
      <span className="hidden sm:inline font-medium text-purple-600 text-[11px]">XP</span>
    </div>
  );
}
