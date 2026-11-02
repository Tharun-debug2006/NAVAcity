/**
 * Tailwind configuration.
 *
 * The colours below mirror the design tokens in `src/styles/tokens.css`; the
 * CSS file is the single source of truth, this file only exposes the same
 * values as Tailwind utilities so that the JSX stays readable.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand / primary navy family.
        metro: {
          50: '#eef5fb',
          100: '#dceaf5',
          200: '#bfd2e5',
          600: '#174a7c',
          700: '#12305a',
          800: '#0b2344',
        },
        // Transit teal family.
        bus: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          600: '#0f766e',
          700: '#115e59',
        },
        // Crowd levels.  Always used together with a text label.
        crowd: {
          low: '#0f8a5f',
          'low-soft': '#ecfdf5',
          moderate: '#0369a1',
          'moderate-soft': '#f0f9ff',
          high: '#c2410c',
          'high-soft': '#fff7ed',
          critical: '#b91c1c',
          'critical-soft': '#fef2f2',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1152px',
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
