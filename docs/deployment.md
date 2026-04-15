# Deployment notes

## Components

- **web**: Next.js application in `apps/web`
- **cms**: Directus instance backed by PostgreSQL
- **database**: PostgreSQL
- **media**: Directus local storage or an external object-storage adapter later

## Environment variables

Copy `.env.example` and set production values for:

- `DIRECTUS_URL`
- `DIRECTUS_ASSETS_BASE_URL`
- `DIRECTUS_PUBLIC_STATUS`
- `DIRECTUS_PUBLIC_VISIBILITY`
- `PHONORA_SINGLETON_COURSE_SLUG` (optional; default singleton course slug used by `cms:setup`)
- `DIRECTUS_ADMIN_EMAIL`
- `DIRECTUS_ADMIN_PASSWORD`
- `DIRECTUS_ADMIN_TOKEN` (optional, preferred for automation)
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `KEY`
- `SECRET`

## Suggested rollout sequence

1. Provision PostgreSQL.
2. Deploy Directus and connect it to PostgreSQL.
3. Run:
   ```bash
   bun run cms:setup
   bun run cms:seed
   ```
4. Build and deploy the Next.js app:
   ```bash
   bun run build
   bun run start
   ```
5. Verify published content and audio playback in staging.
6. Promote to production.

## Rollback

- Revert the web deployment to the previous build.
- Restore the previous PostgreSQL / Directus backup if schema or seed changes caused breakage.
- Re-run `bun run cms:setup` only after verifying the corrected schema changes in staging.
