# IBCS App

IB Computer Science learning platform.

## Stack
- **Frontend**: React + Vite → GitHub Pages
- **Backend**: Cloudflare Worker  
- **Database**: InstantDB

## Deploy

```bash
chmod +x deploy.sh   # first time only
./deploy.sh
```

## Login

- URL: https://stss15.github.io/ibcs-app/
- Username: `MrStewart`
- Password: `SGSD2024!`
- Role: Teacher

> The worker also seeds a default `admin` account with the same password after deployment, so you don't need to edit InstantDB manually. Set `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_TEACHER_USERNAME`, or `SEED_TEACHER_PASSWORD` (via Wrangler secrets or the worker environment) if you want to change those credentials, or run `npm run set-credentials` inside `worker/`.

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

## Recent Updates

**November 2025 - Major UI/UX Modernization**
- Comprehensive design system with modern animations and interactions
- Enhanced tables, keyword cards, quizzes, and activities
- Gamified learning experience with XP animations and celebrations
- 8 new reusable components for rich content authoring
- Fully responsive and WCAG AA compliant

📖 **Documentation:**
- [Quick Start Guide](./QUICK-START-GUIDE.md) - Get started in 5 minutes
- [Full Implementation Summary](./UI-UX-IMPROVEMENTS-SUMMARY.md) - Complete overview
- [Design System Docs](./docs/ui-ux-design-system.md) - Comprehensive reference
