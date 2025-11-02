# 📺 Visual Setup Guide

A simple, visual guide to setting up your IBCS app.

---

## 🎯 The Goal

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│              │        │              │        │              │
│  InstantDB   │◄───────│  Cloudflare  │◄───────│   React      │
│  Database    │        │   Worker     │        │  Frontend    │
│              │        │              │        │              │
└──────────────┘        └──────────────┘        └──────────────┘
      ▲                        ▲                        ▲
      │                        │                        │
   Stores data          Handles auth           User interface
```

**You need to create:**
1. ✅ InstantDB database
2. ✅ Cloudflare Worker (deploy)
3. ✅ Connect them together

---

## 📋 Step 1: Create InstantDB App

### What to do:
1. Open browser → https://www.instantdb.com/dash
2. Click the big **"Create New App"** button
3. Name it: `ibcs-app`
4. Click **Create**

### What you'll get:
```
┌────────────────────────────────────┐
│  Your New InstantDB App            │
├────────────────────────────────────┤
│                                    │
│  App ID:                           │
│  ┌──────────────────────────────┐ │
│  │ fa61cd0c-d77e-44e5-...       │ │  ← COPY THIS
│  └──────────────────────────────┘ │
│                                    │
│  Admin Token:                      │
│  ┌──────────────────────────────┐ │
│  │ c88b98ee-4a55-4d83-...       │ │  ← COPY THIS
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**💡 Tip**: Keep this browser tab open! You'll need these in Step 3.

---

## 🚀 Step 2: Run Setup Script

### Open Terminal:

```bash
cd /Users/StevenStewart/ibcs-app/worker
./setup.sh
```

### What happens:

```
┌─────────────────────────────────────────┐
│  Setup Script Running...                │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Checking Cloudflare login...        │
│  ✓ Asking for credentials...           │
│  ✓ Setting up secrets...                │
│  ✓ Deploying worker...                  │
│  ✓ Done!                                │
│                                         │
│  Your worker URL:                       │
│  https://ibcs-auth.YOUR-NAME.workers.dev│
│                                         │
└─────────────────────────────────────────┘
```

### The script will ask for:

```
1️⃣ INSTANT_APP_ID
   → Paste from InstantDB dashboard (Step 1)

2️⃣ INSTANT_ADMIN_TOKEN
   → Paste from InstantDB dashboard (Step 1)

3️⃣ SEED_KEY
   → Type any secret phrase (e.g., "my-secret-2024")
```

**💡 Tip**: The script generates TOKEN_SECRET automatically!

---

## ⚙️ Step 3: Update Frontend Config

### Edit this file:
```
/Users/StevenStewart/ibcs-app/frontend/public/app-config.json
```

### Change it to:
```json
{
  "APP_ID": "paste-your-app-id-here",
  "INSTANT_ADMIN_TOKEN": "paste-your-admin-token-here"
}
```

### Then copy to dist:
```bash
cp /Users/StevenStewart/ibcs-app/frontend/public/app-config.json \
   /Users/StevenStewart/ibcs-app/frontend/dist/app-config.json
```

---

## 👨‍🏫 Step 4: Create Teacher Account

### Run the seed script:

```bash
cd /Users/StevenStewart/ibcs-app/worker
node seed-teacher.js
```

### Fill in the prompts:

```
┌────────────────────────────────────────────┐
│  Seed Teacher Account                      │
├────────────────────────────────────────────┤
│                                            │
│  Worker URL:                               │
│  → https://ibcs-auth.YOUR-NAME.workers.dev │
│                                            │
│  Seed Key:                                 │
│  → (the same key from Step 2)              │
│                                            │
│  Username:                                 │
│  → MrStewart                               │
│                                            │
│  Password:                                 │
│  → (choose a strong password)              │
│                                            │
│  Display Name:                             │
│  → Mr. Stewart                             │
│                                            │
└────────────────────────────────────────────┘
```

**💡 Tip**: Remember this password! You'll use it to login.

---

## 🧪 Step 5: Test It!

### Start the app:

```bash
cd /Users/StevenStewart/ibcs-app/frontend
npm run dev
```

### You'll see:

```
┌────────────────────────────────────────┐
│                                        │
│  VITE v5.x.x  ready in 234 ms         │
│                                        │
│  ➜  Local:   http://localhost:5173    │ ← OPEN THIS
│                                        │
└────────────────────────────────────────┘
```

### Open browser → http://localhost:5173

### Login screen:

```
┌──────────────────────────────────────┐
│                                      │
│           Welcome Back               │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │ Teacher  │  │ Student  │         │
│  └──────────┘  └──────────┘         │
│        ▲                             │
│        └── Click here first         │
│                                      │
│  Username: [MrStewart        ]      │
│                                      │
│  Password: [••••••••••••     ]      │
│                                      │
│  ┌────────────────────────┐         │
│  │   Log in as Teacher    │         │
│  └────────────────────────┘         │
│                                      │
└──────────────────────────────────────┘
```

### If login works:

```
✅ SUCCESS!

You'll see the Teacher Dashboard with:
- Create Class button
- Your classes list
- Student roster

Everything is working! 🎉
```

---

## 🎊 You're Done!

### What you have now:

```
✓ InstantDB database (stores all data)
✓ Cloudflare Worker (handles authentication)
✓ React Frontend (user interface)
✓ Teacher account (you can login)
✓ Everything connected and working!
```

### Next steps:

```
1. Create your first class
2. Add students to the class
3. Test student login
4. Deploy to production (optional)
```

---

## 🆘 Troubleshooting Visual Guide

### ❌ Login fails

```
Problem                          Solution
┌──────────────┐                ┌──────────────┐
│ Wrong        │                │ Double-check │
│ credentials  │  ─────────────►│ username &   │
│              │                │ password     │
└──────────────┘                └──────────────┘

┌──────────────┐                ┌──────────────┐
│ Account not  │                │ Run seed     │
│ seeded       │  ─────────────►│ script again │
│              │                │              │
└──────────────┘                └──────────────┘

┌──────────────┐                ┌──────────────┐
│ Wrong config │                │ Check        │
│ in app-      │  ─────────────►│ app-config   │
│ config.json  │                │ .json        │
└──────────────┘                └──────────────┘
```

### ❌ Setup script fails

```
Error: "Not logged in"
↓
Solution:
$ npx wrangler login
$ ./setup.sh
```

### ❌ CORS errors

```
Error in browser console:
"Access-Control-Allow-Origin"
↓
Solution:
1. Edit worker/wrangler.toml
2. Add your URL to CORS_ALLOWED_ORIGINS
3. Redeploy: npm run deploy
```

---

## 📊 System Health Check

### Everything working? Check these:

```
┌─────────────────────────────────────────┐
│  Health Check                           │
├─────────────────────────────────────────┤
│                                         │
│  ☐ Can open http://localhost:5173      │
│  ☐ See login page                       │
│  ☐ Can select Teacher/Student           │
│  ☐ Can login as teacher                 │
│  ☐ See dashboard after login            │
│  ☐ Can create a class                   │
│  ☐ Can add a student                    │
│  ☐ Can logout and login as student      │
│  ☐ Student sees their class             │
│  ☐ Data persists after refresh          │
│                                         │
│  All checked? You're ready! ✅          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎓 Quick Reference

### Important URLs to Bookmark:

```
InstantDB Dashboard
→ https://www.instantdb.com/dash

Cloudflare Dashboard
→ https://dash.cloudflare.com

Your Worker URL
→ https://ibcs-auth.YOUR-NAME.workers.dev

Your App (local)
→ http://localhost:5173

Your App (production)
→ https://stss15.github.io/ibcs-app
```

### Important Commands:

```
Deploy worker:
$ cd worker && npm run deploy

View worker logs:
$ cd worker && npm run tail

Seed teacher:
$ cd worker && npm run seed

Run frontend:
$ cd frontend && npm run dev

Build frontend:
$ cd frontend && npm run build
```

---

## 📚 More Help

Need detailed instructions?
- **[START_HERE.md](START_HERE.md)** - Detailed setup guide
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Track progress
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How it all works

---

**Ready to begin? Go to Step 1!** 👆

