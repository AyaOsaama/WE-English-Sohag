import ProgressBar from './ProgressBar.jsx';

// Earned badges are highlighted; locked ones show real progress toward the requirement.
export default function BadgeCard({ badge }) {
  const earned = badge.earned ?? true;
  return (
    <div className={`p-4 rounded-2xl border text-center flex flex-col items-center ${earned ? 'bg-purple-50/60 border-purple-100' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
      <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-2 ${earned ? '' : 'grayscale'}`} aria-hidden="true">{badge.icon}</div>
      <span className="text-xs font-bold text-slate-900">{badge.name}</span>
      {badge.description && <span className="text-[10px] text-slate-500 mt-0.5">{badge.description}</span>}
      {earned ? (
        <span className="text-[10px] text-we-600 font-semibold mt-1">Unlocked</span>
      ) : (
        <div className="w-full mt-2">
          <ProgressBar value={(badge.current / badge.requirementValue) * 100} label={`${badge.name} progress`} />
          <span className="text-[10px] text-slate-400">{badge.current} / {badge.requirementValue}</span>
        </div>
      )}
    </div>
  );
}
