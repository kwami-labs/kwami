#!/usr/bin/env node

/**
 * Sync Version Script
 * 
 * This script ensures version consistency across the project by:
 * 1. Reading version from package.json (single source of truth)
 * 2. Updating the version in src/core/Kwami.ts
 * 3. Updating the version in web/src/components/WelcomeLayer.ts (welcome screen)
 * 
 * Run automatically during build or manually: node scripts/sync-version.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');
const packageJsonPath = resolve(rootDir, 'package.json');
const kwamiTsPath = resolve(rootDir, 'src/core/Kwami.ts');
const welcomeLayerPath = resolve(rootDir, 'web/src/components/WelcomeLayer.ts');

try {
  // Read version from package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version) {
    throw new Error('Version not found in package.json');
  }

  console.log(`📦 Found version: ${version}`);

  // Read Kwami.ts
  let kwamiContent = readFileSync(kwamiTsPath, 'utf8');

  // Replace version in getVersion() method
  // Match: return '2.2.0'; or return "2.2.0";
  const versionRegex = /(static getVersion\(\): string \{\s*return ['"])([^'"]+)(['"];)/;
  
  if (!versionRegex.test(kwamiContent)) {
    throw new Error('getVersion() method not found in Kwami.ts');
  }

  const updatedContent = kwamiContent.replace(
    versionRegex,
    `$1${version}$3`
  );

  // Write updated content
  writeFileSync(kwamiTsPath, updatedContent, 'utf8');

  console.log(`✅ Updated Kwami.ts to version ${version}`);
  console.log(`📄 File: ${kwamiTsPath}`);

  // Update WelcomeLayer.ts
  let welcomeLayerContent = readFileSync(welcomeLayerPath, 'utf8');

  // Replace version in versionDiv.textContent
  // Match: versionDiv.textContent = 'KWAMI v.0.0.1'; or versionDiv.textContent = "KWAMI v.0.0.1";
  const welcomeVersionRegexTest = /(versionDiv\.textContent = ['"])KWAMI v\.[^'"]+(['"];)/;
  const welcomeVersionRegex = /(versionDiv\.textContent = ['"])KWAMI v\.[^'"]+(['"];)/g;
  
  if (!welcomeVersionRegexTest.test(welcomeLayerContent)) {
    throw new Error('versionDiv.textContent not found in WelcomeLayer.ts');
  }

  const updatedWelcomeContent = welcomeLayerContent.replace(
    welcomeVersionRegex,
    `$1KWAMI v.${version}$2`
  );

  // Write updated content
  writeFileSync(welcomeLayerPath, updatedWelcomeContent, 'utf8');

  console.log(`✅ Updated WelcomeLayer.ts to version ${version}`);
  console.log(`📄 File: ${welcomeLayerPath}`);

} catch (error) {
  console.error('❌ Error syncing version:', error.message);
  process.exit(1);
}
