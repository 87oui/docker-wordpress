module.exports = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-order', 'stylelint-config-rational-order/plugin'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          // Tailwind CSS
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'number-leading-zero': 'always',
    'color-hex-case': 'lower',
    'selector-class-pattern': null,
    'function-url-quotes': 'never',
  },
};
