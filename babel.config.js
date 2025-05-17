module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', // NativeWind plugin
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // Path to your .env file
        },
      ],
    ],
  };
};
