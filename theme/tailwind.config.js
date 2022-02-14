const defaultTheme = require('tailwindcss/defaultTheme');
const defaultFontSize = defaultTheme.fontSize;
const fontSize = {};
Object.keys(defaultFontSize).forEach((key) => {
  fontSize[key] = [defaultFontSize[key][0]];
});

module.exports = {
  content: ['./**/*.twig', './src/scripts/**/*.js'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        lg: '1.5rem',
      },
    },
    screens: {
      sm: { max: '559px' },
      md: '560px',
      lg: '1024px',
    },
    fontSize,
    extend: {
      colors: {},
      fontFamily: {},
      inset: {
        ...defaultTheme.spacing,
      },
    },
  },
};
