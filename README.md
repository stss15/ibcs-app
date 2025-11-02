# ibcs-app

IB Computer Science learning platform with authentication and database backend.

## Stack

- **Frontend**: React + Vite single-page app hosted on **GitHub Pages** (`https://stss15.github.io/ibcs-app/`)
- **Backend**: Cloudflare Worker for authentication and secure operations
- **Database**: InstantDB collections (`teachers`, `classes`, `students`)

## 🚀 Quick Setup

**Need to set up the database and worker? Start here:**

1. **[START_HERE.md](START_HERE.md)** - Begin here! Automated setup in 5 minutes
2. **[QUICK_START.md](QUICK_START.md)** - Complete step-by-step guide
3. **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Track your progress

**For developers:**

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How everything connects
- **[worker/README.md](worker/README.md)** - Worker-specific docs
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed technical guide

---

## Project structure

```
frontend/               # React + Vite SPA (login, dashboard, student view)
  src/lib/instant.js   # Thin InstantDB client (list/create/findOne)
  src/lib/hash.js      # SHA-256 hashing helper
  src/lib/bootstrap.js # Seeds the demo teacher (MrStewart) once
  src/hooks/useSession.js
  src/pages/           # LoginPage, TeacherDashboardPage, StudentDashboardPage, TopicPage
  src/components/Layout
  index.html           # CSP-enabled entrypoint for the SPA
public/app-config.json # APP_ID + dev admin token (downloaded at runtime)
src/pages/             # Legacy static pages now pointing to the SPA
src/styles/landing.css # Styling for the GitHub Pages landing splash
```

---

## Database Schema

InstantDB collections (schemaless, but recommended fields):

### teachers
- `username` (string, unique)
- `password` (string, bcrypt hash)
- `displayName` (string, optional)
- `createdAt` (ISO timestamp)

### classes
- `className` (string)
- `description` (string, optional)
- `teacherUsername` (string, links to teachers.username)
- `createdAt` (ISO timestamp)

### students
- `name` (string)
- `username` (string, optional but useful for student login)
- `password` (string, bcrypt hash)
- `classId` (string, InstantDB document id)
- `teacherUsername` (string)
- `createdAt` (ISO timestamp)

You'll create the initial teacher account during setup (see [START_HERE.md](START_HERE.md))

---

## Local Development

### First Time Setup

1. **Set up InstantDB and Cloudflare Worker** (required first time only):
   ```bash
   cd worker
   ./setup.sh
   ```
   See [START_HERE.md](START_HERE.md) for detailed instructions.

2. **Update frontend config** with your InstantDB credentials:
   Edit `frontend/public/app-config.json`

### Running the App

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
cd frontend
npm run build
```

Deploy the contents of `frontend/dist/` to GitHub Pages.

---

## Configuration

### Frontend Config

`frontend/public/app-config.json` contains your InstantDB credentials:

```json
{
  "APP_ID": "your-instantdb-app-id",
  "INSTANT_ADMIN_TOKEN": "your-instantdb-admin-token"
}
```

Get these credentials from: https://www.instantdb.com/dash

### Worker Config

The Cloudflare Worker requires these secrets (set via `npx wrangler secret put`):
- `INSTANT_APP_ID` - Your InstantDB app ID
- `INSTANT_ADMIN_TOKEN` - Your InstantDB admin token
- `TOKEN_SECRET` - Secret for JWT signing
- `SEED_KEY` - Secret for seeding initial data

See [worker/README.md](worker/README.md) for details.

---

## Application Flow

### Authentication Flow

1. **Login** (`LoginPage`)
   - User selects Teacher or Student role
   - Credentials sent to Cloudflare Worker
   - Worker verifies password (bcrypt) against InstantDB
   - Worker generates JWT token
   - Session stored in `localStorage`

2. **Protected Operations**
   - Creating classes and students goes through the Worker
   - Worker validates JWT and permissions
   - Worker hashes passwords with bcrypt
   - Worker writes to InstantDB

### Data Flow

1. **Teacher Dashboard** (`/dashboard`)
   - Lists classes where `teacherUsername` matches session
   - Create class via Worker: `POST /teacher/classes`
   - Add student via Worker: `POST /teacher/students`
   - Display roster filtered by class ID

2. **Student View** (`/student`)
   - Shows assigned class for logged-in student
   - Access to learning materials and progress

### Security

- Passwords hashed with bcrypt (8 rounds)
- JWT tokens for session management (8-hour expiry)
- Teacher operations require valid authentication
- CORS protection on Worker endpoints

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and flow charts.

---

## Security Considerations

### Current Setup
- ✅ Passwords hashed with bcrypt on the server
- ✅ JWT-based authentication
- ✅ Protected endpoints for sensitive operations
- ✅ CORS protection
- ⚠️ Admin token exposed in frontend config (required for direct InstantDB access)

### For Production
- Consider moving all data operations through Worker
- Implement rate limiting
- Add request logging and monitoring
- Set up proper environment separation (dev/staging/prod)
- Rotate tokens regularly
- Add email verification for new accounts

---

## Testing the App

### Local Testing

1. Complete setup (see [START_HERE.md](START_HERE.md))
2. Run frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Log in as Teacher with credentials you created
5. Create a class (e.g., "Year 12 Computer Science")
6. Add a student with username and password
7. Log out and log in as the student
8. Verify student can see their class

### Production Testing

1. Build: `cd frontend && npm run build`
2. Deploy to GitHub Pages
3. Visit `https://stss15.github.io/ibcs-app/`
4. Test login and functionality
5. Check browser console for any errors
6. Verify CORS settings allow your domain

## Troubleshooting

### Common Issues

**Login fails:**
- Check browser console for errors
- Verify `app-config.json` has correct credentials
- Ensure teacher account was seeded
- Check Worker logs: `cd worker && npm run tail`

**CORS errors:**
- Add your domain to `CORS_ALLOWED_ORIGINS` in `worker/wrangler.toml`
- Redeploy worker: `cd worker && npm run deploy`

**Database errors:**
- Verify InstantDB credentials are correct
- Check InstantDB dashboard for API limits
- Ensure InstantDB app is active

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting tips.

---

## Useful Commands

### Worker Commands
```bash
cd worker
npm run deploy      # Deploy worker to Cloudflare
npm run tail        # View live logs
npm run seed        # Seed initial teacher
npm run whoami      # Check Cloudflare login
```

### Frontend Commands
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Documentation

- **[START_HERE.md](START_HERE.md)** - Setup instructions (start here!)
- **[QUICK_START.md](QUICK_START.md)** - Step-by-step setup guide
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Track your progress
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and data flow
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed technical guide
- **[worker/README.md](worker/README.md)** - Worker documentation
- **[worker/DEPLOY.md](worker/DEPLOY.md)** - Deployment instructions

## Support

### Useful Links
- **InstantDB Dashboard**: https://www.instantdb.com/dash
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **InstantDB Docs**: https://www.instantdb.com/docs
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/

### Getting Help
1. Check the troubleshooting sections in the docs above
2. View Worker logs: `cd worker && npm run tail`
3. Check browser console for frontend errors
4. Verify configuration in `app-config.json` and `wrangler.toml`
