const { getDefaultConfig } = require('expo/metro-config');

// Node 20+/24 does not expose requestAnimationFrame, but Expo's router server
// assumes a browser-like animation frame API during web export. Provide a
// minimal shim so bundle generation can run in a Node environment.
globalThis.requestAnimationFrame ??= (callback) =>
  setTimeout(() => callback(Date.now()), 16);
globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id);

// getDefaultConfig already wires up expo-router and the env transformer that
// strips any secret not prefixed with EXPO_PUBLIC_ from the client bundle.
const config = getDefaultConfig(__dirname);

module.exports = config;
