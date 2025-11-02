# 🏗️ IBCS App Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     (http://localhost:5173)                  │
│                  or (https://stss15.github.io)               │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             │ ① Login Request             │ ② Direct Data Access
             │                              │
             ▼                              ▼
┌─────────────────────────┐    ┌──────────────────────────────┐
│   Cloudflare Worker     │    │       InstantDB API          │
│  (Authentication API)   │    │   (Database Operations)      │
│                         │    │                               │
│  ibcs-auth.workers.dev  │    │  api.instantdb.com           │
└────────────┬────────────┘    └──────────────┬───────────────┘
             │                                 │
             │ ③ Verify & Create Session      │
             │                                 │
             └─────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │    InstantDB         │
                │    Database          │
                │                      │
                │  Collections:        │
                │  - teachers          │
                │  - students          │
                │  - classes           │
                └──────────────────────┘
```

## Component Details

### 1. Frontend (React App)

**Location**: `/frontend/src/`

**Purpose**: User interface for teachers and students

**Key Files**:
- `App.jsx` - Main app component with routing
- `pages/LoginPage.jsx` - Login interface
- `pages/TeacherDashboardPage.jsx` - Teacher dashboard
- `pages/StudentDashboardPage.jsx` - Student dashboard
- `lib/instant.js` - InstantDB client functions

**Configuration**:
- `frontend/public/app-config.json` - Contains InstantDB credentials
- Talks directly to InstantDB for data operations
- Uses Cloudflare Worker for authentication only

### 2. Cloudflare Worker (Authentication API)

**Location**: `/worker/`

**Purpose**: Handle authentication, password hashing, and protected operations

**Key File**: `worker.js`

**Endpoints**:
```
POST /auth/login        - Login with username/password
POST /auth/verify       - Verify JWT token
GET  /teacher/dashboard - Get teacher's data (protected)
POST /teacher/classes   - Create class (protected)
POST /teacher/students  - Create student (protected)
POST /setup/seed        - Seed initial teacher
```

**Environment Variables** (set via `wrangler secret`):
- `INSTANT_APP_ID` - Your InstantDB app ID
- `INSTANT_ADMIN_TOKEN` - Your InstantDB admin token
- `TOKEN_SECRET` - Secret for JWT signing
- `SEED_KEY` - Secret for seeding initial data

**Dependencies**:
- `bcryptjs` - Password hashing

### 3. InstantDB (Database)

**Location**: Cloud-hosted at instantdb.com

**Purpose**: Store all app data

**Collections**:

#### `teachers`
```json
{
  "id": "unique-id",
  "username": "MrStewart",
  "password": "bcrypt-hashed-password",
  "displayName": "Mr. Stewart",
  "createdAt": "2024-11-02T..."
}
```

#### `students`
```json
{
  "id": "unique-id",
  "name": "John Doe",
  "username": "john.doe",
  "password": "bcrypt-hashed-password",
  "classId": "class-id",
  "teacherUsername": "MrStewart",
  "createdAt": "2024-11-02T..."
}
```

#### `classes`
```json
{
  "id": "unique-id",
  "className": "Year 12 Computer Science",
  "description": "IB Computer Science course",
  "teacherUsername": "MrStewart",
  "createdAt": "2024-11-02T..."
}
```

## Data Flow

### Login Flow (Teacher)

```
1. User enters credentials in LoginPage
   ↓
2. Frontend calls worker: POST /auth/login
   {
     "username": "MrStewart",
     "password": "secret",
     "role": "teacher"
   }
   ↓
3. Worker queries InstantDB for teacher
   ↓
4. Worker verifies password with bcrypt
   ↓
5. Worker generates JWT token
   ↓
6. Worker returns token to frontend
   {
     "token": "eyJhbGc..."
   }
   ↓
7. Frontend stores session in localStorage
   ↓
8. Frontend redirects to dashboard
```

### Data Access Flow

```
1. Frontend needs to display classes
   ↓
2. Frontend calls InstantDB directly
   instant.list("classes")
   ↓
3. InstantDB returns all classes
   ↓
4. Frontend filters classes by teacherUsername
   ↓
5. Frontend displays classes in UI
```

### Protected Operation Flow (Create Student)

```
1. Teacher creates student in dashboard
   ↓
2. Frontend calls worker: POST /teacher/students
   Headers: { Authorization: "Bearer <token>" }
   Body: { classId, studentName, username, password }
   ↓
3. Worker verifies JWT token
   ↓
4. Worker checks teacher owns the class
   ↓
5. Worker hashes password with bcrypt
   ↓
6. Worker creates student in InstantDB
   ↓
7. Worker returns created student
   ↓
8. Frontend updates UI
```

## Security Model

### Password Security
- Passwords hashed with bcrypt (8 rounds)
- Only hashed passwords stored in database
- Worker handles all password operations

### Authentication
- JWT tokens for session management
- 8-hour token expiration
- Token includes: username, role, issued/expiry time

### Authorization
- Teacher endpoints require valid JWT
- Teachers can only access their own classes
- Students filtered by class ownership

### CORS
- Worker enforces CORS policy
- Allowed origins configured in `wrangler.toml`
- Credentials allowed for authenticated requests

## Deployment Architecture

### Development
```
Frontend: http://localhost:5173 (Vite dev server)
Worker: Not deployed (or test deployment)
Database: Production InstantDB instance
```

### Production
```
Frontend: https://stss15.github.io/ibcs-app (GitHub Pages)
Worker: https://ibcs-auth.YOUR-NAME.workers.dev (Cloudflare)
Database: Production InstantDB instance
```

## Configuration Files

### Frontend
- `frontend/package.json` - Dependencies and scripts
- `frontend/vite.config.js` - Vite configuration
- `frontend/public/app-config.json` - InstantDB credentials
- `frontend/dist/app-config.json` - Built app config

### Worker
- `worker/package.json` - Dependencies and scripts
- `worker/wrangler.toml` - Cloudflare Worker configuration
- `worker/.env` - Not used (secrets in Cloudflare)

## Technology Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **InstantDB SDK** - Database client (via fetch API)

### Worker
- **Cloudflare Workers** - Serverless compute
- **bcryptjs** - Password hashing
- **Web Crypto API** - JWT signing/verification

### Database
- **InstantDB** - Serverless database
- **REST API** - Communication protocol

## Development Workflow

### Making Changes

1. **Frontend changes**:
   ```bash
   cd frontend
   npm run dev  # Start dev server
   # Make changes, hot reload works
   npm run build  # Build for production
   ```

2. **Worker changes**:
   ```bash
   cd worker
   # Edit worker.js
   npm run deploy  # Deploy to Cloudflare
   npm run tail  # View logs
   ```

3. **Database schema changes**:
   - InstantDB is schemaless
   - Just create documents with new fields
   - Update worker and frontend code as needed

## Monitoring and Debugging

### Frontend Debugging
- Browser console (F12)
- React DevTools
- Network tab for API calls

### Worker Debugging
```bash
cd worker
npm run tail  # Real-time logs
```

### Database Debugging
- InstantDB Dashboard: https://www.instantdb.com/dash
- View all documents
- Check API usage

## Scaling Considerations

### Current Limits
- InstantDB: Free tier limits
- Cloudflare Workers: 100,000 requests/day (free)
- GitHub Pages: Unlimited static hosting

### If You Need to Scale
1. Upgrade InstantDB plan
2. Upgrade Cloudflare Workers plan
3. Add caching (Cloudflare KV)
4. Add rate limiting
5. Optimize database queries

## Backup Strategy

### Data Backup
- InstantDB handles database backups
- Export data via InstantDB dashboard
- Consider periodic exports to JSON

### Code Backup
- All code in Git
- Push regularly to GitHub
- Tag releases for easy rollback

## Further Reading

- **InstantDB Docs**: https://www.instantdb.com/docs
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **React Router Docs**: https://reactrouter.com/
- **Vite Docs**: https://vitejs.dev/

