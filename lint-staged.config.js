export default {
  '*.css': ['prettier --write'],
  '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.twig': ['prettier --write'],
}
