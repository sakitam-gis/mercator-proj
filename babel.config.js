module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV === 'development');

  return {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            browsers: 'Last 2 Chrome versions, Firefox ESR',
            node: 'current',
          },
          loose: true,
          modules: false,
        },
      ],
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      [
        '@babel/plugin-proposal-decorators',
        {
          legacy: true,
        },
      ],
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      '@babel/plugin-proposal-object-rest-spread',
    ],
    env: {},
    ignore: [
      'dist/*.js',
      'node_modules'
    ],
    comments: false,
  };
};
