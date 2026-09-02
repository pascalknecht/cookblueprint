const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Needed for Metro to see workspace packages (e.g. @repo/shared) living
// outside apps/mobile, and to resolve pnpm's symlinked node_modules layout.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;

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
