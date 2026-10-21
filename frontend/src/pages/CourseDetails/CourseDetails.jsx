import { Link, useParams } from 'react-router-dom';
import { courseApi } from '../../services/courseApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, PageHeader } from '../../components/States.jsx';
import LessonCard from '../../components/LessonCard.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';

export default function CourseDetails() {
  const { id } = useParams();
  const course = useAsync(() => courseApi.get(id), [id]);
  const units = useAsync(() => courseApi.units(id), [id]);

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-xs font-bold text-we-600 hover:underline">← All courses</Link>
      <Async state={course}>
        {({ course: c, totalLessons, progress }) => {
          const done = progress?.completedLessons?.length || 0;
          const percentage = progress?.percentage || 0;
          return (
            <PageHeader badge={c.difficulty} title={`${c.icon} ${c.title}`} subtitle={c.description}>
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{done} of {totalLessons} lessons</span><span className="font-bold text-we-600">{percentage}%</span></div>
                <ProgressBar value={percentage} height="h-2" label="Course progress" />
                {units.data?.currentLessonId && <Link to={`/lessons/${units.data.currentLessonId}`} className="mt-3 block text-center px-4 py-2.5 rounded-xl bg-we-600 text-white text-xs font-bold hover:bg-we-700">Continue →</Link>}
              </div>
            </PageHeader>
          );
        }}
      </Async>
      <Async state={units}>
        {({ units: list }) => list.length === 0 ? <p className="text-sm text-slate-500">This course has no units yet.</p> : (
          <div className="space-y-5">
            {list.map((u, ui) => (
              <section key={u._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                <h2 className="text-base font-bold text-we-900">Unit {ui + 1}: {u.title}</h2>
                {u.description && <p className="text-xs text-slate-500 mb-4">{u.description}</p>}
                <div className="space-y-2 mt-3">{u.lessons.map((l, li) => <LessonCard key={l._id} lesson={l} index={li + 1} />)}</div>
                {u.lessons.length === 0 && <p className="text-xs text-slate-400">No lessons in this unit yet.</p>}
              </section>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
