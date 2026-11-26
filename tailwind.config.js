/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.html",
    "./assets/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: '#141414',
        stone: {
          50: '#161618',
          100: '#1B1B1E',
          200: '#2A2A2F',
          300: '#3D3D45',
          400: '#64646E',
          500: '#868690',
          600: '#B8B8C0',
          700: '#D6D6DC'
        },
        obsidian: '#0E0E10',
        charcoal: '#1B1B1E',
        elevated: '#222226',
        gold: {
          DEFAULT: '#C9A24D',
          deep: '#E5C483',
          light: '#F7E7C4',
          soft: 'rgba(201, 162, 77, 0.14)',
          border: 'rgba(201, 162, 77, 0.42)'
        },
        ink: {
          primary: '#F5F4F0',
          secondary: '#B8B8C0',
          muted: '#868690',
          light: '#F5F4F0',
          'light-muted': '#B8B8C0'
        }
      },
      fontFamily: {
        serif: ['"Marcellus"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        xs: '0 2px 8px rgba(0, 0, 0, 0.3)',
        sm: '0 10px 30px rgba(0, 0, 0, 0.38)',
        md: '0 22px 54px rgba(0, 0, 0, 0.5)',
        card: '0 16px 40px rgba(0, 0, 0, 0.45)',
        dark: '0 32px 84px rgba(0, 0, 0, 0.65)',
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 60px -12px rgba(0, 0, 0, 0.55)',
        'glass-gold': 'inset 0 1px 0 rgba(247, 231, 196, 0.18), 0 28px 70px -12px rgba(201, 162, 77, 0.18)',
        'glow-gold': '0 0 32px rgba(201, 162, 77, 0.35)'
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '28px'
      }
    }
  },
  plugins: []
};
