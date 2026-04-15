## Context

Phonora is starting as a greenfield product with a clear educational goal: teach learners to read English phonetic transcription, distinguish sounds by ear, and connect pronunciation to basic reading rules. The MVP must prioritize structured progression, reusable content, and non-technical content administration.

The major constraint is that учебный контент must not live inside frontend code. The system therefore needs a content model that supports ordered course delivery, reusable examples and audio, multiple lesson types, and exercises that can be extended later without redesigning the whole stack. The recommended stack in the project brief is Next.js + TypeScript for the public site and Directus + PostgreSQL for content management, which aligns well with these constraints.

Stakeholders:
- Learners consuming lessons and exercises on desktop and mobile.
- Educators/admins creating and maintaining lesson content.
- Developers implementing and extending the platform.

## Goals / Non-Goals

**Goals:**
- Deliver a public MVP with landing page, course navigation, lesson pages, and exercise pages.
- Model course content in Directus so admins can create, order, publish, and update content without code changes.
- Support the MVP lesson domains: phonetic symbols, sound combinations, reading rules, and exercises.
- Make audio assets reusable across lessons and exercises.
- Keep the frontend thin and content-driven so adding blocks mostly becomes a CMS task.
- Preserve room for future extensions such as learner progress, more exercise types, and richer analytics.

**Non-Goals:**
- User voice recording, pronunciation scoring, or intonation analysis.
- Building a custom admin panel instead of using Directus Studio.
- Creating a full speaking course or synchronous classroom features.
- Solving advanced personalization, spaced repetition, or teacher dashboards in MVP.

## Decisions

### 1. Use Next.js App Router for the public application
- **Decision:** Build the learner-facing site as a Next.js App Router application in TypeScript.
- **Rationale:** The content is page-oriented, SEO-friendly, and benefits from server rendering, route-based layouts, and good deployment portability. App Router also keeps data fetching and route composition simple for a content-driven product.
- **Alternatives considered:**
  - **Plain React SPA:** simpler initial hosting, but weaker default SEO and more client-side data orchestration.
  - **Custom backend + templating:** would reduce frontend flexibility and slow future UI iteration.

### 2. Use Directus + PostgreSQL as the source of truth for content and admin workflows
- **Decision:** Store all learning content in PostgreSQL and manage it through Directus collections, relations, roles, and file storage.
- **Rationale:** Directus already provides admin UI, auth, role-based permissions, file handling, ordering fields, and APIs. This avoids spending MVP time on building CRUD tooling.
- **Alternatives considered:**
  - **Hand-built admin panel:** high effort for low product value in MVP.
  - **Markdown/content files in repo:** versionable, but unsuitable for non-technical authors and media-heavy content workflows.

### 3. Use a normalized but author-friendly content model
- **Decision:** Represent the main domain with reusable collections and explicit ordering:
  - `courses`
  - `modules`
  - `lesson_blocks`
  - `phonetic_symbols`
  - `sound_combinations`
  - `reading_rules`
  - `example_words`
  - `audio_assets` / Directus files
  - `exercises`
  - `exercise_items`
- **Rationale:** The educational structure is sequential, while examples and audio should be reusable across multiple lessons and exercises. A normalized model minimizes duplication while keeping lesson assembly flexible.
- **Alternatives considered:**
  - **Single polymorphic lesson table with large JSON blobs:** faster to start, but harder to validate, query, and reuse content safely.
  - **Separate page documents only:** easier rendering, worse reuse of shared examples/audio.

### 4. Distinguish structure entities from content entities
- **Decision:** Use `course -> module -> lesson_block` for sequencing and navigation, while lesson blocks reference one primary content entity (`phonetic_symbol`, `sound_combination`, `reading_rule`, or `exercise`).
- **Rationale:** This lets editors control learning order independently from the reusable content library. The same content entity can appear in different curricular structures later if needed.
- **Alternatives considered:**
  - **Content entities define navigation themselves:** simpler schema, but couples reusable content to one fixed course path.

### 5. Render lesson pages through typed content adapters
- **Decision:** The Next.js app will fetch published Directus records and map them into frontend view models before rendering.
- **Rationale:** Directus responses are CMS-oriented and relation-heavy. A mapping layer keeps UI components stable, prevents CMS field leakage across the app, and makes future backend changes less painful.
- **Alternatives considered:**
  - **Use raw Directus payloads directly in components:** less code initially, but higher coupling and brittle UI logic.

### 6. Support MVP exercises through a generic exercise engine with typed variants
- **Decision:** Model exercises with a base `exercise` entity plus `exercise_items` that carry a `type` and structured fields for prompt, audio, options, correct answers, and explanations.
- **Rationale:** MVP needs several exercise types but not a different page implementation for each type. A typed engine allows reuse of page shells, validation, and result handling while adding new types incrementally.
- **Alternatives considered:**
  - **Dedicated collection and frontend flow per exercise type:** clearer isolation, but more duplication and slower expansion.
  - **Free-form JSON only:** flexible, but risky for editor usability and validation.

### 7. Publish content via status flags and filter only published records in the public app
- **Decision:** Content entities and lesson blocks will include publication state, visibility controls, and ordering fields. Public queries will request only published items.
- **Rationale:** Editors need draft workflows and the ability to hide incomplete materials without deleting them.
- **Alternatives considered:**
  - **No draft state:** simpler, but operationally brittle.

### 8. Reuse Directus file storage for audio assets
- **Decision:** Store uploaded audio in Directus-managed storage and reference those files from content entities.
- **Rationale:** This gives upload UI, metadata, access control, and consistent asset URLs without building a separate media system for MVP.
- **Alternatives considered:**
  - **External storage wired manually in frontend:** workable, but duplicates CMS responsibilities.

### 9. Defer learner accounts and persistent progress unless explicitly enabled later
- **Decision:** MVP pages will be structured so progress can be added later, but learner authentication and stored progress are not required for the first delivery.
- **Rationale:** The learning value of the MVP comes from content and practice quality, not account infrastructure.
- **Alternatives considered:**
  - **Add accounts now:** increases scope and backend complexity without proving the learning flow first.

## Risks / Trade-offs

- **[Risk] Directus schema design may become awkward if exercise types evolve quickly** → **Mitigation:** keep a stable shared exercise core and reserve a structured metadata field for type-specific extensions where necessary.
- **[Risk] Over-normalized content can make authoring cumbersome** → **Mitigation:** optimize Directus relations, labels, presets, and editorial documentation so common tasks stay simple.
- **[Risk] Frontend performance may degrade with deeply nested CMS queries** → **Mitigation:** use purpose-built query shapes, server-side fetching, relation limits, and a mapping layer that requests only needed fields.
- **[Risk] Audio asset quality or inconsistency can reduce pedagogical value** → **Mitigation:** define upload guidelines for format, naming, and pronunciation source quality before content entry scales.
- **[Risk] Reading rules often contain exceptions that do not fit rigid models** → **Mitigation:** allow explicit exceptions/notes fields and avoid pretending rules are universally deterministic.

## Migration Plan

1. Provision PostgreSQL and Directus for the project.
2. Create Directus collections, relations, roles, and file storage configuration for the MVP schema.
3. Seed minimal starter content for one course, core modules, several symbols/combinations/rules, and sample exercises.
4. Build the Next.js application against published-content APIs and verify responsive navigation and lesson rendering.
5. Configure environment variables, media access, and deployment for both frontend and CMS.
6. Roll out to a staging environment first, validate editor workflows and public lesson paths, then promote to production.
7. Rollback by redeploying the previous frontend build and restoring the previous Directus/PostgreSQL snapshot if schema or content changes break the release.

## Open Questions

- Should the MVP ship with anonymous local progress tracking in the browser, or omit progress entirely from the first release?
- Will audio assets be recorded internally or sourced/licensed externally, and what metadata is required for attribution?
- Do we want one course with fixed modules in MVP, or should the data model support multiple public courses from day one?
- Should exercises show immediate feedback per item, summary feedback at the end, or both?
