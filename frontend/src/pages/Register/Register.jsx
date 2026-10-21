import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LEVEL_NAMES } from '../../utils/format.js';

const LEVELS = Object.keys(LEVEL_NAMES);
const field = 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-we-600 focus:ring-2 focus:ring-we-100 outline-none text-sm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', grade: '', specialization: '', englishLevel: 'A2', targetLevel: 'B2' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="text-[11px] text-rose-600 mt-1">{errors[k]}</p> : null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-we-900 via-we-700 to-we-magenta p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <h1 className="font-black text-xl text-we-900">Create your student account</h1>
        <p className="text-sm text-slate-500 mb-6">WE English Lab • Sohag campus</p>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div><label htmlFor="name" className="block text-xs font-bold text-slate-600 mb-1">Full name</label><input id="name" value={form.name} onChange={set('name')} className={field} /><Err k="name" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="email" className="block text-xs font-bold text-slate-600 mb-1">Email</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className={field} /><Err k="email" /></div>
            <div><label htmlFor="studentId" className="block text-xs font-bold text-slate-600 mb-1">Student ID (optional)</label><input id="studentId" value={form.studentId} onChange={set('studentId')} className={field} placeholder="WE-SHG-2024-0000" /></div>
          </div>
          <div><label htmlFor="password" className="block text-xs font-bold text-slate-600 mb-1">Password</label><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} className={field} /><Err k="password" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="grade" className="block text-xs font-bold text-slate-600 mb-1">Grade</label><input id="grade" value={form.grade} onChange={set('grade')} className={field} placeholder="Grade 2" /></div>
            <div><label htmlFor="spec" className="block text-xs font-bold text-slate-600 mb-1">Specialization</label><input id="spec" value={form.specialization} onChange={set('specialization')} className={field} placeholder="Information Technology" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="lvl" className="block text-xs font-bold text-slate-600 mb-1">Current English level</label><select id="lvl" value={form.englishLevel} onChange={set('englishLevel')} className={field}>{LEVELS.map((l) => <option key={l} value={l}>{l} – {LEVEL_NAMES[l]}</option>)}</select></div>
            <div><label htmlFor="tgt" className="block text-xs font-bold text-slate-600 mb-1">Target level</label><select id="tgt" value={form.targetLevel} onChange={set('targetLevel')} className={field}>{LEVELS.map((l) => <option key={l} value={l}>{l} – {LEVEL_NAMES[l]}</option>)}</select></div>
          </div>
          {serverError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2" role="alert">{serverError}</p>}
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-we-600 hover:bg-we-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-we-600/20">{busy ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-6">Already registered? <Link to="/login" className="text-we-600 font-bold hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
