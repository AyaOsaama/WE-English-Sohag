import { Link } from 'react-router-dom';

export default function LessonCard({ lesson, index }) {
  return (
    <Link to={`/lessons/${lesson._id}`} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:border-we-400 ${lesson.isCurrent ? 'bg-white border-we-400 shadow-sm' : 'bg-purple-50/50 border-purple-100'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${lesson.completed ? 'bg-emerald-100 text-emerald-700' : lesson.isCurrent ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-500 border border-slate-200'}`}>
          {lesson.completed ? '✓' : index}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800 truncate">{lesson.title}</div>
          <div className="text-[11px] text-slate-400">{lesson.durationMinutes} min • +{lesson.xpReward} XP{lesson.skill ? ` • ${lesson.skill} quiz` : ''}</div>
        </div>
      </div>
      <span className={`text-xs font-bold shrink-0 ${lesson.completed ? 'text-emerald-600' : lesson.isCurrent ? 'text-we-600' : 'text-slate-400'}`}>
        {lesson.completed ? 'Completed' : lesson.isCurrent ? 'Up next' : 'Start'}
      </span>
    </Link>
  );
}
