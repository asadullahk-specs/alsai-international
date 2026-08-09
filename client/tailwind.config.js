/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      'xs': '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      'max-320': { max: '320px' },
      'max-480': { max: '480px' },
      'max-520': { max: '520px' },
      'max-640': { max: '640px' },
      'max-680': { max: '680px' },
      'max-768': { max: '768px' },
      'max-820': { max: '820px' },
      'max-1024': { max: '1024px' },
      'max-1120': { max: '1120px' },
      'max-1180': { max: '1180px' },
      'max-1220': { max: '1220px' },
      'max-1280': { max: '1280px' },
      'max-1470': { max: '1470px' },
      'max-1480': { max: '1480px' },
      'max-1560': { max: '1560px' },
      'min-641': '641px',
      'min-681': '681px',
      'min-769': '769px',
      'min-821': '821px',
      'min-1121': '1121px',
      'min-1181': '1181px',
      'min-1221': '1221px',
      'min-1281': '1281px',
      'min-1301': '1301px',
      'min-1471': '1471px',
      'min-1481': '1481px',
      'min-1561': '1561px',
    },
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF6F0',
          50: '#FEFDFB',
          100: '#FAF6F0',
          200: '#EFE6D8',
        },
        charcoal: {
          DEFAULT: '#141210',
          light: '#1F1B18',
        },
        ink: '#211D1A',
        muted: '#7A7168',
        brand: {
          DEFAULT: '#A9662A',
          light: '#C17F3E',
          dark: '#8A5220',
        },
        gold: {
          DEFAULT: '#C9A15A',
          light: '#D9BE8B',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
    // The brand direction calls for sharp, edge-to-edge corners everywhere -
    // buttons, cards, fields, banners. `rounded-full` is left untouched since
    // it's used for circular avatars/icons, a shape choice rather than a corner
    // softening. Every other radius utility (rounded, rounded-md, rounded-lg...)
    // now resolves to 0 across the whole app without touching component code.
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '9999px',
    },
  },
  plugins: [],
};
