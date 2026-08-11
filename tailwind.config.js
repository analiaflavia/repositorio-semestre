/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070F1F',
          900: '#0A1628',
          800: '#0F1F3A',
          700: '#16294A',
          600: '#22375F',
          500: '#39507A',
          400: '#5B6B8C',
          300: '#8B97AE',
        },
        gold: {
          700: '#8A6B2F',
          600: '#A8843F',
          500: '#B89653',
          400: '#C9AC74',
          300: '#D9C48E',
          100: '#F0E5CC',
          50:  '#FAF6EC',
        },
        paper: {
          DEFAULT: '#F5F4F1',
          soft:    '#FAF9F7',
          rule:    '#E6E3DC',
        },
        // alias para que el código existente no se rompa
        brand: {
          50:  '#F1F4F9',
          100: '#DFE6F0',
          200: '#C2CEE0',
          300: '#8B97AE',
          400: '#5B6B8C',
          500: '#39507A',
          600: '#16294A',
          700: '#0F1F3A',
          800: '#0A1628',
          900: '#070F1F',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,22,40,0.04), 0 12px 28px -16px rgba(10,22,40,0.18)',
        lift: '0 2px 4px rgba(10,22,40,0.05), 0 20px 40px -20px rgba(10,22,40,0.28)',
      },
    },
  },
  plugins: [],
}