const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Expo (SDK 52+) auto-configures Metro's watchFolders/nodeModulesPaths for
// monorepos — the manual watchFolders + resolver.nodeModulesPaths +
// resolver.disableHierarchicalLookup this used to set here fought that
// default and its own explicit two-path allowlist, disabling Metro's
// normal walk-up-the-tree resolution and silently breaking on whichever
// transitive dependency (whatwg-fetch, invariant, ...) pnpm's hoisting
// happened not to place in one of those two exact directories on a given
// machine — reproducible locally, but not guaranteed identical on EAS's
// build image. See https://docs.expo.dev/guides/monorepos/.
config.resolver.unstable_enableSymlinks = true;

// Metro watches the monorepo root, so a Next.js Chrome profile that appears
// and vanishes (screenshot tooling) would otherwise crash the file watcher.
const existingBlockList = config.resolver.blockList;
const blockPatterns = Array.isArray(existingBlockList)
  ? existingBlockList
  : existingBlockList
    ? [existingBlockList]
    : [];
const blockFlags = blockPatterns[0]?.flags ?? '';
config.resolver.blockList = [
  ...blockPatterns,
  new RegExp(String.raw`[/\\]\.chrome-shot-profile[/\\].*`, blockFlags),
];

module.exports = config;
