import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar.jsx';

const META = {
  speaking: { icon: '🎙️', label: 'Speaking', to: '/speaking', cta: 'Go to Speaking Lab →', tone: 'bg-amber-50 text-amber-700' },
  vocabulary: { icon: '📇', label: 'Vocabulary Drill', to: '/vocabulary', cta: 'Practice Cards →', tone: 'bg-purple-50 text-we-600' },
  ai: { icon: '🤖', label: 'AI Dialogue', to: '/ai-tutor', cta: 'Open AI Tutor →', tone: 'bg-emerald-50 text-emerald-700' },
  lesson: { icon: '📘', label: 'Lesson', to: '/courses', cta: 'Pick a lesson →', tone: 'bg-blue-50 text-blue-700' },
  course: { icon: '🏁', label: 'Course', to: '/courses', cta: 'Open courses →', tone: 'bg-indigo-50 text-indigo-700' },
  general: { icon: '🎯', label: 'General', to: '/courses', cta: 'Start learning →', tone: 'bg-pink-50 text-we-magenta' },
};

export default function ChallengeCard({ challenge, featured = false, onStart }) {
  const meta = META[challenge.type] || META.general;
  const done = challenge.status === 'completed';
  const target = challenge.requirement?.target || 1;
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-we-card flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${featured ? 'border-2 border-we-400' : 'border border-slate-200/80'} ${done ? 'opacity-90' : ''}`}>
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className={`w-12 h-12 rounded-2xl ${meta.tone} flex items-center justify-center text-2xl shrink-0`} aria-hidden="true">{done ? '✅' : meta.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{meta.label}</span>
            <span className="text-xs font-bold text-we-600">+{challenge.xpReward} XP</span>
            {done && <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Completed</span>}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">{challenge.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
          <div className="mt-3 max-w-xs">
            <ProgressBar value={(challenge.progress / target) * 100} color={done ? 'bg-emerald-500' : 'bg-we-600'} label="Challenge progress" />
            <span className="text-[11px] text-slate-400">{challenge.progress} / {target}</span>
          </div>
        </div>
      </div>
      {!done && (
        <div className="flex gap-2 shrink-0">
          {challenge.status === 'not_started' && onStart && (
            <button onClick={() => onStart(challenge)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">Start</button>
          )}
          <Link to={meta.to} className="px-5 py-2.5 rounded-xl bg-we-600 hover:bg-we-700 text-white text-xs font-bold transition-all shadow-md shadow-we-600/20">{meta.cta}</Link>
        </div>
      )}
    </div>
  );
}
