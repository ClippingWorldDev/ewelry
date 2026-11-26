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
        ivory: '#0A0A0B',
        stone: {
          50: '#0F0F12',
          100: '#16161A',
          200: '#2A2722',
          300: '#3D372C',
          400: '#6B6559',
          500: '#948F84',
          600: '#B8B3A8',
          700: '#D6D3CB'
        },
        obsidian: '#050506',
        charcoal: '#141416',
        gold: {
          DEFAULT: '#C9A24D',
          deep: '#E5C483',
          light: '#F3DCA4',
          soft: 'rgba(201, 162, 77, 0.14)',
          border: 'rgba(201, 162, 77, 0.36)'
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#D4D4D8',
          muted: '#A1A1AA',
          light: '#FFFFFF',
          'light-muted': '#A1A1AA'
        }
      },
      fontFamily: {
        serif: ['"Marcellus"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        xs: '0 2px 6px rgba(0, 0, 0, 0.25)',
        sm: '0 8px 28px rgba(0, 0, 0, 0.35)',
        md: '0 22px 54px rgba(0, 0, 0, 0.45)',
        card: '0 12px 36px rgba(0, 0, 0, 0.4)',
        dark: '0 32px 84px rgba(0, 0, 0, 0.65)',
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 60px -12px rgba(0, 0, 0, 0.55)',
        'glass-gold': 'inset 0 1px 0 rgba(229, 196, 131, 0.22), 0 28px 70px -12px rgba(201, 162, 77, 0.2)',
        'glow-gold': '0 0 30px rgba(201, 162, 77, 0.4)'
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
