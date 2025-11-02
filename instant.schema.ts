// IBCS App Schema for InstantDB
// Docs: https://www.instantdb.com/docs/modeling-data
// Copy this entire file content and paste it in the InstantDB dashboard Schema editor

import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
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
  links: {},
  rooms: {}
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema }
export default schema;
