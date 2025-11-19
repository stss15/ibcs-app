import bcrypt from 'bcryptjs';
import { getDb, id, tx } from './src/instant.js';
import {
  findAdminByUsername,
  findTeacherByUsername,
  listTeachers,
  createTeacherAccount,
  archiveTeacher,
  createClassWithRoster,
  appendStudentsToClass,
  getTeacherDashboardData,
  archiveStudent,
  nextTeacherSequence,
} from './src/repositories.js';
import { json, readJson, withCors } from './src/http.js';
import { createToken, verifyToken } from './src/jwt.js';
import {
  createRequestContext,
  updateRoute,
  logRequestStart,
  logRequestPayload,
  logResponse,
  logError,
  logAuthResult,
  attachSession,
} from './src/logger.js';

const TOKEN_TTL_HOURS = 12;
const AUTH_PREFIX = 'Bearer ';
const VALID_ROLES = new Set(['admin', 'teacher']);
const BCRYPT_ROUNDS = 8;

const DEFAULT_SEED_PASSWORD = 'SGSD2024!';
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_TEACHER_USERNAME = 'MrStewart';
let seedInitializationPromise = null;

async function ensureSeedAccounts(env) {
  if (!seedInitializationPromise) {
    seedInitializationPromise = seedDefaultAccounts(env);
  }
  try {
    return await seedInitializationPromise;
  } catch (error) {
    seedInitializationPromise = null;
    throw error;
  }
}

async function seedDefaultAccounts(env) {
  const db = getDb(env);
  const adminConfig = getSeedConfig(env, 'admin');
  const teacherConfig = getSeedConfig(env, 'teacher');
  await Promise.all([
    seedAdminAccount(db, adminConfig),
    seedTeacherAccount(db, teacherConfig),
  ]);
}

function getSeedConfig(env, role) {
  const uppercaseRole = role.toUpperCase();
  const fallbackUsername = role === 'admin' ? DEFAULT_ADMIN_USERNAME : DEFAULT_TEACHER_USERNAME;
  const username =
    env[`SEED_${uppercaseRole}_USERNAME`] ??
    env[`${uppercaseRole}_USERNAME`] ??
    fallbackUsername;
  const password =
    env[`SEED_${uppercaseRole}_PASSWORD`] ??
    env[`${uppercaseRole}_PASSWORD`] ??
    env.SEED_PASSWORD ??
    DEFAULT_SEED_PASSWORD;
  return { username, password };
}

function prepareSeedUsername(value) {
  if (!value && value !== 0) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function prepareSeedPassword(value) {
  if (value === undefined || value === null) {
    return DEFAULT_SEED_PASSWORD;
  }
  return String(value);
}

function hasPositiveSequenceNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

function nowIso() {
  return new Date().toISOString();
}

async function seedAdminAccount(db, config) {
  const username = prepareSeedUsername(config.username);
  if (!username) return;
  const normalized = username.toLowerCase();
  const admin = await findAdminByUsername(db, username);
  const password = prepareSeedPassword(config.password);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  if (!admin) {
    const adminId = id();
    await db.transact([
      tx.admins[adminId].update({
        username,
        usernameLower: normalized,
        passwordHash,
        createdAt: nowIso(),
      }),
    ]);
    return;
  }
  const updates = {};
  if (!admin.passwordHash) updates.passwordHash = passwordHash;
  if (admin.username !== username) updates.username = username;
  if (admin.usernameLower !== normalized) updates.usernameLower = normalized;
  if (Object.keys(updates).length > 0) {
    await db.transact([tx.admins[admin.id].update(updates)]);
  }
}

async function seedTeacherAccount(db, config) {
  const username = prepareSeedUsername(config.username);
  if (!username) return;
  const normalized = username.toLowerCase();
  const teacher = await findTeacherByUsername(db, username);
  const password = prepareSeedPassword(config.password);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  if (!teacher) {
    const teacherId = id();
    const sequenceNumber = await nextTeacherSequence(db);
    await db.transact([
      tx.teachers[teacherId].update({
        username,
        usernameLower: normalized,
        sequenceNumber,
        passwordHash,
        passwordPlain: password,
        createdAt: nowIso(),
        archivedAt: null,
      }),
    ]);
    return;
  }
  const updates = {};
  if (!teacher.passwordHash) updates.passwordHash = passwordHash;
  if (!teacher.passwordPlain) updates.passwordPlain = password;
  if (!hasPositiveSequenceNumber(teacher.sequenceNumber)) {
    updates.sequenceNumber = await nextTeacherSequence(db);
  }
  if (teacher.username !== username) updates.username = username;
  if (teacher.usernameLower !== normalized) updates.usernameLower = normalized;
  if (Object.keys(updates).length > 0) {
    await db.transact([tx.teachers[teacher.id].update(updates)]);
  }
}

export default {
  async fetch(request, env) {
    const ctx = createRequestContext({ request });
    logRequestStart(ctx);

    if (request.method === 'OPTIONS') {
      updateRoute(ctx, 'cors.options');
      return finalizeWithCors(request, env, ctx, Promise.resolve(new Response(null, { status: 204 })));
    }

    try {
      await ensureSeedAccounts(env);
      const url = new URL(request.url);
      const { pathname } = url;

      if (pathname === '/auth/login' && request.method === 'POST') {
        updateRoute(ctx, 'auth.login');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, handleLogin(request, env, ctx));
      }

      if (pathname === '/auth/verify' && request.method === 'POST') {
        updateRoute(ctx, 'auth.verify');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, handleVerify(request, env, ctx));
      }

      if (pathname === '/admin/dashboard' && request.method === 'GET') {
        updateRoute(ctx, 'admin.dashboard');
        return finalizeWithCors(request, env, ctx, requireRole(request, env, ctx, 'admin', handleAdminDashboard));
      }

      if (pathname === '/admin/teachers' && request.method === 'POST') {
        updateRoute(ctx, 'admin.teachers.create');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, ctx, 'admin', handleAdminCreateTeacher));
      }

      if (pathname.startsWith('/admin/teachers/') && request.method === 'DELETE') {
        const username = decodeURIComponent(pathname.split('/')[3] || '');
        updateRoute(ctx, 'admin.teachers.archive');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, ctx, 'admin', (req, environment, session) =>
            handleAdminDeleteTeacher(req, environment, session, username),
          ),
        );
      }

      if (pathname === '/teacher/dashboard' && request.method === 'GET') {
        updateRoute(ctx, 'teacher.dashboard');
        return finalizeWithCors(request, env, ctx, requireRole(request, env, ctx, 'teacher', handleTeacherDashboard));
      }

      if (pathname === '/teacher/classes' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.classes.create');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, ctx, 'teacher', handleTeacherCreateClass));
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/students') && request.method === 'POST') {
        const classId = decodeURIComponent(pathname.split('/')[3] || '');
        updateRoute(ctx, 'teacher.classes.students.add');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, ctx, 'teacher', (req, environment, session) =>
            handleTeacherAddStudents(req, environment, session, classId),
          ),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.includes('/students/') && request.method === 'DELETE') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        const studentId = decodeURIComponent(segments[5] || '');
        updateRoute(ctx, 'teacher.classes.students.remove');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, ctx, 'teacher', (req, environment, session) =>
            handleTeacherRemoveStudent(req, environment, session, classId, studentId),
          ),
        );
      }

      updateRoute(ctx, 'not_found');
      return finalizeWithCors(request, env, ctx, Promise.resolve(json({ error: 'Not found' }, 404)));
    } catch (error) {
      logError(ctx, error);
      return finalizeWithCors(request, env, ctx, Promise.resolve(json({ error: 'Internal Server Error' }, 500)));
    }
  },
};

async function captureRequestBody(request, ctx) {
  if (!request) return;
  const method = (request.method || '').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return;
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return;
  try {
    const clone = request.clone();
    const body = await clone.json();
    logRequestPayload(ctx, body);
  } catch (error) {
    logError(ctx, error, { reason: 'request.body_parse_failed' });
  }
}

async function finalizeWithCors(request, env, ctx, responsePromise) {
  let response;
  try {
    response = await responsePromise;
  } catch (error) {
    logError(ctx, error);
    response = json({ error: 'Internal Server Error' }, 500);
  }
  if (!(response instanceof Response)) {
    response = json(response ?? { ok: true });
  }
  const logged = await logResponse(ctx, response);
  return withCors(Promise.resolve(logged), request, env);
}

async function handleLogin(request, env, ctx) {
  const { role = 'teacher', username = '', password = '' } = await readJson(request);
  const normalizedRole = String(role).toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedPassword = String(password);

  if (!VALID_ROLES.has(normalizedRole)) {
    logAuthResult(ctx, { status: 'failure', reason: 'invalid_role', role: normalizedRole, username: normalizedUsername });
    return json({ error: 'Role must be admin or teacher.' }, 400);
  }
  if (!normalizedUsername || !normalizedPassword) {
    logAuthResult(ctx, { status: 'failure', reason: 'missing_credentials', role: normalizedRole, username: normalizedUsername });
    return json({ error: 'Username and password are required.' }, 400);
  }

  const db = getDb(env);
  const account = normalizedRole === 'admin'
    ? await findAdminByUsername(db, normalizedUsername)
    : await findTeacherByUsername(db, normalizedUsername);

  if (!account || account.archivedAt) {
    logAuthResult(ctx, { status: 'failure', reason: 'account_missing', role: normalizedRole, username: normalizedUsername });
    return json({ error: 'Invalid credentials' }, 401);
  }

  const matches = await verifyOrRehashPassword(db, normalizedRole, account, normalizedPassword);
  if (!matches) {
    logAuthResult(ctx, { status: 'failure', reason: 'password_mismatch', role: normalizedRole, username: normalizedUsername });
    return json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(
    { sub: account.id, username: account.username?.toLowerCase() ?? normalizedUsername.toLowerCase(), role: normalizedRole },
    env.TOKEN_SECRET,
    TOKEN_TTL_HOURS,
  );
  logAuthResult(ctx, { status: 'success', role: normalizedRole, username: account.username });
  return json({ token, user: formatSessionUser(normalizedRole, account) });
}

async function verifyOrRehashPassword(db, role, account, password) {
  const passwordHash = account.passwordHash || null;
  if (passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
  if (!account.passwordPlain) {
    return false;
  }
  if (account.passwordPlain !== password) {
    return false;
  }
  const newHash = await bcrypt.hash(account.passwordPlain, BCRYPT_ROUNDS);
  const collection = role === 'admin' ? tx.admins : tx.teachers;
  await db.transact([collection[account.id].update({ passwordHash: newHash })]);
  account.passwordHash = newHash;
  return true;
}

async function handleVerify(request, env, ctx) {
  const { token } = await readJson(request);
  if (!token) {
    logAuthResult(ctx, { status: 'failure', reason: 'token_missing' });
    return json({ valid: false, error: 'Token missing' }, 400);
  }
  try {
    const session = await verifyToken(token, env.TOKEN_SECRET);
    attachSession(ctx, session);
    if (!VALID_ROLES.has(session.role)) {
      return json({ valid: false }, 401);
    }
    const db = getDb(env);
    const account = session.role === 'admin'
      ? await findAdminByUsername(db, session.username)
      : await findTeacherByUsername(db, session.username);
    if (!account || account.archivedAt) {
      logAuthResult(ctx, { status: 'failure', reason: 'account_missing', role: session.role, username: session.username });
      return json({ valid: false }, 401);
    }
    return json({ valid: true, user: formatSessionUser(session.role, account) });
  } catch (error) {
    logAuthResult(ctx, { status: 'failure', reason: 'token_invalid' });
    return json({ valid: false }, 401);
  }
}

async function handleAdminDashboard(_request, env) {
  const db = getDb(env);
  const teachers = await listTeachers(db, { includeArchived: true });
  return json({ teachers });
}

async function handleAdminCreateTeacher(request, env) {
  const db = getDb(env);
  const payload = await readJson(request);
  const requestedCount = Number(payload?.count ?? 1);
  const count = Number.isFinite(requestedCount) ? Math.max(1, Math.min(10, Math.floor(requestedCount))) : 1;
  const created = [];
  for (let i = 0; i < count; i += 1) {
    created.push(await createTeacherAccount(db));
  }
  return json({ created });
}

async function handleAdminDeleteTeacher(_request, env, _session, username) {
  if (!username) {
    return json({ error: 'Teacher username required' }, 400);
  }
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, username);
  if (!teacher) {
    return json({ error: 'Teacher not found' }, 404);
  }
  await archiveTeacher(db, teacher.id);
  return json({ success: true });
}

async function handleTeacherDashboard(_request, env, session) {
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }
  const data = await getTeacherDashboardData(db, teacher);
  return json({ teacher: formatSessionUser('teacher', teacher), classes: data.classes });
}

async function handleTeacherCreateClass(request, env, session) {
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher) {
    return json({ error: 'Teacher not found' }, 404);
  }
  const payload = await readJson(request);
  const yearLevel = payload?.yearLevel || 'Year 7';
  const classNumber = payload?.classNumber || '1';
  const studentCount = Number(payload?.studentCount ?? 0);
  const created = await createClassWithRoster(db, teacher, { yearLevel, classNumber, studentCount });
  return json(created, 201);
}

async function handleTeacherAddStudents(request, env, session, classId) {
  if (!classId) {
    return json({ error: 'Class ID required' }, 400);
  }
  const db = getDb(env);
  const payload = await readJson(request);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher) {
    return json({ error: 'Teacher not found' }, 404);
  }
  const count = Number(payload?.count ?? 1);
  const result = await appendStudentsToClass(db, teacher, { classId, count });
  return json(result);
}

async function handleTeacherRemoveStudent(_request, env, session, classId, studentId) {
  if (!classId || !studentId) {
    return json({ error: 'Class ID and student ID required' }, 400);
  }
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher) {
    return json({ error: 'Teacher not found' }, 404);
  }
  await archiveStudent(db, teacher, studentId);
  return json({ success: true, studentId, classId });
}

async function requireRole(request, env, ctx, allowedRole, handler) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith(AUTH_PREFIX)) {
    logAuthResult(ctx, { status: 'failure', reason: 'missing_authorization', requiredRole: allowedRole });
    return json({ error: 'Missing authorization' }, 401);
  }
  try {
    const session = await verifyToken(authHeader.slice(AUTH_PREFIX.length), env.TOKEN_SECRET);
    attachSession(ctx, session);
    if (session.role !== allowedRole) {
      logAuthResult(ctx, { status: 'failure', reason: 'role_mismatch', role: session.role, requiredRole: allowedRole });
      return json({ error: `${allowedRole} role required` }, 403);
    }
    logAuthResult(ctx, { status: 'success', reason: 'authorized', role: session.role, username: session.username });
    return handler(request, env, session, ctx);
  } catch (error) {
    logAuthResult(ctx, { status: 'failure', reason: 'invalid_or_expired_token' });
    return json({ error: 'Invalid or expired token' }, 401);
  }
}

function formatSessionUser(role, doc) {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id ?? null,
    username: doc.username ?? null,
    role,
    displayName: doc.username ?? role,
    archivedAt: doc.archivedAt ?? null,
  };
}
