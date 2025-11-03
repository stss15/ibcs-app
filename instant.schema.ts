// IBCS App Schema for InstantDB
import { i } from '@instantdb/react';

const _schema = i.graph(
  {
    admins: i.entity({
      username: i.string().unique().indexed(),
      usernameLower: i.string().optional().unique().indexed(),
      password: i.string(),
      firstName: i.string(),
      lastName: i.string(),
      displayName: i.string(),
      createdAt: i.string(),
    }),
    teachers: i.entity({
      username: i.string().unique().indexed(),
      usernameLower: i.string().optional().unique().indexed(),
      password: i.string(),
      firstName: i.string(),
      lastName: i.string(),
      displayName: i.string(),
      createdAt: i.string(),
      archivedAt: i.string().optional(),
    }),
    classes: i.entity({
      className: i.string(),
      description: i.string().optional(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      yearGroup: i.string().optional(),
      createdAt: i.string(),
      archivedAt: i.string().optional(),
    }),
    students: i.entity({
      username: i.string().optional().indexed(),
      usernameLower: i.string().optional().unique().indexed(),
      password: i.string(),
      firstName: i.string(),
      lastName: i.string(),
      displayName: i.string(),
      yearGroup: i.string(),
      curriculumTrack: i.string(),
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      activeStage: i.string(),
      status: i.string(),
      archivedAt: i.string().optional(),
      createdAt: i.string(),
    }),
    classUnlocks: i.entity({
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      stageKey: i.string(),
      unlockedBy: i.string(),
      unlockedAt: i.string(),
    }),
    studentUnlocks: i.entity({
      studentId: i.string().indexed(),
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      stageKey: i.string(),
      unlockedBy: i.string(),
      unlockedAt: i.string(),
      scope: i.string(),
      targetId: i.string().optional(),
    }),
    lessons: i.entity({
      slug: i.string().unique().indexed(),
      title: i.string(),
      stageKey: i.string(),
      order: i.number(),
      createdAt: i.string(),
      isActive: i.boolean().optional(),
    }),
    studentProgress: i.entity({
      studentId: i.string().indexed(),
      lessonSlug: i.string().indexed(),
      classId: i.string().indexed(),
      teacherId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      status: i.string(),
      formativeAttempts: i.number().optional(),
      summativeScore: i.number().optional(),
      updatedAt: i.string(),
    }),
  },
  {}
);

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
