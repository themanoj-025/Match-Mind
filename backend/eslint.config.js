import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage', 'scripts', 'src/data']),
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        node: true,
        es2022: true,
      },
    },
    rules: {
      // Allow console.log — replaced by Pino, but fallback OK
      'no-console': 'off',

      // Require === and !==
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // No unused vars (exceptions for _ prefixed)
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Prefer const over let when not reassigned
      'prefer-const': 'error',

      // No var
      'no-var': 'error',

      // No duplicate imports
      'no-duplicate-imports': 'error',

      // Require curly braces even for single-line blocks
      curly: ['error', 'all'],

      // No trailing spaces
      'no-trailing-spaces': 'error',

      // Consistent return
      'consistent-return': 'warn',
    },
  },
])
