// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // ← correct plugin for Tailwind v4
    autoprefixer: {},
  },
};
