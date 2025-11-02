import { id, tx } from './instant.js';

function sanitizeTeacher(doc) {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id ?? null,
    username: doc.username,
    displayName: doc.displayName ?? doc.username ?? null,
    createdAt: doc.createdAt ?? null,
    password: doc.password,
  };
}

function sanitizeClass(doc) {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id ?? null,
    className: doc.className ?? '',
    description: doc.description ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    createdAt: doc.createdAt ?? null,
  };
}

function sanitizeStudent(doc) {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id ?? null,
    name: doc.name ?? '',
    username: doc.username ?? null,
    classId: doc.classId ?? null,
    teacherUsername: doc.teacherUsername ?? null,
    createdAt: doc.createdAt ?? null,
    password: doc.password,
  };
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

export async function createTeacher(db, { username, password, displayName }) {
  const teacherId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.teachers[teacherId].update({
      username,
      password,
      displayName,
      createdAt,
    }),
  ]);

  return {
    id: teacherId,
    username,
    displayName,
    createdAt,
  };
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

export async function createClass(db, { className, description, teacherUsername }) {
  const classId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.classes[classId].update({
      className,
      description: description || null,
      teacherUsername,
      createdAt,
    }),
  ]);

  return {
    id: classId,
    className,
    description: description || null,
    teacherUsername,
    createdAt,
  };
}

export async function createStudent(db, { name, username, password, classId, teacherUsername }) {
  const studentId = id();
  const createdAt = new Date().toISOString();

  await db.transact([
    tx.students[studentId].update({
      name,
      username: username || null,
      password,
      classId,
      teacherUsername,
      createdAt,
    }),
  ]);

  return {
    id: studentId,
    name,
    username: username || null,
    classId,
    teacherUsername,
    createdAt,
  };
}

export async function getTeacherDashboardData(db, username) {
  const result = await db.query({
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
  });

  const classes = (result?.classes ?? []).map(sanitizeClass);
  const students = (result?.students ?? []).map(sanitizeStudent);

  return {
    classes,
    students,
  };
}

export async function getStudentDashboardData(db, username) {
  const result = await db.query({
    students: {
      $: {
        where: { username },
        limit: 1,
      },
    },
  });

  const student = sanitizeStudent(result?.students?.[0]);
  if (!student) {
    return { student: null, class: null };
  }

  const classes = await db.query({
    classes: {
      $: {
        where: { id: student.classId },
        limit: 1,
      },
    },
  });

  const classDoc = sanitizeClass(classes?.classes?.[0]);

  return {
    student,
    class: classDoc,
  };
}
