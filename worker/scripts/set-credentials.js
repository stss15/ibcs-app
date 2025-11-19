#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { init, id, tx } from '@instantdb/admin';

const BCRYPT_ROUNDS = 8;

function extractDocId(doc) {
  return doc?.id ?? doc?._id ?? null;
}

function prepareUsername(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

async function main() {
  const {
    INSTANT_APP_ID: appId,
    INSTANT_ADMIN_TOKEN: adminToken,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    TEACHER_USERNAME,
    TEACHER_PASSWORD,
    SEED_ADMIN_USERNAME,
    SEED_ADMIN_PASSWORD,
    SEED_TEACHER_USERNAME,
    SEED_TEACHER_PASSWORD,
  } = process.env;

  if (!appId || !adminToken) {
    throw new Error('Missing INSTANT_APP_ID or INSTANT_ADMIN_TOKEN in the environment.');
  }

  const db = init({ appId, adminToken });
  const operations = [];
  const adminUsername = SEED_ADMIN_USERNAME ?? ADMIN_USERNAME;
  const adminPassword = SEED_ADMIN_PASSWORD ?? ADMIN_PASSWORD;
  const teacherUsername = SEED_TEACHER_USERNAME ?? TEACHER_USERNAME;
  const teacherPassword = SEED_TEACHER_PASSWORD ?? TEACHER_PASSWORD;

  if (adminUsername && adminPassword) {
    operations.push(() => upsertAdmin(db, adminUsername, adminPassword));
  }
  if (teacherUsername && teacherPassword) {
    operations.push(() => upsertTeacher(db, teacherUsername, teacherPassword));
  }

  if (operations.length === 0) {
    console.log('No credentials provided. Set ADMIN_USERNAME/ADMIN_PASSWORD and/or TEACHER_USERNAME/TEACHER_PASSWORD and rerun.');
    return;
  }

  for (const operation of operations) {
    await operation();
  }
}

async function upsertAdmin(db, username, password) {
  const prepared = prepareUsername(username);
  if (!prepared) throw new Error('ADMIN_USERNAME must not be empty.');
  const normalized = prepared.toLowerCase();
  const result = await db.query({
    admins: { $: { where: { usernameLower: normalized }, limit: 1 } },
  });
  const existing = result?.admins?.[0];
  const adminId = extractDocId(existing) ?? id();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const payload = {
    username: prepared,
    usernameLower: normalized,
    passwordHash,
  };
  if (!existing?.createdAt) {
    payload.createdAt = new Date().toISOString();
  }
  await db.transact([tx.admins[adminId].update(payload)]);
  console.log(`${existing ? 'Updated' : 'Created'} admin account '${prepared}'`);
}

async function upsertTeacher(db, username, password) {
  const prepared = prepareUsername(username);
  if (!prepared) throw new Error('TEACHER_USERNAME must not be empty.');
  const normalized = prepared.toLowerCase();
  const result = await db.query({
    teachers: { $: { where: { usernameLower: normalized }, limit: 1 } },
  });
  const existing = result?.teachers?.[0];
  const teacherId = extractDocId(existing) ?? id();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const sequenceNumber = await determineSequence(db, existing?.sequenceNumber);
  const payload = {
    username: prepared,
    usernameLower: normalized,
    sequenceNumber,
    passwordHash,
    passwordPlain: password,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    archivedAt: existing?.archivedAt ?? null,
  };
  await db.transact([tx.teachers[teacherId].update(payload)]);
  console.log(`${existing ? 'Updated' : 'Created'} teacher account '${prepared}' (sequence ${sequenceNumber})`);
}

async function determineSequence(db, current) {
  const existing = Number(current);
  if (Number.isFinite(existing) && existing > 0) return existing;
  const snapshot = await db.query({ teachers: { $: { where: {} } } });
  const used = new Set(
    (snapshot?.teachers ?? [])
      .map((doc) => Number(doc.sequenceNumber))
      .filter((n) => Number.isFinite(n) && n > 0),
  );
  let candidate = 1;
  while (used.has(candidate)) candidate += 1;
  return candidate;
}

main().catch((error) => {
  console.error('Failed to set credentials:', error);
  process.exit(1);
});
