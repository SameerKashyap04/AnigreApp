const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add tflite and txt to assetExts so Metro bundles them correctly
config.resolver.assetExts.push('tflite', 'txt');

module.exports = config;
