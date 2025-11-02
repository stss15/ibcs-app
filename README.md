# IBCS App

IB Computer Science learning platform.

## Stack
- **Frontend**: React + Vite → GitHub Pages
- **Backend**: Cloudflare Worker  
- **Database**: InstantDB

## Deploy

```bash
chmod +x deploy-everything.sh
./deploy-everything.sh
```

## Login

- URL: https://stss15.github.io/ibcs-app/
- Username: `MrStewart`
- Password: `SGSD2024!`
- Role: Teacher

## Structure

```
frontend/     # React app
worker/       # Cloudflare Worker (auth + API)
instant.schema.ts  # Database schema
```

## Local Development

```bash
cd frontend && npm run dev
```
