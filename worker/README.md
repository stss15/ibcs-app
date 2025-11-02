# Cloudflare Worker Setup

This directory contains the Cloudflare Worker that handles authentication for the IBCS app.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
cd /Users/StevenStewart/ibcs-app/worker
./setup.sh
```

This script will:
1. Check your Cloudflare login status
2. Guide you through setting up secrets
3. Deploy your worker automatically

### Option 2: Manual Setup

#### 1. Login to Cloudflare
```bash
npx wrangler login
```

#### 2. Set Required Secrets
```bash
# Generate token secret
openssl rand -base64 32

# Set secrets one by one
npx wrangler secret put INSTANT_APP_ID
npx wrangler secret put INSTANT_ADMIN_TOKEN
npx wrangler secret put TOKEN_SECRET
npx wrangler secret put SEED_KEY
```

#### 3. Deploy
```bash
npx wrangler deploy
```

## 🔐 Required Secrets

| Secret | Description | How to Get |
|--------|-------------|------------|
| `INSTANT_APP_ID` | Your InstantDB App ID | From https://www.instantdb.com/dash |
| `INSTANT_ADMIN_TOKEN` | Your InstantDB Admin Token | From https://www.instantdb.com/dash |
| `TOKEN_SECRET` | Secret for JWT signing | Generate with `openssl rand -base64 32` |
| `SEED_KEY` | Secret for seeding initial data | Any random string you choose |

## 👨‍🏫 Seed Initial Teacher

After deploying, create your first teacher account:

### Option 1: Use the helper script
```bash
node seed-teacher.js
```

### Option 2: Manual curl
```bash
curl -X POST https://YOUR-WORKER-URL.workers.dev/setup/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-key: YOUR-SEED-KEY" \
  -d '{
    "teacher": {
      "username": "MrStewart",
      "password": "YourSecurePassword",
      "displayName": "Mr. Stewart"
    }
  }'
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login with username/password
- `POST /auth/verify` - Verify JWT token

### Teacher Endpoints (require authentication)
- `GET /teacher/dashboard` - Get classes and students
- `POST /teacher/classes` - Create a new class
- `POST /teacher/students` - Create a new student

### Setup
- `POST /setup/seed` - Seed initial teacher (requires seed key)

## 🔧 Useful Commands

```bash
# View deployment info
npx wrangler deployments list

# View live logs
npx wrangler tail

# Check who you're logged in as
npx wrangler whoami

# Update a secret
npx wrangler secret put SECRET_NAME

# Delete a secret
npx wrangler secret delete SECRET_NAME

# List all secrets
npx wrangler secret list
```

## 🐛 Troubleshooting

### "Not authenticated" error
```bash
npx wrangler logout
npx wrangler login
```

### CORS errors
Make sure your frontend URL is in `CORS_ALLOWED_ORIGINS` in `wrangler.toml`:
```toml
[vars]
CORS_ALLOWED_ORIGINS = "https://stss15.github.io,http://localhost:5173"
```

### Worker logs showing errors
View real-time logs:
```bash
npx wrangler tail
```

### Need to redeploy
```bash
npx wrangler deploy --force
```

## 📚 More Information

See the full setup guide at: `/Users/StevenStewart/ibcs-app/SETUP_GUIDE.md`

See deployment instructions at: `DEPLOY.md`

