import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/App.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
