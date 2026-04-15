## Context

Phonora currently serves one public content language and stores most learner-facing copy as single-language scalar fields in Directus. The frontend also hardcodes shared UI labels such as navigation, empty states, and lesson actions in English. Admins work in Directus Studio with the current schema, so adding bilingual support affects both the public Next.js application and the Directus bootstrap/seed workflow.

This change is cross-cutting because it touches routing, layout, content fetching, typed mappers, CMS schema, seed data, editorial docs, and QA flows. The main constraints are:
- The public site must support exactly two locales for now: `ru` and `en`.
- Existing content and routes should remain operable during migration.
- Admins should manage both language variants on the same content record rather than maintaining duplicate records per language.
- We use Directus as the admin UI, so admin interface localization should rely on Directus capabilities where possible instead of building a custom CMS.

Stakeholders:
- Learners who expect the site language to follow their browser or previously selected preference.
- Editors who need to enter and maintain Russian and English text without changing code.
- Developers who need a predictable content model and route structure for localized rendering.

## Goals / Non-Goals

**Goals:**
- Add Russian and English locale support to the public site, including a visible language switcher.
- Select the initial public locale from persisted preference first, then browser language, with English as the default fallback.
- Render shared UI chrome and learner-facing content in the active locale.
- Extend the Directus content model so localizable text can be stored for both `ru` and `en` on the same entity.
- Keep existing content slugs stable across languages so route matching and cross-locale switching stay simple.
- Make admin authoring workable in both languages by providing bilingual content fields and relying on Directus Studio locale support for the admin shell.

**Non-Goals:**
- Supporting more than two locales in this change.
- Localizing canonical slugs or generating different content trees per locale.
- Building a custom admin panel separate from Directus Studio.
- Translating raw English phonetic data itself when it is part of the lesson subject matter, such as symbols, transcriptions, or example target words.

## Decisions

### 1. Use locale-prefixed public routes with root auto-redirect
- **Decision:** Move learner-facing pages under a top-level locale segment such as `/en`, `/ru`, `/en/modules/[slug]`, and `/ru/learn/[moduleSlug]/[lessonSlug]`. The root `/` will redirect to the best locale using a `preferred-locale` cookie first, then the `Accept-Language` header, then `en`.
- **Rationale:** Locale-prefixed routes make server rendering deterministic, allow correct `<html lang>` output, preserve shareable URLs, and avoid client-only language flicker.
- **Alternatives considered:**
  - **Cookie-only locale without route prefix:** less URL churn, but harder SSR behavior and less obvious locale-specific navigation.
  - **Localized slugs per language:** better native URLs, but significantly more CMS complexity and route-mapping overhead.

### 2. Keep one content record per entity and add explicit `*_en` / `*_ru` fields for localizable text
- **Decision:** Extend existing Directus collections with paired locale fields for public text, for example `title_en` / `title_ru`, `summary_en` / `summary_ru`, `description_en` / `description_ru`, and similar pairs for lesson, rule, and exercise copy.
- **Rationale:** The project only needs two locales now, and explicit fields are easier to bootstrap, validate, query, seed, and expose in TypeScript than introducing a full translation table architecture. This also keeps authoring on a single record.
- **Alternatives considered:**
  - **Separate translation collections:** more scalable for many locales, but much more complex for this project stage.
  - **JSON translation blobs in one field:** flexible, but poor authoring ergonomics in Directus and weaker type safety.

### 3. Resolve localized values in a dedicated content localization layer with fallback to default locale
- **Decision:** Add shared frontend helpers that accept a record plus active locale and return the best available string, using requested locale first and English fallback when the requested translation is missing.
- **Rationale:** A centralized resolver prevents repeated fallback logic in UI components and supports a safe migration from existing single-language content.
- **Alternatives considered:**
  - **Require both locales before rendering publicly:** cleaner final state, but blocks incremental rollout and complicates migration.
  - **Handle fallback separately in each mapper/component:** simpler short term, but brittle and inconsistent.

### 4. Keep structural identifiers and pedagogical primitives locale-neutral
- **Decision:** Preserve current `slug`, ordering fields, publication fields, lesson type fields, symbols, transcriptions, and example target words as shared values across locales. Only explanatory and interface text becomes localized.
- **Rationale:** English phonetic content is the subject of study, so many data points are not translations. Keeping shared identifiers stable avoids content duplication and cross-locale mismatch.
- **Alternatives considered:**
  - **Duplicate full entities per locale:** simpler localized rendering model, but much harder editorial maintenance and sequencing consistency.

### 5. Localize public UI text with in-repo dictionaries, not an external i18n dependency
- **Decision:** Store shared UI strings for the public app in small TypeScript dictionaries keyed by locale and use lightweight server/client helpers to read them.
- **Rationale:** The app has a small number of framework-owned labels, and adding a full i18n library would increase complexity without clear benefit.
- **Alternatives considered:**
  - **Introduce a full i18n framework now:** helpful for larger locale counts, but unnecessary for the current scope.

### 6. Treat Directus Studio shell localization and content localization as separate concerns
- **Decision:** Rely on Directus Studio's native language support for admin shell localization where available, while updating collection field labels, notes, seed docs, and authoring guidance so bilingual content entry is clear regardless of admin locale.
- **Rationale:** We do not own the Directus UI code in this repository, but we do control schema metadata and documentation. This is the lowest-effort path to a bilingual admin experience.
- **Alternatives considered:**
  - **Ignore admin shell locale entirely:** would not satisfy the operational requirement for Russian-speaking editors.
  - **Custom extension or custom admin UI:** too much scope for this change.

### 7. Update exercise payloads to support localized prompt and option text
- **Decision:** Keep `exercise_items` as structured records, but extend localizable text fields (`prompt`, `prompt_note`, `explanation`) into locale pairs and update `options` JSON to carry localized labels for text-bearing options.
- **Rationale:** Exercise delivery already uses a mixed structured/JSON model. Localizing only the display text preserves the current engine while allowing Russian and English prompts.
- **Alternatives considered:**
  - **Normalize options into a separate collection:** better authoring long term, but a much larger schema and frontend change.

### 8. Migrate existing single-language content by backfilling English fields first
- **Decision:** During schema update, existing content will be copied into the new English fields, Russian fields will be populated via seed/sample content where available, and the frontend will temporarily fall back to English until Russian translations exist.
- **Rationale:** This avoids downtime and keeps the current content visible while bilingual content is being completed.
- **Alternatives considered:**
  - **Big-bang migration that requires full Russian content before deploy:** higher launch risk and slower rollout.

## Risks / Trade-offs

- **[Risk] Paired locale fields increase schema width and mapper verbosity** → **Mitigation:** centralize locale field resolution helpers and document the localizable field pattern clearly.
- **[Risk] Some records may have incomplete Russian translations after rollout** → **Mitigation:** use English fallback in rendering, add QA coverage for translation completeness, and document authoring expectations.
- **[Risk] Locale-prefixed routing may require widespread link updates** → **Mitigation:** introduce shared locale-aware route builders and update navigation components in one pass.
- **[Risk] Directus shell localization may vary by deployment/user settings** → **Mitigation:** document required admin profile language settings and keep schema field labels/notes understandable for both Russian- and English-speaking editors.
- **[Risk] JSON exercise options are harder to validate than scalar fields** → **Mitigation:** define a strict localized option shape, update seed data, and validate option parsing in frontend mappers.

## Migration Plan

1. Add locale utilities and route structure for `/[locale]` public pages while preserving root redirect behavior.
2. Extend Directus bootstrap definitions with bilingual fields for all localizable collections and content metadata updates for authoring clarity.
3. Update seed data and migration/backfill scripts so existing content is copied into English fields and sample Russian translations are available.
4. Update content queries, types, and mappers to read locale-paired fields and resolve active-locale values with fallback.
5. Update learner-facing UI components and shared dictionaries to use localized strings and locale-aware links.
6. Update documentation and QA checklists for public locale switching, translation fallback, and admin editing in both languages.
7. Deploy to staging, verify `en`/`ru` public flows and Directus editorial workflows, then release to production.
8. Roll back by redeploying the prior frontend and restoring the previous Directus schema/content snapshot if the new schema or routing causes release issues.

## Open Questions

- Should the public language switcher keep users on the equivalent page when moving between locales, or always return them to the locale home page if content resolution fails?
- Do we want to require both `ru` and `en` values before publishing newly created records after the migration period, or keep fallback-based publishing indefinitely?
- Is Directus native user-language configuration sufficient for the admin requirement, or do we later want a project-specific admin extension for stronger bilingual guidance?
