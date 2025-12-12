module.exports = {
  root: true,
  extends: [
    'sobird/typescript.cjs',
  ],
  rules: {
    'import/no-import-module-exports': ['error', {
      exceptions: ['**/*'],
    }],
    'import/no-unresolved': 'off',
    'arrow-body-style': ['error', 'always'],
  },
};
