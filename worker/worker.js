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
} from '../shared/year7Curriculum.js';
import { generatePassword } from '../shared/passwords.js';

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

      if (pathname === '/admin/dashboard' && request.method === 'GET') {
        return requireRole(request, env, 'admin', handleAdminDashboard);
      }

      if (pathname === '/admin/teachers' && request.method === 'POST') {
        return requireRole(request, env, 'admin', handleAdminCreateTeacher);
      }

      if (pathname.startsWith('/admin/teachers/') && request.method === 'DELETE') {
        const username = decodeURIComponent(pathname.split('/')[3] || '');
        return requireRole(request, env, 'admin', (req, env, session) =>
          handleAdminDeleteTeacher(req, env, session, username),
        );
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

      if (pathname === '/teacher/students/bulk' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleBulkCreateStudentsHandler);
      }

      if (pathname === '/teacher/classes/unlocks' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleClassUnlock);
      }

      if (pathname === '/teacher/students/unlocks' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleStudentUnlock);
      }

      if (pathname === '/teacher/students/archive' && request.method === 'POST') {
        return requireRole(request, env, 'teacher', handleArchiveStudent);
      }

      if (pathname.startsWith('/teacher/students/') && pathname.endsWith('/dashboard') && request.method === 'GET') {
        const segments = pathname.split('/');
        const studentId = decodeURIComponent(segments[3] || '');
        return requireRole(request, env, 'teacher', (req, env, session) =>
          handleTeacherStudentDashboard(req, env, session, studentId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/pacing')) {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        if (request.method === 'GET') {
          return requireRole(request, env, 'teacher', (req, env, session) =>
            handleGetClassPacing(req, env, session, classId),
          );
        }
        if (request.method === 'POST') {
          return requireRole(request, env, 'teacher', (req, env, session) =>
            handleUpdateClassPacing(req, env, session, classId),
          );
        }
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/export') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        return requireRole(request, env, 'teacher', (req, env, session) =>
          handleClassExport(req, env, session, classId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/credentials') && request.method === 'POST') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        return requireRole(request, env, 'teacher', (req, env, session) =>
          handleGenerateClassCredentials(req, env, session, classId),
        );
      }

      if (pathname.startsWith('/teacher/classes/') && pathname.endsWith('/live-assessment-status') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        return requireRole(request, env, 'teacher', (req, env, session) =>
          handleTeacherLiveAssessmentStatus(req, env, session, classId),
        );
      }

      if (pathname === '/student/dashboard' && request.method === 'GET') {
        return requireRole(request, env, 'student', handleStudentDashboard);
      }

      if (pathname.startsWith('/student/classes/') && pathname.endsWith('/pacing') && request.method === 'GET') {
        const segments = pathname.split('/');
        const classId = decodeURIComponent(segments[3] || '');
        return requireRole(request, env, 'student', (req, env, session) =>
          handleStudentClassPacing(req, env, session, classId),
        );
      }

      if (pathname === '/student/gamification' && request.method === 'GET') {
        return requireRole(request, env, 'student', handleGetStudentGamification);
      }

      if (pathname === '/student/gamification' && request.method === 'POST') {
        return requireRole(request, env, 'student', handleSyncStudentGamification);
      }

      if (pathname === '/student/live-assessment-status' && request.method === 'POST') {
        return requireRole(request, env, 'student', handleStudentLiveAssessmentStatus);
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
  const normalizedUsernameLower = normalizedUsername.toLowerCase();
  const normalizedPassword = String(password);

  if (!normalizedUsername || !normalizedPassword) {
    return json({ error: 'Username and password are required.' }, 400);
  }
  if (!['admin', 'teacher', 'student'].includes(normalizedRole)) {
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
    return json({ error: 'Invalid credentials' }, 401);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, userDoc.password);
  if (!passwordMatches) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  if (userDoc.archivedAt) {
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
    let doc = null;

    if (payload.role === 'admin') {
      doc = await findAdminByUsername(db, payload.username);
    } else if (payload.role === 'teacher') {
      doc = await findTeacherByUsername(db, payload.username);
    } else {
      doc = await findStudentByUsername(db, payload.username);
    }

    if (!doc || doc.archivedAt) {
      return json({ valid: false }, 401);
    }

    return json({
      valid: true,
      user: formatSessionUser(payload.role, doc),
    });
  } catch (error) {
    console.warn('Token verification failed', error);
    return json({ valid: false }, 401);
  }
}

async function handleAdminDashboard(_request, env, session) {
  const db = getDb(env);
  const [adminDoc, teachers] = await Promise.all([
    findAdminByUsername(db, session.username),
    listTeachers(db, { includeArchived: true }),
  ]);

  if (!adminDoc) {
    return json({ error: 'Admin not found' }, 404);
  }

  const teacherDetails = [];
  for (const teacher of teachers) {
    const summary = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });
    const safeTeacher = stripPassword(teacher);
    const activeStudents = summary.students.filter((student) => student.status === 'active').length;
    const archivedStudents = summary.students.filter((student) => student.status === 'archived').length;
    teacherDetails.push({
      id: safeTeacher.id,
      username: safeTeacher.username,
      firstName: safeTeacher.firstName ?? null,
      lastName: safeTeacher.lastName ?? null,
      displayName: safeTeacher.displayName ?? safeTeacher.username,
      createdAt: safeTeacher.createdAt ?? null,
      archivedAt: safeTeacher.archivedAt ?? null,
      totals: {
        classes: summary.classes.filter((clazz) => !clazz.archivedAt).length,
        activeStudents,
        archivedStudents,
      },
    });
  }

  return json({
    admin: formatSessionUser('admin', adminDoc),
    teachers: teacherDetails,
  });
}

async function handleAdminCreateTeacher(request, env) {
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

  return json({ teacher: stripPassword(created) }, 201);
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

  const summary = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });

  const archivedAt = await archiveTeacher(db, teacher.id);
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

  return json({
    ok: true,
    archivedAt,
    classesArchived,
    studentsArchived,
  });
}

async function handleTeacherDashboard(_request, env, session) {
  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const data = await getTeacherDashboardData(db, { teacherId: teacher.id, username: teacher.username });
  const safeStudents = data.students.map(stripPassword);

  const lessonSummary = summarizeLessons(data.progress);

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
  if (!pacing || !pacing.lessonId) {
    return { lesson: null, sequenceIndex: null };
  }

  const lesson = getYear7LessonById(pacing.lessonId);
  if (!lesson) {
    return { lesson: null, sequenceIndex: null };
  }

  const sequenceIndex = getYear7LessonIndex(lesson.id);
  return {
    lesson,
    sequenceIndex,
  };
}

async function handleGetClassPacing(_request, env, session, classId) {
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

  return json({
    class: classDoc,
    pacing,
    ...metadata,
  });
}

async function handleUpdateClassPacing(request, env, session, classId) {
  if (!classId) {
    return json({ error: 'Class id is required' }, 400);
  }

  const body = await readJson(request);
  const command = String(body.command || '').toLowerCase();
  const requestedLessonId = body.lessonId ? String(body.lessonId).trim() : '';
  const requestedUnitId = body.unitId ? String(body.unitId).trim() : '';
  const requestedLessonTitle = body.lessonTitle ? String(body.lessonTitle).trim() : '';
  const requestedTrack = body.track ? String(body.track).trim() : '';

  const db = getDb(env);
  const teacher = await findTeacherByUsername(db, session.username);
  if (!teacher || teacher.archivedAt) {
    return json({ error: 'Teacher not found' }, 404);
  }

  const classDoc = await findClassById(db, classId);
  if (!classDoc || classDoc.teacherId !== teacher.id) {
    return json({ error: 'Class not found' }, 404);
  }

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

  const resolveLessonInfo = (lessonId, unitId, titleHint = '') => {
    if (!lessonId) return null;
    const year7Lesson = getYear7LessonById(lessonId);
    if (year7Lesson) {
      return year7Lesson;
    }
    if (!unitId) {
      return {
        id: lessonId,
        title: titleHint || lessonId,
        unitId: null,
      };
    }
    return {
      id: lessonId,
      unitId,
      title: titleHint || lessonId,
    };
  };

  if (command === 'advance') {
    if (!currentPacing?.lessonId) {
      const defaultPointer = getYear7DefaultPointer();
      const firstLesson = defaultPointer ? getYear7LessonById(defaultPointer.lessonId) : null;
      if (!firstLesson) {
        return json({ error: 'Year 7 curriculum data is not configured.' }, 500);
      }
      const track = inferTrack() || 'ks3';
      const updated = await setClassPacing(db, {
        classId,
        track,
        unitId: firstLesson.unitId,
        lessonId: firstLesson.id,
        updatedBy: teacher.username,
      });

      return json({
        pacing: updated,
        lesson: firstLesson,
        sequenceIndex: getYear7LessonIndex(updated.lessonId),
      });
    }

    const nextLesson = getYear7NextLesson(currentPacing.lessonId);
    if (!nextLesson) {
      return json({ error: 'Already at the final lesson in the sequence.' }, 400);
    }

    const track = inferTrack() || 'ks3';
    const updated = await setClassPacing(db, {
      classId,
      track,
      unitId: nextLesson.unitId,
      lessonId: nextLesson.id,
      updatedBy: teacher.username,
    });

    return json({
      pacing: updated,
      lesson: nextLesson,
      sequenceIndex: getYear7LessonIndex(updated.lessonId),
    });
  }

  if (command === 'start') {
    const defaultPointer = getYear7DefaultPointer();
    if (!defaultPointer) {
      return json({ error: 'Year 7 curriculum data is not configured.' }, 500);
    }
    const nextLesson = getYear7LessonById(defaultPointer.lessonId);
    if (!nextLesson) {
      return json({ error: 'Unable to resolve the starting lesson.' }, 500);
    }

    const track = inferTrack() || 'ks3';
    const updated = await setClassPacing(db, {
      classId,
      track,
      unitId: nextLesson.unitId,
      lessonId: nextLesson.id,
      updatedBy: teacher.username,
    });

    return json({
      pacing: updated,
      lesson: nextLesson,
      sequenceIndex: getYear7LessonIndex(updated.lessonId),
    });
  }

  if (command === 'stop') {
    if (!currentPacing?.lessonId || !currentPacing?.unitId) {
      return json({ error: 'No pacing pointer to save yet.' }, 400);
    }

    const track = inferTrack();
    const updated = await setClassPacing(db, {
      classId,
      track,
      unitId: currentPacing.unitId,
      lessonId: currentPacing.lessonId,
      updatedBy: teacher.username,
    });

    const lessonPayload = resolveLessonInfo(updated.lessonId, updated.unitId, requestedLessonTitle);
    const sequenceIndex = updated.track === 'ks3' ? getYear7LessonIndex(updated.lessonId) : null;

    return json({
      pacing: updated,
      lesson: lessonPayload,
      sequenceIndex,
    });
  }

async function handleStudentClassPacing(_request, env, session, classId) {
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

  return json({
    class: classDoc,
    pacing,
    ...metadata,
  });
}

  if (requestedLessonId) {
    const year7Lesson = getYear7LessonById(requestedLessonId);
    const resolvedUnitId = requestedUnitId || year7Lesson?.unitId || currentPacing?.unitId;

    if (!resolvedUnitId) {
      return json({ error: 'unitId is required when setting a lesson pacing pointer.' }, 400);
    }

    if (requestedUnitId && year7Lesson && requestedUnitId !== year7Lesson.unitId) {
      return json({ error: 'Lesson does not belong to the specified unit.' }, 400);
    }

    const track = year7Lesson ? 'ks3' : inferTrack();
    const updated = await setClassPacing(db, {
      classId,
      track,
      unitId: resolvedUnitId,
      lessonId: requestedLessonId,
      updatedBy: teacher.username,
    });

    const lessonPayload = year7Lesson || resolveLessonInfo(updated.lessonId, updated.unitId, requestedLessonTitle);
    const sequenceIndex = updated.track === 'ks3' ? getYear7LessonIndex(updated.lessonId) : null;

    return json({
      pacing: updated,
      lesson: lessonPayload,
      sequenceIndex,
    });
  }

  return json({ error: 'Provide lessonId or a command (start, advance, stop).' }, 400);
}

async function handleCreateClass(request, env, session) {
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

  return json({ class: created }, 201);
}

async function handleCreateStudent(request, env, session) {
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

  return json({ student: stripPassword(created) }, 201);
}

async function handleBulkCreateStudentsHandler(request, env, session) {
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
  return json({
    created: created.map(stripPassword),
    count: created.length,
  }, 201);
}

async function handleGenerateClassCredentials(request, env, session, classId) {
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

  return json({
    classId,
    generatedAt: timestamp,
    count: credentials.length,
    credentials,
  });
}

async function handleClassUnlock(request, env, session) {
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

  return json({ unlock }, 201);
}

async function handleStudentUnlock(request, env, session) {
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

  return json({ unlock }, 201);
}

async function handleArchiveStudent(request, env, session) {
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
  return json({ archivedAt });
}

async function handleTeacherStudentDashboard(_request, env, session, studentId) {
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

  return json({
    student: formatSessionUser('student', data.student),
    class: data.class,
    unlocks: data.unlocks,
    progress: data.progress,
    classPacing: data.classPacing ?? null,
  });
}

async function handleTeacherLiveAssessmentStatus(request, env, session, classId) {
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

  return json({
    classId,
    unitId,
    segmentId,
    students: rows,
    summary,
    total: totalStudents,
  });
}

async function handleClassExport(_request, env, session, classId) {
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

  return json({
    class: clazz,
    generatedAt: new Date().toISOString(),
    rows,
    csv: csvLines.join('\n'),
    filename: `class-${classId}-progress.csv`,
    mimeType: 'text/csv',
  });
}

async function handleStudentDashboard(_request, env, session) {
  const db = getDb(env);
  const data = await getStudentDashboardData(db, session.username);

  if (!data.student) {
    return json({ error: 'Student record not found' }, 404);
  }

  return json({
    student: formatSessionUser('student', data.student),
    class: data.class,
    unlocks: data.unlocks,
    progress: data.progress,
    classPacing: data.classPacing ?? null,
    gamification: data.gamification ?? null,
  });
}

async function handleStudentLiveAssessmentStatus(request, env, session) {
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

  return json({ status: record });
}

async function handleGetStudentGamification(_request, env, session) {
  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);

  if (!student) {
    return json({ error: 'Student record not found' }, 404);
  }

  const gamification = await getStudentGamification(db, student.id);
  return json(gamification);
}

async function handleSyncStudentGamification(request, env, session) {
  const db = getDb(env);
  const student = await findStudentByUsername(db, session.username);

  if (!student) {
    return json({ error: 'Student record not found' }, 404);
  }

  const payload = await readJson(request);
  const gamification = await syncStudentGamification(db, student.id, payload);
  return json(gamification);
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

  const firstName = teacher.firstName || 'Admin';
  const lastName = teacher.lastName || 'Teacher';
  const displayName = teacher.displayName || `${firstName} ${lastName}`.trim();

  const db = getDb(env);
  const existing = await findTeacherByUsername(db, teacher.username);
  if (existing) {
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

  return json({ ok: true, seeded: true, teacher: created }, 201);
}

/* ------------------------------ Middleware ----------------------------- */

async function requireRole(request, env, allowedRoles, handler) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return withCors(Promise.resolve(json({ error: 'Missing authorization' }, 401)), request, env);
  }

  try {
    const session = await verifyToken(authHeader.slice(7), env.TOKEN_SECRET);
    if (!roles.includes(session.role)) {
      return withCors(Promise.resolve(json({ error: `${roles.join(', ')} role required` }, 403)), request, env);
    }

    const response = await handler(request, env, session);
    return withCors(Promise.resolve(response), request, env);
  } catch (error) {
    return withCors(Promise.resolve(json({ error: 'Invalid or expired token' }, 401)), request, env);
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
