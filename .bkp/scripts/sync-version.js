#!/usr/bin/env node

/**
 * Sync Version Script
 * 
 * This script ensures version consistency across the project by:
 * 1. Reading version from package.json (root - single source of truth)
 * 2. Automatically detecting all versions in files that are older than current version
 * 3. Updating version in all relevant files across the monorepo
 * 4. Preserving historical version references in CHANGELOG and Version History sections
 * 
 * The script is fully automatic and requires NO manual maintenance.
 * Simply update the version in root package.json and run: npm run sync-version
 * 
 * Run: npm run sync-version
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

/**
 * Compare two semantic versions (returns true if v1 < v2)
 */
function isVersionOlder(v1, v2) {
  const [major1, minor1, patch1] = v1.split('.').map(Number);
  const [major2, minor2, patch2] = v2.split('.').map(Number);
  
  if (major1 !== major2) return major1 < major2;
  if (minor1 !== minor2) return minor1 < minor2;
  return patch1 < patch2;
}

/**
 * Extract all version numbers from content
 */
function extractVersions(content) {
  // Match version numbers like 1.2.3 (digits.digits.digits)
  // Using (?<!\.) and (?!\.) to avoid matching partial versions like "10.10.10.1"
  const versionRegex = /(?<!\d)(\d+\.\d+\.\d+)(?!\d)/g;
  const versions = new Set();
  let match;
  
  while ((match = versionRegex.exec(content)) !== null) {
    versions.add(match[1]);
  }
  
  return Array.from(versions);
}

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
 * Check if a line is in a "Version History" or "Changelog" section
 */
function isHistoricalReference(content, matchIndex) {
  // Get the 500 characters before the match
  const before = content.substring(Math.max(0, matchIndex - 500), matchIndex);
  
  // Check if we're in a version history or changelog section
  const historySectionRegex = /(##\s*(Version History|Changelog|Release Notes|Updates)|```changelog)/i;
  
  // If there's a history section marker in the preceding text
  if (historySectionRegex.test(before)) {
    // Check if there's another ## header between the history section and our match
    // (which would mean we've left the history section)
    const lastHistoryMarker = before.search(historySectionRegex);
    const textAfterMarker = before.substring(lastHistoryMarker);
    
    // Count ## headers after the history marker
    const headerAfter = (textAfterMarker.match(/\n##\s+/g) || []).length;
    
    // If there's another ## header, we've left the history section
    return headerAfter === 0;
  }
  
  return false;
}

/**
 * Update version in a file
 */
function updateVersionInFile(filePath, currentVersion) {
  let content = readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;
  
  // Extract all versions from the file
  const versionsInFile = extractVersions(content);
  
  // Filter to only versions that are older than current version
  const oldVersions = versionsInFile.filter(v => isVersionOlder(v, currentVersion));
  
  if (oldVersions.length === 0) {
    return { content, changed: false, originalContent };
  }
  
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
    // Kwami v X.X.X or Kwami vX.X.X (with optional space, with or without dot)
    { regex: /Kwami v\.?\s?OLD_VERSION/g, desc: 'Kwami v' },
    // > **Version X.X.X** (in markdown quotes)
    { regex: /(>\s*\*\*Version\s+)OLD_VERSION(\*\*)/g, desc: '> **Version' },
    // return 'X.X.X' or value: 'X.X.X' (single quotes in code)
    { regex: /'OLD_VERSION'/g, desc: "Single quoted version" },
    // return "X.X.X" or value: "X.X.X" (double quotes in code)
    { regex: /"OLD_VERSION"/g, desc: "Double quoted version" },
  ];
  
  // For each old version, try all patterns
  for (const oldVersion of oldVersions) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source.replace(/OLD_VERSION/g, oldVersion.replace(/\./g, '\\.')), 'g');
      
      // Replace with a function to check if it's a historical reference
      content = content.replace(regex, (match, ...args) => {
        // Get the index of this match in the original content
        const matchIndex = args[args.length - 2]; // Second to last arg is the index
        
        // Skip if this is in a version history section
        if (isHistoricalReference(originalContent, matchIndex)) {
          return match; // Don't change it
        }
        
        // Otherwise, replace the old version with new version
        changed = true;
        return match.replace(oldVersion, currentVersion);
      });
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
  console.log(`   Mode: Automatic (will replace any version < ${version})\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const updatedFiles = [];

  /**
   * Resolve npm workspaces to concrete workspace directories.
   * Supports:
   * - ["app", "web"]
   * - { packages: ["packages/*"] }
   * - Simple trailing globs like "packages/*"
   */
  function getWorkspaceDirsFromRootPackageJson() {
    const ws = rootPackageJson.workspaces;
    const workspaceEntries = Array.isArray(ws) ? ws : (ws && Array.isArray(ws.packages) ? ws.packages : null);
    const fallbackEntries = ['kwami', 'app', 'candy', 'market', 'dao', 'web', 'pg'];

    const entries = workspaceEntries ?? fallbackEntries;
    const dirs = [];

    for (const entry of entries) {
      if (typeof entry !== 'string' || !entry.trim()) continue;

      // Simple "something/*" expansion (common in npm workspaces)
      if (entry.endsWith('/*')) {
        const baseRel = entry.slice(0, -2);
        const baseAbs = resolve(rootDir, baseRel);
        if (!existsSync(baseAbs)) continue;

        try {
          const children = readdirSync(baseAbs);
          for (const child of children) {
            const childAbs = join(baseAbs, child);
            const stat = statSync(childAbs);
            if (!stat.isDirectory()) continue;
            if (['node_modules', '.git', 'dist', '.output', '.nuxt', 'build'].includes(child)) continue;
            dirs.push(join(baseRel, child));
          }
        } catch {
          // ignore workspace expansion failures; individual package.json updates are best-effort
        }

        continue;
      }

      // Skip unsupported complex globs (**, {}, etc.) rather than guessing
      if (entry.includes('*')) {
        console.log(`   ⚠️  Skipping unsupported workspace pattern: ${entry}`);
        continue;
      }

      dirs.push(entry);
    }

    // De-dupe while preserving order
    return Array.from(new Set(dirs));
  }

  // First, update workspace package.json files
  console.log('📦 Updating workspace package.json files...\n');
  const workspaces = getWorkspaceDirsFromRootPackageJson();
  
  for (const workspace of workspaces) {
    const packageJsonPath = resolve(rootDir, workspace, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const oldVersion = packageJson.version;
        
        if (!packageJson.version) {
          // Add version if it doesn't exist (insert after name for proper order)
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
    const result = updateVersionInFile(filePath, version);
    
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
