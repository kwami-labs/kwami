#!/usr/bin/env node

/**
 * Comprehensive Version Sync Script
 * 
 * Syncs version from kwami/package.json to ALL files across the project:
 * - All package.json files (root, kwami, pg, app, web, etc.)
 * - All README.md files (root, kwami/, projects/)
 * - All docs/**\/*.md files
 * - Source code files (Kwami.ts, WelcomeLayer.ts)
 * 
 * Run: npm run sync-version
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

// Pattern to match version numbers (e.g., 1.4.2, 1.5.5)
const VERSION_PATTERN = /\d+\.\d+\.\d+/;

/**
 * Recursively find all files matching a pattern
 */
function findFiles(dir, pattern, results = []) {
  if (!existsSync(dir)) return results;
  
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    // Skip node_modules, dist, .git
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.github') {
      continue;
    }
    
    if (stat.isDirectory()) {
      findFiles(filePath, pattern, results);
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

/**
 * Update version in package.json files
 */
function updatePackageJson(filePath, version) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const pkg = JSON.parse(content);
    
    if (pkg.version && pkg.version !== version) {
      pkg.version = version;
      writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update version in markdown and TypeScript files
 */
function updateVersionInFile(filePath, version, patterns) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const pattern of patterns) {
      const originalContent = content;
      content = content.replace(pattern.regex, pattern.replacement(version));
      if (content !== originalContent) {
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

try {
  // Read version from kwami/package.json (single source of truth)
  const kwamiPackageJsonPath = resolve(rootDir, 'kwami/package.json');
  const kwamiPackageJson = JSON.parse(readFileSync(kwamiPackageJsonPath, 'utf8'));
  const version = kwamiPackageJson.version;

  if (!version) {
    throw new Error('Version not found in kwami/package.json');
  }

  console.log(`\n📦 Syncing version: ${version}`);
  console.log(`   Source: kwami/package.json`);
  console.log('');

  let updatedCount = 0;
  let skippedCount = 0;

  // ==========================================
  // 1. Update all package.json files
  // ==========================================
  console.log('📄 Updating package.json files...');
  const packageJsonFiles = findFiles(rootDir, /^package\.json$/);
  
  for (const file of packageJsonFiles) {
    const relativePath = file.replace(rootDir + '/', '');
    if (updatePackageJson(file, version)) {
      console.log(`   ✅ ${relativePath}`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log('');

  // ==========================================
  // 2. Update all README.md files
  // ==========================================
  console.log('📄 Updating README.md files...');
  const readmeFiles = findFiles(rootDir, /^README\.md$/);
  
  const readmePatterns = [
    // Pattern: > **Version 1.4.2** -
    {
      regex: /(>\s*\*\*Version\s+)\d+\.\d+\.\d+(\*\*)/g,
      replacement: (v) => `$1${v}$2`
    },
    // Pattern: **Version:** 1.4.2
    {
      regex: /(\*\*Version:\*\*\s+)\d+\.\d+\.\d+/g,
      replacement: (v) => `$1${v}`
    },
    // Pattern: Version: 1.4.2
    {
      regex: /(Version:\s+)\d+\.\d+\.\d+/g,
      replacement: (v) => `$1${v}`
    },
    // Pattern: version 1.4.2
    {
      regex: /(version\s+)\d+\.\d+\.\d+/gi,
      replacement: (v) => `$1${v}`
    }
  ];
  
  for (const file of readmeFiles) {
    const relativePath = file.replace(rootDir + '/', '');
    if (updateVersionInFile(file, version, readmePatterns)) {
      console.log(`   ✅ ${relativePath}`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log('');

  // ==========================================
  // 3. Update all docs/**/*.md files
  // ==========================================
  console.log('📄 Updating docs/**/*.md files...');
  const docsDir = resolve(rootDir, 'docs');
  const docsFiles = findFiles(docsDir, /\.md$/);
  
  const docsPatterns = [
    // Pattern: Version 1.4.2 or v1.4.2
    {
      regex: /(Version\s+v?)\d+\.\d+\.\d+/gi,
      replacement: (v) => `$1${v}`
    },
    // Pattern: version: "1.4.2"
    {
      regex: /(version:\s*["'])\d+\.\d+\.\d+(["'])/g,
      replacement: (v) => `$1${v}$2`
    },
    // Pattern: @version 1.4.2
    {
      regex: /(@version\s+)\d+\.\d+\.\d+/g,
      replacement: (v) => `$1${v}`
    }
  ];
  
  for (const file of docsFiles) {
    const relativePath = file.replace(rootDir + '/', '');
    if (updateVersionInFile(file, version, docsPatterns)) {
      console.log(`   ✅ ${relativePath}`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log('');

  // ==========================================
  // 4. Update specific source files
  // ==========================================
  console.log('📄 Updating source files...');
  
  // Kwami.ts - getVersion() method
  const kwamiTsPath = resolve(rootDir, 'kwami/src/core/Kwami.ts');
  if (existsSync(kwamiTsPath)) {
    const patterns = [
      {
        regex: /(static getVersion\(\): string \{\s*return\s*['"])\d+\.\d+\.\d+(['"];)/,
        replacement: (v) => `$1${v}$2`
      }
    ];
    if (updateVersionInFile(kwamiTsPath, version, patterns)) {
      console.log(`   ✅ kwami/src/core/Kwami.ts`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }
  
  // WelcomeLayer.ts - version display
  const welcomeLayerPath = resolve(rootDir, 'web/src/components/WelcomeLayer.ts');
  if (existsSync(welcomeLayerPath)) {
    const patterns = [
      {
        regex: /(versionDiv\.textContent\s*=\s*['"]KWAMI\s+v\.)\d+\.\d+\.\d+(['"];)/g,
        replacement: (v) => `$1${v}$2`
      }
    ];
    if (updateVersionInFile(welcomeLayerPath, version, patterns)) {
      console.log(`   ✅ web/src/components/WelcomeLayer.ts`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log('');

  // ==========================================
  // Summary
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉 Version sync complete!`);
  console.log(`   Version: ${version}`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${skippedCount} files (already up-to-date)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

} catch (error) {
  console.error('\n❌ Error syncing version:', error.message);
  console.error(error.stack);
  process.exit(1);
}
