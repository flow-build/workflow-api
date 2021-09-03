module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'max-len': 'off',
    camelcase: 'off',
    indent: ['error', 2],
    'no-undef': 'off'
  }
}
