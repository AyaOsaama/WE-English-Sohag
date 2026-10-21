import { courseApi } from '../../services/courseApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import CourseCard from '../../components/CourseCard.jsx';

export default function Courses() {
  const { user } = useAuth();
  const state = useAsync(() => courseApi.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader badge="Technical English" title="Course tracks" subtitle="Specialized English for WE Applied Technology School: networking, telecom, programming, security, AI, electronics and workplace communication." />
      <Async state={state}>
        {({ courses }) => courses.length === 0 ? <EmptyState icon="📚" title="No courses yet">A teacher or admin needs to publish courses.</EmptyState> : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((row, i) => user.role === 'student' ? <CourseCard key={row.course._id} row={row} index={i} /> : (
              <CourseCard key={row.course._id} index={i} row={{ ...row, totalLessons: 1, completedLessons: 0, percentage: 0, started: false }} />
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
