import { initials } from '../utils/format.js';

export default function Avatar({ user, size = 'w-10 h-10', text = 'text-xs' }) {
  if (user?.avatar) return <img src={user.avatar} alt={user.name} className={`${size} rounded-xl object-cover ring-2 ring-we-600/30`} />;
  return (
    <div className={`${size} ${text} rounded-xl bg-gradient-to-tr from-we-900 to-we-600 text-white font-bold flex items-center justify-center ring-2 ring-we-600/30`} aria-label={user?.name}>
      {initials(user?.name)}
    </div>
  );
}
