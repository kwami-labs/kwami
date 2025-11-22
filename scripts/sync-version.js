#!/usr/bin/env node

/**
 * Sync Version Script
 * 
 * This script ensures version consistency across the project by:
 * 1. Reading version from package.json (root - single source of truth)
 * 2. Updating version in all relevant files across the monorepo
 * 3. Replacing old versions (1.4.x, 1.5.x) with the current version
 * 
 * Run: npm run sync-version
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

// Old versions to replace (1.4.0, 1.4.1, 1.4.2, 1.5.0, 1.5.1, 1.5.2, 1.5.3, 1.5.4)
const OLD_VERSIONS = ['1.4.0', '1.4.1', '1.4.2', '1.5.0', '1.5.1', '1.5.2', '1.5.3', '1.5.4'];

/**
 * Recursively get all files with specific extensions
 */
function getAllFiles(dir, extensions = ['.md', '.ts', '.js', '.json'], fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, dist, .output directories
      if (!['node_modules', '.git', 'dist', '.output', '.nuxt', 'build'].includes(file)) {
        getAllFiles(filePath, extensions, fileList);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      // Skip package-lock.json files
      if (!file.endsWith('package-lock.json')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Update version in a file
 */
function updateVersionInFile(filePath, currentVersion, oldVersions) {
  let content = readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;
  
  // Define patterns to match and replace
  const patterns = [
    // **Version:** X.X.X or Version: X.X.X
    { regex: /(\*\*Version:\*\*|\*\*Version\*\*:?|Version:)\s*OLD_VERSION/g, desc: 'Version:' },
    // kwami@X.X.X
    { regex: /kwami@OLD_VERSION/g, desc: 'kwami@' },
    // "version": "X.X.X" (in JSON-like strings in markdown)
    { regex: /"version":\s*"OLD_VERSION"/g, desc: '"version":' },
    // KWAMI v.X.X.X
    { regex: /KWAMI v\.OLD_VERSION/g, desc: 'KWAMI v.' },
    // > **Version X.X.X** (in markdown quotes)
    { regex: /(>\s*\*\*Version\s+)OLD_VERSION(\*\*)/g, desc: '> **Version' },
  ];
  
  // For each old version, try all patterns
  for (const oldVersion of oldVersions) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source.replace(/OLD_VERSION/g, oldVersion.replace(/\./g, '\\.')), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, (match) => match.replace(oldVersion, currentVersion));
        changed = true;
      }
    }
  }
  
  return { content, changed, originalContent };
}

try {
  // Read version from root package.json (single source of truth)
  const rootPackageJsonPath = resolve(rootDir, 'package.json');
  const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf8'));
  const version = rootPackageJson.version;

  if (!version) {
    throw new Error('Version not found in package.json');
  }

  console.log(`\n📦 Syncing version: ${version}`);
  console.log(`   Source: package.json`);
  console.log(`   Replacing: ${OLD_VERSIONS.join(', ')}\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const updatedFiles = [];

  // First, update workspace package.json files
  console.log('📦 Updating workspace package.json files...\n');
  const workspaces = ['kwami', 'app', 'candy', 'market', 'dao', 'web', 'pg'];
  
  for (const workspace of workspaces) {
    const packageJsonPath = resolve(rootDir, workspace, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const oldVersion = packageJson.version;
        
        if (!packageJson.version) {
          // Add version if it doesn't exist (insert after name for proper order)
          const orderedPackageJson = {
            name: packageJson.name,
            version: version,
            ...packageJson
          };
          delete orderedPackageJson.name; // Remove duplicate name
          const finalPackageJson = {
            name: packageJson.name,
            version: version,
            ...Object.fromEntries(Object.entries(packageJson).filter(([key]) => key !== 'name'))
          };
          writeFileSync(packageJsonPath, JSON.stringify(finalPackageJson, null, 2) + '\n', 'utf8');
          updatedFiles.push(`${workspace}/package.json`);
          console.log(`   ✓ ${workspace}/package.json (added version ${version})`);
          updatedCount++;
        } else if (packageJson.version !== version) {
          // Update version if it's different
          packageJson.version = version;
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
          updatedFiles.push(`${workspace}/package.json`);
          console.log(`   ✓ ${workspace}/package.json (${oldVersion} → ${version})`);
          updatedCount++;
        } else {
          // Already up to date
          console.log(`   ✓ ${workspace}/package.json (already ${version})`);
          skippedCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Could not update ${workspace}/package.json: ${err.message}`);
        skippedCount++;
      }
    } else {
      console.log(`   ⏭️  ${workspace}/package.json (not found)`);
      skippedCount++;
    }
  }

  // Get all markdown, TypeScript, and JavaScript files
  console.log('\n📄 Scanning documentation and source files...\n');
  const allFiles = getAllFiles(rootDir, ['.md', '.ts', '.js']);
  
  for (const filePath of allFiles) {
    const relativePath = filePath.replace(rootDir + '/', '');
    const result = updateVersionInFile(filePath, version, OLD_VERSIONS);
    
    if (result.changed) {
      writeFileSync(filePath, result.content, 'utf8');
      updatedFiles.push(relativePath);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Version sync complete!');
  console.log(`   Version: ${version}`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${skippedCount} files (already up-to-date)`);
  
  if (updatedFiles.length > 0) {
    console.log('\n📝 Updated files:');
    updatedFiles.forEach(file => console.log(`   ✓ ${file}`));
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

} catch (error) {
  console.error('❌ Error syncing version:', error.message);
  console.error(error.stack);
  process.exit(1);
}
