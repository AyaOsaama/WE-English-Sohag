import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../services/authApi.js';
import { progressApi } from '../../services/progressApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Async, PageHeader } from '../../components/States.jsx';
import Avatar from '../../components/Avatar.jsx';
import BadgeCard from '../../components/BadgeCard.jsx';
import { LEVEL_NAMES, levelLabel } from '../../utils/format.js';

const field = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-we-600 focus:ring-2 focus:ring-we-100 outline-none text-sm';

function Row({ k, v }) {
  return <div className="flex justify-between gap-4 py-2 border-b border-slate-100 text-sm"><span className="text-slate-500">{k}</span><span className="font-semibold text-slate-800 text-right">{v || '—'}</span></div>;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const isStudent = user.role === 'student';
  const badges = useAsync(() => (isStudent ? progressApi.badges() : Promise.resolve({ badges: [] })), [isStudent]);
  const courses = useAsync(() => (isStudent ? progressApi.courses() : Promise.resolve({ courses: [] })), [isStudent]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, specialization: user.specialization || '', targetLevel: user.targetLevel });
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast('Name is required', 'error');
    if (password && password.length < 8) return toast('Password must be at least 8 characters', 'error');
    setBusy(true);
    try {
      const payload = { name: form.name.trim(), specialization: form.specialization, targetLevel: form.targetLevel };
      if (password) payload.password = password;
      const d = await authApi.updateProfile(payload);
      setUser(d.user); setPassword(''); setEditing(false);
      toast('Profile updated', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  const earned = (badges.data?.badges || []).filter((b) => b.earned);
  const completed = (courses.data?.courses || []).filter((c) => c.completed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Profile">
        {!editing && <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-we-600 text-white text-xs font-bold hover:bg-we-700">Edit profile</button>}
      </PageHeader>

      <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
        <div className="flex items-center gap-4 mb-4">
          <Avatar user={user} size="w-16 h-16" text="text-lg" />
          <div><div className="text-lg font-bold text-we-900">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div><span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-we-100 text-we-700">{user.role}</span></div>
        </div>

        {editing ? (
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="p-name" className="block text-xs font-bold text-slate-600 mb-1">Name</label><input id="p-name" value={form.name} onChange={set('name')} className={field} /></div>
            <div><label htmlFor="p-spec" className="block text-xs font-bold text-slate-600 mb-1">Specialization</label><input id="p-spec" value={form.specialization} onChange={set('specialization')} className={field} /></div>
            <div><label htmlFor="p-tgt" className="block text-xs font-bold text-slate-600 mb-1">Target level</label><select id="p-tgt" value={form.targetLevel} onChange={set('targetLevel')} className={field}>{Object.keys(LEVEL_NAMES).map((l) => <option key={l} value={l}>{l} – {LEVEL_NAMES[l]}</option>)}</select></div>
            <div><label htmlFor="p-pw" className="block text-xs font-bold text-slate-600 mb-1">New password (optional)</label><input id="p-pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} /></div>
            <p className="sm:col-span-2 text-[11px] text-slate-400">Email, campus, grade, English level, XP and streak are managed by your school and can't be edited here.</p>
            <div className="sm:col-span-2 flex gap-2"><button disabled={busy} className="px-5 py-2.5 rounded-xl bg-we-600 text-white text-xs font-bold disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">Cancel</button></div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8">
            <div><Row k="Student ID" v={user.studentId} /><Row k="Campus" v={user.campus} /><Row k="Grade" v={user.grade} /><Row k="Specialization" v={user.specialization} /></div>
            {isStudent && <div><Row k="English level" v={levelLabel(user.englishLevel)} /><Row k="Target level" v={levelLabel(user.targetLevel)} /><Row k="Total XP" v={user.xp.toLocaleString()} /><Row k="Streak (current / longest)" v={`${user.currentStreak} / ${user.longestStreak} days`} /></div>}
          </div>
        )}
      </section>

      {isStudent && (
        <>
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
            <h2 className="text-base font-bold text-we-900 mb-3">Badges earned</h2>
            <Async state={badges}>{() => earned.length ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{earned.map((b) => <BadgeCard key={b._id} badge={b} />)}</div> : <p className="text-xs text-slate-500">No badges yet.</p>}</Async>
          </section>
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
            <h2 className="text-base font-bold text-we-900 mb-3">Completed courses</h2>
            <Async state={courses}>{() => completed.length ? <ul className="space-y-2">{completed.map((c) => <li key={c.course._id} className="text-sm font-semibold text-slate-700">✅ {c.course.icon} {c.course.title}</li>)}</ul> : <p className="text-xs text-slate-500">No completed courses yet.</p>}</Async>
          </section>
        </>
      )}
    </div>
  );
}
