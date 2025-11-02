# InstantDB Schema Management Guide

## Quick Start

To push schema changes to InstantDB:

```bash
./push-schema.sh
```

To seed the initial teacher account without touching the worker manually:

```bash
node worker/seed-teacher.js
```

The script reads `instant.config.json`, uses the InstantDB Admin SDK directly, and only asks for the teacher credentials you want to create.

## What You Need

Your project is already configured with:

1. **instant.schema.ts** - Your database schema definition
2. **instant.config.json** - Your app configuration with app_id and admin_token
3. **package.json** - With `@instantdb/react` dependency and `"type": "module"`

The Cloudflare Worker now uses the official `@instantdb/admin` SDK for all reads and writes, so the frontend and backend stay in sync automatically.

## How It Works

The `instant-cli` tool:
1. Reads your `instant.schema.ts` file
2. Compares it with your current database schema
3. Shows you a preview of changes
4. Applies the changes after confirmation

## Your Working Solution

You discovered that the CLI works when:
- ✅ You're in a directory with a proper `package.json`
- ✅ `@instantdb/react` is installed in `node_modules`
- ✅ `"type": "module"` is set in package.json
- ✅ `instant.config.json` exists with your app_id

## Common Issues & Solutions

### Error: "We couldn't find an Instant SDK"
**Solution**: Run `npm install` to install dependencies

### Error: "No app ID detected"
**Solution**: Use the `--app` flag or ensure `instant.config.json` exists

### Error: "We couldn't find your schema export"
**Solution**: Make sure your schema file has `export default schema`

## Your App Details

- **App ID**: `83df1c1d-6e07-47fa-845b-a147c33850c6`
- **Dashboard**: https://www.instantdb.com/dash

## Schema Structure

Your database has three entities:

1. **teachers** - Teacher accounts with username/password
2. **classes** - Classes linked to teachers
3. **students** - Students linked to classes and teachers

## Manual Commands

If you prefer to run commands directly:

```bash
# Login (one time)
npx instant-cli login

# Push schema
npx instant-cli push --app 83df1c1d-6e07-47fa-845b-a147c33850c6

# Pull current schema from server
npx instant-cli pull --app 83df1c1d-6e07-47fa-845b-a147c33850c6
```

## Editing the Schema

1. Edit `instant.schema.ts`
2. Run `./push-schema.sh`
3. Review the changes in the CLI prompt
4. Confirm to apply

Example schema change:

```typescript
students: i.entity({
  name: i.string(),
  username: i.string().optional().indexed(),
  password: i.string(),
  classId: i.string().indexed(),
  teacherUsername: i.string().indexed(),
  createdAt: i.string(),
  // Add a new field:
  email: i.string().optional(),
}),
```

