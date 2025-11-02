# Quick Deploy Instructions

## Prerequisites
- Cloudflare account (you have this ✓)
- InstantDB account (you have this ✓)
- Node.js installed

## 1. Login to Cloudflare (if not already)
```bash
cd /Users/StevenStewart/ibcs-app/worker
npx wrangler login
```

## 2. Create New InstantDB App
1. Visit: https://www.instantdb.com/dash
2. Click "Create New App"
3. Name it: `ibcs-app`
4. **Save your App ID and Admin Token**

## 3. Set Cloudflare Worker Secrets

Generate a random token secret first:
```bash
openssl rand -base64 32
```

Then set all secrets:
```bash
# Set each secret (you'll be prompted to paste the value)
npx wrangler secret put INSTANT_APP_ID
npx wrangler secret put INSTANT_ADMIN_TOKEN
npx wrangler secret put TOKEN_SECRET
npx wrangler secret put SEED_KEY
```

**Values to use:**
- `INSTANT_APP_ID`: Your InstantDB App ID from step 2
- `INSTANT_ADMIN_TOKEN`: Your InstantDB Admin Token from step 2
- `TOKEN_SECRET`: The random string from openssl command above
- `SEED_KEY`: Any secret string like "my-secret-key-2024"

## 4. Deploy Worker
```bash
npx wrangler deploy
```

You'll get a URL like: `https://ibcs-auth.YOUR-NAME.workers.dev`

## 5. Update Frontend Config

Edit `/Users/StevenStewart/ibcs-app/frontend/public/app-config.json`:
```json
{
  "API_BASE": "https://ibcs-auth.YOUR-NAME.workers.dev"
}
```

## 6. Create Initial Teacher Account

Replace `YOUR-WORKER-URL` and `YOUR-SEED-KEY` below:

```bash
curl -X POST https://YOUR-WORKER-URL.workers.dev/setup/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-key: YOUR-SEED-KEY" \
  -d '{
    "teacher": {
      "username": "MrStewart",
      "password": "YourPassword123",
      "displayName": "Mr. Stewart"
    }
  }'
```

## 7. Test Login
1. Start frontend: `cd ../frontend && npm run dev`
2. Open browser to `http://localhost:5173`
3. Login with:
   - Username: `MrStewart`
   - Password: `YourPassword123`
   - Role: Teacher

## Done! 🎉

Your worker is deployed and your database is ready!

### Need to update secrets later?
```bash
npx wrangler secret put SECRET_NAME
```

### View deployed worker info:
```bash
npx wrangler deployments list
```

### View logs:
```bash
npx wrangler tail
```

