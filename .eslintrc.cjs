module.exports = {
  root: true,
  extends: [
    'sobird/typescript.cjs',
  ],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-import-module-exports': ['error', {
      exceptions: ['**/*'],
    }],
    'import/no-unresolved': 'off',
    'arrow-body-style': ['error', 'always'],
  },
};
