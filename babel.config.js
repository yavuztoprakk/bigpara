module.exports = function (api) {
    api.cache(true);
    return {
      presets: ["babel-preset-expo"],
      plugins: [
        ["module:react-native-dotenv", {
          moduleName: "@env",
          path: ".env",
          allowUndefined: false, // Ortam değişkenlerinin tanımlı olduğundan emin olmak için
        }],
        "react-native-reanimated/plugin", // Bu her zaman en sonda olmalıdır!
      ],
    };
  };