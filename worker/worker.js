import bcrypt from 'bcryptjs';
import { getDb } from './src/instant.js';
import {
  findAdminByUsername,
  findTeacherByUsername,
  findStudentByUsername,
  createTeacher as createTeacherRecord,
  createClass as createClassRecord,
  createStudent as createStudentRecord,
  bulkCreateStudents,
  bulkUpdateStudentPasswords,
  createClassUnlock,
  createStudentUnlock,
  getTeacherDashboardData,
  getStudentDashboardData,
  getStudentDashboardDataById,
  listTeachers,
  archiveTeacher,
  archiveClass,
  archiveStudent,
  setStudentActiveStage,
  findClassById,
  listStudentsByClass,
  getClassPacing,
  setClassPacing,
  findClassPacingBySessionCode,
  getStudentGamification,
  syncStudentGamification,
  listLiveAssessmentStatus,
  upsertLiveAssessmentStatus,
} from './src/repositories.js';
import { json, readJson, withCors } from './src/http.js';
import { createToken, verifyToken } from './src/jwt.js';
import {
  YEAR7_LESSON_SEQUENCE,
  getYear7LessonById,
  getYear7LessonIndex,
  getYear7NextLesson,
  getYear7DefaultPointer,
  deriveAccessibleSlides,
  getDeckSummary,
  getLiveDeckById,
} from '../shared/liveDecks.js';
import { generatePassword } from '../shared/passwords.js';
import {
  createRequestContext,
  updateRoute,
  logRequestStart,
  logRequestPayload,
  logResponse,
  logError,
  attachSession,
  logAuthResult,
  logEvent,
  logDbOperation,
} from './src/logger.js';

const BCRYPT_ROUNDS = 8;
const CSV_HEADER = [
  'Student name',
  'Username',
  'Year group',
  'Curriculum track',
  'Active stage',
  'Completed lessons',
  'In-progress lessons',
  'Formative attempts',
  'Latest summative score',
];

const SESSION_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SESSION_CODE_LENGTH = 5;

function randomSessionCode() {
  let code = '';
  for (let index = 0; index < SESSION_CODE_LENGTH; index += 1) {
    const charIndex = Math.floor(Math.random() * SESSION_CODE_ALPHABET.length);
    code += SESSION_CODE_ALPHABET[charIndex];
  }
  return code;
}

async function generateUniqueSessionCode(db) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomSessionCode();
    const record = await findClassPacingBySessionCode(db, code);
    if (!record) {
      return code;
    }
  }
  const fallback = Date.now().toString(36).toUpperCase();
  return fallback.slice(-SESSION_CODE_LENGTH).padStart(SESSION_CODE_LENGTH, '0');
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
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'admin', handleAdminDashboard, ctx));
      }

      if (pathname === '/admin/teachers' && request.method === 'POST') {
        updateRoute(ctx, 'admin.teachers.create');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'admin', handleAdminCreateTeacher, ctx));
      }

      if (pathname.startsWith('/admin/teachers/') && request.method === 'DELETE') {
        const username = decodeURIComponent(pathname.split('/')[3] || '');
        updateRoute(ctx, 'admin.teachers.delete');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'admin', handleAdminDeleteTeacher, ctx, username),
        );
      }

      if (pathname === '/teacher/dashboard' && request.method === 'GET') {
        updateRoute(ctx, 'teacher.dashboard');
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleTeacherDashboard, ctx));
      }

      if (pathname === '/teacher/classes' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.classes.create');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleCreateClass, ctx));
      }

      if (pathname === '/teacher/students' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.students.create');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleCreateStudent, ctx));
      }

      if (pathname === '/teacher/students/bulk' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.students.bulk');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'teacher', handleBulkCreateStudentsHandler, ctx),
        );
      }

      if (pathname === '/teacher/classes/unlocks' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.classes.unlock');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleClassUnlock, ctx));
      }

      if (pathname === '/teacher/students/unlocks' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.students.unlock');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleStudentUnlock, ctx));
      }

      if (pathname === '/teacher/students/archive' && request.method === 'POST') {
        updateRoute(ctx, 'teacher.students.archive');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'teacher', handleArchiveStudent, ctx));
      }

      if (pathname.startsWith('/teacher/students/') && pathname.endsWith('/dashboard') && request.method === 'GET') {
        const segments = pathname.split('/');
        const studentId = decodeURIComponent(segments[3] || '');
        updateRoute(ctx, 'teacher.students.dashboard');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'teacher', handleTeacherStudentDashboard, ctx, studentId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/pacing')) {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        if (request.method === 'GET') {
          updateRoute(ctx, 'teacher.classes.pacing.get');
          return finalizeWithCors(
            request,
            env,
            ctx,
            requireRole(request, env, 'teacher', handleGetClassPacing, ctx, classId),
          );
        }
        if (request.method === 'POST') {
          updateRoute(ctx, 'teacher.classes.pacing.update');
          await captureRequestBody(request, ctx);
          return finalizeWithCors(
            request,
            env,
            ctx,
            requireRole(request, env, 'teacher', handleUpdateClassPacing, ctx, classId),
          );
        }
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/export') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        updateRoute(ctx, 'teacher.classes.export');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'teacher', handleClassExport, ctx, classId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/credentials') && request.method === 'POST') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        updateRoute(ctx, 'teacher.classes.credentials');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'teacher', handleGenerateClassCredentials, ctx, classId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/live-assessment-status') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        updateRoute(ctx, 'teacher.classes.liveAssessment');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'teacher', handleTeacherLiveAssessmentStatus, ctx, classId),
        );
      }

      if (pathname === '/student/dashboard' && request.method === 'GET') {
        updateRoute(ctx, 'student.dashboard');
        return finalizeWithCors(request, env, ctx, requireRole(request, env, 'student', handleStudentDashboard, ctx));
      }

      if (pathname.startsWith('/student/classes/') && pathname.endsWith('/pacing') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        updateRoute(ctx, 'student.classes.pacing');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'student', handleStudentClassPacing, ctx, classId),
        );
      }

      if (pathname === '/student/gamification' && request.method === 'GET') {
        updateRoute(ctx, 'student.gamification.get');
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'student', handleGetStudentGamification, ctx),
        );
      }

      if (pathname === '/student/gamification' && request.method === 'POST') {
        updateRoute(ctx, 'student.gamification.sync');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'student', handleSyncStudentGamification, ctx),
        );
      }

      if (pathname === '/student/live-assessment-status' && request.method === 'POST') {
        updateRoute(ctx, 'student.liveAssessment.upsert');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'student', handleStudentLiveAssessmentStatus, ctx),
        );
      }

      if (pathname === '/student/live-sessions/join' && request.method === 'POST') {
        updateRoute(ctx, 'student.liveSessions.join');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(
          request,
          env,
          ctx,
          requireRole(request, env, 'student', handleStudentJoinLiveSession, ctx),
        );
      }

      if (pathname === '/setup/seed' && request.method === 'POST') {
        updateRoute(ctx, 'setup.seed');
        await captureRequestBody(request, ctx);
        return finalizeWithCors(request, env, ctx, handleSeed(request, env, ctx));
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
  if (method === 'GET' || method === 'HEAD') {
    return;
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return;
  }

  try {
    const clone = request.clone();
    const body = await clone.json();
    logRequestPayload(ctx, body);
  } catch (error) {
    logEvent(ctx, 'request.body_parse_failed', { error: error?.message || String(error) }, 'warn');
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

/* --------------------------- Route Handlers ---------------------------- */

async function handleLogin(request, env, ctx) {
  const { role = 'teacher', username = '', password = '' } = await readJson(request);
  const normalizedRole = String(role).toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedUsernameLower = normalizedUsername.toLowerCase();
  const normalizedPassword = String(password);

  logEvent(ctx, 'auth.login.attempt', {
    role: normalizedRole,
    username: normalizedUsername,
  });

  if (!normalizedUsername || !normalizedPassword) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'missing_credentials',
      role: normalizedRole,
      username: normalizedUsername,
    });
    return json({ error: 'Username and password are required.' }, 400);
  }
  if (!['admin', 'teacher', 'student'].includes(normalizedRole)) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'invalid_role',
      role: normalizedRole,
      username: normalizedUsername,
    });
    return json({ error: "Role must be 'admin', 'teacher', or 'student'." }, 400);
  }

  const db = getDb(env);
  let userDoc = null;

  if (normalizedRole === 'admin') {
    userDoc = await findAdminByUsername(db, normalizedUsername);
  } else if (normalizedRole === 'teacher') {
    userDoc = await findTeacherByUsername(db, normalizedUsername);
  } else {
    userDoc = await findStudentByUsername(db, normalizedUsername);
  }

  if (!userDoc?.password) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'user_not_found',
      role: normalizedRole,
      username: normalizedUsername,
    });
    return json({ error: 'Invalid credentials' }, 401);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, userDoc.password);
  if (!passwordMatches) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'password_mismatch',
      role: normalizedRole,
      username: normalizedUsername,
    });
    return json({ error: 'Invalid credentials' }, 401);
  }

  if (userDoc.archivedAt) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'archived',
      role: normalizedRole,
      username: normalizedUsername,
    });
    return json({ error: 'Account archived' }, 403);
  }

  const canonicalUsername = userDoc.username ?? normalizedUsername;
  const tokenUsername = (canonicalUsername || normalizedUsernameLower).toLowerCase();
  const token = await createToken(
    {
      sub: userDoc.id,
      username: tokenUsername,
      role: normalizedRole,
    },
    env.TOKEN_SECRET,
  );

  logAuthResult(ctx, {
    status: 'success',
    role: normalizedRole,
    username: tokenUsername,
    userId: userDoc.id ?? null,
  });

  return json({
    token,
    user: formatSessionUser(normalizedRole, userDoc),
  });
}

async function handleVerify(request, env, ctx) {
  const { token } = await readJson(request);
  if (!token) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'token_missing',
    });
    return json({ valid: false, error: 'Token missing' }, 400);
  }

  try {
    const payload = await verifyToken(token, env.TOKEN_SECRET);
    const db = getDb(env);
    let doc = null;

    if (payload.role === 'admin') {
      doc = await findAdminByUsername(db, payload.username);
    } else if (payload.role === 'teacher') {
      doc = await findTeacherByUsername(db, payload.username);
    } else {
      doc = await findStudentByUsername(db, payload.username);
    }

    if (!doc || doc.archivedAt) {
      logAuthResult(ctx, {
        status: 'failure',
        reason: 'user_not_found',
        role: payload.role,
        username: payload.username,
      });
      return json({ valid: false }, 401);
    }

    logAuthResult(ctx, {
      status: 'success',
      role: payload.role,
      username: payload.username,
      userId: doc.id ?? null,
    });

    return json({
      valid: true,
      user: formatSessionUser(payload.role, doc),
    });
  } catch (error) {
    console.warn('Token verification failed', error);
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'token_verification_failed',
    });
    return json({ valid: false }, 401);
  }
}

async function handleAdminDashboard(_request, env, session, ctx) {
  const db = getDb(env);
  const adminDoc = await findAdminByUsername(db, session.username);
  if (!adminDoc) {
    return json({ error: 'Admin not found' }, 404);
  }

  const teachers = await listTeachers(db, { includeArchived: true });
  const teacherSummaries = teachers.map((teacher) => {
    const safe = stripPassword(teacher);
    return {
      id: safe.id,
      username: safe.username,
      displayName: safe.displayName ?? safe.username,
      firstName: safe.firstName ?? null,
      lastName: safe.lastName ?? null,
      createdAt: safe.createdAt ?? null,
      archivedAt: safe.archivedAt ?? null,
    };
  });

  logEvent(ctx, 'admin.dashboard.loaded', {
    admin: session.username,
    teacherCount: teacherSummaries.length,
  });

  return json({
    admin: formatSessionUser('admin', adminDoc),
    teachers: teacherSummaries,
  });
}

async function handleAdminCreateTeacher(request, env, _session, ctx) {
  const body = await readJson(request);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const displayName = String(body.displayName || '').trim() || [firstName, lastName].filter(Boolean).join(' ') || username;

  if (!username || !password || !firstName || !lastName) {
    return json({ error: 'username, password, firstName, and lastName are required.' }, 400);
  }

  const db = getDb(env);
  const existing = await findTeacherByUsername(db, username);
  if (existing) {
    logEvent(ctx, 'admin.teacher.create_conflict', { username });
    return json({ error: 'Teacher already exists.' }, 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await createTeacherRecord(db, {
    username,
    password: passwordHash,
    firstName,
    lastName,
    displayName,
  });

  logDbOperation(ctx, {
    action: 'createTeacher',
    username,
    teacherId: created.id,
  });

  return json({ teacher: stripPassword(created) }, 201);
}

async function handleAdminDeleteTeacher(_request, env, session, ctx, username) {
  if (!username) {
    return json({ error: 'Teacher username required' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, username);
  if (!teacher) {
    logEvent(ctx, 'admin.teacher.delete_missing', { username, requestedBy: session?.username });
    return json({ error: 'Teacher not found' }, 404);
  }

  const summary = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });

  const archivedAt = await archiveTeacher(db, teacher.id);
  logDbOperation(ctx, {
    action: 'archiveTeacher',
    teacherId: teacher.id,
    username: teacher.username,
    requestedBy: session?.username ?? null,
  });
  let classesArchived = 0;
  for (const clazz of summary.classes) {
    if (!clazz.archivedAt) {
      await archiveClass(db, clazz.id);
      classesArchived += 1;
    }
  }

  let studentsArchived = 0;
  for (const student of summary.students) {
    if (student.status !== 'archived') {
      await archiveStudent(db, student.id);
      studentsArchived += 1;
    }
  }

  logEvent(ctx, 'admin.teacher.delete_complete', {
    username: teacher.username,
    classesArchived,
    studentsArchived,
  });

  return json({
    ok: true,
    archivedAt,
    classesArchived,
    studentsArchived,
  });
}

async function handleTeacherDashboard(_request, env, session, ctx) {
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const data = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });
  const safeStudents = data.students.map(stripPassword);

  const lessonSummary = summarizeLessons(data.progress);

  logEvent(ctx, 'teacher.dashboard.loaded', {
    teacherId: teacher.id,
    classes: data.classes.length,
    students: safeStudents.length,
  });

  return json({
    teacher: formatSessionUser('teacher', teacher),
    classes: data.classes.filter((clazz) => !clazz.archivedAt),
    students: safeStudents.filter((student) => student.status !== 'archived'),
    archivedStudents: safeStudents.filter((student) => student.status === 'archived'),
    classUnlocks: data.classUnlocks,
    studentUnlocks: data.studentUnlocks,
    progress: data.progress,
    lessonSummary,
    classPacing: data.classPacing,
  });
}

function buildPacingMetadata(pacing) {
  if (!pacing || !(pacing.lessonId || pacing.slideId)) {
    return { lesson: null, sequenceIndex: null, accessibleSlides: [], deck: null };
  }

  const lessonId = pacing.lessonId ?? pacing.slideId;
  const deckId = pacing.deckId ?? pacing.unitId ?? null;
  const lesson = getYear7LessonById(lessonId);
  const sequenceIndex = lesson ? getYear7LessonIndex(lesson.id) : null;
  const deck = deckId ? getDeckSummary(deckId) : null;
  const accessibleSlides = deckId ? deriveAccessibleSlides(deckId, lessonId, pacing.history) : [];

  return {
    lesson: lesson ?? null,
    sequenceIndex,
    deck,
    accessibleSlides,
  };
}

async function handleGetClassPacing(_request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class id is required' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc || classDoc.teacherId !== teacher.id) {
    return json({ error: 'Class not found' }, 404);
  }

  const pacing = await getClassPacing(db, classId);
  const metadata = buildPacingMetadata(pacing);

  logEvent(ctx, 'pacing.teacher.fetch', {
    classId,
    teacherId: teacher.id,
    pacing,
  });

  return json({
    class: classDoc,
    pacing,
    ...metadata,
  });
}

async function handleUpdateClassPacing(request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class id is required' }, 400);
  }

  const body = await readJson(request);
  const command = String(body.command || '').toLowerCase();
  const requestedLessonId = body.lessonId ? String(body.lessonId).trim() : '';
  const requestedUnitId = body.unitId ? String(body.unitId).trim() : '';
  const requestedTrack = body.track ? String(body.track).trim() : '';
  const resume = body.resume !== false;
  const resetHistory = Boolean(body.resetHistory);
  const explicitHistory = Array.isArray(body.history) ? body.history.map((entry) => String(entry).trim()) : null;

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc || classDoc.teacherId !== teacher.id) {
    return json({ error: 'Class not found' }, 404);
  }

  logEvent(ctx, 'pacing.teacher.update_request', {
    classId,
    teacherId: teacher.id,
    command,
    requestedLessonId: requestedLessonId || null,
    requestedUnitId: requestedUnitId || null,
    requestedTrack: requestedTrack || null,
  });

  const currentPacing = await getClassPacing(db, classId);

  const inferTrack = () => {
    if (requestedTrack) return requestedTrack;
    if (currentPacing?.track) return currentPacing.track;
    const label = String(classDoc?.yearGroup || '').toLowerCase();
    if (label.includes('year 7') || label.includes('ks3')) return 'ks3';
    if (label.includes('igcse')) return 'igcse';
    if (label.includes('ib') || label.includes('dp')) return 'ib';
    return null;
  };

  const defaultPointer = getYear7DefaultPointer();
  const fallbackDeckId =
    requestedUnitId ||
    currentPacing?.deckId ||
    currentPacing?.unitId ||
    defaultPointer?.unitId ||
    YEAR7_LESSON_SEQUENCE[0]?.deckId ||
    YEAR7_LESSON_SEQUENCE[0]?.unitId ||
    null;

  const ensureDeckId = (candidateId) => {
    const deckId = candidateId || fallbackDeckId;
    if (!deckId || !getLiveDeckById(deckId)) {
      return null;
    }
    return deckId;
  };

  const baseHistory = Array.isArray(currentPacing?.history) ? currentPacing.history : [];

  const dedupeHistory = (list) => {
    const seen = new Set();
    const result = [];
    for (const entry of list) {
      const value = String(entry || '').trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      result.push(value);
    }
    return result;
  };

  const buildHistory = (slideId, { reset = false, overrides = null } = {}) => {
    if (Array.isArray(overrides) && overrides.length > 0) {
      const merged = overrides.slice();
      if (slideId && !merged.includes(slideId)) {
        merged.push(slideId);
      }
      return dedupeHistory(merged);
    }
    const base = reset ? [] : baseHistory.slice();
    if (slideId && !base.includes(slideId)) {
      base.push(slideId);
    }
    return dedupeHistory(base);
  };

  const track = inferTrack() || 'ks3';

  const persist = async ({ deckId, slideId, history, sessionCode, sessionStatus, sessionStartedAt, logCommand }) => {
    const resolvedDeckId = ensureDeckId(deckId);
    if (!resolvedDeckId) {
      return json({ error: 'Live deck is not configured.' }, 500);
    }

    const resolvedHistory = history.length > 0 ? history : [slideId];
    const accessibleDetails = deriveAccessibleSlides(resolvedDeckId, slideId, resolvedHistory);
    const accessibleIds = accessibleDetails.map((item) => item.slideId);

    const updated = await setClassPacing(db, {
      classId,
      track,
      deckId: resolvedDeckId,
      slideId,
      history: resolvedHistory,
      accessibleSlides: accessibleIds,
      sessionCode: sessionCode ?? null,
      sessionStatus: sessionStatus ?? null,
      sessionStartedAt: sessionStartedAt ?? null,
      updatedBy: teacher.username,
    });

    logDbOperation(ctx, {
      action: 'setClassPacing',
      classId,
      teacherId: teacher.id,
      command: logCommand,
      track: updated.track,
      unitId: updated.unitId,
      lessonId: updated.lessonId,
    });

    const metadata = buildPacingMetadata(updated);
    return json({
      pacing: updated,
      ...metadata,
    });
  };

  if (command === 'start') {
    const startDeckId = ensureDeckId(requestedUnitId);
    if (!startDeckId) {
      return json({ error: 'No live deck configured for Year 7.' }, 500);
    }

    const deck = getLiveDeckById(startDeckId);
    const initialSlideId = (() => {
      if (resume && currentPacing?.slideId && currentPacing.deckId === startDeckId && !resetHistory) {
        return currentPacing.slideId;
      }
      return deck?.slides?.[0]?.id || null;
    })();

    if (!initialSlideId) {
      return json({ error: 'Live deck does not contain any slides.' }, 500);
    }

    const history = buildHistory(initialSlideId, { reset: resetHistory || !resume, overrides: explicitHistory });
    const sessionCode = await generateUniqueSessionCode(db);
    const sessionStartedAt = new Date().toISOString();

    return persist({
      deckId: startDeckId,
      slideId: initialSlideId,
      history,
      sessionCode,
      sessionStatus: 'live',
      sessionStartedAt,
      logCommand: 'start',
    });
  }

  if (command === 'advance') {
    if (!currentPacing?.lessonId && !currentPacing?.slideId) {
      const fallbackLessonId = defaultPointer?.lessonId || YEAR7_LESSON_SEQUENCE[0]?.id || null;
      const fallbackDeck = ensureDeckId(defaultPointer?.unitId || YEAR7_LESSON_SEQUENCE[0]?.deckId);
      if (!fallbackLessonId || !fallbackDeck) {
        return json({ error: 'Unable to determine the starting slide.' }, 500);
      }
      const history = buildHistory(fallbackLessonId, { reset: true });
      const sessionCode = currentPacing?.sessionCode || (await generateUniqueSessionCode(db));
      const sessionStartedAt = currentPacing?.sessionStartedAt || new Date().toISOString();
      return persist({
        deckId: fallbackDeck,
        slideId: fallbackLessonId,
        history,
        sessionCode,
        sessionStatus: 'live',
        sessionStartedAt,
        logCommand: 'advance:init',
      });
    }

    const currentLessonId = currentPacing?.lessonId ?? currentPacing?.slideId;
    const nextLesson = getYear7NextLesson(currentLessonId);
    if (!nextLesson) {
      return json({ error: 'Already at the final slide in the live deck.' }, 400);
    }

    const history = buildHistory(nextLesson.id, { overrides: explicitHistory });
    const sessionCode = currentPacing?.sessionCode || (await generateUniqueSessionCode(db));
    const sessionStartedAt = currentPacing?.sessionStartedAt || new Date().toISOString();

    return persist({
      deckId: nextLesson.unitId,
      slideId: nextLesson.id,
      history,
      sessionCode,
      sessionStatus: 'live',
      sessionStartedAt,
      logCommand: 'advance',
    });
  }

  if (command === 'stop') {
    if (!currentPacing?.lessonId && !currentPacing?.slideId) {
      return json({ error: 'No pacing pointer to save yet.' }, 400);
    }
    const slideId = currentPacing?.lessonId ?? currentPacing?.slideId;
    const deckId = ensureDeckId(currentPacing?.deckId ?? currentPacing?.unitId);
    if (!deckId) {
      return json({ error: 'Live deck metadata missing for this class.' }, 500);
    }
    const history = buildHistory(slideId, { overrides: explicitHistory });
    const sessionStartedAt = currentPacing?.sessionStartedAt || new Date().toISOString();
    return persist({
      deckId,
      slideId,
      history,
      sessionCode: null,
      sessionStatus: 'paused',
      sessionStartedAt,
      logCommand: 'stop',
    });
  }

  if (command === 'reset') {
    const deckId = ensureDeckId(requestedUnitId);
    if (!deckId) {
      return json({ error: 'Live deck is not configured.' }, 500);
    }
    const deck = getLiveDeckById(deckId);
    const firstSlide = deck?.slides?.[0]?.id;
    if (!firstSlide) {
      return json({ error: 'Live deck does not contain any slides.' }, 500);
    }
    const history = buildHistory(firstSlide, { reset: true, overrides: explicitHistory });
    return persist({
      deckId,
      slideId: firstSlide,
      history,
      sessionCode: null,
      sessionStatus: 'idle',
      sessionStartedAt: null,
      logCommand: 'reset',
    });
  }

  if (requestedLessonId) {
    const lessonMeta = getYear7LessonById(requestedLessonId);
    const resolvedUnitId = requestedUnitId || lessonMeta?.unitId || currentPacing?.deckId || currentPacing?.unitId;

    if (!resolvedUnitId) {
      return json({ error: 'unitId is required when setting a lesson pacing pointer.' }, 400);
    }

    if (requestedUnitId && lessonMeta && requestedUnitId !== lessonMeta.unitId) {
      return json({ error: 'Lesson does not belong to the specified unit.' }, 400);
    }

    const history = buildHistory(requestedLessonId, { reset: resetHistory, overrides: explicitHistory });
    const sessionCode = currentPacing?.sessionCode || null;
    const sessionStatus = currentPacing?.sessionStatus || null;
    const sessionStartedAt = currentPacing?.sessionStartedAt || null;

    return persist({
      deckId: resolvedUnitId,
      slideId: requestedLessonId,
      history,
      sessionCode,
      sessionStatus,
      sessionStartedAt,
      logCommand: 'manual-set',
    });
  }

  return json({ error: 'Provide lessonId or a command (start, advance, stop, reset).' }, 400);
}

async function handleStudentClassPacing(_request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class id is required' }, 400);
  }

  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);
  if (!student || student.archivedAt || student.classId !== classId) {
    return json({ error: 'Class not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc) {
    return json({ error: 'Class not found' }, 404);
  }

  const pacing = await getClassPacing(db, classId);
  const metadata = buildPacingMetadata(pacing);

  logEvent(ctx, 'pacing.student.fetch', {
    classId,
    studentId: student.id,
    pacing,
  });

  return json({
    class: classDoc,
    pacing,
    ...metadata,
  });
}

async function handleCreateClass(request, env, session, ctx) {
  const body = await readJson(request);
  const className = String(body.className || '').trim();
  const description = String(body.description || '').trim();
  const yearGroup = body.yearGroup ? String(body.yearGroup).trim() : null;

  if (!className) {
    return json({ error: 'Class name is required.' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const created = await createClassRecord(db, {
    className,
    description: description || null,
    teacherId: teacher.id,
    teacherUsername: teacher.username,
    yearGroup,
  });

  logDbOperation(ctx, {
    action: 'createClass',
    classId: created.id,
    teacherId: teacher.id,
    teacherUsername: teacher.username,
    yearGroup,
  });

  return json({ class: created }, 201);
}

async function handleCreateStudent(request, env, session, ctx) {
  const body = await readJson(request);
  const classId = String(body.classId || '').trim();
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const yearGroup = String(body.yearGroup || '').trim();
  const programme = String(body.programme || '').trim();

  if (!classId || !firstName || !lastName || !password || !programme) {
    return json({ error: 'classId, firstName, lastName, programme, and password are required.' }, 400);
  }

  const db = getDb(env);
  const [teacher, classQuery] = await Promise.all([
    findTeacherByUsername(db, session.username),
    db.query({
      classes: {
        $: {
          where: { id: classId },
          limit: 1,
        },
      },
    }),
  ]);

  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = classQuery?.classes?.[0];
  if (!classDoc || classDoc.teacherUsername !== teacher.username) {
    return json({ error: 'Not authorised for this class.' }, 403);
  }

  if (username) {
    const existingStudent = await findStudentByUsername(db, username);
    if (existingStudent) {
      logEvent(ctx, 'teacher.student.create_conflict', { username, classId });
      return json({ error: 'Student username already exists.' }, 409);
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await createStudentRecord(db, {
    username: username || null,
    password: passwordHash,
    firstName,
    lastName,
    classId,
    teacherId: teacher.id,
    teacherUsername: teacher.username,
    yearGroup,
    programme,
  });

  logDbOperation(ctx, {
    action: 'createStudent',
    studentId: created.id,
    teacherId: teacher.id,
    classId,
    username: created.username ?? null,
    programme,
  });

  return json({ student: stripPassword(created) }, 201);
}

async function handleBulkCreateStudentsHandler(request, env, session, ctx) {
  const body = await readJson(request);
  const classId = String(body.classId || '').trim();
  const rows = Array.isArray(body.students) ? body.students : [];

  if (!classId || rows.length === 0) {
    return json({ error: 'classId and students array are required.' }, 400);
  }
  if (rows.length > 200) {
    return json({ error: 'Bulk upload limited to 200 students at a time.' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classQuery = await db.query({
    classes: {
      $: {
        where: { id: classId },
        limit: 1,
      },
    },
  });
  const classDoc = classQuery?.classes?.[0];
  if (!classDoc || classDoc.teacherUsername !== teacher.username) {
    return json({ error: 'Not authorised for this class.' }, 403);
  }

  const prepared = [];
  for (const row of rows) {
    const firstName = String(row.firstName || '').trim();
    const lastName = String(row.lastName || '').trim();
    const yearGroup = String(row.yearGroup || '').trim();
    const username = String(row.username || '').trim();
    const password = String(row.password || '');
    const programme = String(row.programme || '').trim();

    if (!firstName || !lastName || !programme || !password) {
      return json({ error: 'Each student requires firstName, lastName, programme, and password.' }, 400);
    }

    if (username) {
      const existingStudent = await findStudentByUsername(db, username);
      if (existingStudent) {
        logEvent(ctx, 'teacher.student.bulk_conflict', { username, classId });
        return json({ error: `Student username already exists: ${username}` }, 409);
      }
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    prepared.push({
      username: username || null,
      password: passwordHash,
      firstName,
      lastName,
      classId,
      teacherId: teacher.id,
      teacherUsername: teacher.username,
      yearGroup,
      programme,
    });
  }

  const created = await bulkCreateStudents(db, prepared);
  logDbOperation(ctx, {
    action: 'bulkCreateStudents',
    teacherId: teacher.id,
    classId,
    count: created.length,
  });
  return json({
    created: created.map(stripPassword),
    count: created.length,
  }, 201);
}

async function handleGenerateClassCredentials(request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class id is required.' }, 400);
  }

  const body = await readJson(request);
  const requestedIds = Array.isArray(body.studentIds)
    ? body.studentIds
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : [];
  const requestedIdSet = new Set(requestedIds);

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc || classDoc.teacherId !== teacher.id) {
    return json({ error: 'Class not found' }, 404);
  }

  const students = await listStudentsByClass(db, classId);
  const filteredStudents = students
    .filter((student) => student.teacherId === teacher.id)
    .filter((student) => (requestedIdSet.size === 0 ? true : requestedIdSet.has(student.id)));

  if (filteredStudents.length === 0) {
    return json({ error: 'No matching students found for this class.' }, 404);
  }

  const timestamp = new Date().toISOString();
  const updates = [];
  const credentials = [];

  for (const student of filteredStudents) {
    const passwordPlain = generatePassword();
    const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_ROUNDS);
    updates.push({
      studentId: student.id,
      passwordHash,
      passwordResetAt: timestamp,
    });
    credentials.push({
      id: student.id,
      username: student.username,
      firstName: student.firstName,
      lastName: student.lastName,
      displayName: student.displayName,
      password: passwordPlain,
    });
  }

  await bulkUpdateStudentPasswords(db, updates);

  logDbOperation(ctx, {
    action: 'bulkPasswordReset',
    classId,
    teacherId: teacher.id,
    count: credentials.length,
  });

  return json({
    classId,
    generatedAt: timestamp,
    count: credentials.length,
    credentials,
  });
}

async function handleClassUnlock(request, env, session, ctx) {
  const body = await readJson(request);
  const classId = String(body.classId || '').trim();
  const stageKey = String(body.stageKey || '').trim();

  if (!classId || !stageKey) {
    return json({ error: 'classId and stageKey are required.' }, 400);
  }

  const db = getDb(env);
  const [teacher, classQuery] = await Promise.all([
    findTeacherByUsername(db, session.username),
    db.query({
      classes: {
        $: {
          where: { id: classId },
          limit: 1,
        },
      },
    }),
  ]);

  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = classQuery?.classes?.[0];
  if (!classDoc || classDoc.teacherUsername !== teacher.username) {
    return json({ error: 'Not authorised for this class.' }, 403);
  }

  const unlock = await createClassUnlock(db, {
    classId,
    stageKey,
    unlockedBy: teacher.username,
    teacherId: teacher.id,
    teacherUsername: teacher.username,
  });

  logDbOperation(ctx, {
    action: 'createClassUnlock',
    unlockId: unlock.id,
    classId,
    teacherId: teacher.id,
    stageKey,
  });

  return json({ unlock }, 201);
}

async function handleStudentUnlock(request, env, session, ctx) {
  const body = await readJson(request);
  const studentId = String(body.studentId || '').trim();
  const stageKey = String(body.stageKey || '').trim();
  const scope = body.scope ? String(body.scope).trim() : 'stage';
  const targetId = body.targetId ? String(body.targetId).trim() : null;

  if (!studentId || !stageKey) {
    return json({ error: 'studentId and stageKey are required.' }, 400);
  }

  const db = getDb(env);
  const [teacher, studentQuery] = await Promise.all([
    findTeacherByUsername(db, session.username),
    db.query({
      students: {
        $: {
          where: { id: studentId },
          limit: 1,
        },
      },
    }),
  ]);

  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const studentDoc = studentQuery?.students?.[0];
  if (!studentDoc || studentDoc.teacherUsername !== teacher.username) {
    return json({ error: 'Not authorised for this student.' }, 403);
  }

  const unlock = await createStudentUnlock(db, {
    studentId,
    classId: studentDoc.classId,
    teacherId: teacher.id,
    teacherUsername: teacher.username,
    stageKey,
    unlockedBy: teacher.username,
    scope,
    targetId,
  });

  if (scope === 'stage') {
    await setStudentActiveStage(db, studentId, stageKey);
  }

  logDbOperation(ctx, {
    action: 'createStudentUnlock',
    unlockId: unlock.id,
    studentId,
    classId: studentDoc.classId,
    teacherId: teacher.id,
    scope,
    stageKey,
  });

  return json({ unlock }, 201);
}

async function handleArchiveStudent(request, env, session, ctx) {
  const body = await readJson(request);
  const studentId = String(body.studentId || '').trim();

  if (!studentId) {
    return json({ error: 'studentId is required.' }, 400);
  }

  const db = getDb(env);
  const [teacher, studentQuery] = await Promise.all([
    findTeacherByUsername(db, session.username),
    db.query({
      students: {
        $: {
          where: { id: studentId },
          limit: 1,
        },
      },
    }),
  ]);

  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const studentDoc = studentQuery?.students?.[0];
  if (!studentDoc || studentDoc.teacherUsername !== teacher.username) {
    return json({ error: 'Not authorised for this student.' }, 403);
  }

  const archivedAt = await archiveStudent(db, studentId);
  logDbOperation(ctx, {
    action: 'archiveStudent',
    studentId,
    teacherId: teacher.id,
    classId: studentDoc.classId,
  });
  return json({ archivedAt });
}

async function handleTeacherStudentDashboard(_request, env, session, ctx, studentId) {
  if (!studentId) {
    return json({ error: 'Student id required' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const data = await getStudentDashboardDataById(db, studentId);
  if (!data.student || data.student.teacherId !== teacher.id) {
    return json({ error: 'Student not found' }, 404);
  }

  logEvent(ctx, 'teacher.student.dashboard', {
    teacherId: teacher.id,
    studentId: data.student.id,
  });

  return json({
    student: formatSessionUser('student', data.student),
    class: data.class,
    unlocks: data.unlocks,
    progress: data.progress,
    classPacing: data.classPacing ?? null,
  });
}

async function handleTeacherLiveAssessmentStatus(request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class id is required' }, 400);
  }

  const url = new URL(request.url);
  const unitId = String(url.searchParams.get('unitId') || '').trim();
  const segmentId = String(url.searchParams.get('segmentId') || '').trim();

  if (!unitId || !segmentId) {
    return json({ error: 'unitId and segmentId are required' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc || classDoc.teacherId !== teacher.id) {
    return json({ error: 'Class not found' }, 404);
  }

  const [students, statuses] = await Promise.all([
    listStudentsByClass(db, classId),
    listLiveAssessmentStatus(db, { classId, unitId, segmentId }),
  ]);

  const statusMap = new Map();
  for (const status of statuses) {
    if (!status || !status.studentId) continue;
    statusMap.set(status.studentId, status);
  }

  const rows = [];
  let completed = 0;
  let inProgress = 0;

  for (const student of students) {
    const status = statusMap.get(student.id);
    const recordStatus = (status?.status || 'not-started').toLowerCase();
    if (recordStatus === 'completed') completed += 1;
    else if (recordStatus === 'in-progress') inProgress += 1;

    rows.push({
      id: student.id,
      displayName: student.displayName,
      username: student.username,
      classId: student.classId,
      attempts: status?.attempts ?? 0,
      status: recordStatus,
      score: status?.score ?? null,
      lastUpdated: status?.lastUpdated ?? null,
    });
    statusMap.delete(student.id);
  }

  // Include orphan records (e.g. recently archived students) for visibility
  for (const status of statusMap.values()) {
    const recordStatus = (status.status || 'not-started').toLowerCase();
    if (recordStatus === 'completed') completed += 1;
    else if (recordStatus === 'in-progress') inProgress += 1;
    rows.push({
      id: status.studentId,
      displayName: null,
      username: null,
      classId,
      attempts: status.attempts ?? 0,
      status: recordStatus,
      score: status.score ?? null,
      lastUpdated: status.lastUpdated ?? null,
    });
  }

  const totalStudents = rows.length;
  const summary = {
    completed,
    'in-progress': inProgress,
    'not-started': Math.max(totalStudents - completed - inProgress, 0),
  };

  logEvent(ctx, 'teacher.live_assessment.status', {
    teacherId: teacher.id,
    classId,
    unitId,
    segmentId,
    totals: summary,
  });

  return json({
    classId,
    unitId,
    segmentId,
    students: rows,
    summary,
    total: totalStudents,
  });
}

async function handleClassExport(_request, env, session, ctx, classId) {
  if (!classId) {
    return json({ error: 'Class ID required' }, 400);
  }

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const data = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });
  const clazz = data.classes.find((item) => item.id === classId && !item.archivedAt);
  if (!clazz) {
    return json({ error: 'Class not found' }, 404);
  }

  const students = data.students.filter((student) => student.classId === classId && student.status !== 'archived');
  const progressMap = new Map();
  for (const record of data.progress) {
    if (record.classId !== classId) continue;
    const list = progressMap.get(record.studentId) || [];
    list.push(record);
    progressMap.set(record.studentId, list);
  }

  const rows = students.map((student) => {
    const studentProgress = progressMap.get(student.id) || [];
    let completed = 0;
    let inProgress = 0;
    let attempts = 0;
    let latestSummative = '';

    for (const record of studentProgress) {
      if (record.status === 'summative-complete') completed += 1;
      else if (record.status !== 'locked') inProgress += 1;
      if (typeof record.formativeAttempts === 'number') attempts += record.formativeAttempts;
      if (typeof record.summativeScore === 'number') {
        latestSummative = record.summativeScore.toString();
      }
    }

    return {
      studentName: student.displayName || `${student.firstName} ${student.lastName}`.trim(),
      username: student.username || '',
      yearGroup: student.yearGroup || '',
      curriculumTrack: student.curriculumTrack || '',
      activeStage: student.activeStage || '',
      completedLessons: completed,
      inProgressLessons: inProgress,
      formativeAttempts: attempts,
      latestSummativeScore: latestSummative,
    };
  });

  const csvLines = [CSV_HEADER.join(',')];
  for (const row of rows) {
    csvLines.push(
      [
        row.studentName,
        row.username,
        row.yearGroup,
        row.curriculumTrack,
        row.activeStage,
        row.completedLessons,
        row.inProgressLessons,
        row.formativeAttempts,
        row.latestSummativeScore,
      ]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
  }

  logEvent(ctx, 'teacher.class.export', {
    teacherId: teacher.id,
    classId,
    studentCount: students.length,
  });

  return json({
    class: clazz,
    generatedAt: new Date().toISOString(),
    rows,
    csv: csvLines.join('\n'),
    filename: `class-${classId}-progress.csv`,
    mimeType: 'text/csv',
  });
}

async function handleStudentDashboard(_request, env, session, ctx) {
  const db = getDb(env);
  const data = await getStudentDashboardData(db, session.username);

  if (!data.student) {
    return json({ error: 'Student record not found' }, 404);
  }

  logEvent(ctx, 'student.dashboard.loaded', {
    studentId: data.student.id,
    classId: data.class?.id ?? null,
  });

  return json({
    student: formatSessionUser('student', data.student),
    class: data.class,
    unlocks: data.unlocks,
    progress: data.progress,
    classPacing: data.classPacing ?? null,
    gamification: data.gamification ?? null,
  });
}

async function handleStudentLiveAssessmentStatus(request, env, session, ctx) {
  const body = await readJson(request);
  const classId = String(body.classId || '').trim();
  const unitId = String(body.unitId || '').trim();
  const segmentId = String(body.segmentId || '').trim();
  const attempts = Number(body.attempts ?? 0);
  const statusRaw = String(body.status || '').trim().toLowerCase();
  const scoreRaw = body.score;

  if (!classId || !unitId || !segmentId) {
    return json({ error: 'classId, unitId, and segmentId are required.' }, 400);
  }

  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);
  if (!student || student.classId !== classId || student.archivedAt) {
    return json({ error: 'Student not found for this class.' }, 404);
  }

  const normalizedStatus = statusRaw === 'completed' ? 'completed' : statusRaw === 'in-progress' ? 'in-progress' : 'in-progress';
  const record = await upsertLiveAssessmentStatus(db, {
    classId,
    unitId,
    segmentId,
    studentId: student.id,
    attempts,
    status: normalizedStatus,
    score: scoreRaw,
  });

  logDbOperation(ctx, {
    action: 'upsertLiveAssessmentStatus',
    studentId: student.id,
    classId,
    unitId,
    segmentId,
    attempts,
    status: normalizedStatus,
  });

  return json({ status: record });
}

async function handleGetStudentGamification(_request, env, session, ctx) {
  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);

  if (!student) {
    return json({ error: 'Student record not found' }, 404);
  }

  const gamification = await getStudentGamification(db, student.id);
  logEvent(ctx, 'student.gamification.fetch', {
    studentId: student.id,
    xp: gamification?.xp ?? 0,
    level: gamification?.level ?? 1,
  });
  return json(gamification);
}

async function handleSyncStudentGamification(request, env, session, ctx) {
  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);

  if (!student) {
    return json({ error: 'Student record not found' }, 404);
  }

  const payload = await readJson(request);
  const gamification = await syncStudentGamification(db, student.id, payload);
  logDbOperation(ctx, {
    action: 'syncStudentGamification',
    studentId: student.id,
    xp: gamification.xp,
    level: gamification.level,
  });
  return json(gamification);
}

async function handleStudentJoinLiveSession(request, env, session, ctx) {
  const body = await readJson(request);
  const joinCode = String(body.joinCode || body.code || '').trim().toUpperCase();
  if (!joinCode) {
    return json({ error: 'joinCode is required' }, 400);
  }

  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);
  if (!student || student.archivedAt) {
    return json({ error: 'Student not found' }, 404);
  }

  const pacing = await findClassPacingBySessionCode(db, joinCode);
  if (!pacing || !pacing.classId) {
    return json({ error: 'Live session not found' }, 404);
  }

  const classDoc = await findClassById(db, pacing.classId);
  if (!classDoc) {
    return json({ error: 'Class not found' }, 404);
  }

  const metadata = buildPacingMetadata(pacing);

  logEvent(ctx, 'pacing.student.join_session', {
    joinCode,
    classId: pacing.classId,
    studentId: student.id,
  });

  return json({
    class: classDoc,
    pacing,
    joinCode,
    ...metadata,
  });
}

async function handleSeed(request, env, ctx) {
  if (!env.SEED_KEY) {
    return json({ error: 'Seed key not configured' }, 403);
  }

  const headerKey = request.headers.get('x-seed-key');
  if (!headerKey || headerKey !== env.SEED_KEY) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'invalid_seed_key',
    });
    return json({ error: 'Forbidden' }, 403);
  }

  const { teacher } = await readJson(request);
  if (!teacher?.username || !teacher?.password) {
    return json({ error: 'teacher.username and teacher.password required' }, 400);
  }

  const firstName = teacher.firstName || 'Admin';
  const lastName = teacher.lastName || 'Teacher';
  const displayName = teacher.displayName || `${firstName} ${lastName}`.trim();

  const db = getDb(env);
  const existing = await findTeacherByUsername(db, teacher.username);
  if (existing) {
    logEvent(ctx, 'seed.teacher.exists', { username: teacher.username });
    return json({ ok: true, seeded: false, reason: 'teacher exists' });
  }

  const hash = await bcrypt.hash(String(teacher.password), BCRYPT_ROUNDS);
  const created = await createTeacherRecord(db, {
    username: teacher.username,
    password: hash,
    firstName,
    lastName,
    displayName,
  });

  logDbOperation(ctx, {
    action: 'seedTeacher',
    teacherId: created.id,
    username: created.username,
  });

  return json({ ok: true, seeded: true, teacher: created }, 201);
}

/* ------------------------------ Middleware ----------------------------- */

async function requireRole(request, env, allowedRoles, handler, ctx, ...extraArgs) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'missing_authorization',
      requiredRoles: roles,
    });
    return json({ error: 'Missing authorization' }, 401);
  }

  try {
    const session = await verifyToken(authHeader.slice(7), env.TOKEN_SECRET);
    attachSession(ctx, session);
    if (!roles.includes(session.role)) {
      logAuthResult(ctx, {
        status: 'failure',
        reason: 'role_mismatch',
        role: session.role,
        username: session.username,
        requiredRoles: roles,
      });
      return json({ error: `${roles.join(', ')} role required` }, 403);
    }

    logAuthResult(ctx, {
      status: 'success',
      reason: 'authorized',
      role: session.role,
      username: session.username,
    });

    return handler(request, env, session, ctx, ...extraArgs);
  } catch (error) {
    logAuthResult(ctx, {
      status: 'failure',
      reason: 'invalid_or_expired_token',
    });
    return json({ error: 'Invalid or expired token' }, 401);
  }
}

/* ------------------------------- Helpers ------------------------------- */

function summarizeLessons(progressRecords) {
  const totals = {
    locked: 0,
    available: 0,
    'formative-complete': 0,
    'summative-complete': 0,
  };

  for (const record of progressRecords) {
    if (record?.status && totals.hasOwnProperty(record.status)) {
      totals[record.status] += 1;
    }
  }

  return totals;
}

function formatSessionUser(role, doc) {
  const safeDoc = stripPassword(doc) || {};
  const base = {
    id: safeDoc.id ?? safeDoc._id ?? null,
    username: safeDoc.username ?? null,
    role,
    displayName: safeDoc.displayName ?? safeDoc.username ?? null,
  };

  if (role === 'admin' || role === 'teacher') {
    base.firstName = safeDoc.firstName ?? null;
    base.lastName = safeDoc.lastName ?? null;
    base.archivedAt = safeDoc.archivedAt ?? null;
  }

  if (role === 'student') {
    base.firstName = safeDoc.firstName ?? null;
    base.lastName = safeDoc.lastName ?? null;
    base.classId = safeDoc.classId ?? null;
    base.curriculumTrack = safeDoc.curriculumTrack ?? null;
    base.activeStage = safeDoc.activeStage ?? null;
    base.status = safeDoc.status ?? null;
    base.yearGroup = safeDoc.yearGroup ?? null;
  }

  return base;
}

function stripPassword(entity) {
  if (!entity || typeof entity !== 'object') return entity;
  const { password, ...rest } = entity;
  return rest;
}
