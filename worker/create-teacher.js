#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { getDb } from './src/instant.js';
import { findTeacherByUsername, createTeacher as createTeacherRecord } from './src/repositories.js';

const BCRYPT_ROUNDS = 8;

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 1) {
    const part = process.argv[i];
    if (!part.startsWith('--')) continue;
    const [key, value] = part.split('=');
    const name = key.slice(2);
    args[name] = value ?? process.argv[i + 1];
    if (value === undefined) {
      i += 1;
    }
  }
  return args;
}

async function loadInstantConfig() {
  const rootDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  const configPath = path.join(rootDir, 'instant.config.json');
  const raw = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(raw);
  if (!config?.app_id || !config?.admin_token) {
    throw new Error('instant.config.json is missing app_id or admin_token');
  }
  return {
    INSTANT_APP_ID: config.app_id,
    INSTANT_ADMIN_TOKEN: config.admin_token,
  };
}

async function main() {
  console.log('============================================');
  console.log('  Create Teacher Account');
  console.log('============================================\n');

  const env = await loadInstantConfig();
  const db = getDb(env);
  const cliArgs = parseArgs();

  const needsPrompt =
    !cliArgs.username || !cliArgs.password || !cliArgs['first-name'] || !cliArgs['last-name'];
  const rl = needsPrompt ? readline.createInterface({ input, output }) : null;

  const usernameInput = cliArgs.username ?? (await rl.question('Teacher username [StevenStewart]: '));
  const passwordInput = cliArgs.password ?? (await rl.question('Teacher password: '));
  const firstNameInput = cliArgs['first-name'] ?? (await rl.question('First name [Steven]: '));
  const lastNameInput = cliArgs['last-name'] ?? (await rl.question('Last name [Stewart]: '));
  const displayNameInput =
    cliArgs['display-name'] ??
    (await rl.question('Display name [Steven Stewart]: '));

  if (rl) rl.close();

  const username = (usernameInput || 'StevenStewart').trim();
  const password = passwordInput.trim();
  const firstName = (firstNameInput || 'Steven').trim();
  const lastName = (lastNameInput || 'Stewart').trim();
  const displayName = (displayNameInput || `${firstName} ${lastName}`.trim()).trim();

  if (!username) {
    throw new Error('Username is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }

  const existing = await findTeacherByUsername(db, username);
  if (existing) {
    console.log('\n⚠️  Teacher already exists. No changes made.');
    console.log(JSON.stringify(existing, null, 2));
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await createTeacherRecord(db, {
    username,
    password: passwordHash,
    firstName,
    lastName,
    displayName,
  });

  console.log('\n✅ Teacher account created!');
  console.log(JSON.stringify(created, null, 2));
  console.log('\nLogin credentials:');
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
}

main().catch((error) => {
  console.error('\n❌ Failed to create teacher:', error.message);
  process.exit(1);
});
