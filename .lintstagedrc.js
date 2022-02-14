module.exports = {
  '*.css': [
    './theme/node_modules/.bin/prettier --config ./theme/.prettierrc.js --write',
    './theme/node_modules/.bin/stylelint --config ./theme/.stylelintrc.js --fix',
  ],
  '*.js': [
    './theme/node_modules/.bin/prettier --config ./theme/.prettierrc.js --write',
    './theme/node_modules/.bin/eslint -c ./theme/.eslintrc.js --fix',
  ],
  '!(*-lock).{json,md}': [
    './theme/node_modules/.bin/prettier --config ./theme/.prettierrc.js --write',
  ],
};
