// IBCS App Permissions for InstantDB
// This file defines who can read/write data in your database

export default {
  teachers: {
    allow: {
      create: "false", // Teachers are created through your Worker API
      update: "false",
      delete: "false",
    },
  },
  classes: {
    allow: {
      create: "false", // Classes are managed through your Worker API
      update: "false",
      delete: "false",
    },
  },
  students: {
    allow: {
      create: "false", // Students are managed through your Worker API
      update: "false",
      delete: "false",
    },
  },
};

