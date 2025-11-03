# Project Overview & Product Aim

## Purpose
A free, static teaching app for IB Computer Science (first exams 2027). Students progress through a gated learning journey of reading, formative checkpoints, and summative tasks. Teachers unlock topics, track progress, and mark work. The app intentionally avoids personal data collection, paid APIs, and email-based authentication.

## Primary Audience
- IB Computer Science students at SL and HL
- Teachers who need simple class control and real-time insight into student progress

## Core Objectives
1. Map the full syllabus (A1–A4, B1–B4) into navigable units, stages, and segments.
2. Provide interactive learning objects: MCQ, true/false, multi-select, matching, ordering, gap fill, drag/drop, playgrounds, reflections, planners, and summatives.
3. Enforce progression rules: read → formative success → unlock next stage → attempt summative.
4. Offer a teacher dashboard with class rosters, gating controls, progress heatmaps, marking queues, and CSV/Excel export.
5. Keep data minimal: student display names or usernames only, salted password hashes, signed session tokens.
6. Respect SL/HL visibility flags so HL-only content stays hidden for SL accounts.
7. Include sandboxes (Python via Skulpt, future SQL via WASM) that can be reset safely.

## Non-Goals
- No email logins, OAuth, or AI-powered authoring.
- No heavy backend; the SPA communicates directly with InstantDB via the Cloudflare Worker.

## Privacy & Security Principles
- Store only the minimum: teacher display names, student first names or usernames.
- Persist password hashes (bcrypt) and short-lived signed tokens.
- Limit teacher actions to their classes; students may only read public content and write their own progress.

## Definition of Done (MVP)
- Login works for teachers and students via the SPA and InstantDB-backed worker.
- Teachers can create classes, add students, and unlock topics.
- Students can clear formative checkpoints and unlock subsequent stages.
- Summative submissions store grading placeholders and appear in the teacher marking queue.
- CSV export functions for teacher reporting are available.

## Roadmap Milestones
- **M1** – Core navigation, formative engine, progress storage.
- **M2** – Summatives, marking UI, CSV export.
- **M3** – Code sandboxes (Python + SQL), simple auto-marking.
- **M4** – Analytics, content authoring GUI, accessibility and theming polish.

## Success Criteria
- A class can complete an A1 subtopic end-to-end after unlock without staff intervention.
- Teachers can see live progress and export marks reliably.
- Deployment runs entirely on free tiers (GitHub Pages + InstantDB + Cloudflare Worker).


