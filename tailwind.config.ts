import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-strong': 'var(--ink-strong)',
        body: 'var(--body)',
        'body-mid': 'var(--body-mid)',
        mute: 'var(--mute)',
        'mute-soft': 'var(--mute-soft)',
        hairline: 'var(--hairline)',
        canvas: 'var(--canvas)',
        purple: 'var(--purple)',
        pink: 'var(--pink)',
        blue: 'var(--blue)',
        'blue-deep': 'var(--blue-deep)',
        'blue-info': 'var(--blue-info)',
        orange: 'var(--orange)',
        green: 'var(--green)',
        yellow: 'var(--yellow)',
        red: 'var(--red)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        full: 'var(--r-full)',
      },
      maxWidth: {
        container: '1240px',
      },
      boxShadow: {
        'layer-2': 'var(--shadow-2)',
        'layer-3': 'var(--shadow-3)',
      },
    },
  },
  plugins: [],
};

export default config;
