/**
 * "off" or 0 - turn the rule off
 * "warn" or 1 - turn the rule on as a warning (doesn't affect exit code)
 * "error" or 2 - turn the rule on as an error (exit code will be 1)
 * 
 * @see https://typescript-eslint.io/play
 */
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    // 'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 使用2个空格缩进
    // indent: ['error', 2, { SwitchCase: 1 }],
    '@typescript-eslint/indent': ['error', 2],
    /** Require or disallow semicolons instead of ASI */
    "@typescript-eslint/semi": "error",
    /** Disallow unused variables */
    // "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/no-explicit-any": "off"
  }
};
