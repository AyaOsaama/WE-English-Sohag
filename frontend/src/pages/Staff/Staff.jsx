import { useState } from 'react';
import { staffApi } from '../../services/staffApi.js';
import { speakingApi } from '../../services/speakingApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import AudioPlayer from '../../components/AudioPlayer.jsx';
import { pct, timeAgo } from '../../utils/format.js';

const field = 'w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-we-600 outline-none text-sm';
const TABS = [['students', 'Students'], ['speaking', 'Speaking submissions'], ['announcements', 'Announcements']];

function StudentDetail({ id, onClose }) {
  const state = useAsync(() => staffApi.studentProgress(id), [id]);
  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-we-300 shadow-we-card">
      <div className="flex justify-between"><h3 className="font-bold text-we-900">Student performance</h3><button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-700">Close ✕</button></div>
      <Async state={state}>
        {({ student, courses, skills, stats }) => (
          <div className="mt-4 grid md:grid-cols-2 gap-6">
            <div className="space-y-1 text-sm">
              <div className="font-bold">{student.name} <span className="text-slate-400 font-normal">{student.email}</span></div>
              <div className="text-xs text-slate-500">Level {student.englishLevel} • {student.xp} XP • streak {student.currentStreak}d • {stats.completedLessons} lessons</div>
              <div className="pt-3 space-y-2">{courses.filter((c) => c.started).map((c) => <div key={c.course._id}><div className="flex justify-between text-xs"><span>{c.course.title}</span><span className="font-bold">{c.percentage}%</span></div><ProgressBar value={c.percentage} /></div>)}{!courses.some((c) => c.started) && <p className="text-xs text-slate-400">No course started.</p>}</div>
            </div>
            <div className="space-y-2">{skills.map((s) => <div key={s.skill}><div className="flex justify-between text-xs capitalize"><span>{s.skill}</span><span className="font-bold">{pct(s.percentage)}</span></div>{s.percentage !== null && <ProgressBar value={s.percentage} />}</div>)}</div>
          </div>
        )}
      </Async>
    </div>
  );
}

function Students({ isAdmin }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const { toast } = useToast();
  const state = useAsync(() => staffApi.users(q ? `?q=${encodeURIComponent(q)}` : ''), [q]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    try { await staffApi.createUser(form); toast('User created', 'success'); setAdding(false); setForm({ name: '', email: '', password: '', role: 'student' }); state.reload(); }
    catch (err) { toast(err.message, 'error'); }
  };
  const toggle = async (u) => {
    try { await staffApi.updateUser(u._id, { isActive: !u.isActive }); state.reload(); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between">
        <input aria-label="Search users" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or ID…" className={`${field} max-w-xs`} />
        {isAdmin && <button onClick={() => setAdding((a) => !a)} className="px-4 py-2 rounded-xl bg-we-600 text-white text-xs font-bold">+ Add user</button>}
      </div>
      {adding && (
        <form onSubmit={create} className="bg-white rounded-2xl p-4 border border-slate-200 grid sm:grid-cols-5 gap-3 items-end">
          <input aria-label="Name" placeholder="Name" value={form.name} onChange={set('name')} className={field} required />
          <input aria-label="Email" type="email" placeholder="Email" value={form.email} onChange={set('email')} className={field} required />
          <input aria-label="Password" type="password" placeholder="Password (8+)" value={form.password} onChange={set('password')} className={field} required minLength={8} />
          <select aria-label="Role" value={form.role} onChange={set('role')} className={field}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select>
          <button className="px-4 py-2 rounded-xl bg-we-600 text-white text-xs font-bold">Create</button>
        </form>
      )}
      {selected && <StudentDetail id={selected} onClose={() => setSelected(null)} />}
      <Async state={state}>
        {({ users }) => users.length === 0 ? <EmptyState title="No users found" /> : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-slate-400 uppercase text-[10px]"><tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Level</th><th className="p-3">XP</th><th className="p-3">Streak</th><th className="p-3" /></tr></thead>
              <tbody>{users.map((u) => (
                <tr key={u._id} className={`border-t border-slate-100 ${u.isActive ? '' : 'opacity-50'}`}>
                  <td className="p-3"><div className="font-bold text-slate-800">{u.name}</div><div className="text-slate-400">{u.email}</div></td>
                  <td className="p-3 capitalize">{u.role}</td><td className="p-3">{u.role === 'student' ? u.englishLevel : '—'}</td><td className="p-3">{u.role === 'student' ? u.xp : '—'}</td><td className="p-3">{u.role === 'student' ? `${u.currentStreak}d` : '—'}</td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">{u.role === 'student' && <button onClick={() => setSelected(u._id)} className="font-bold text-we-600 hover:underline">Performance</button>}{isAdmin && <button onClick={() => toggle(u)} className="font-bold text-slate-500 hover:underline">{u.isActive ? 'Disable' : 'Enable'}</button>}</td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </Async>
    </div>
  );
}

function Speaking() {
  const state = useAsync(() => speakingApi.submissions(), []);
  return (
    <Async state={state}>
      {({ submissions }) => submissions.length === 0 ? <EmptyState icon="🎙️" title="No submissions yet" /> : (
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
          {submissions.map((s) => (
            <div key={s._id} className="p-4 space-y-1">
              <div className="flex justify-between text-xs"><span className="font-bold text-slate-800">{s.studentId?.name} — {s.challengeId?.title}</span><span className="text-slate-400">{timeAgo(s.createdAt)} • overall {pct(s.overallScore)}</span></div>
              <p className="text-xs text-slate-500 italic">“{s.transcript}”</p>
              <p className="text-[11px] text-slate-400">{s.aiFeedback}</p>
              <AudioPlayer submissionId={s._id} />
            </div>
          ))}
        </div>
      )}
    </Async>
  );
}

function Announcements() {
  const state = useAsync(() => staffApi.announcements(), []);
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', content: '', targetAudience: 'students' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const create = async (e) => {
    e.preventDefault();
    try { await staffApi.createAnnouncement(form); setForm({ title: '', content: '', targetAudience: 'students' }); toast('Announcement published', 'success'); state.reload(); }
    catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (id) => { try { await staffApi.removeAnnouncement(id); state.reload(); } catch (err) { toast(err.message, 'error'); } };
  return (
    <div className="space-y-4">
      <form onSubmit={create} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <input aria-label="Title" placeholder="Title" value={form.title} onChange={set('title')} className={field} required />
        <textarea aria-label="Content" placeholder="Announcement text" dir="auto" value={form.content} onChange={set('content')} className={field} rows={3} required />
        <div className="flex gap-3"><select aria-label="Audience" value={form.targetAudience} onChange={set('targetAudience')} className={`${field} max-w-[10rem]`}><option value="students">Students</option><option value="teachers">Teachers</option><option value="all">Everyone</option></select><button className="px-4 py-2 rounded-xl bg-we-600 text-white text-xs font-bold">Publish</button></div>
      </form>
      <Async state={state}>
        {({ announcements }) => announcements.map((a) => (
          <div key={a._id} className="bg-white rounded-2xl p-4 border border-slate-200 flex justify-between gap-4">
            <div><div className="text-sm font-bold">{a.title} <span className="text-[10px] uppercase text-slate-400">• {a.targetAudience}</span></div><p className="text-xs text-slate-600 mt-1" dir="auto">{a.content}</p><div className="text-[11px] text-slate-400 mt-1">{a.author?.name} • {timeAgo(a.publishedAt)}</div></div>
            <button onClick={() => remove(a._id)} className="text-xs font-bold text-rose-500 hover:underline self-start">Delete</button>
          </div>
        ))}
      </Async>
    </div>
  );
}

export default function Staff() {
  const { user } = useAuth();
  const [tab, setTab] = useState('students');
  return (
    <div className="space-y-6">
      <PageHeader badge={user.role} title="Staff console" subtitle={user.role === 'admin' ? 'Manage users, review speaking submissions and publish announcements.' : 'View students, their performance and speaking submissions.'} />
      <div role="tablist" className="flex gap-2 flex-wrap">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === id ? 'bg-we-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{label}</button>)}
      </div>
      {tab === 'students' && <Students isAdmin={user.role === 'admin'} />}
      {tab === 'speaking' && <Speaking />}
      {tab === 'announcements' && <Announcements />}
    </div>
  );
}
