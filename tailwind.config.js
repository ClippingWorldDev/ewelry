/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F4',
        stone: {
          50: '#FAF8F4',
          100: '#F5F1E9',
          200: '#E8E1D3',
          300: '#CFC6B5',
          400: '#B0A795'
        },
        obsidian: '#0E0D0C',
        charcoal: '#171513',
        gold: {
          DEFAULT: '#B59054',
          deep: '#8E6B36',
          light: '#D9BA82',
          soft: 'rgba(181, 144, 84, 0.12)',
          border: 'rgba(181, 144, 84, 0.32)'
        },
        ink: {
          primary: '#141311',
          secondary: '#524E47',
          muted: '#7C766C',
          light: '#FAF8F4',
          'light-muted': '#B8B1A6'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        sm: '0 8px 28px rgba(14, 13, 12, 0.045)',
        md: '0 22px 54px rgba(14, 13, 12, 0.085)',
        dark: '0 32px 84px rgba(0, 0, 0, 0.48)',
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 1), 0 24px 60px -12px rgba(14, 13, 12, 0.1)',
        'glass-gold': 'inset 0 1px 0 rgba(255, 255, 255, 1), 0 28px 70px -12px rgba(181, 144, 84, 0.15)'
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
