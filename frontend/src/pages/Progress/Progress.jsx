import { progressApi } from '../../services/progressApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import BadgeCard from '../../components/BadgeCard.jsx';
import { pct, timeAgo, COURSE_COLORS } from '../../utils/format.js';

const SKILL_NAMES = { vocabulary: 'Vocabulary', grammar: 'Grammar', speaking: 'Speaking', reading: 'Reading', listening: 'Listening' };

export default function Progress() {
  const overview = useAsync(() => progressApi.overview(), []);
  const badges = useAsync(() => progressApi.badges(), []);
  return (
    <div className="space-y-6">
      <PageHeader badge="Report" title="My progress" subtitle="Course progress counts completed lessons. Skill progress comes from your real quiz, review and speaking results. XP is separate from both." />
      <Async state={overview}>
        {({ overall, courses, skills, recentActivity }) => (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[['Total XP', overall.totalXP.toLocaleString()], ['Streak', `${overall.currentStreak} d`], ['Longest streak', `${overall.longestStreak} d`], ['Courses done', overall.coursesCompleted], ['Lessons done', overall.lessonsCompleted]].map(([l, v]) => (
                <div key={l} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-we-card text-center"><div className="text-2xl font-black text-we-900">{v}</div><div className="text-[11px] text-slate-500 font-semibold uppercase">{l}</div></div>
              ))}
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                <h2 className="text-base font-bold text-we-900 mb-4">Course progress</h2>
                <div className="space-y-4">
                  {courses.map((c, i) => (
                    <div key={c.course._id}>
                      <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{c.course.icon} {c.course.title}</span><span className="font-bold text-we-600">{c.percentage}%</span></div>
                      <ProgressBar value={c.percentage} color={COURSE_COLORS[i % COURSE_COLORS.length]} label={c.course.title} />
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.completedLessons} / {c.totalLessons} lessons</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                <h2 className="text-base font-bold text-we-900 mb-4">Skill progress</h2>
                <div className="space-y-4">
                  {skills.map((s) => (
                    <div key={s.skill}>
                      <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{SKILL_NAMES[s.skill]}</span><span className="font-bold text-we-600">{pct(s.percentage)}</span></div>
                      {s.percentage === null ? <p className="text-[11px] text-slate-400">No results yet ({s.basis}).</p> : <><ProgressBar value={s.percentage} label={SKILL_NAMES[s.skill]} /><div className="text-[10px] text-slate-400 mt-0.5">{s.attempts} attempt{s.attempts === 1 ? '' : 's'} • {s.basis}</div></>}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
              <h2 className="text-base font-bold text-we-900 mb-4">Badges</h2>
              <Async state={badges}>{({ badges: list }) => list.length === 0 ? <EmptyState title="No badges configured" /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{list.map((b) => <BadgeCard key={b._id} badge={b} />)}</div>}</Async>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
              <h2 className="text-base font-bold text-we-900 mb-3">Recent activity</h2>
              {recentActivity.length === 0 ? <p className="text-xs text-slate-500">No activity yet.</p> : (
                <ul className="divide-y divide-slate-100">{recentActivity.map((a) => <li key={a._id} className="py-2.5 flex justify-between gap-3 text-xs"><div><div className="font-semibold text-slate-700">{a.title}</div><div className="text-slate-400">{timeAgo(a.createdAt)}</div></div>{a.xp > 0 && <span className="font-bold text-we-600">+{a.xp} XP</span>}</li>)}</ul>
              )}
            </section>
          </>
        )}
      </Async>
    </div>
  );
}
