const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep Metro config minimal and compatible with Expo SDK 50.
// Remove unsupported fields like staticBundles and server.getStaticRenderFunctions.

module.exports = config;