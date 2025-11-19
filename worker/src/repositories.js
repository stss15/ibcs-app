import bcrypt from 'bcryptjs';
import { generatePassword } from '../../shared/passwords.js';
import { id, tx } from './instant.js';

const BCRYPT_ROUNDS = 8;

function nowIso() {
  return new Date().toISOString();
}

function extractId(doc) {
  return doc?.id ?? doc?._id ?? null;
}

function normalizeUsername(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized || null;
}

function prepareUsername(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function formatTeacherUsername(sequenceNumber) {
  return `SGSD${sequenceNumber}`;
}

function formatClassCode(yearLevel, classNumber) {
  const yearDigits = (yearLevel || '').replace(/[^0-9]/g, '') || '0';
  const label = (classNumber || '1').toString().replace(/[^A-Za-z0-9]/g, '') || '1';
  return `Y${yearDigits}-${label}`.toUpperCase();
}

function formatClassLabel(yearLevel, classNumber) {
  const yearDigits = (yearLevel || 'Year 7').match(/\d+/);
  const year = yearDigits ? `Year ${yearDigits[0]}` : String(yearLevel || 'Year 7');
  return `${year} · Class ${classNumber ?? 1}`;
}

function formatStudentUsername(classCode, rosterNumber) {
  const padded = String(rosterNumber).padStart(2, '0');
  return `${classCode}-S${padded}`.toUpperCase();
}

function sanitizeTeacherView(teacher) {
  if (!teacher) return null;
  return {
    id: teacher.id,
    username: teacher.username,
    sequenceNumber: teacher.sequenceNumber,
    createdAt: teacher.createdAt,
    archivedAt: teacher.archivedAt ?? null,
    passwordPlain: teacher.passwordPlain ?? null,
  };
}

function sanitizeClassView(classDoc) {
  if (!classDoc) return null;
  return {
    id: classDoc.id,
    label: classDoc.label,
    code: classDoc.code,
    yearLevel: classDoc.yearLevel,
    classNumber: classDoc.classNumber,
    studentCount: classDoc.studentCount ?? 0,
    createdAt: classDoc.createdAt,
  };
}

function sanitizeStudentView(student) {
  if (!student) return null;
  return {
    id: student.id,
    classId: student.classId,
    username: student.username,
    rosterNumber: student.rosterNumber,
    password: student.passwordPlain ?? null,
    status: student.status,
    archivedAt: student.archivedAt ?? null,
    createdAt: student.createdAt,
  };
}

/* ------------------------------------------------------------------ */

export async function findAdminByUsername(db, username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const result = await db.query({
    admins: { $: { where: { usernameLower: normalized }, limit: 1 } },
  });
  const doc = result?.admins?.[0];
  if (!doc) return null;
  return { ...doc, passwordHash: doc.passwordHash, username: doc.username };
}

export async function findTeacherByUsername(db, username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const result = await db.query({
    teachers: { $: { where: { usernameLower: normalized }, limit: 1 } },
  });
  const doc = result?.teachers?.[0];
  if (!doc) return null;
  return {
    id: extractId(doc),
    username: doc.username,
    usernameLower: doc.usernameLower ?? normalized,
    sequenceNumber: doc.sequenceNumber ?? Number(doc.username?.replace(/\D/g, '')) || null,
    passwordHash: doc.passwordHash,
    passwordPlain: doc.passwordPlain ?? null,
    createdAt: doc.createdAt ?? null,
    archivedAt: doc.archivedAt ?? null,
  };
}

export async function listTeachers(db, { includeArchived = false } = {}) {
  const where = includeArchived ? {} : { archivedAt: null };
  const [teachersResult, classesResult, studentsResult] = await Promise.all([
    db.query({ teachers: { $: { where } } }),
    db.query({ classes: { $: { where: { archivedAt: null } } } }),
    db.query({ students: { $: { where: { archivedAt: null } } } }),
  ]);

  const classMap = new Map();
  for (const doc of classesResult?.classes ?? []) {
    const classRecord = sanitizeClassView({ id: extractId(doc), ...doc });
    if (!doc.teacherId) continue;
    const list = classMap.get(doc.teacherId) ?? [];
    list.push(classRecord);
    classMap.set(doc.teacherId, list);
  }

  const studentTotals = new Map();
  for (const doc of studentsResult?.students ?? []) {
    if (!doc.teacherId || doc.status === 'archived') continue;
    studentTotals.set(doc.teacherId, (studentTotals.get(doc.teacherId) ?? 0) + 1);
  }

  return (teachersResult?.teachers ?? []).map((doc) => {
    const teacher = findTeacherByDoc(doc);
    const totals = {
      classes: classMap.get(teacher.id)?.length ?? 0,
      students: studentTotals.get(teacher.id) ?? 0,
    };
    return {
      ...sanitizeTeacherView(teacher),
      totals,
    };
  });
}

function findTeacherByDoc(doc) {
  return {
    id: extractId(doc),
    username: doc.username,
    usernameLower: doc.usernameLower,
    sequenceNumber: doc.sequenceNumber,
    passwordHash: doc.passwordHash,
    passwordPlain: doc.passwordPlain,
    createdAt: doc.createdAt,
    archivedAt: doc.archivedAt ?? null,
  };
}

async function nextTeacherSequence(db) {
  const result = await db.query({ teachers: { $: { where: {} } } });
  const numbers = (result?.teachers ?? []).map((doc) => doc.sequenceNumber ?? Number(doc.username?.replace(/\D/g, '')) || 0);
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return max + 1;
}

export async function createTeacherAccount(db) {
  const sequenceNumber = await nextTeacherSequence(db);
  const username = formatTeacherUsername(sequenceNumber);
  const passwordPlain = generatePassword();
  const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_ROUNDS);
  const teacherId = id();
  const createdAt = nowIso();
  await db.transact([
    tx.teachers[teacherId].update({
      username,
      usernameLower: username.toLowerCase(),
      sequenceNumber,
      passwordHash,
      passwordPlain,
      createdAt,
      archivedAt: null,
    }),
  ]);
  return { id: teacherId, username, sequenceNumber, passwordPlain, createdAt };
}

export async function archiveTeacher(db, teacherId) {
  if (!teacherId) return null;
  const archivedAt = nowIso();
  await db.transact([
    tx.teachers[teacherId].update({ archivedAt }),
  ]);
  return archivedAt;
}

function ensurePositiveInteger(value, fallback = 1) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) return Math.floor(num);
  return fallback;
}

async function fetchClassById(db, classId) {
  if (!classId) return null;
  const result = await db.query({ classes: { $: { where: { id: classId }, limit: 1 } } });
  if (!result?.classes?.[0]) return null;
  return { id: extractId(result.classes[0]), ...result.classes[0] };
}

async function fetchStudentById(db, studentId) {
  if (!studentId) return null;
  const result = await db.query({ students: { $: { where: { id: studentId }, limit: 1 } } });
  if (!result?.students?.[0]) return null;
  return { id: extractId(result.students[0]), ...result.students[0] };
}

async function generateStudentRecords({ classId, teacher, classCode, startNumber, count }) {
  const students = [];
  const operations = [];
  const createdAt = nowIso();
  for (let offset = 0; offset < count; offset += 1) {
    const rosterNumber = startNumber + offset;
    const username = formatStudentUsername(classCode, rosterNumber);
    const passwordPlain = generatePassword();
    const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_ROUNDS);
    const studentId = id();
    operations.push(
      tx.students[studentId].update({
        classId,
        teacherId: teacher.id,
        teacherUsername: teacher.username,
        username,
        usernameLower: username.toLowerCase(),
        rosterNumber,
        passwordHash,
        passwordPlain,
        status: 'active',
        createdAt,
      }),
    );
    students.push(sanitizeStudentView({ id: studentId, classId, username, rosterNumber, passwordPlain, status: 'active', createdAt }));
  }
  return { operations, students };
}

export async function createClassWithRoster(db, teacher, { yearLevel, classNumber, studentCount = 0 }) {
  const normalizedCount = ensurePositiveInteger(studentCount, 0);
  const classId = id();
  const createdAt = nowIso();
  const code = formatClassCode(yearLevel, classNumber);
  const label = formatClassLabel(yearLevel, classNumber);
  const nextStudentNumber = normalizedCount + 1;

  const ops = [
    tx.classes[classId].update({
      teacherId: teacher.id,
      teacherUsername: teacher.username,
      label,
      code,
      yearLevel,
      classNumber,
      studentCount: normalizedCount,
      nextStudentNumber,
      createdAt,
      archivedAt: null,
    }),
  ];

  let roster = [];
  if (normalizedCount > 0) {
    const { operations, students } = await generateStudentRecords({
      classId,
      teacher,
      classCode: code,
      startNumber: 1,
      count: normalizedCount,
    });
    ops.push(...operations);
    roster = students;
  }

  await db.transact(ops);
  return { ...sanitizeClassView({ id: classId, teacherId: teacher.id, label, code, yearLevel, classNumber, studentCount: normalizedCount, createdAt }), students: roster };
}

export async function appendStudentsToClass(db, teacher, { classId, count }) {
  const classRecord = await fetchClassById(db, classId);
  if (!classRecord || classRecord.teacherId !== teacher.id) {
    throw new Error('Class not found');
  }
  const increment = ensurePositiveInteger(count, 1);
  const startNumber = (classRecord.nextStudentNumber ?? classRecord.studentCount ?? 0) + 1;
  const { operations, students } = await generateStudentRecords({
    classId,
    teacher,
    classCode: classRecord.code,
    startNumber,
    count: increment,
  });

  await db.transact([
    tx.classes[classId].update({
      studentCount: (classRecord.studentCount ?? 0) + increment,
      nextStudentNumber: startNumber + increment,
    }),
    ...operations,
  ]);

  return { classId, students };
}

async function loadClassRoster(db, classId) {
  const result = await db.query({ students: { $: { where: { classId, status: 'active', archivedAt: null } } } });
  return (result?.students ?? []).map((doc) => sanitizeStudentView({ id: extractId(doc), ...doc }));
}

export async function getTeacherDashboardData(db, teacher) {
  const classesResult = await db.query({ classes: { $: { where: { teacherId: teacher.id, archivedAt: null } } } });
  const classes = [];
  for (const doc of classesResult?.classes ?? []) {
    const classRecord = sanitizeClassView({ id: extractId(doc), ...doc });
    const roster = await loadClassRoster(db, classRecord.id);
    classes.push({ ...classRecord, students: roster });
  }
  return { teacher: sanitizeTeacherView(teacher), classes };
}

export async function archiveStudent(db, teacher, studentId) {
  if (!studentId) throw new Error('Student ID required');
  const student = await fetchStudentById(db, studentId);
  if (!student || student.teacherId !== teacher.id) {
    throw new Error('Student not found');
  }
  const classRecord = await fetchClassById(db, student.classId);
  const operations = [
    tx.students[studentId].update({
      status: 'archived',
      archivedAt: nowIso(),
    }),
  ];
  if (classRecord) {
    const newCount = Math.max((classRecord.studentCount ?? 0) - 1, 0);
    operations.push(tx.classes[classRecord.id].update({ studentCount: newCount }));
  }
  await db.transact(operations);
  return sanitizeStudentView({ ...student, status: 'archived', archivedAt: nowIso() });
}
