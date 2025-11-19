// Simplified InstantDB schema for the minimal IBCS control centre
import { i } from '@instantdb/react';

const _schema = i.graph(
  {
    admins: i.entity({
      username: i.string().unique().indexed(),
      usernameLower: i.string().unique().indexed(),
      passwordHash: i.string(),
      createdAt: i.string(),
    }),
    teachers: i.entity({
      username: i.string().unique().indexed(),
      usernameLower: i.string().unique().indexed(),
      sequenceNumber: i.number().unique().indexed(),
      passwordHash: i.string(),
      passwordPlain: i.string(),
      createdAt: i.string(),
      archivedAt: i.string().optional(),
    }),
    classes: i.entity({
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      label: i.string(),
      code: i.string().indexed(),
      yearLevel: i.string(),
      classNumber: i.number(),
      studentCount: i.number(),
      nextStudentNumber: i.number(),
      createdAt: i.string(),
      archivedAt: i.string().optional(),
    }),
    students: i.entity({
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      username: i.string().unique().indexed(),
      usernameLower: i.string().unique().indexed(),
      rosterNumber: i.number(),
      passwordHash: i.string(),
      passwordPlain: i.string(),
      status: i.string().indexed(),
      createdAt: i.string(),
      archivedAt: i.string().optional(),
    }),
    classUnlocks: i.entity({
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      contentKey: i.string(),
      unlockedAt: i.string(),
      unlockedBy: i.string(),
    }),
  },
  {},
);

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
