import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';
import StreakBadge from './StreakBadge.jsx';
import XPBadge from './XPBadge.jsx';
import { levelLabel } from '../utils/format.js';
import { navFor, TITLES } from './navItems.js';

function Sidebar({ user, items, onLogout }) {
  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200/80 z-30 shrink-0 select-none shadow-sm sticky top-0 h-screen">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-we-900 to-we-600 flex items-center justify-center text-white shadow-md shadow-we-600/20">
          <span className="font-extrabold text-xl tracking-tighter lowercase">we</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg text-we-900 tracking-tight">English Lab</span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-we-100 text-we-700 rounded-md">ATS</span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">Sohag Campus • سوهاج</p>
        </div>
      </div>

      <div className="mx-4 my-4 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50/50 border border-purple-100/80 flex items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            {user.role === 'student' ? (
              <>
                <span className="text-[10px] font-bold text-we-700 bg-we-100/80 px-1.5 rounded">Level {user.englishLevel}</span>
                <span className="text-[10px] text-amber-600 font-bold">🔥 {user.currentStreak}d</span>
              </>
            ) : (
              <span className="text-[10px] font-bold text-we-700 bg-we-100/80 px-1.5 rounded capitalize">{user.role}</span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2" aria-label="Main">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'font-semibold text-we-600 bg-we-50 border border-purple-100' : 'font-medium text-slate-600 hover:text-we-600 hover:bg-purple-50/60'}`}
          >
            <span className="flex items-center gap-3.5"><Icon name={item.icon} />{item.label}</span>
            {item.tag && <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-gradient-to-r from-we-600 to-we-magenta text-white rounded-full">{item.tag}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="text-[11px] text-slate-400 px-3">
          <p className="font-semibold text-slate-600">WE ATS Sohag</p>
          <p>Ministry of Edu & Telecom Egypt</p>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all">
          <Icon name="logout" className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function Header({ user, title }) {
  const isStudent = user.role === 'student';
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-we-600 flex items-center justify-center text-white font-extrabold text-base lowercase">we</div>
          <div>
            <div className="text-sm font-extrabold text-we-900 leading-tight">WE English Lab</div>
            <div className="text-[10px] text-slate-400">Sohag Campus</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-600">WE Applied Tech School Sohag</span>
          <span>/</span>
          <span className="text-we-600 font-bold">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {isStudent && <StreakBadge days={user.currentStreak} />}
        {isStudent && <XPBadge xp={user.xp} />}
        {isStudent && (
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-we-900 text-white font-bold text-xs">
            <span className="text-purple-300 font-normal">Level:</span>
            <span>{levelLabel(user.englishLevel)}</span>
          </div>
        )}
        <NavLink to="/profile" className="rounded-xl p-0.5 hover:opacity-80" aria-label="Profile"><Avatar user={user} size="w-8 h-8" text="text-[10px]" /></NavLink>
      </div>
    </header>
  );
}

function MobileNav({ items }) {
  const shown = items.filter((i) => i.mobile !== false);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg" aria-label="Mobile">
      {shown.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-we-600' : 'text-slate-400 hover:text-we-600'}`}>
          <Icon name={item.icon} />
          <span className="text-[10px] font-medium">{item.short}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = navFor(user.role);
  const base = '/' + pathname.split('/')[1];
  const title = TITLES[base] || (pathname.startsWith('/lessons') ? 'Lesson' : 'WE English Lab');

  const onLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F6FA]">
      <Sidebar user={user} items={items} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header user={user} title={title} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full"><Outlet /></main>
        <footer className="mt-auto bg-white border-t border-slate-200/80 px-4 sm:px-8 py-5 text-xs text-slate-400 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-we-600 text-white font-extrabold text-xs lowercase flex items-center justify-center">we</span>
              <span className="font-bold text-slate-700">WE Applied Technology School – Sohag</span>
            </div>
            <p>© 2026 Telecom Egypt & Ministry of Communications and Information Technology.</p>
          </div>
        </footer>
      </div>
      <MobileNav items={items} />
    </div>
  );
}
