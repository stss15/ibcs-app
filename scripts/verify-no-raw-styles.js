#!/usr/bin/env node

/**
 * Verify that no raw hex colors, px values, or inline styles are used.
 * Usage: node scripts/verify-no-raw-styles.js
 * 
 * Exit code 0 if compliant, 1 if violations found.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

// Patterns to check
const patterns = [
  {
    name: 'Inline style attributes',
    regex: /style\s*=\s*["'][^"']*["']/,
    message: 'Inline style attributes found. Use CSS variables: style={{ "--var": value }}'
  },
  {
    name: 'Hex colors',
    regex: /#[0-9A-Fa-f]{3,6}\b/,
    message: 'Raw hex colors found. Use design tokens: var(--color-primary-800)'
  },
  {
    name: 'Hardcoded pixels',
    regex: /\b\d+px\b/,
    message: 'Hardcoded pixel values found. Use design tokens: var(--space-2), var(--space-4)'
  }
];

// Files/directories to exclude
const excludes = [
  'node_modules',
  'dist',
  '.git',
  'frontend/src/styles/global.css', // Token definitions allowed
  '.map', // Source maps
  '.json', // JSON files (configs, manifests)
];

// Get changed files
let filesToCheck = [];
try {
  const gitDiff = execSync('git diff --name-only --diff-filter=ACMR HEAD', { encoding: 'utf-8' });
  const gitDiffCached = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' });
  const allChanged = new Set([
    ...gitDiff.split('\n').filter(Boolean),
    ...gitDiffCached.split('\n').filter(Boolean)
  ]);
  
  // Filter to frontend/src files only
  filesToCheck = Array.from(allChanged)
    .filter(file => file.startsWith('frontend/src/'))
    .filter(file => {
      // Exclude certain file types
      if (file.endsWith('.json') || file.endsWith('.map')) return false;
      // Exclude global.css (token definitions)
      if (file === 'frontend/src/styles/global.css') return false;
      return true;
    });
} catch (error) {
  console.error(`Error getting changed files: ${error.message}`);
  process.exit(1);
}

if (filesToCheck.length === 0) {
  console.log('✓ No frontend files changed, skipping style check');
  process.exit(0);
}

// Check each file
const violations = [];

for (const file of filesToCheck) {
  // Skip if file doesn't exist
  if (!existsSync(file)) continue;
  
  // Skip excluded files
  if (excludes.some(exclude => file.includes(exclude))) continue;
  
  // Only check JS/JSX/CSS files
  if (!file.match(/\.(js|jsx|css|ts|tsx)$/)) continue;
  
  try {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;
      
      // Check each pattern
      for (const { name, regex, message } of patterns) {
        // Allow CSS variable assignments in style prop
        if (name === 'Inline style attributes' && line.includes("style={{") && line.includes("'--")) {
          continue; // CSS variable assignments are allowed
        }
        
        // Allow CSS custom properties in CSS files
        if (file.endsWith('.css') && line.includes('--') && (line.includes('var(') || line.includes(':'))) {
          continue; // CSS variable definitions/usage are allowed
        }
        
        if (regex.test(line)) {
          violations.push({
            file,
            line: lineNum,
            content: line.trim(),
            pattern: name,
            message
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${file}: ${error.message}`);
  }
}

// Report results
if (violations.length > 0) {
  console.error(`\n❌ DESIGN TOKEN VIOLATION: ${violations.length} violation(s) found:\n`);
  
  // Group by file
  const byFile = {};
  violations.forEach(v => {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  });
  
  Object.entries(byFile).forEach(([file, violations]) => {
    console.error(`\n${file}:`);
    violations.forEach(({ line, content, pattern, message }) => {
      console.error(`  Line ${line}: ${pattern}`);
      console.error(`    ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`);
      console.error(`    Fix: ${message}`);
    });
  });
  
  console.error(`\nUse design tokens from frontend/src/styles/global.css instead of raw values.`);
  process.exit(1);
}

console.log(`✓ All ${filesToCheck.length} file(s) comply with design token requirements`);
process.exit(0);

