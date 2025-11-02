#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { getDb, tx } from './src/instant.js';
import { findAdminByUsername, createAdmin } from './src/repositories.js';

const BCRYPT_ROUNDS = 8;

const TEACHER_BACKFILL = {
  mrstewart: {
    firstName: 'Steven',
    lastName: 'Stewart',
    displayName: 'Steven Stewart',
  },
};

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
  const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
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

function splitName(value) {
  if (!value) return { firstName: null, lastName: null };
  const parts = value
    .replace(/^[^A-Za-z]+/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }
  return { firstName: parts[0], lastName: parts[parts.length - 1] };
}

async function backfillTeacherDetails(db) {
  const result = await db.query({
    teachers: {
      $: {},
    },
  });

  const teachers = result?.teachers ?? [];
  if (teachers.length === 0) {
    console.log('\nℹ️  No existing teachers to backfill.');
    return;
  }

  const mutations = [];
  for (const teacher of teachers) {
    const mapKey = String(teacher.username || '').toLowerCase();
    const overrides = TEACHER_BACKFILL[mapKey] ?? {};
    const desiredFirst = overrides.firstName ?? splitName(overrides.displayName ?? teacher.displayName ?? teacher.username).firstName;
    const desiredLast = overrides.lastName ?? splitName(overrides.displayName ?? teacher.displayName ?? teacher.username).lastName;
    const desiredDisplay = overrides.displayName ?? teacher.displayName ?? teacher.username;

    const update = {};
    if (!teacher.firstName && desiredFirst) update.firstName = desiredFirst;
    if (!teacher.lastName && desiredLast) update.lastName = desiredLast;
    if (
      (overrides.displayName && teacher.displayName !== overrides.displayName) ||
      !teacher.displayName ||
      teacher.displayName === teacher.username
    ) {
      update.displayName = desiredDisplay;
    }

    if (Object.keys(update).length > 0) {
      mutations.push(tx.teachers[teacher.id].update(update));
      console.log(` - Queued update for teacher ${teacher.username}`);
    }
  }

  if (mutations.length > 0) {
    await db.transact(mutations);
    console.log('✅ Teacher records updated.');
  } else {
    console.log('ℹ️  Teacher profiles already populated.');
  }
}

async function main() {
  console.log('============================================');
  console.log('  Seed Admin + Backfill Profiles');
  console.log('============================================\n');

  const env = await loadInstantConfig();
  const db = getDb(env);
  const cliArgs = parseArgs();

  const needsPrompt = !cliArgs.username || !cliArgs.password || !cliArgs['first-name'] || !cliArgs['last-name'];
  const rl = needsPrompt ? readline.createInterface({ input, output }) : null;

  const usernameInput = cliArgs.username ?? (await rl.question('Admin username [admin]: '));
  const passwordInput = cliArgs.password ?? (await rl.question('Admin password: '));
  const firstNameInput = cliArgs['first-name'] ?? (await rl.question('First name [Site]: '));
  const lastNameInput = cliArgs['last-name'] ?? (await rl.question('Last name [Administrator]: '));

  if (rl) rl.close();

  const username = (usernameInput || 'admin').trim();
  const password = passwordInput.trim();
  const firstName = (firstNameInput || 'Site').trim();
  const lastName = (lastNameInput || 'Administrator').trim();
  const displayName = `${firstName} ${lastName}`.trim();

  if (!username) {
    throw new Error('Username is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }

  const existing = await findAdminByUsername(db, username);
  if (existing) {
    console.log('\n⚠️  Admin already exists; skipping creation.');
  } else {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const created = await createAdmin(db, {
      username,
      password: passwordHash,
      firstName,
      lastName,
      displayName,
    });

    console.log('\n✅ Admin account created!');
    console.log(JSON.stringify(created, null, 2));
    console.log('\nLogin credentials:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
  }

  await backfillTeacherDetails(db);

  console.log('\nAll done.');
}

main().catch((error) => {
  console.error('\n❌ Failed to seed admin:', error.message);
  process.exit(1);
});
