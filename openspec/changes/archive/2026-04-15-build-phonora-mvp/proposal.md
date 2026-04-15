## Why

Phonora needs an MVP that teaches learners to recognize phonetic symbols, connect transcription to pronunciation, and apply basic English reading rules through structured practice instead of memorizing disconnected examples. We need to establish a content-driven platform now so educators can expand the course through an admin interface without rewriting the frontend for every new lesson.

## What Changes

- Build a public learning experience for the Phonora MVP with a landing page, module navigation, lesson sequencing, and responsive lesson pages.
- Add study card pages for individual phonetic symbols and sound combinations with explanations, examples, and audio playback.
- Add reading rule lessons that connect spelling patterns, transcription, pronunciation, exceptions, and practice.
- Add an exercise experience for listening and matching activities, covering at least the MVP exercise types for symbol recognition, word/transcription association, stress identification, and rule application.
- Add a content management workflow backed by Directus and PostgreSQL so admins can create, order, publish, and update course content and audio assets without code changes.
- Define a reusable content model so courses, modules, lesson blocks, examples, audio assets, and exercises can be reused across lessons.

## Capabilities

### New Capabilities
- `course-navigation`: Public course discovery, module sequencing, lesson block navigation, and responsive learner-facing pages.
- `phonetic-study-cards`: Learner pages for phonetic symbols and sound combinations with audio, explanations, examples, and comparison guidance.
- `reading-rule-lessons`: Learner pages for reading rules with explanations, examples, exceptions, and reinforcement activities.
- `phonetic-exercises`: Interactive exercise delivery for audio-based recognition, matching, stress selection, and rule practice.
- `content-admin-management`: Admin-managed content model, publishing workflow, ordering, and audio asset management via CMS.

### Modified Capabilities
- None.

## Impact

- New Next.js App Router frontend for the public learning experience.
- New Directus project configuration and PostgreSQL schema/content collections.
- API integration between the frontend and Directus for published content retrieval.
- Audio storage and delivery pipeline for lesson and exercise playback.
- Shared TypeScript types and content mapping for course, lesson, example, and exercise entities.
