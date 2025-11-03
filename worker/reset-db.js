#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, tx } from './src/instant.js';

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

async function purgeCollection(db, collection) {
  const query = await db.query({
    [collection]: {
      $: {},
    },
  });
  const records = query?.[collection] ?? [];
  if (records.length === 0) {
    console.log(`No records found in ${collection}, skipping.`);
    return;
  }

  console.log(`Deleting ${records.length} record(s) from ${collection}...`);
  const mutations = [];
  for (const record of records) {
    const recordId = record?.id ?? record?._id;
    if (!recordId) continue;
    if (!tx[collection]) {
      console.warn(`Unknown collection in tx: ${collection}, skipping`);
      continue;
    }
    mutations.push(tx[collection][recordId].delete());
  }

  const chunkSize = 64;
  for (let i = 0; i < mutations.length; i += chunkSize) {
    const chunk = mutations.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      await db.transact(chunk);
    }
  }
}

async function main() {
  console.log('============================================');
  console.log('  Reset InstantDB Collections');
  console.log('============================================\n');

  const env = await loadInstantConfig();
  const db = getDb(env);

  const collections = [
    'studentProgress',
    'studentUnlocks',
    'classUnlocks',
    'students',
    'classes',
    'teachers',
    'admins',
  ];

  for (const collection of collections) {
    await purgeCollection(db, collection);
  }

  console.log('\n✅ Database reset complete.');
}

main().catch((error) => {
  console.error('\n❌ Failed to reset database:', error);
  process.exit(1);
});
