module.exports = {
  root: true,
  extends: [
    'sobird/typescript.cjs',
  ],
  rules: {
    'import/no-import-module-exports': ['error', {
      exceptions: ['**/*'],
    }],
    'arrow-body-style': ['error', 'always'],
  },
};