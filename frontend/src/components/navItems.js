export const NAV = {
  student: [
    { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: 'home' },
    { to: '/ai-tutor', label: 'AI English Tutor', short: 'AI Tutor', icon: 'chat', tag: 'AI' },
    { to: '/speaking', label: 'Speaking Lab', short: 'Speaking', icon: 'mic' },
    { to: '/courses', label: 'Tech English', short: 'Courses', icon: 'monitor' },
    { to: '/vocabulary', label: 'Vocabulary', short: 'Vocab', icon: 'book' },
    { to: '/challenges', label: 'Challenges', short: 'Quests', icon: 'bolt', mobile: false },
    { to: '/progress', label: 'My Progress', short: 'Progress', icon: 'chart', mobile: false },
    { to: '/profile', label: 'Profile', short: 'Profile', icon: 'user' },
  ],
  staff: [
    { to: '/staff', label: 'Staff Console', short: 'Console', icon: 'users' },
    { to: '/courses', label: 'Courses', short: 'Courses', icon: 'monitor' },
    { to: '/profile', label: 'Profile', short: 'Profile', icon: 'user' },
  ],
};

export const navFor = (role) => (role === 'student' ? NAV.student : NAV.staff);
export const homeFor = (role) => (role === 'student' ? '/dashboard' : '/staff');

export const TITLES = {
  '/dashboard': 'Dashboard', '/ai-tutor': 'AI Tutor', '/speaking': 'Speaking Lab', '/courses': 'Tech English',
  '/vocabulary': 'Vocabulary', '/challenges': 'Challenges', '/progress': 'My Progress', '/profile': 'Profile', '/staff': 'Staff Console',
};
