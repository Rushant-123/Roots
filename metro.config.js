// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure we process TS files correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Add React to the resolver
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react': require.resolve('react'),
  'react-native': require.resolve('react-native'),
};

// Add React to the resolverMainFields
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
  'module',
];

// Add watchFolders to include node_modules
config.watchFolders = [
  ...config.watchFolders || [],
  'node_modules',
];

// Configure static file serving
config.server = {
  ...config.server,
  staticPaths: [
    ...(config.server?.staticPaths || []),
    path.join(__dirname, 'public'),
  ],
};

module.exports = config; 