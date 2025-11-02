# 🎯 START HERE - Complete Setup Guide

You need to create both an **InstantDB database** and deploy a **Cloudflare Worker**. 

## 📋 What You'll Do

1. **Create InstantDB app** → Get your database credentials
2. **Deploy Cloudflare Worker** → Set up authentication API
3. **Update frontend config** → Connect everything together
4. **Create teacher account** → Your first login
5. **Test the app** → Make sure it works!

---

## 🎬 Let's Begin!

### Method 1: Automated Setup (Easiest!)

Just run this one command and follow the prompts:

```bash
cd /Users/StevenStewart/ibcs-app/worker
./setup.sh
```

This will handle everything automatically! ✨

### Method 2: Manual Setup (Step-by-step)

If you prefer to do each step manually, see: **QUICK_START.md**

---

## ⚡️ Automated Setup Details

When you run `./setup.sh`, here's what happens:

1. **Checks Cloudflare login** 
   - If not logged in, prompts you to login

2. **Asks for InstantDB credentials**
   - You'll need to create an app at https://www.instantdb.com/dash first
   - Then paste your App ID and Admin Token

3. **Sets up secrets**
   - Generates a secure JWT token secret
   - Asks you to set a seed key

4. **Deploys worker**
   - Uploads your code to Cloudflare
   - Gives you the worker URL

---

## 📝 Step-by-Step if Using Automated Setup

### Step 1: Create InstantDB App

1. Open browser: https://www.instantdb.com/dash
2. Click **"Create New App"**
3. Name: `ibcs-app`
4. **Keep this tab open** - you'll need these credentials in step 3!

### Step 2: Run Setup Script

```bash
cd /Users/StevenStewart/ibcs-app/worker
./setup.sh
```

### Step 3: Enter Credentials When Prompted

The script will ask for:
- **INSTANT_APP_ID**: Copy from InstantDB dashboard
- **INSTANT_ADMIN_TOKEN**: Copy from InstantDB dashboard
- **SEED_KEY**: Type any secret phrase (e.g., "my-secret-123")

The script generates a **TOKEN_SECRET** automatically.

### Step 4: Save Your Worker URL

After deployment completes, you'll see something like:
```
Published ibcs-auth (1.23 sec)
  https://ibcs-auth.your-name.workers.dev
```

**Copy this URL!** You'll need it next.

### Step 5: Update Frontend Config

Edit: `/Users/StevenStewart/ibcs-app/frontend/public/app-config.json`

Replace with your InstantDB credentials:
```json
{
  "APP_ID": "your-app-id-from-instantdb",
  "INSTANT_ADMIN_TOKEN": "your-admin-token-from-instantdb"
}
```

Also update the dist folder:
```bash
cp /Users/StevenStewart/ibcs-app/frontend/public/app-config.json \
   /Users/StevenStewart/ibcs-app/frontend/dist/app-config.json
```

### Step 6: Create Teacher Account

```bash
node seed-teacher.js
```

When prompted, enter:
- **Worker URL**: The URL from Step 4
- **Seed key**: The same seed key from Step 3
- **Username**: `MrStewart` (or any username)
- **Password**: Choose a strong password
- **Display name**: `Mr. Stewart` (or any name)

### Step 7: Test!

```bash
cd /Users/StevenStewart/ibcs-app/frontend
npm run dev
```

Open http://localhost:5173 and login!

---

## ✅ You're Done!

Your app now has:
- ✅ InstantDB database (stores users, classes, students)
- ✅ Cloudflare Worker (handles authentication)
- ✅ Teacher account (you can login)
- ✅ Frontend configured (connects to both)

---

## 🆘 Troubleshooting

### Setup script fails at login
```bash
cd /Users/StevenStewart/ibcs-app/worker
npx wrangler login
```
Then run `./setup.sh` again.

### Can't find setup.sh or it won't run
```bash
chmod +x /Users/StevenStewart/ibcs-app/worker/setup.sh
```

### Worker deploys but seed fails
Double-check:
1. Worker URL is correct
2. Seed key matches what you entered during setup
3. InstantDB credentials are correct in frontend config

### Login fails in the app
1. Open browser console (F12)
2. Look for error messages
3. Verify `app-config.json` has correct credentials
4. Make sure you seeded a teacher account

---

## 🎓 What Each Part Does

### InstantDB
- **Purpose**: Database to store teachers, students, and classes
- **What you need**: App ID and Admin Token
- **Where**: https://www.instantdb.com/dash

### Cloudflare Worker  
- **Purpose**: API for login, authentication, and data management
- **What you need**: Deploy the code and set secrets
- **Where**: https://dash.cloudflare.com

### Frontend Config
- **Purpose**: Tells the React app how to connect to InstantDB
- **What you need**: Update app-config.json
- **Where**: `/frontend/public/app-config.json`

---

## 📚 Other Helpful Guides

- **QUICK_START.md** - All steps in one place
- **SETUP_GUIDE.md** - Detailed technical guide
- **worker/README.md** - Worker-specific documentation
- **worker/DEPLOY.md** - Deployment instructions

---

## 🔗 Quick Commands Reference

```bash
# Deploy worker
cd worker && npm run deploy

# View worker logs
cd worker && npm run tail

# Seed teacher
cd worker && npm run seed

# Run frontend locally
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

---

**Ready? Run `./setup.sh` and let's go!** 🚀

