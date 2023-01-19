module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  extends: '@alexzimakov/eslint-config',

  overrides: [
    {
      files: ['src/**/*.ts', 'vitest.config.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
    }
  ]
};
