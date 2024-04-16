module.exports = {
  root: true,
  extends: [
    '@sobird/eslint-config/typescript.cjs',
  ],
  rules: {
    'import/no-import-module-exports': ['error', {
      exceptions: ['**/*'],
    }],
    'arrow-body-style': ['error', 'always'],
  },
};
