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
