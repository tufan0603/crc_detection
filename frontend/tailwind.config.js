/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:          '#e4ecf7',
        surface:     '#eef3fb',
        card:        '#f2f6fd',
        border:      '#bfcde6',
        primary:     '#2563eb',
        accent:      '#0ea5e9',
        danger:      '#dc2626',
        success:     '#16a34a',
        warning:     '#d97706',
        muted:       '#7a8fb5',
        textprimary: '#0f1f3d',
        textsub:     '#3d5070',
        purple:      '#7c3aed',
        pink:        '#ec4899',
        teal:        '#0d9488',
        orange:      '#ea580c',
      },
      borderRadius: {
        'none': '0',
        'sm':   '4px',
        DEFAULT:'6px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '10px',
        '2xl':  '12px',
        '3xl':  '14px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
