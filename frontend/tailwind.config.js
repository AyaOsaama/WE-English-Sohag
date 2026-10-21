/** Design tokens carried over from the HTML prototype. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        we: {
          50: '#FAF5FF', 100: '#F3E8FF', 200: '#E9D5FF', 300: '#D8B4FE', 400: '#C084FC', 500: '#9333EA',
          600: '#5C2483', 700: '#4C1D6E', 800: '#3B1457', 900: '#230B3E',
          accent: '#8E3AC4', magenta: '#B82987', teal: '#00C49F',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], cairo: ['Cairo', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      boxShadow: {
        'we-soft': '0 8px 30px rgba(92, 36, 131, 0.08)',
        'we-glow': '0 0 25px rgba(142, 58, 196, 0.25)',
        'we-card': '0 4px 20px -2px rgba(35, 11, 62, 0.05), 0 2px 6px -1px rgba(35, 11, 62, 0.03)',
      },
    },
  },
  plugins: [],
};
