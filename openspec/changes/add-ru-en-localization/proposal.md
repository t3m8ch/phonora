## Why

Phonora currently exposes learner-facing content and authoring fields in a single language, which makes the product harder to use for Russian-speaking learners and editors. Adding Russian and English localization now will let the site present the right language by default, allow users to switch languages explicitly, and let admins manage bilingual content without duplicating the product.

## What Changes

- Add a public language switcher for Russian and English and apply the selected locale across the site.
- Render shared site chrome, navigation labels, empty states, and learner-facing content in the active locale.
- Extend the content model so course, module, lesson, exercise, and reusable text content can store Russian and English variants.
- Update admin authoring flows so editors can enter, review, and maintain both Russian and English content for the same records.
- Ensure the admin workspace can be used in Russian or English, including locale-aware authoring guidance and language selection expectations.

## Capabilities

### New Capabilities
- `interface-localization`: Public site and admin-facing workflows support Russian and English locale selection, locale persistence, and localized interface labels.

### Modified Capabilities
- `content-admin-management`: Admin-managed content supports bilingual fields and language-aware editing workflows.
- `course-navigation`: Course landing, module navigation, and lesson navigation render in the active locale.
- `phonetic-study-cards`: Study card titles, explanations, notes, and example text render in the active locale.
- `reading-rule-lessons`: Reading rule lesson text and linked reinforcement labels render in the active locale.
- `phonetic-exercises`: Exercise prompts, instructions, options, and feedback text render in the active locale.

## Impact

- Affected frontend code in `apps/web` for routing, layout, navigation, locale selection, content fetching, and rendering.
- Affected Directus schema/bootstrap and seed data in `scripts/` and `cms/seed-data` to support bilingual content fields and editor workflows.
- Affected shared content types and mappers in `apps/web/lib/*`.
- Affected docs for content authoring and QA to cover bilingual site and admin behavior.
