// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'alloy',
    'alloy/typescript',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 0,
    'import/named': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-unused-expressions': 0,
    'no-buffer-constructor': 0,
    'import/no-extraneous-dependencies': 0, // 为了避免测试代码lint报错
    'array-bracket-newline': ['error', { 'multiline': true }],
    'no-plusplus': 0,
    'object-shorthand': [0, 'never'],
    'member-ordering': 0,
    'object-literal-sort-keys': 0,
    'no-shadowed-variable': 0,
    'no-consecutive-blank-lines': 0,
    'no-string-literal': 0,
    'arrow-parens': 0,
    'no-implicit-dependencies': 0,
    'no-submodule-imports': 0,
    'no-case-declarations': 1,
    'arrow-body-style': [2, 'as-needed'],
    'class-methods-use-this': 0,
    'import/order': 0,
    'import/imports-first': 0,
    'import/newline-after-import': 0,
    'import/no-dynamic-require': 0,
    'import/no-named-as-default': 0,
    'import/no-webpack-loader-syntax': 0,
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    'max-len': 0,
    'newline-per-chained-call': 0,
    'no-confusing-arrow': 0,
    'no-use-before-define': 0,
    'prefer-template': 2,
    'require-yield': 0,
    'import/prefer-default-export': 0,
    'import/no-cycle': 0,
    'linebreak-style': 0,
    'global-require': 0,
    'quotes': ['error', 'single'], // 使用单引号
    'semi': ['error', 'always'], // 结束添加分号
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.mjs'] // webstorm IDE cannot resolve the webpack.babel.prod.js module correctly without this
      },
    },
  },
  globals: {}
};
