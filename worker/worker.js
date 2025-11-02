import bcrypt from 'bcryptjs';
import { getDb } from './src/instant.js';
import {
  findTeacherByUsername,
  findStudentByUsername,
  createTeacher as createTeacherRecord,
  createClass as createClassRecord,
  createStudent as createStudentRecord,
  getTeacherDashboardData,
  getStudentDashboardData,
} from './src/repositories.js';
import { json, readJson, withCors } from './src/http.js';
import { createToken, verifyToken } from './src/jwt.js';

const BCRYPT_ROUNDS = 8;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return withCors(Promise.resolve(new Response(null, { status: 204 })), request, env);
    }

    try {
      const url = new URL(request.url);
      const { pathname } = url;

      if (pathname === '/auth/login' && request.method === 'POST') {
        return withCors(handleLogin(request, env), request, env);
      }

      if (pathname === '/auth/verify' && request.method === 'POST') {
        return withCors(handleVerify(request, env), request, env);
      }

      if (pathname === '/teacher/dashboard' && request.method === 'GET') {
        return requireRole(request, env, 'teacher', handleTeacherDashboard);
      }

      if (pathname === '/teacher/classes' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleCreateClass);
      }

      if (pathname === '/teacher/students' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleCreateStudent);
      }

      if (pathname === '/student/dashboard' && request.method === 'GET') {
        return requireRole(request, env, 'student', handleStudentDashboard);
      }

      if (pathname === '/setup/seed' && request.method === 'POST') {
        return withCors(handleSeed(request, env), request, env);
      }

      return withCors(Promise.resolve(json({ error: 'Not found' }, 404)), request, env);
    } catch (error) {
      console.error('Worker error', error);
      return withCors(Promise.resolve(json({ error: 'Internal Server Error' }, 500)), request, env);
    }
  },
};

/* --------------------------- Route Handlers ---------------------------- */

async function handleLogin(request, env) {
  const { role = 'teacher', username = '', password = '' } = await readJson(request);
  const normalizedRole = String(role).toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedPassword = String(password);

  if (!normalizedUsername || !normalizedPassword) {
    return json({ error: 'Username and password are required.' }, 400);
  }
  if (!['teacher', 'student'].includes(normalizedRole)) {
    return json({ error: "Role must be 'teacher' or 'student'." }, 400);
  }

  const db = getDb(env);
  const userDoc =
    normalizedRole === 'teacher'
      ? await findTeacherByUsername(db, normalizedUsername)
      : await findStudentByUsername(db, normalizedUsername);

  if (!userDoc?.password) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, userDoc.password);
  if (!passwordMatches) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(
    {
      sub: userDoc.id,
      username: normalizedUsername,
      role: normalizedRole,
    },
    env.TOKEN_SECRET,
  );

  return json({
    token,
    user: formatSessionUser(normalizedRole, userDoc),
  });
}

async function handleVerify(request, env) {
  const { token } = await readJson(request);
  if (!token) {
    return json({ valid: false, error: 'Token missing' }, 400);
  }

  try {
    const payload = await verifyToken(token, env.TOKEN_SECRET);
    const db = getDb(env);
    const doc =
      payload.role === 'teacher'
        ? await findTeacherByUsername(db, payload.username)
        : await findStudentByUsername(db, payload.username);

    if (!doc) {
      return json({ valid: false }, 401);
    }

    return json({
      valid: true,
      user: formatSessionUser(payload.role, doc),
    });
  } catch (error) {
    return json({ valid: false, error: error.message }, 401);
  }
}

async function handleTeacherDashboard(request, env, session) {
  const db = getDb(env);
  const { classes, students } = await getTeacherDashboardData(db, session.username);

  return withCors(
    Promise.resolve(
      json({
        classes: classes.map(stripPassword),
        students: students.map(stripPassword),
      }),
    ),
    request,
    env,
  );
}

async function handleCreateClass(request, env, session) {
  const body = await readJson(request);
  const className = String(body.className || '').trim();
  const description = String(body.description || '').trim();

  if (!className) {
    return json({ error: 'className is required.' }, 400);
  }

  const db = getDb(env);
  const created = await createClassRecord(db, {
    className,
    description: description || null,
    teacherUsername: session.username,
  });

  return withCors(Promise.resolve(json(created, 201)), request, env);
}

async function handleCreateStudent(request, env, session) {
  const body = await readJson(request);
  const classId = String(body.classId || '').trim();
  const studentName = String(body.studentName || '').trim();
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!classId || !studentName || !password) {
    return json({ error: 'classId, studentName, and password are required.' }, 400);
  }

  const db = getDb(env);
  const { classes } = await getTeacherDashboardData(db, session.username);
  const ownsClass = classes.some((item) => item.teacherUsername === session.username && item.id === classId);
  if (!ownsClass) {
    return json({ error: 'Not authorised for this class.' }, 403);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await createStudentRecord(db, {
    name: studentName,
    username: username || null,
    password: passwordHash,
    classId,
    teacherUsername: session.username,
  });

  return withCors(Promise.resolve(json(stripPassword(created), 201)), request, env);
}

async function handleStudentDashboard(request, env, session) {
  const db = getDb(env);
  const data = await getStudentDashboardData(db, session.username);

  if (!data.student) {
    return withCors(Promise.resolve(json({ error: 'Student record not found' }, 404)), request, env);
  }

  return withCors(
    Promise.resolve(
      json({
        student: stripPassword(data.student),
        class: data.class,
      }),
    ),
    request,
    env,
  );
}

async function handleSeed(request, env) {
  if (!env.SEED_KEY) {
    return json({ error: 'Seed key not configured' }, 403);
  }

  const headerKey = request.headers.get('x-seed-key');
  if (!headerKey || headerKey !== env.SEED_KEY) {
    return json({ error: 'Forbidden' }, 403);
  }

  const { teacher } = await readJson(request);
  if (!teacher?.username || !teacher?.password) {
    return json({ error: 'teacher.username and teacher.password required' }, 400);
  }

  const db = getDb(env);
  const existing = await findTeacherByUsername(db, teacher.username);
  if (existing) {
    return json({ ok: true, seeded: false, reason: 'teacher exists' });
  }

  const hash = await bcrypt.hash(String(teacher.password), BCRYPT_ROUNDS);
  const created = await createTeacherRecord(db, {
    username: teacher.username,
    password: hash,
    displayName: teacher.displayName || teacher.username,
  });

  return json({ ok: true, seeded: true, teacher: created }, 201);
}

/* ------------------------------ Middleware ----------------------------- */

async function requireRole(request, env, role, handler) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return withCors(Promise.resolve(json({ error: 'Missing authorization' }, 401)), request, env);
  }

  try {
    const session = await verifyToken(authHeader.slice(7), env.TOKEN_SECRET);
    if (session.role !== role) {
      return withCors(Promise.resolve(json({ error: `${role} role required` }, 403)), request, env);
    }

    return handler(request, env, session);
  } catch (error) {
    return withCors(Promise.resolve(json({ error: 'Invalid or expired token' }, 401)), request, env);
  }
}

/* ------------------------------- Helpers ------------------------------- */

function formatSessionUser(role, doc) {
  const safeDoc = stripPassword(doc);
  if (role === 'teacher') {
    return {
      username: safeDoc.username,
      role,
      displayName: safeDoc.displayName ?? safeDoc.username,
    };
  }

  return {
    username: safeDoc.username ?? safeDoc.name,
    role,
    displayName: safeDoc.name ?? safeDoc.username,
    classId: safeDoc.classId ?? null,
  };
}

function stripPassword(entity) {
  if (!entity || typeof entity !== 'object') return entity;
  const { password, ...rest } = entity;
  return rest;
}
