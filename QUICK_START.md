# 🚀 QUICK START - Deploy in 5 Minutes

Follow these steps to get your IBCS app running with InstantDB and Cloudflare Workers.

## Prerequisites ✓

- [x] Cloudflare account (you have this)
- [x] InstantDB account (you have this)
- [x] Node.js installed
- [x] Code already written (you have this)

## Step-by-Step Setup

### 1️⃣ Create InstantDB Database (2 minutes)

1. Open https://www.instantdb.com/dash
2. Click **"Create New App"**
3. Name it: `ibcs-app`
4. **Copy these two values** (you'll need them next):
   - ✏️ **App ID**: `_____________________`
   - 🔑 **Admin Token**: `_____________________`

### 2️⃣ Deploy Cloudflare Worker (2 minutes)

Open your terminal and run the automated setup:

```bash
cd /Users/StevenStewart/ibcs-app/worker
./setup.sh
```

The script will:
- ✅ Check your Cloudflare login
- ✅ Ask for your InstantDB credentials
- ✅ Set up all required secrets
- ✅ Deploy your worker

**Save your worker URL!** It will look like:
```
https://ibcs-auth.YOUR-NAME.workers.dev
```

### 3️⃣ Update Frontend Config (30 seconds)

Edit: `/Users/StevenStewart/ibcs-app/frontend/public/app-config.json`

```json
{
  "APP_ID": "paste-your-app-id-here",
  "INSTANT_ADMIN_TOKEN": "paste-your-admin-token-here"
}
```

**Also update the dist folder:**
```bash
cp /Users/StevenStewart/ibcs-app/frontend/public/app-config.json \
   /Users/StevenStewart/ibcs-app/frontend/dist/app-config.json
```

### 4️⃣ Create Your First Teacher Account (1 minute)

Run the seed script:

```bash
cd /Users/StevenStewart/ibcs-app/worker
node seed-teacher.js
```

Enter:
- Worker URL: `https://ibcs-auth.YOUR-NAME.workers.dev`
- Seed key: (the one you set during setup)
- Username: `MrStewart`
- Password: (choose a secure password)
- Display name: `Mr. Stewart`

### 5️⃣ Test Your App! (30 seconds)

```bash
cd /Users/StevenStewart/ibcs-app/frontend
npm run dev
```

Open http://localhost:5173 and login with:
- 👤 Username: `MrStewart`
- 🔒 Password: (the password you just set)
- 👨‍🏫 Role: **Teacher**

## 🎉 Done!

Your app is now running with:
- ✅ InstantDB database
- ✅ Cloudflare Worker for authentication
- ✅ Teacher account ready to use

---

## 🆘 Having Issues?

### "Not logged in to Cloudflare"
```bash
npx wrangler login
```

### Worker deployment fails
```bash
cd /Users/StevenStewart/ibcs-app/worker
npx wrangler whoami
npx wrangler deploy
```

### Can't login to the app
1. Check browser console for errors
2. Verify your `app-config.json` has the correct credentials
3. Make sure you seeded a teacher account
4. Try viewing worker logs: `npx wrangler tail`

### CORS errors
Check that `http://localhost:5173` is in the `CORS_ALLOWED_ORIGINS` in `worker/wrangler.toml`

---

## 📚 Next Steps

### Deploy to Production

1. **Build frontend:**
   ```bash
   cd /Users/StevenStewart/ibcs-app/frontend
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   - Push your code to GitHub
   - Go to repo Settings → Pages
   - Select source: GitHub Actions or `gh-pages` branch

3. **Your app will be live at:**
   ```
   https://stss15.github.io/ibcs-app
   ```

### Create Classes and Students

Once logged in as a teacher:
1. Create a class
2. Add students to the class
3. Students can login with their credentials

---

## 🔗 Useful Links

- **InstantDB Dashboard**: https://www.instantdb.com/dash
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Your Worker Logs**: `cd worker && npx wrangler tail`
- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Worker Documentation**: See `worker/README.md`

---

## 📝 Important Credentials to Save

Keep these somewhere safe:

```
InstantDB App ID: _____________________
InstantDB Admin Token: _____________________
Cloudflare Worker URL: _____________________
Seed Key: _____________________
Teacher Username: _____________________
Teacher Password: _____________________
```

