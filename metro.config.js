const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaulConfig = getDefaultConfig(__dirname);
defaulConfig.resolver.assetExts.push('cjs');

module.exports = defaulConfig;

