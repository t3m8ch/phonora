## 1. Locale routing and shared localization utilities

- [x] 1.1 Add shared locale constants, dictionary helpers, and fallback resolution utilities for `ru` and `en`
- [x] 1.2 Restructure the public Next.js routes under a locale segment and add root redirect logic based on saved preference, browser language, and English fallback
- [x] 1.3 Add locale-aware route/link helpers and a public language switcher that persists the selected locale

## 2. Directus schema and bilingual content model

- [x] 2.1 Extend Directus bootstrap definitions with `*_en` and `*_ru` fields for all localizable course, module, lesson, rule, card, example-note, and exercise text fields
- [x] 2.2 Update Directus field metadata, notes, and labels so admins can clearly distinguish Russian and English authoring inputs
- [x] 2.3 Define the localized exercise option payload shape and update schema/bootstrap handling for bilingual exercise prompts and option labels

## 3. Seed data and content migration

- [x] 3.1 Update seed data structures and seeding scripts to write English and Russian values into the new bilingual fields
- [x] 3.2 Add migration/backfill logic that copies existing single-language content into the English locale fields so current content remains usable after rollout
- [x] 3.3 Refresh sample content and admin-facing documentation snippets to demonstrate bilingual authoring in the CMS

## 4. Frontend data access and locale-aware mapping

- [x] 4.1 Update shared TypeScript content types to model bilingual Directus records and localized exercise option data
- [x] 4.2 Update Directus field selection and fetch utilities to request localized fields for course, module, lesson, study card, reading rule, example, and exercise records
- [x] 4.3 Refactor mapper/content adapter logic to resolve learner-facing text in the active locale with English fallback when translations are missing

## 5. Public learner experience localization

- [x] 5.1 Localize the site shell, metadata, navigation labels, empty states, and lesson navigation controls using the shared dictionaries
- [x] 5.2 Update course, module, study card, reading rule, and exercise pages/components to render localized content and preserve the active locale in internal navigation
- [x] 5.3 Ensure locale switching keeps learners on the equivalent page whenever the target localized route can be resolved

## 6. Admin workflow guidance and QA coverage

- [x] 6.1 Update content authoring and QA documentation for bilingual public content, translation fallback behavior, and Russian/English admin workspace usage
- [x] 6.2 Extend smoke checks or manual verification steps to cover locale redirects, language switching, localized rendering, and fallback cases
- [x] 6.3 Run project verification plus bilingual workflow checks against the seeded dataset and fix any locale-related regressions
