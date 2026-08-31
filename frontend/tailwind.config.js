/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                heading: ['"Fira Code"', 'monospace'],
                body: ['"Fira Sans"', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#6C63FF',
                    50: '#EEEDFF',
                    100: '#D4D2FF',
                    200: '#A9A5FF',
                    300: '#8B85FF',
                    400: '#6C63FF',
                    500: '#5A50F0',
                    600: '#4840D0',
                    700: '#3630A0',
                    800: '#242070',
                    900: '#121040',
                },
                accent: {
                    DEFAULT: '#22C55E',
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#22C55E',
                    600: '#16A34A',
                },
                surface: {
                    DEFAULT: '#0F172A',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
                dark: {
                    bg: '#0F172A',
                    surface: '#1E293B',
                },
            },
            boxShadow: {
                glow: '0 0 20px rgba(108, 99, 255, 0.3)',
                'glow-lg': '0 0 40px rgba(108, 99, 255, 0.4)',
                'glow-accent': '0 0 20px rgba(34, 197, 94, 0.3)',
                glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #6C63FF 0%, #22C55E 50%, #06B6D4 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(34,197,94,0.05) 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'float-slow': 'float 8s ease-in-out 1s infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'gradient': 'gradient 8s ease infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(3deg)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [],
}
