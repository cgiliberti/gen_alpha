import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        trait: {
          agency: '#6366f1',      // indigo
          orthogonal: '#8b5cf6',  // violet
          curiosity: '#06b6d4',   // cyan
        },
      },
    },
  },
  plugins: [],
};

export default config;
