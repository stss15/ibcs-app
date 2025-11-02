# Setup Guide: InstantDB + Cloudflare Worker

## Step 1: Create InstantDB Database

1. Go to https://www.instantdb.com/dash
2. Click "Create New App"
3. Give it a name like "ibcs-auth" or "ibcs-app"
4. Once created, you'll see your **App ID** and **Admin Token**
5. Copy these credentials - you'll need them shortly

## Step 2: Configure Your App

Update `/Users/StevenStewart/ibcs-app/frontend/public/app-config.json` with your new InstantDB credentials:

```json
{
  "APP_ID": "your-app-id-here",
  "INSTANT_ADMIN_TOKEN": "your-admin-token-here"
}
```

## Step 3: Set Up Cloudflare Worker Secrets

You need to set up secrets for your Cloudflare Worker. Run these commands from the `/Users/StevenStewart/ibcs-app/worker` directory:

```bash
# Set InstantDB App ID
npx wrangler secret put INSTANT_APP_ID
# When prompted, paste your InstantDB App ID

# Set InstantDB Admin Token
npx wrangler secret put INSTANT_ADMIN_TOKEN
# When prompted, paste your InstantDB Admin Token

# Set a secret for JWT signing (generate a random string)
npx wrangler secret put TOKEN_SECRET
# When prompted, paste a long random string (e.g., use: openssl rand -base64 32)

# Optional: Set seed key for creating initial teacher account
npx wrangler secret put SEED_KEY
# When prompted, paste a secret key (e.g., "my-secret-seed-key-123")
```

## Step 4: Deploy Cloudflare Worker

From the `/Users/StevenStewart/ibcs-app/worker` directory:

```bash
npx wrangler deploy
```

After deployment, you'll get a URL like: `https://ibcs-auth.YOUR-SUBDOMAIN.workers.dev`

## Step 5: Update Frontend Configuration

The frontend needs to know where your Cloudflare Worker is deployed. You'll need to update the API endpoint in your frontend code to point to your worker URL.

## Step 6: Seed Initial Teacher Account (Optional)

Once your worker is deployed, you can create an initial teacher account:

```bash
curl -X POST https://YOUR-WORKER-URL.workers.dev/setup/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-key: YOUR-SEED-KEY" \
  -d '{
    "teacher": {
      "username": "MrStewart",
      "password": "Dragon-S25052",
      "displayName": "Mr. Stewart"
    }
  }'
```

## Step 7: Test Your Setup

1. Build your frontend: `cd frontend && npm run build`
2. Serve it locally or deploy to GitHub Pages
3. Try logging in with your teacher credentials

## Quick Reference

### InstantDB Collections
Your app uses these collections:
- `teachers` - Teacher accounts
- `students` - Student accounts  
- `classes` - Class information

### Worker Endpoints
- `POST /auth/login` - Login with username/password
- `POST /auth/verify` - Verify JWT token
- `GET /teacher/dashboard` - Get teacher's classes and students
- `POST /teacher/classes` - Create a new class
- `POST /teacher/students` - Create a new student
- `POST /setup/seed` - Seed initial teacher (requires seed key)

## Troubleshooting

### Worker deployment fails
- Make sure you're logged in: `npx wrangler whoami`
- If not logged in: `npx wrangler login`

### CORS errors
- Check that your frontend origin is in the `CORS_ALLOWED_ORIGINS` in `wrangler.toml`
- Current allowed origins: `https://stss15.github.io,http://localhost:5173`

### InstantDB errors
- Verify your App ID and Admin Token are correct
- Check the InstantDB dashboard for API usage and errors

### Login fails
- Make sure you've seeded at least one teacher account
- Check browser console for detailed error messages
- Verify the worker secrets are set correctly

