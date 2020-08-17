const devDependencies = Object.keys(require('./package.json').devDependencies) || {};

module.exports = {
  env: {
    node: true,
    es2017: true,
    'jest/globals': true,
  },
  plugins: ['prettier', 'promise', 'import', 'node', 'security', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:promise/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:node/recommended',
    'google',
    'prettier',
  ],
  rules: {
    'prettier/prettier': ['warn'],
    'no-template-curly-in-string': ['error'],
    'prefer-template': ['warn'],
    'require-jsdoc': ['off'],
    'new-cap': ['warn', {capIsNewExceptions: ['Router']}],
    'no-debugger': ['warn'],
    'vars-on-top': ['warn'],
    'brace-style': ['error', '1tbs', {allowSingleLine: true}],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'multi-or-nest', 'consistent'],
  },
  overrides: [
    {
      files: ['__tests__/**/*', '__mocks__/**/*', 'test/**/*'],
      rules: {
        'node/no-unpublished-require': ['error', {allowModules: devDependencies}],
      },
    },
    {
      files: ['public/**/*.js', 'static/**/*.js'],
      plugins: ['prettier', 'promise', 'import', 'compat'],
      env: {
        node: false,
        browser: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:promise/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:compat/recommended',
        'google',
        'prettier',
      ],
    },
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
};
