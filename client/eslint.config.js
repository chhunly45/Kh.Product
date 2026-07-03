import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'src/__tests__/**']
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': {
        rules: {
          'no-explicit-any': {}
        }
      },
      'react-hooks': {
        rules: {
          'exhaustive-deps': {}
        }
      }
    },
    rules: {
      'no-debugger': 'error'
    }
  }
];
