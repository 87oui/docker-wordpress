import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import configPrettier from 'eslint-config-prettier'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  configPrettier,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['tsconfig.json', 'src/blocks/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      'import-x/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['tsconfig.json', 'src/blocks/tsconfig.json'],
      },
    },
  },
])
