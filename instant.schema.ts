// IBCS App Schema for InstantDB
import { i } from '@instantdb/react';

const _schema = i.graph(
  {
    teachers: i.entity({
      username: i.string().unique().indexed(),
      password: i.string(),
      displayName: i.string().optional(),
      createdAt: i.string(),
    }),
    classes: i.entity({
      className: i.string(),
      description: i.string().optional(),
      teacherUsername: i.string().indexed(),
      createdAt: i.string(),
    }),
    students: i.entity({
      name: i.string(),
      username: i.string().optional().indexed(),
      password: i.string(),
      classId: i.string().indexed(),
      teacherUsername: i.string().indexed(),
      createdAt: i.string(),
    }),
  },
  {}
);

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
