const devDependencies = Object.keys(require('./package.json').devDependencies) || {};
const basePlugins = ['prettier', 'promise', 'import'];
const baseExtends = [
  'eslint:recommended',
  'plugin:promise/recommended',
  'plugin:import/errors',
  'plugin:import/warnings',
  'google',
  'prettier',
];
module.exports = {
  env: {
    node: true,
    es2017: true,
  },
  plugins: basePlugins.concat(['node', 'security']),
  extends: baseExtends.concat(['plugin:node/recommended', 'plugin:security/recommended']),
  rules: {
    'prettier/prettier': ['warn'],
    'no-template-curly-in-string': ['error'],
    'prefer-template': ['warn'],
    camelcase: ['warn'],
    'require-jsdoc': ['off'],
    'new-cap': ['warn', {capIsNewExceptions: ['Router']}],
    'no-debugger': ['warn'],
    'vars-on-top': ['warn'],
    'brace-style': ['error', '1tbs', {allowSingleLine: true}],
    'security/detect-object-injection': ['off'],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'multi-or-nest', 'consistent'],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/__mocks__/**/*', 'test/**/*', 'util/**/*'],
      env: {
        'jest/globals': true,
        node: true,
        es2017: true,
      },
      plugins: basePlugins.concat(['node', 'jest']),
      extends: baseExtends.concat(['plugin:node/recommended', 'plugin:jest/recommended', 'plugin:jest/style']),
      rules: {
        'node/no-unpublished-require': ['error', {allowModules: devDependencies}],
        'require-jsdoc': ['off'],
      },
    },
    {
      files: ['public/**/*.js', 'static/**/*.js'],
      plugins: basePlugins.concat(['compat']),
      env: {
        node: false,
        browser: true,
        es2017: true,
      },
      extends: baseExtends.concat(['plugin:compat/recommended']),
      rules: {
        'no-var': ['off'],
        'vars-on-top': ['off'],
        'prettier/prettier': ['off'],
      },
    },
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
};
