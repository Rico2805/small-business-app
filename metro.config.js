// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add resolver for .cjs files
defaultConfig.resolver.sourceExts.push('cjs');

// Firebase uses a module with a .mjs extension
defaultConfig.resolver.sourceExts.push('mjs');

// This is needed to enable polyfill of "idb"
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  'idb': require.resolve('idb')
};

// This is a critical setting to ensure the bundling works correctly with Firebase dependencies
defaultConfig.resolver.resolverMainFields = ['browser', 'main', 'react-native'];

module.exports = defaultConfig;
