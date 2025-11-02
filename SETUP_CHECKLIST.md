# ✅ Setup Checklist

Use this checklist to track your progress setting up the IBCS app.

---

## 📋 Pre-Setup

- [ ] I have a Cloudflare account
- [ ] I have an InstantDB account  
- [ ] Node.js is installed on my computer
- [ ] I've opened a terminal

---

## 🗄️ InstantDB Database

### Create App
- [ ] Opened https://www.instantdb.com/dash
- [ ] Clicked "Create New App"
- [ ] Named it `ibcs-app`
- [ ] App created successfully

### Save Credentials
- [ ] Copied **App ID**: `_______________________`
- [ ] Copied **Admin Token**: `_______________________`
- [ ] Saved credentials somewhere safe

---

## ☁️ Cloudflare Worker

### Login to Cloudflare
- [ ] Ran: `cd /Users/StevenStewart/ibcs-app/worker`
- [ ] Ran: `npx wrangler login`
- [ ] Successfully logged in

### Deploy Worker

Choose one method:

#### Option A: Automated (Recommended)
- [ ] Ran: `./setup.sh`
- [ ] Entered InstantDB App ID when prompted
- [ ] Entered InstantDB Admin Token when prompted
- [ ] Noted the generated TOKEN_SECRET
- [ ] Set SEED_KEY: `_______________________`
- [ ] Worker deployed successfully
- [ ] Saved worker URL: `_______________________`

#### Option B: Manual
- [ ] Generated token secret: `openssl rand -base64 32`
- [ ] Set INSTANT_APP_ID: `npx wrangler secret put INSTANT_APP_ID`
- [ ] Set INSTANT_ADMIN_TOKEN: `npx wrangler secret put INSTANT_ADMIN_TOKEN`
- [ ] Set TOKEN_SECRET: `npx wrangler secret put TOKEN_SECRET`
- [ ] Set SEED_KEY: `npx wrangler secret put SEED_KEY`
- [ ] Deployed: `npx wrangler deploy`
- [ ] Saved worker URL: `_______________________`

---

## ⚙️ Frontend Configuration

### Update Config Files
- [ ] Edited: `frontend/public/app-config.json`
- [ ] Replaced APP_ID with InstantDB App ID
- [ ] Replaced INSTANT_ADMIN_TOKEN with InstantDB Admin Token
- [ ] Saved the file
- [ ] Copied config to dist: 
      ```
      cp frontend/public/app-config.json frontend/dist/app-config.json
      ```

---

## 👨‍🏫 Initial Teacher Account

### Seed Teacher
- [ ] Ran: `cd /Users/StevenStewart/ibcs-app/worker`
- [ ] Ran: `node seed-teacher.js`
- [ ] Entered worker URL
- [ ] Entered seed key
- [ ] Entered username: `_______________________`
- [ ] Entered password: `_______________________`
- [ ] Entered display name
- [ ] Teacher created successfully

---

## 🧪 Testing

### Local Testing
- [ ] Ran: `cd /Users/StevenStewart/ibcs-app/frontend`
- [ ] Ran: `npm run dev`
- [ ] Opened: http://localhost:5173
- [ ] Selected "Teacher" role
- [ ] Entered username
- [ ] Entered password
- [ ] Successfully logged in! 🎉

### Verify Features
- [ ] Can see dashboard
- [ ] Can create a class
- [ ] Can add a student
- [ ] Student can login
- [ ] Data persists after refresh

---

## 🚀 Production Deployment (Optional)

### Build Frontend
- [ ] Ran: `cd /Users/StevenStewart/ibcs-app/frontend`
- [ ] Ran: `npm run build`
- [ ] Build completed without errors

### Deploy to GitHub Pages
- [ ] Pushed code to GitHub
- [ ] Enabled GitHub Pages in repo settings
- [ ] Site deployed to: `_______________________`
- [ ] Tested production site
- [ ] Login works in production

---

## 📊 Final Verification

- [ ] Teacher can login
- [ ] Teacher can create classes
- [ ] Teacher can add students
- [ ] Students can login
- [ ] Data persists correctly
- [ ] No console errors
- [ ] CORS working correctly

---

## 💾 Save These for Later

**Important Credentials:**
```
InstantDB App ID: _______________________
InstantDB Admin Token: _______________________
Worker URL: _______________________
Seed Key: _______________________
Teacher Username: _______________________
Teacher Password: _______________________
GitHub Pages URL: _______________________
```

---

## 🆘 Had Issues?

If you encountered problems, note them here:

**Issue 1:**
- Problem: _______________________
- Solution: _______________________

**Issue 2:**
- Problem: _______________________
- Solution: _______________________

**Issue 3:**
- Problem: _______________________
- Solution: _______________________

---

## ✨ Success!

If all items are checked, you're done! 

Your IBCS app is now fully functional with:
- ✅ Database (InstantDB)
- ✅ Authentication API (Cloudflare Worker)
- ✅ Frontend (React app)
- ✅ Teacher account
- ✅ Everything connected and working

**Congratulations!** 🎉

---

## 📚 Next Steps

Now that setup is complete, you might want to:
- [ ] Add more teachers
- [ ] Create your first classes
- [ ] Invite students
- [ ] Customize the frontend
- [ ] Add more features

See the main README.md for development guides.

