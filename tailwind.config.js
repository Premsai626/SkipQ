/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Obsidian & Neon Cyan Redesign Theme Tokens
        obsidian: {
          DEFAULT: '#080B12',
          main: '#080B12',
          secondary: '#0D111B',
          card: '#111827',
          elevated: '#1A2232',
          hover: '#202B3D',
          border: '#273244',
        },
        neon: {
          cyan: '#00D4FF',
          violet: '#8B5CF6',
        },
        surface: {
          primary: '#080B12',
          secondary: '#0D111B',
          card: '#111827',
          elevated: '#1A2232',
          hover: '#202B3D',
          border: '#273244',
        },
        content: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        status: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
        },
        brand: {
          DEFAULT: '#00D4FF',
          accent: '#8B5CF6',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#00D4FF',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-soft': 'bounce 1.5s infinite',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 212, 255, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(52, 211, 153, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'elevated-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
