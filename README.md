# Phonora

Phonora is a content-driven web app for learning English phonetics, transcription, and reading rules.

## Stack

- **Frontend:** Next.js App Router + TypeScript
- **CMS:** Directus
- **Database:** PostgreSQL
- **Package manager / runtime:** bun

## Quick start

1. Copy env values:
   ```bash
   cp .env.example .env
   ```
2. Start the local stack:
   ```bash
   docker compose up -d
   ```
3. Install frontend dependencies:
   ```bash
   bun install
   ```
4. Bootstrap Directus schema and seed starter content:
   ```bash
   bun run cms:setup
   bun run cms:seed
   ```
5. Start the web app locally if you are not using the Docker web service:
   ```bash
   bun run dev
   ```
6. Open:
   - Web: http://localhost:3000
   - Directus Studio: http://localhost:8055

## Useful commands

- `bun run dev` — run the Next.js app
- `bun run lint` — lint the web app
- `bun run build` — production build of the web app
- `bun run verify` — lint + build
- `bun run cms:setup` — create/update Directus collections, fields, relations, roles, permissions
- `bun run cms:seed` — import the minimal MVP starter dataset

## Project structure

- `apps/web` — learner-facing Next.js app
- `scripts` — Directus bootstrap and seed automation
- `cms/seed-data` — starter content fixtures
- `cms/assets` — sample audio files used during seed
- `docs` — deployment, authoring, and QA notes

See `docs/content-authoring.md` and `docs/qa-checklist.md` for editor and testing workflows.
