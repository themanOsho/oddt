/**
 * Tailwind config for ODDT admin dashboard views.
 * - No prefix (standard Tailwind utilities)
 * - Preflight enabled (default)
 */
module.exports = {
  content: [
    './views/**/*.php',
    './src/**/*.php',
    './admin.php',
    './installer.php',
    './login.php',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Example mapping so admin can also reference CSS variables if desired
        'oddt-custom-bg': 'var(--oddt-bg)',
        'oddt-custom-hover': 'var(--oddt-hover)',
        'oddt-custom-dropdown': 'var(--oddt-dropdown-bg)'
      }
    }
  },
  plugins: []
};
