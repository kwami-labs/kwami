#!/usr/bin/env node

/**
 * Sync Version Script
 * 
 * This script ensures version consistency across the project by:
 * 1. Reading version from kwami/package.json (single source of truth)
 * 2. Updating version in all relevant files
 * 3. Updating markdown files (README, CHANGELOG, docs)
 * 
 * Run: npm run sync-version
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

try {
  // Read version from kwami/package.json (core library)
  const kwamiPackageJsonPath = resolve(rootDir, 'kwami/package.json');
  const kwamiPackageJson = JSON.parse(readFileSync(kwamiPackageJsonPath, 'utf8'));
  const version = kwamiPackageJson.version;

  if (!version) {
    throw new Error('Version not found in kwami/package.json');
  }

  console.log(`📦 Syncing version: ${version}`);
  console.log('');

  let updatedCount = 0;
  let skippedCount = 0;

  // 1. Update kwami/src/core/Kwami.ts
  const kwamiTsPath = resolve(rootDir, 'kwami/src/core/Kwami.ts');
  if (existsSync(kwamiTsPath)) {
    let kwamiContent = readFileSync(kwamiTsPath, 'utf8');
    const kwamiRegex = /(static getVersion\(\): string \{\s*return ['"])([^'"]+)(['"];)/;
    
    if (kwamiRegex.test(kwamiContent)) {
      kwamiContent = kwamiContent.replace(kwamiRegex, `$1${version}$3`);
      writeFileSync(kwamiTsPath, kwamiContent, 'utf8');
      console.log(`✅ Updated: kwami/src/core/Kwami.ts`);
      updatedCount++;
    } else {
      console.log(`⏭️  No pattern match: kwami/src/core/Kwami.ts`);
      skippedCount++;
    }
  } else {
    console.log(`⏭️  Skipped: kwami/src/core/Kwami.ts (file not found)`);
    skippedCount++;
  }

  // 2. Update web/src/components/WelcomeLayer.ts
  const welcomeLayerPath = resolve(rootDir, 'web/src/components/WelcomeLayer.ts');
  if (existsSync(welcomeLayerPath)) {
    let welcomeContent = readFileSync(welcomeLayerPath, 'utf8');
    const welcomeRegex = /(versionDiv\.textContent = ['"])KWAMI v\.[^'"]+(['"];)/g;
    
    if (welcomeRegex.test(welcomeContent)) {
      // Reset regex
      welcomeContent = readFileSync(welcomeLayerPath, 'utf8');
      welcomeContent = welcomeContent.replace(welcomeRegex, `$1KWAMI v.${version}$2`);
      writeFileSync(welcomeLayerPath, welcomeContent, 'utf8');
      console.log(`✅ Updated: web/src/components/WelcomeLayer.ts`);
      updatedCount++;
    } else {
      console.log(`⏭️  No pattern match: web/src/components/WelcomeLayer.ts`);
      skippedCount++;
    }
  } else {
    console.log(`⏭️  Skipped: web/src/components/WelcomeLayer.ts (file not found)`);
    skippedCount++;
  }

  // 3. Update README.md
  const readmePath = resolve(rootDir, 'README.md');
  if (existsSync(readmePath)) {
    let readmeContent = readFileSync(readmePath, 'utf8');
    const readmeRegex = /(> \*\*Version )[\d.]+(\*\* -)/g;
    
    if (readmeRegex.test(readmeContent)) {
      // Reset regex
      readmeContent = readFileSync(readmePath, 'utf8');
      readmeContent = readmeContent.replace(readmeRegex, `$1${version}$2`);
      writeFileSync(readmePath, readmeContent, 'utf8');
      console.log(`✅ Updated: README.md`);
      updatedCount++;
    } else {
      console.log(`⏭️  No pattern match: README.md`);
      skippedCount++;
    }
  } else {
    console.log(`⏭️  Skipped: README.md (file not found)`);
    skippedCount++;
  }

  console.log('');
  console.log(`🎉 Version sync complete!`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);

} catch (error) {
  console.error('❌ Error syncing version:', error.message);
  console.error(error.stack);
  process.exit(1);
}
