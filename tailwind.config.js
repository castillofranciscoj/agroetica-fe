// tailwind.config.js
module.exports = {
    // Look in all of your pages/components for class names
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    // Switch to “class” strategy so dark styles only apply
    // when you explicitly add <html class="dark">
    darkMode: false,
    theme: {
      extend: {
        // your theme overrides, if any
      },
    },
    plugins: [
      // your plugins, if any
    ],
  };
  