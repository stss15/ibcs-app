import { id, tx } from './instant.js';
import manifest from './manifest.js';
import { getYear7DefaultPointer } from '../../shared/liveDecks.js';

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

function sanitizeClassPacing(doc) {
  if (!doc) return null;
  const history = Array.isArray(doc.history) ? doc.history : [];
  const accessibleSlides = Array.isArray(doc.accessibleSlides) ? doc.accessibleSlides : null;
  return {
    id: extractId(doc),
    classId: doc.classId ?? null,
    track: doc.track ?? null,
    unitId: doc.unitId ?? doc.deckId ?? null,
    lessonId: doc.lessonId ?? doc.slideId ?? null,
    deckId: doc.deckId ?? doc.unitId ?? null,
    slideId: doc.slideId ?? doc.lessonId ?? null,
    sessionCode: doc.sessionCode ?? null,
    sessionStatus: doc.sessionStatus ?? null,
    sessionStartedAt: doc.sessionStartedAt ?? null,
    history,
    accessibleSlides,
    metadata: doc.metadata ?? null,
    updatedAt: doc.updatedAt ?? null,
    updatedBy: doc.updatedBy ?? null,
  };
}

function prepareUsername(value) {
  if (value === null || value === undefined) {
    return { username: null, usernameLower: null };
  }
  const raw = String(value).trim();
  if (!raw) {
    return { username: null, usernameLower: null };
  }
  return {
    username: raw,
    usernameLower: raw.toLowerCase(),
  };
}

async function ensureUsernameLower(db, collection, doc) {
  if (!doc) return null;
  if (doc.usernameLower) return doc;
  const { usernameLower } = prepareUsername(doc.username);
  if (!usernameLower) return doc;
  const targetId = extractId(doc);
  if (!targetId) return doc;
  try {
    await db.transact([
      tx[collection][targetId].update({
        usernameLower,
      }),
    ]);
    doc.usernameLower = usernameLower;
  } catch (error) {
    console.warn(`Failed to backfill ${collection} usernameLower for ${doc.username}`, error);
  }
  return doc;
}

/* ------------------------------------------------------------------ *
 * Lookup helpers
 * ------------------------------------------------------------------ */

export async function findAdminByUsername(db, username) {
  const { username: canonical, usernameLower } = prepareUsername(username);
  if (!canonical && !usernameLower) {
    return null;
  }

  if (usernameLower) {
    const byLower = await db.query({
      admins: {
        $: {
          where: { usernameLower },
          limit: 1,
        },
      },
    });
    if (byLower?.admins?.[0]) {
      const doc = await ensureUsernameLower(db, 'admins', byLower.admins[0]);
      return sanitizeAdmin(doc);
    }
  }

  if (canonical) {
    const result = await db.query({
      admins: {
        $: {
          where: { username: canonical },
          limit: 1,
        },
      },
    });
    if (result?.admins?.[0]) {
      const doc = await ensureUsernameLower(db, 'admins', result.admins[0]);
      return sanitizeAdmin(doc);
    }
  }

  return null;
}

export async function findTeacherByUsername(db, username) {
  const { username: canonical, usernameLower } = prepareUsername(username);
  if (!canonical && !usernameLower) {
    return null;
  }

  if (usernameLower) {
    const byLower = await db.query({
      teachers: {
        $: {
          where: { usernameLower },
          limit: 1,
        },
      },
    });
    if (byLower?.teachers?.[0]) {
      const doc = await ensureUsernameLower(db, 'teachers', byLower.teachers[0]);
      return sanitizeTeacher(doc);
    }
  }

  if (canonical) {
    const result = await db.query({
      teachers: {
        $: {
          where: { username: canonical },
          limit: 1,
        },
      },
    });
    if (result?.teachers?.[0]) {
      const doc = await ensureUsernameLower(db, 'teachers', result.teachers[0]);
      return sanitizeTeacher(doc);
    }
  }

  return null;
}

export async function findStudentByUsername(db, username) {
  const { username: canonical, usernameLower } = prepareUsername(username);
  if (!canonical && !usernameLower) {
    return null;
  }

  if (usernameLower) {
    const byLower = await db.query({
      students: {
        $: {
          where: { usernameLower },
          limit: 1,
        },
      },
    });
    if (byLower?.students?.[0]) {
      const doc = await ensureUsernameLower(db, 'students', byLower.students[0]);
      return sanitizeStudent(doc);
    }
  }

  if (canonical) {
    const result = await db.query({
      students: {
        $: {
          where: { username: canonical },
          limit: 1,
        },
      },
    });
    if (result?.students?.[0]) {
      const doc = await ensureUsernameLower(db, 'students', result.students[0]);
      return sanitizeStudent(doc);
    }
  }

  return null;
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

export async function createAdmin(db, { username, password, firstName, lastName, displayName }) {
  const adminId = id();
  const createdAt = new Date().toISOString();
  const { username: normalizedUsername, usernameLower } = prepareUsername(username);

  await db.transact([
    tx.admins[adminId].update({
      username: normalizedUsername,
      usernameLower,
      password,
      firstName,
      lastName,
      displayName,
      createdAt,
    }),
  ]);

  return {
    id: adminId,
    username: normalizedUsername,
    firstName,
    lastName,
    displayName,
    createdAt,
  };
}

export async function createTeacher(db, { username, password, firstName, lastName, displayName }) {
  const teacherId = id();
  const createdAt = new Date().toISOString();
  const { username: normalizedUsername, usernameLower } = prepareUsername(username);

  await db.transact([
    tx.teachers[teacherId].update({
      username: normalizedUsername,
      usernameLower,
      password,
      firstName,
      lastName,
      displayName,
      createdAt,
    }),
  ]);

  return {
    id: teacherId,
    username: normalizedUsername,
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

const YEAR7_TRACK_ID = 'ks3';
const YEAR7_DEFAULT_POINTER = getYear7DefaultPointer();
const YEAR7_DEFAULT_STAGE = YEAR7_DEFAULT_POINTER?.lessonId ?? null;

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
  if (track === YEAR7_TRACK_ID) {
    return YEAR7_DEFAULT_STAGE ? [YEAR7_DEFAULT_STAGE] : [];
  }
  return TRACKS[track]?.defaultLessons ?? TRACKS[DEFAULT_TRACK]?.defaultLessons ?? [];
}

function resolveInitialStage(track, defaultLessons) {
  if (defaultLessons.length > 0) {
    return defaultLessons[0];
  }
  if (track === YEAR7_TRACK_ID && YEAR7_DEFAULT_STAGE) {
    return YEAR7_DEFAULT_STAGE;
  }
  return 'A1.1.1';
}

export async function createStudent(
  db,
  { username, password, firstName, lastName, classId, teacherId, teacherUsername, yearGroup, programme },
) {
  const studentId = id();
  const createdAt = new Date().toISOString();
  const { username: normalizedUsername, usernameLower } = prepareUsername(username);
  const track = resolveTrack({ programme, yearGroup });
  const defaultLessons = getDefaultLessonsForTrack(track);
  const initialStage = resolveInitialStage(track, defaultLessons);
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || normalizedUsername || 'Student';

  await db.transact([
    tx.students[studentId].update({
      username: normalizedUsername,
      usernameLower,
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
    username: normalizedUsername,
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
    const initialStage = resolveInitialStage(track, defaultLessons);
    const { username: normalizedUsername, usernameLower } = prepareUsername(student.username);
    const displayName = [student.firstName, student.lastName].filter(Boolean).join(' ') || normalizedUsername || 'Student';

    mutations.push(
      tx.students[studentId].update({
        username: normalizedUsername,
        usernameLower,
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
      username: normalizedUsername,
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

export async function bulkUpdateStudentPasswords(db, updates) {
  if (!Array.isArray(updates) || updates.length === 0) {
    return;
  }

  const timestamp = new Date().toISOString();
  const mutations = [];

  for (const update of updates) {
    if (!update?.studentId || !update?.passwordHash) continue;
    mutations.push(
      tx.students[update.studentId].update({
        password: update.passwordHash,
        passwordResetAt: update.passwordResetAt ?? timestamp,
      }),
    );
  }

  if (mutations.length === 0) {
    return;
  }

  await db.transact(mutations);
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
  if (!studentId || !lessonSlug) {
    throw new Error('studentId and lessonSlug are required to record progress');
  }

  const queryResult = await db.query({
    studentProgress: {
      $: {
        where: { studentId, lessonSlug },
        limit: 1,
      },
    },
  });

  const existing = queryResult?.studentProgress?.[0] ?? null;
  const recordId = existing ? extractId(existing) : id();
  const updatedAt = new Date().toISOString();

  const resolvedClassId = classId ?? existing?.classId ?? null;
  const resolvedTeacherId = teacherId ?? existing?.teacherId ?? null;
  const resolvedTeacherUsername = teacherUsername ?? existing?.teacherUsername ?? null;
  const resolvedStatus = status ?? existing?.status ?? 'locked';
  const resolvedFormativeAttempts =
    typeof formativeAttempts === 'number'
      ? formativeAttempts
      : typeof existing?.formativeAttempts === 'number'
      ? existing.formativeAttempts
      : null;
  const resolvedSummativeScore =
    typeof summativeScore === 'number'
      ? summativeScore
      : typeof existing?.summativeScore === 'number'
      ? existing.summativeScore
      : null;

  await db.transact([
    tx.studentProgress[recordId].update({
      studentId,
      lessonSlug,
      classId: resolvedClassId,
      teacherId: resolvedTeacherId,
      teacherUsername: resolvedTeacherUsername,
      status: resolvedStatus,
      formativeAttempts: resolvedFormativeAttempts,
      summativeScore: resolvedSummativeScore,
      updatedAt,
    }),
  ]);

  return {
    id: recordId,
    studentId,
    classId: resolvedClassId,
    teacherId: resolvedTeacherId,
    teacherUsername: resolvedTeacherUsername,
    lessonSlug,
    status: resolvedStatus,
    formativeAttempts: resolvedFormativeAttempts,
    summativeScore: resolvedSummativeScore,
    updatedAt,
  };
}

export async function getStudentGamification(db, studentId) {
  const result = await db.query({
    studentGamification: {
      $: {
        where: { studentId },
        limit: 1,
      },
    },
  });

  const doc = result?.studentGamification?.[0];
  if (!doc) {
    return {
      studentId,
      xp: 0,
      level: 1,
      streak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      lastUpdated: null,
    };
  }

  return {
    studentId: doc.studentId ?? studentId,
    xp: typeof doc.xp === 'number' ? doc.xp : 0,
    level: typeof doc.level === 'number' ? doc.level : 1,
    streak: typeof doc.streak === 'number' ? doc.streak : 0,
    totalCorrect: typeof doc.totalCorrect === 'number' ? doc.totalCorrect : 0,
    totalAttempts: typeof doc.totalAttempts === 'number' ? doc.totalAttempts : 0,
    lastUpdated: doc.lastUpdated ?? null,
  };
}

export async function syncStudentGamification(db, studentId, gamificationData) {
  const lastUpdated = new Date().toISOString();
  const xp = typeof gamificationData.xp === 'number' ? gamificationData.xp : 0;
  const level = typeof gamificationData.level === 'number' ? gamificationData.level : 1;
  const streak = typeof gamificationData.streak === 'number' ? gamificationData.streak : 0;
  const totalCorrect = typeof gamificationData.totalCorrect === 'number' ? gamificationData.totalCorrect : 0;
  const totalAttempts = typeof gamificationData.totalAttempts === 'number' ? gamificationData.totalAttempts : 0;

  // Check if record exists
  const existing = await db.query({
    studentGamification: {
      $: {
        where: { studentId },
        limit: 1,
      },
    },
  });

  if (existing?.studentGamification?.[0]) {
    // Update existing record
    await db.transact([
      tx.studentGamification[existing.studentGamification[0].id].update({
        xp,
        level,
        streak,
        totalCorrect,
        totalAttempts,
        lastUpdated,
      }),
    ]);
  } else {
    // Create new record
    const recordId = id();
    await db.transact([
      tx.studentGamification[recordId].update({
        studentId,
        xp,
        level,
        streak,
        totalCorrect,
        totalAttempts,
        lastUpdated,
      }),
    ]);
  }

  return {
    studentId,
    xp,
    level,
    streak,
    totalCorrect,
    totalAttempts,
    lastUpdated,
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

  const pacingRecords = [];
  for (const classDoc of classes) {
    const pacingResult = await db.query({
      classPacing: {
        $: {
          where: { classId: classDoc.id },
          limit: 1,
        },
      },
    });
    if (pacingResult?.classPacing?.[0]) {
      pacingRecords.push(sanitizeClassPacing(pacingResult.classPacing[0]));
    }
  }

  return {
    classes,
    students,
    classUnlocks,
    studentUnlocks,
    progress,
    classPacing: pacingRecords,
  };
}

async function buildStudentDashboardPayload(db, student) {
  if (!student || student.status === 'archived') {
    return { student: null, class: null, unlocks: [], progress: [], gamification: null };
  }

  const [classResult, unlocksResult, progressResult, gamificationData] = await Promise.all([
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
    getStudentGamification(db, student.id),
  ]);

  const classDoc = sanitizeClass(classResult?.classes?.[0]);
  const unlocks = (unlocksResult?.studentUnlocks ?? []).map(sanitizeStudentUnlock);
  const progress = (progressResult?.studentProgress ?? []).map(sanitizeStudentProgress);

  const classPacing = await (async () => {
    if (!student?.classId) return null;
    const pacingResult = await db.query({
      classPacing: {
        $: {
          where: { classId: student.classId },
          limit: 1,
        },
      },
    });
    return sanitizeClassPacing(pacingResult?.classPacing?.[0]);
  })();

  return {
    student,
    class: classDoc,
    unlocks,
    progress,
    classPacing,
    gamification: gamificationData,
  };
}

export async function getStudentDashboardData(db, username) {
  const student = await findStudentByUsername(db, username);
  return buildStudentDashboardPayload(db, student);
}

export async function getStudentDashboardDataById(db, studentId) {
  if (!studentId) {
    return { student: null, class: null, unlocks: [], progress: [] };
  }
  const result = await db.query({
    students: {
      $: {
        where: { id: studentId },
        limit: 1,
      },
    },
  });
  const student = sanitizeStudent(result?.students?.[0]);
  return buildStudentDashboardPayload(db, student);
}

export async function getClassPacing(db, classId) {
  if (!classId) return null;
  const result = await db.query({
    classPacing: {
      $: {
        where: { classId },
        limit: 1,
      },
    },
  });
  return sanitizeClassPacing(result?.classPacing?.[0]);
}

export async function findClassPacingBySessionCode(db, sessionCode) {
  if (!sessionCode) return null;
  const result = await db.query({
    classPacing: {
      $: {
        where: { sessionCode },
        limit: 1,
      },
    },
  });
  return sanitizeClassPacing(result?.classPacing?.[0]);
}

export async function setClassPacing(
  db,
  {
    classId,
    track,
    unitId,
    lessonId,
    deckId,
    slideId,
    history,
    accessibleSlides,
    sessionCode,
    sessionStatus,
    sessionStartedAt,
    metadata,
    updatedBy,
  },
) {
  const resolvedDeckId = deckId ?? unitId;
  const resolvedSlideId = slideId ?? lessonId;
  if (!classId || !resolvedDeckId || !resolvedSlideId) {
    throw new Error('classId, deckId, and slideId are required to update pacing');
  }

  const updatedAt = new Date().toISOString();
  const historyArray = Array.isArray(history) ? history : [];
  const accessibleArray = Array.isArray(accessibleSlides) ? accessibleSlides : null;

  const payload = {
    classId,
    track: track ?? null,
    unitId: resolvedDeckId,
    lessonId: resolvedSlideId,
    deckId: resolvedDeckId,
    slideId: resolvedSlideId,
    history: historyArray,
    accessibleSlides: accessibleArray,
    sessionCode: sessionCode ?? null,
    sessionStatus: sessionStatus ?? null,
    sessionStartedAt: sessionStartedAt ?? null,
    metadata: metadata ?? null,
    updatedAt,
    updatedBy: updatedBy ?? null,
  };

  await db.transact([
    tx.classPacing[classId].update(payload),
  ]);

  return {
    id: classId,
    ...payload,
  };
}

export async function findClassById(db, classId) {
  if (!classId) return null;
  const result = await db.query({
    classes: {
      $: {
        where: { id: classId },
        limit: 1,
      },
    },
  });
  return sanitizeClass(result?.classes?.[0]);
}

export async function listStudentsByClass(db, classId) {
  if (!classId) return [];
  const result = await db.query({
    students: {
      $: {
        where: { classId },
      },
    },
  });

  return (result?.students ?? [])
    .map(sanitizeStudent)
    .filter((student) => student.status !== 'archived');
}

function sanitizeLiveAssessmentStatus(doc) {
  if (!doc) return null;
  return {
    id: extractId(doc),
    classId: doc.classId ?? null,
    unitId: doc.unitId ?? null,
    segmentId: doc.segmentId ?? null,
    studentId: doc.studentId ?? null,
    attempts: typeof doc.attempts === 'number' ? doc.attempts : 0,
    status: doc.status ?? 'in-progress',
    score: typeof doc.score === 'number' ? doc.score : null,
    lastUpdated: doc.lastUpdated ?? null,
  };
}

export async function upsertLiveAssessmentStatus(db, { classId, unitId, segmentId, studentId, attempts, status, score }) {
  if (!classId || !unitId || !segmentId || !studentId) {
    throw new Error('classId, unitId, segmentId, and studentId are required');
  }

  const now = new Date().toISOString();
  const attemptValue = Number.isFinite(Number(attempts)) && Number(attempts) >= 0 ? Number(attempts) : 0;
  const scoreValue = Number.isFinite(Number(score)) ? Number(score) : null;

  const existing = await db.query({
    liveAssessmentStatus: {
      $: {
        where: { classId, unitId, segmentId, studentId },
        limit: 1,
      },
    },
  });

  const updatedRecord = {
    classId,
    unitId,
    segmentId,
    studentId,
    attempts: attemptValue,
    status: status || 'in-progress',
    score: scoreValue,
    lastUpdated: now,
  };

  if (existing?.liveAssessmentStatus?.[0]) {
    const record = existing.liveAssessmentStatus[0];
    await db.transact([
      tx.liveAssessmentStatus[record.id].update(updatedRecord),
    ]);
    return sanitizeLiveAssessmentStatus({ ...record, ...updatedRecord, id: record.id });
  }

  const recordId = id();
  await db.transact([
    tx.liveAssessmentStatus[recordId].update({
      ...updatedRecord,
    }),
  ]);

  return sanitizeLiveAssessmentStatus({ id: recordId, ...updatedRecord });
}

export async function listLiveAssessmentStatus(db, { classId, unitId, segmentId }) {
  if (!classId || !unitId || !segmentId) return [];

  const result = await db.query({
    liveAssessmentStatus: {
      $: {
        where: { classId, unitId, segmentId },
      },
    },
  });

  return (result?.liveAssessmentStatus ?? []).map(sanitizeLiveAssessmentStatus);
}
