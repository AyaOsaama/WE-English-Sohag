export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export const LEVEL_NAMES = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper-Intermediate', C1: 'Advanced', C2: 'Proficient' };
export const levelLabel = (l) => (l ? `${l} ${LEVEL_NAMES[l] || ''}`.trim() : '');

export const hasArabic = (s = '') => /[؀-ۿ]/.test(s);

export function timeAgo(date) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export const pct = (v) => (v === null || v === undefined ? '—' : `${v}%`);
export const fmtDuration = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export const COURSE_COLORS = ['bg-we-600', 'bg-blue-600', 'bg-rose-500', 'bg-amber-500', 'bg-violet-600', 'bg-emerald-600', 'bg-we-magenta'];
