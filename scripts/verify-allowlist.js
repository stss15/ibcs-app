#!/usr/bin/env node

/**
 * Verify that only files in the allowlist have been changed.
 * Usage: node scripts/verify-allowlist.js <task-id>
 * 
 * Exit code 0 if all files are allowed, 1 if violations found.
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const taskId = process.argv[2];

if (!taskId) {
  console.error('Error: Task ID required');
  console.error('Usage: node scripts/verify-allowlist.js <task-id>');
  process.exit(1);
}

// Read allowlist from .ibcs-task-allowlist
let allowlist = [];
try {
  const allowlistContent = readFileSync('.ibcs-task-allowlist', 'utf-8');
  const lines = allowlistContent.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });
  
  // Convert glob patterns to regex (simple implementation)
  allowlist = lines.map(pattern => {
    // Escape special regex chars except * and ?
    let regex = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '___DOUBLESTAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLESTAR___/g, '.*')
      .replace(/\?/g, '[^/]');
    return new RegExp(`^${regex}$`);
  });
} catch (error) {
  console.error(`Error reading .ibcs-task-allowlist: ${error.message}`);
  process.exit(1);
}

// Get changed files from git
let changedFiles = [];
try {
  const gitDiff = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });
  const gitDiffCached = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  const allChanged = new Set([
    ...gitDiff.split('\n').filter(Boolean),
    ...gitDiffCached.split('\n').filter(Boolean)
  ]);
  changedFiles = Array.from(allChanged);
} catch (error) {
  console.error(`Error getting changed files: ${error.message}`);
  process.exit(1);
}

// Always allow documentation files
const alwaysAllowed = [
  /^docs\/ui-ux-refactor-changelog\.md$/,
  /^docs\/ui-ux-refactor-plan\.md$/,
  /^docs\/ui-ux-design-system\.md$/,
  /^docs\/.*\.md$/, // Allow any markdown in docs
];

// Blocked patterns (always reject)
const blockedPatterns = [
  /^package\.json$/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /^\.env/,
  /^worker\/.*$/,
  /^frontend\/index\.html$/, // CSP changes need explicit approval
];

// Check each changed file
const violations = [];
const allowed = [];

for (const file of changedFiles) {
  // Check if blocked
  if (blockedPatterns.some(pattern => pattern.test(file))) {
    violations.push({
      file,
      reason: 'File is in blocked list (package.json, lockfiles, .env, worker, or CSP)'
    });
    continue;
  }
  
  // Check if always allowed
  if (alwaysAllowed.some(pattern => pattern.test(file))) {
    allowed.push(file);
    continue;
  }
  
  // Check if in allowlist
  const isAllowed = allowlist.some(pattern => pattern.test(file));
  
  if (isAllowed) {
    allowed.push(file);
  } else {
    violations.push({
      file,
      reason: 'File not in allowlist'
    });
  }
}

// Report results
if (violations.length > 0) {
  console.error(`\n❌ ALLOWLIST VIOLATION: ${violations.length} file(s) not allowed:\n`);
  violations.forEach(({ file, reason }) => {
    console.error(`  - ${file}`);
    console.error(`    Reason: ${reason}`);
  });
  console.error(`\nAllowed files for this task:`);
  allowlist.forEach(pattern => {
    console.error(`  - ${pattern}`);
  });
  console.error(`\nIf this file should be allowed, update .ibcs-task-allowlist`);
  process.exit(1);
}

console.log(`✓ All ${changedFiles.length} changed file(s) are in allowlist`);
process.exit(0);

