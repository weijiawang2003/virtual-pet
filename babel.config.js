// Reanimated v4 requires `react-native-worklets/plugin` to be the LAST plugin.
// Anything added after will silently break worklet compilation.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
