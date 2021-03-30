module.exports = {
  '*.scss': ['prettier --write', 'stylelint --fix'],
  '*.js': ['prettier --write', 'eslint --fix'],
  '!(*-lock).{json,md}': ['prettier --write'],
};
