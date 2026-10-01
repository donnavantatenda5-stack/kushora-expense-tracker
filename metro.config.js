const { getDefaultConfig } = require('expo/metro-config');

// getDefaultConfig already wires up expo-router and the env transformer that
// strips any secret not prefixed with EXPO_PUBLIC_ from the client bundle.
const config = getDefaultConfig(__dirname);

module.exports = config;
