import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/dashboardApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, EmptyState } from '../../components/States.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import ChallengeCard from '../../components/ChallengeCard.jsx';
import { levelLabel, pct, timeAgo } from '../../utils/format.js';

const SKILL_NAMES = { vocabulary: 'Vocabulary', grammar: 'Grammar', speaking: 'Speaking', reading: 'Reading', listening: 'Listening' };

function Metric({ label, value, sub, icon }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-we-card">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span><span className="text-xl" aria-hidden="true">{icon}</span></div>
      <div className="text-2xl sm:text-3xl font-black text-we-900 mt-2">{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const state = useAsync(() => dashboardApi.get(), []);
  return (
    <Async state={state}>
      {(d) => {
        const { student, stats, continueLearning, challenges, badges, skills, recentActivity, announcements } = d;
        const firstName = student.name.split(' ')[0];
        const cl = continueLearning;
        return (
          <div className="space-y-6">
            <section className="relative overflow-hidden bg-gradient-to-br from-we-900 via-we-700 to-we-600 rounded-3xl p-6 sm:p-8 text-white shadow-we-glow">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wide">{student.campus} • {student.specialization || 'WE Applied Technology School'}</span>
                  <h1 className="text-2xl sm:text-3xl font-black mt-3">Welcome back, {firstName}! 👋</h1>
                  <p className="text-sm text-purple-100 mt-2">
                    {stats.activeToday ? `You're on a ${stats.currentStreak}-day streak. Keep going!` : stats.currentStreak > 0 ? `Practice today to keep your ${stats.currentStreak}-day streak alive.` : 'Complete any activity today to start your streak.'}
                  </p>
                </div>
                {cl?.nextLesson && (
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 lg:w-80">
                    <div className="text-[11px] uppercase font-bold text-purple-200">Continue learning</div>
                    <div className="text-sm font-bold mt-1">{cl.course.icon} {cl.course.title}</div>
                    <div className="text-xs text-purple-100">Next: {cl.nextLesson.title}</div>
                    <ProgressBar value={cl.percentage} color="bg-amber-300" label="Course progress" />
                    <Link to={`/lessons/${cl.nextLesson._id}`} className="mt-3 inline-block px-4 py-2 rounded-xl bg-white text-we-700 text-xs font-bold hover:bg-purple-50">{cl.started ? 'Resume lesson →' : 'Start course →'}</Link>
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Your stats">
              <Metric icon="🎓" label="Level" value={student.englishLevel} sub={`Target: ${levelLabel(student.targetLevel)}`} />
              <Metric icon="🔥" label="Streak" value={`${stats.currentStreak} d`} sub={`Longest: ${stats.longestStreak} days`} />
              <Metric icon="⚡" label="Total XP" value={stats.xp.toLocaleString()} sub={`+${stats.xpThisWeek} XP in the last 7 days`} />
              <Metric icon="📘" label="Lessons" value={stats.lessonsCompleted} sub={`${stats.coursesCompleted} course${stats.coursesCompleted === 1 ? '' : 's'} completed`} />
            </section>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-we-900">Today's challenges</h2><Link to="/challenges" className="text-xs font-bold text-we-600 hover:underline">View all</Link></div>
                  {challenges.length ? <div className="space-y-3">{challenges.slice(0, 3).map((c, i) => <ChallengeCard key={c._id} challenge={c} featured={i === 0} />)}</div> : <EmptyState icon="🎯" title="No challenges today">Check back tomorrow.</EmptyState>}
                </section>

                <section className="grid sm:grid-cols-3 gap-3" aria-label="Quick actions">
                  {[
                    { to: '/vocabulary', icon: '📇', t: 'Vocabulary', s: stats.vocabularyDue ? `${stats.vocabularyDue} due for review` : `${stats.masteredVocabulary} words mastered` },
                    { to: '/speaking', icon: '🎙️', t: 'Speaking Lab', s: 'Record and get feedback' },
                    { to: '/ai-tutor', icon: '🤖', t: 'AI Tutor', s: 'Practice conversation' },
                  ].map((a) => (
                    <Link key={a.to} to={a.to} className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-we-400 hover:shadow-md transition-all shadow-we-card">
                      <div className="text-2xl" aria-hidden="true">{a.icon}</div><div className="text-sm font-bold text-slate-800 mt-2">{a.t}</div><div className="text-[11px] text-slate-500">{a.s}</div>
                    </Link>
                  ))}
                </section>

                <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                  <h2 className="text-lg font-bold text-we-900 mb-4">Skill progress</h2>
                  <div className="space-y-3">
                    {skills.map((s) => (
                      <div key={s.skill}>
                        <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{SKILL_NAMES[s.skill]}</span><span className="font-bold text-we-600">{pct(s.percentage)}</span></div>
                        {s.percentage === null ? <p className="text-[11px] text-slate-400">No results yet.</p> : <ProgressBar value={s.percentage} label={`${SKILL_NAMES[s.skill]} skill`} />}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                  <h2 className="text-lg font-bold text-we-900 mb-3">Recent badges</h2>
                  {badges.length ? (
                    <div className="space-y-2.5">{badges.map((b) => <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/60"><span className="text-2xl" aria-hidden="true">{b.icon}</span><div><div className="text-xs font-bold text-slate-800">{b.name}</div><div className="text-[11px] text-slate-500">{timeAgo(b.earnedAt)}</div></div></div>)}</div>
                  ) : <p className="text-xs text-slate-500">No badges yet. Complete lessons and challenges to earn your first one.</p>}
                </section>

                <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                  <h2 className="text-lg font-bold text-we-900 mb-3">Recent activity</h2>
                  {recentActivity.length ? (
                    <ul className="space-y-3">{recentActivity.map((a) => <li key={a._id} className="flex items-start justify-between gap-3 text-xs"><div><div className="font-semibold text-slate-700">{a.title}</div><div className="text-slate-400">{timeAgo(a.createdAt)}</div></div>{a.xp > 0 && <span className="font-bold text-we-600 shrink-0">+{a.xp} XP</span>}</li>)}</ul>
                  ) : <p className="text-xs text-slate-500">Nothing yet. Your activity will appear here.</p>}
                </section>

                {announcements.length > 0 && (
                  <section className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
                    <h2 className="text-sm font-bold text-amber-800 mb-2">📢 Campus announcements</h2>
                    <div className="space-y-3">{announcements.map((a) => <div key={a._id}><div className="text-xs font-bold text-amber-900">{a.title}</div><p className="text-xs text-amber-800 mt-0.5" dir="auto">{a.content}</p></div>)}</div>
                  </section>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Async>
  );
}
