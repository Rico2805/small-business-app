module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['@react-native/babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.json'],
          alias: {
            '@components': './components',
            '@screens': './screens',
            '@services': './services',
            '@utils': './utils',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
