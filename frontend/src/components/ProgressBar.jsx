export default function ProgressBar({ value = 0, color = 'bg-we-600', height = 'h-1.5', label }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full bg-slate-100 rounded-full ${height} overflow-hidden`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`${color} ${height} rounded-full transition-all duration-700`} style={{ width: `${v}%` }} />
    </div>
  );
}
