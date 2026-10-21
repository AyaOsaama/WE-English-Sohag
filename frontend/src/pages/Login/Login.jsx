import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { homeFor } from '../../components/navItems.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) return setError('Enter your email or student ID and your password.');
    setBusy(true);
    try {
      const user = await login(identifier.trim(), password);
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-we-900 via-we-700 to-we-magenta p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-we-900 to-we-600 flex items-center justify-center text-white font-extrabold text-xl lowercase">we</div>
          <div>
            <h1 className="font-black text-xl text-we-900 leading-tight">English Lab</h1>
            <p className="text-xs text-slate-400">WE Applied Technology School • Sohag</p>
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500 mb-6">Sign in to continue your technical English journey.</p>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="block text-xs font-bold text-slate-600 mb-1">Email or Student ID</label>
            <input id="identifier" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-we-600 focus:ring-2 focus:ring-we-100 outline-none text-sm" placeholder="student@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-we-600 focus:ring-2 focus:ring-we-100 outline-none text-sm" placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-we-600 hover:bg-we-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-we-600/20 transition-all">{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-6">New student? <Link to="/register" className="text-we-600 font-bold hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
}
