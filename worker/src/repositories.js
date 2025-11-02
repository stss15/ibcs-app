import { id, tx } from './instant.js';
import manifest from '../../curriculum/manifest.json' assert { type: 'json' };

/* ------------------------------------------------------------------ *
 * Sanitizers ensure we never leak password hashes back to callers.
 * ------------------------------------------------------------------ */

function extractId(doc) {
  return doc?.id ?? doc?._id ?? null;
}

function sanitizeAdmin(doc) {
  if (!doc) return null;
  const fallbackName = [doc.firstName, doc.lastName].filter(Boolean).join(' ').trim() || doc.username;
  return {
    id: extractId(doc),
    username: doc.username,
    firstName: doc.firstName ?? '',
    lastName: doc.lastName ?? '',
    displayName: doc.displayName ?? fallbackName,
    createdAt: doc.createdAt ?? null,
    password: doc.password,
  };
}

function sanitizeTeacher(doc) {
  if (!doc) return null;
  const fallbackName = [doc.firstName, doc.lastName].filter(Boolean).join(' ').trim() || doc.username;
  return {
    id: extractId(doc),
    username: doc.username,
    firstName: doc.firstName ?? '',
    lastName: doc.lastName ?? '',
    displayName: doc.displayName ?? fallbackName,
    createdAt: doc.createdAt ?? null,
    archivedAt: doc.archivedAt ?? null,
    password: doc.password,
  };
}

function sanitizeClass(doc) {
  if (!doc) return null;
  return {
    id: extractId(doc),
    className: doc.className ?? '',
    description: doc.description ?? null,
    teacherId: doc.teacherId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    yearGroup: doc.yearGroup ?? null,
    createdAt: doc.createdAt ?? null,
    archivedAt: doc.archivedAt ?? null,
  };
}

function sanitizeStudent(doc) {
  if (!doc) return null;
  const fallbackName =
    [doc.firstName, doc.lastName].filter(Boolean).join(' ').trim() || doc.username || doc.name || 'Student';
  return {
    id: extractId(doc),
    username: doc.username ?? null,
    firstName: doc.firstName ?? '',
    lastName: doc.lastName ?? '',
    displayName: doc.displayName ?? fallbackName,
    yearGroup: doc.yearGroup ?? null,
    curriculumTrack: doc.curriculumTrack ?? null,
    classId: doc.classId ?? null,
    teacherId: doc.teacherId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    activeStage: doc.activeStage ?? null,
    status: doc.status ?? 'active',
    archivedAt: doc.archivedAt ?? null,
    createdAt: doc.createdAt ?? null,
    password: doc.password,
  };
}

function sanitizeClassUnlock(doc) {
  if (!doc) return null;
  return {
    id: extractId(doc),
    classId: doc.classId ?? null,
    teacherId: doc.teacherId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    stageKey: doc.stageKey ?? null,
    unlockedBy: doc.unlockedBy ?? null,
    unlockedAt: doc.unlockedAt ?? null,
  };
}

function sanitizeStudentUnlock(doc) {
  if (!doc) return null;
  return {
    id: extractId(doc),
    studentId: doc.studentId ?? null,
    classId: doc.classId ?? null,
    teacherId: doc.teacherId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    stageKey: doc.stageKey ?? null,
    unlockedBy: doc.unlockedBy ?? null,
    unlockedAt: doc.unlockedAt ?? null,
    scope: doc.scope ?? 'stage',
    targetId: doc.targetId ?? null,
  };
}

function sanitizeStudentProgress(doc) {
  if (!doc) return null;
  return {
    id: extractId(doc),
    studentId: doc.studentId ?? null,
    lessonSlug: doc.lessonSlug ?? null,
    classId: doc.classId ?? null,
    teacherId: doc.teacherId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    status: doc.status ?? 'locked',
    formativeAttempts: doc.formativeAttempts ?? null,
    summativeScore: doc.summativeScore ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * Lookup helpers
 * ------------------------------------------------------------------ */

export async function findAdminByUsername(db, username) {
  const result = await db.query({
    admins: {
      $: {
        where: { username },
        limit: 1,
      },
    },
  });
  return sanitizeAdmin(result?.admins?.[0]);
}

export async function findTeacherByUsername(db, username) {
  const result = await db.query({
    teachers: {
      $: {
        where: { username },
        limit: 1,
      },
    },
  });
  return sanitizeTeacher(result?.teachers?.[0]);
}

export async function findStudentByUsername(db, username) {
  const result = await db.query({
    students: {
      $: {
        where: { username },
        limit: 1,
      },
    },
  });
  return sanitizeStudent(result?.students?.[0]);
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

export async function createAdmin(db, { username, password, firstName, lastName, displayName }) {
  const adminId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.admins[adminId].update({
      username,
      password,
      firstName,
      lastName,
      displayName,
      createdAt,
    }),
  ]);

  return {
    id: adminId,
    username,
    firstName,
    lastName,
    displayName,
    createdAt,
  };
}

export async function createTeacher(db, { username, password, firstName, lastName, displayName }) {
  const teacherId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.teachers[teacherId].update({
      username,
      password,
      firstName,
      lastName,
      displayName,
      createdAt,
    }),
  ]);

  return {
    id: teacherId,
    username,
    firstName,
    lastName,
    displayName,
    createdAt,
  };
}

export async function archiveTeacher(db, teacherId) {
  const archivedAt = new Date().toISOString();
  await db.transact([
    tx.teachers[teacherId].update({
      archivedAt,
    }),
  ]);
  return archivedAt;
}

export async function createClass(db, { className, description, teacherId, teacherUsername, yearGroup }) {
  const classId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.classes[classId].update({
      className,
      description: description || null,
      teacherId,
      teacherUsername,
      yearGroup: yearGroup || null,
      createdAt,
    }),
  ]);

  return {
    id: classId,
    className,
    description: description || null,
    teacherId,
    teacherUsername,
    yearGroup: yearGroup || null,
    createdAt,
  };
}

export async function updateClassYearGroup(db, classId, yearGroup) {
  await db.transact([
    tx.classes[classId].update({
      yearGroup: yearGroup || null,
    }),
  ]);
}

export async function archiveClass(db, classId) {
  const archivedAt = new Date().toISOString();
  await db.transact([
    tx.classes[classId].update({
      archivedAt,
    }),
  ]);
  return archivedAt;
}

const TRACKS = manifest?.tracks ?? {};
const TRACK_KEYS = Object.keys(TRACKS);
const DEFAULT_TRACK = 'igcse';

function normalizeTrackInput(programme) {
  const raw = String(programme ?? '').trim().toLowerCase();
  if (!raw) return null;
  if (TRACKS[raw]) return raw;

  const collapsed = raw.replace(/[^a-z0-9]/g, '');
  for (const key of TRACK_KEYS) {
    const collapsedKey = key.replace(/[^a-z0-9]/g, '');
    if (collapsed === collapsedKey) {
      return key;
    }
  }

  if (collapsed.startsWith('keystage3') || collapsed === 'middleyears') return 'ks3';
  if (collapsed.includes('igcse')) return 'igcse';
  if (collapsed.includes('standardlevel') || collapsed === 'sl') return 'ib-sl';
  if (collapsed.includes('higherlevel') || collapsed === 'hl') return 'ib-hl';

  return null;
}

function resolveTrack({ programme, yearGroup }) {
  const normalized = normalizeTrackInput(programme);
  if (normalized) {
    return normalized;
  }
  const numeric = Number(String(yearGroup ?? '').replace(/\D/g, ''));
  if (Number.isFinite(numeric)) {
    if (numeric >= 12) return 'ib-hl';
    if (numeric >= 10) return 'igcse';
    return 'ks3';
  }
  return DEFAULT_TRACK;
}

function getDefaultLessonsForTrack(track) {
  return TRACKS[track]?.defaultLessons ?? TRACKS[DEFAULT_TRACK]?.defaultLessons ?? [];
}

export async function createStudent(
  db,
  { username, password, firstName, lastName, classId, teacherId, teacherUsername, yearGroup, programme },
) {
  const studentId = id();
  const createdAt = new Date().toISOString();
  const track = resolveTrack({ programme, yearGroup });
  const defaultLessons = getDefaultLessonsForTrack(track);
  const initialStage = defaultLessons.length > 0 ? defaultLessons[0] : 'A1.1.1';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || username || 'Student';

  await db.transact([
    tx.students[studentId].update({
      username: username || null,
      password,
      firstName,
      lastName,
      displayName,
      yearGroup: yearGroup || null,
      curriculumTrack: track,
      classId,
      teacherId,
      teacherUsername,
      activeStage: initialStage,
      status: 'active',
      createdAt,
    }),
    ...defaultLessons.map((lessonId) =>
      tx.studentUnlocks[id()].update({
        studentId,
        classId,
        teacherId,
        teacherUsername,
        stageKey: lessonId,
        unlockedBy: teacherUsername ?? 'system',
        unlockedAt: createdAt,
        scope: 'lesson',
      }),
    ),
  ]);

  return {
    id: studentId,
    username: username || null,
    firstName,
    lastName,
    displayName,
    yearGroup: yearGroup || null,
    curriculumTrack: track,
    classId,
    teacherId,
    teacherUsername,
    activeStage: initialStage,
    status: 'active',
    createdAt,
  };
}

export async function archiveStudent(db, studentId) {
  const archivedAt = new Date().toISOString();
  await db.transact([
    tx.students[studentId].update({
      status: 'archived',
      archivedAt,
    }),
  ]);
  return archivedAt;
}

export async function setStudentActiveStage(db, studentId, stageKey) {
  await db.transact([
    tx.students[studentId].update({
      activeStage: stageKey,
    }),
  ]);
}

export async function bulkCreateStudents(db, students) {
  const now = new Date().toISOString();
  const mutations = [];
  const created = [];

  for (const student of students) {
    const studentId = id();
    const track = resolveTrack({ programme: student.programme, yearGroup: student.yearGroup });
    const defaultLessons = getDefaultLessonsForTrack(track);
    const initialStage = defaultLessons.length > 0 ? defaultLessons[0] : 'A1.1.1';
    const displayName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username || 'Student';

    mutations.push(
      tx.students[studentId].update({
        username: student.username || null,
        password: student.password,
        firstName: student.firstName,
        lastName: student.lastName,
        displayName,
        yearGroup: student.yearGroup || null,
        curriculumTrack: track,
        classId: student.classId,
        teacherId: student.teacherId,
        teacherUsername: student.teacherUsername,
        activeStage: initialStage,
        status: 'active',
        createdAt: now,
      }),
      ...defaultLessons.map((lessonId) =>
        tx.studentUnlocks[id()].update({
          studentId,
          classId: student.classId,
          teacherId: student.teacherId,
          teacherUsername: student.teacherUsername,
          stageKey: lessonId,
          unlockedBy: student.teacherUsername ?? 'system',
          unlockedAt: now,
          scope: 'lesson',
        }),
      ),
    );

    created.push({
      id: studentId,
      username: student.username || null,
      firstName: student.firstName,
      lastName: student.lastName,
      displayName,
      yearGroup: student.yearGroup || null,
      curriculumTrack: track,
      classId: student.classId,
      teacherId: student.teacherId,
      teacherUsername: student.teacherUsername,
      activeStage: initialStage,
      status: 'active',
      createdAt: now,
    });
  }

  if (mutations.length > 0) {
    await db.transact(mutations);
  }

  return created;
}

export async function createClassUnlock(db, { classId, stageKey, unlockedBy, teacherId, teacherUsername }) {
  const unlockId = id();
  const unlockedAt = new Date().toISOString();

  await db.transact([
    tx.classUnlocks[unlockId].update({
      classId,
      teacherId,
      teacherUsername,
      stageKey,
      unlockedBy,
      unlockedAt,
    }),
  ]);

  return {
    id: unlockId,
    classId,
    stageKey,
    teacherId,
    teacherUsername,
    unlockedAt,
  };
}

export async function createStudentUnlock(
  db,
  { studentId, classId, teacherId, teacherUsername, stageKey, unlockedBy, scope = 'stage', targetId = null },
) {
  const unlockId = id();
  const unlockedAt = new Date().toISOString();

  await db.transact([
    tx.studentUnlocks[unlockId].update({
      studentId,
      classId,
      teacherId,
      teacherUsername,
      stageKey,
      unlockedBy,
      unlockedAt,
      scope,
      targetId,
    }),
  ]);

  return {
    id: unlockId,
    studentId,
    classId,
    teacherId,
    teacherUsername,
    stageKey,
    unlockedBy,
    unlockedAt,
    scope,
    targetId,
  };
}

export async function setStudentProgress(
  db,
  { studentId, classId, teacherId, teacherUsername, lessonSlug, status, formativeAttempts, summativeScore },
) {
  const recordId = id();
  const updatedAt = new Date().toISOString();

  await db.transact([
    tx.studentProgress[recordId].update({
      studentId,
      lessonSlug,
      classId,
      teacherId,
      teacherUsername,
      status,
      formativeAttempts: typeof formativeAttempts === 'number' ? formativeAttempts : null,
      summativeScore: typeof summativeScore === 'number' ? summativeScore : null,
      updatedAt,
    }),
  ]);

  return {
    id: recordId,
    studentId,
    classId,
    teacherId,
    teacherUsername,
    lessonSlug,
    status,
    formativeAttempts: typeof formativeAttempts === 'number' ? formativeAttempts : null,
    summativeScore: typeof summativeScore === 'number' ? summativeScore : null,
    updatedAt,
  };
}

/* ------------------------------------------------------------------ *
 * Aggregations
 * ------------------------------------------------------------------ */

export async function listTeachers(db, { includeArchived = false } = {}) {
  const where = includeArchived ? {} : { archivedAt: null };
  const result = await db.query({
    teachers: {
      $: {
        where,
      },
    },
  });
  return (result?.teachers ?? []).map(sanitizeTeacher);
}

export async function getTeacherDashboardData(db, { teacherId, username }) {
  const classesResult = await db.query({
    classes: {
      $: {
        where: { teacherUsername: username },
      },
    },
    students: {
      $: {
        where: { teacherUsername: username },
      },
    },
    classUnlocks: {
      $: {
        where: { teacherUsername: username },
      },
    },
    studentUnlocks: {
      $: {
        where: { teacherUsername: username },
      },
    },
    studentProgress: {
      $: {
        where: { teacherUsername: username },
      },
    },
  });

  const classes = (classesResult?.classes ?? []).map(sanitizeClass).filter((item) => !item.archivedAt);
  const students = (classesResult?.students ?? []).map(sanitizeStudent);

  const classUnlocks = (classesResult?.classUnlocks ?? []).map(sanitizeClassUnlock);
  const studentUnlocks = (classesResult?.studentUnlocks ?? []).map(sanitizeStudentUnlock);
  const progress = (classesResult?.studentProgress ?? []).map(sanitizeStudentProgress);

  return {
    classes,
    students,
    classUnlocks,
    studentUnlocks,
    progress,
  };
}

export async function getStudentDashboardData(db, username) {
  const studentResult = await db.query({
    students: {
      $: {
        where: { username },
        limit: 1,
      },
    },
  });

  const student = sanitizeStudent(studentResult?.students?.[0]);
  if (!student || student.status === 'archived') {
    return { student: null, class: null, unlocks: [], progress: [] };
  }

  const [classResult, unlocksResult, progressResult] = await Promise.all([
    db.query({
      classes: {
        $: {
          where: { id: student.classId },
          limit: 1,
        },
      },
    }),
    db.query({
      studentUnlocks: {
        $: {
          where: { studentId: student.id },
        },
      },
    }),
    db.query({
      studentProgress: {
        $: {
          where: { studentId: student.id },
        },
      },
    }),
  ]);

  const classDoc = sanitizeClass(classResult?.classes?.[0]);
  const unlocks = (unlocksResult?.studentUnlocks ?? []).map(sanitizeStudentUnlock);
  const progress = (progressResult?.studentProgress ?? []).map(sanitizeStudentProgress);

  return {
    student,
    class: classDoc,
    unlocks,
    progress,
  };
}
