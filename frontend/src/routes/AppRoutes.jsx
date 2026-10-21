import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';
import { Loading } from '../components/States.jsx';
import { homeFor } from '../components/navItems.js';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Courses from '../pages/Courses/Courses.jsx';
import CourseDetails from '../pages/CourseDetails/CourseDetails.jsx';
import Lesson from '../pages/Lesson/Lesson.jsx';
import Vocabulary from '../pages/Vocabulary/Vocabulary.jsx';
import SpeakingLab from '../pages/SpeakingLab/SpeakingLab.jsx';
import AITutor from '../pages/AITutor/AITutor.jsx';
import Challenges from '../pages/Challenges/Challenges.jsx';
import Progress from '../pages/Progress/Progress.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import Staff from '../pages/Staff/Staff.jsx';

// UI guards only improve navigation. The real authorization is enforced by the API.
function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Navigate to={homeFor(user.role)} replace /> : children;
}

const STUDENT = ['student'];
const STAFF = ['teacher', 'admin'];

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<RequireAuth roles={STUDENT}><Dashboard /></RequireAuth>} />
        <Route path="/ai-tutor" element={<RequireAuth roles={STUDENT}><AITutor /></RequireAuth>} />
        <Route path="/speaking" element={<RequireAuth roles={STUDENT}><SpeakingLab /></RequireAuth>} />
        <Route path="/vocabulary" element={<RequireAuth roles={STUDENT}><Vocabulary /></RequireAuth>} />
        <Route path="/challenges" element={<RequireAuth roles={STUDENT}><Challenges /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth roles={STUDENT}><Progress /></RequireAuth>} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/lessons/:id" element={<Lesson />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/staff" element={<RequireAuth roles={STAFF}><Staff /></RequireAuth>} />
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  );
}
