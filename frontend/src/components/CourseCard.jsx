import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar.jsx';
import { COURSE_COLORS } from '../utils/format.js';

export default function CourseCard({ row, index = 0 }) {
  const { course, totalLessons, completedLessons, percentage, started, completed, currentLesson } = row;
  const color = COURSE_COLORS[index % COURSE_COLORS.length];
  const target = currentLesson ? `/lessons/${currentLesson}` : `/courses/${course._id}`;
  const cta = completed ? 'Review course' : started ? 'Continue →' : totalLessons ? 'Start track →' : 'Coming soon';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card hover:border-we-300 hover:shadow-lg transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform" aria-hidden="true">{course.icon}</div>
          <span className="text-[11px] font-bold text-we-700 bg-we-100 px-2.5 py-1 rounded-full">{completed ? 'Completed ✓' : course.difficulty}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
        <p className="text-xs text-slate-500 mt-1">{course.description}</p>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{completedLessons} of {totalLessons} lessons</span>
            <span className="font-bold text-we-600">{percentage}%</span>
          </div>
          <ProgressBar value={percentage} color={color} height="h-2" label={`${course.title} progress`} />
        </div>
      </div>
      {totalLessons > 0 ? (
        <Link to={target} className={`mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${started && !completed ? 'bg-we-600 text-white hover:bg-we-700 shadow-md shadow-we-600/20' : 'bg-slate-100 text-slate-800 hover:bg-we-600 hover:text-white'}`}>{cta}</Link>
      ) : (
        <span className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 text-slate-400">{cta}</span>
      )}
    </div>
  );
}
