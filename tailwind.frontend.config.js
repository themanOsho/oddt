/**
 * Tailwind config for ODDT frontend widget.
 * - Strict prefix: 'oddt-'
 * - Preflight disabled (corePlugins.preflight = false)
 * - Adds small utilities that map to CSS custom properties so admins can set colors via variables
 */
module.exports = {
  content: [
    './**/*.php',
    './src/**/*.php',
    './views/**/*.php',
    './assets/js/**/*.js'
  ],
  prefix: 'oddt-',
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      // Register named theme colors as global design tokens when needed.
      colors: {
        // kept intentionally empty; utilities below use CSS variables directly
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.custom-bg': { 'background-color': 'var(--oddt-bg)' },
        '.custom-hover:hover': { 'background-color': 'var(--oddt-hover)' },
        '.custom-dropdown': { 'background-color': 'var(--oddt-dropdown-bg)' }
      };
      addUtilities(newUtilities, { variants: ['responsive', 'hover'] });
    }
  ]
};
