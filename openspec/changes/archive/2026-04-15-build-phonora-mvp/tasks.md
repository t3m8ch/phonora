## 1. Project foundation

- [x] 1.1 Bootstrap the public app with Next.js App Router, TypeScript, base styling, and environment variable support
- [x] 1.2 Add local development orchestration for Next.js, Directus, and PostgreSQL (for example via Docker Compose or equivalent scripts)
- [x] 1.3 Define shared configuration for Directus API access, media base URLs, and published-content filtering

## 2. CMS schema and content model

- [x] 2.1 Create Directus collections and relations for courses, modules, lesson blocks, phonetic symbols, sound combinations, reading rules, exercises, exercise items, and reusable example content
- [x] 2.2 Configure ordering, slug, publication status, and visibility fields required for public navigation and draft workflows
- [x] 2.3 Configure Directus file storage and metadata for reusable audio assets
- [x] 2.4 Create initial roles and permissions so admins can manage content while public users can read only published data

## 3. Frontend data access and mapping

- [x] 3.1 Implement typed Directus client utilities for fetching course navigation, lesson content, reading rules, exercises, and media references
- [x] 3.2 Add content adapter/mapping functions that transform Directus records into stable frontend view models
- [x] 3.3 Add error and empty-state handling for missing, unpublished, or incomplete content records

## 4. Learner-facing course experience

- [x] 4.1 Build the public landing page with course overview and entry points into published learning sections
- [x] 4.2 Build ordered module and lesson block navigation pages using CMS-defined sequencing
- [x] 4.3 Build learner lesson layouts with previous/next navigation and links back to the parent module
- [x] 4.4 Implement responsive layouts for desktop and mobile lesson browsing

## 5. Lesson content pages

- [x] 5.1 Implement phonetic symbol pages with symbol display, explanations, examples, notes, and audio playback
- [x] 5.2 Implement sound combination pages with combination explanations, examples, comparison notes, and audio playback
- [x] 5.3 Implement reading rule pages with rule statements, examples, exceptions, and linked reinforcement exercises

## 6. Exercise delivery

- [x] 6.1 Implement a generic exercise page shell that renders typed exercise items from CMS data
- [x] 6.2 Support the MVP exercise variants for audio-to-symbol, symbol-to-audio, symbol-to-word, transcription-to-word, stress selection, similar-sound discrimination, and reading-rule application
- [x] 6.3 Implement answer evaluation and learner feedback states for submitted exercise responses
- [x] 6.4 Ensure reusable words, transcription, and audio assets can be referenced across multiple exercise items without frontend duplication

## 7. Seed content, QA, and release readiness

- [x] 7.1 Seed the CMS with a minimal Phonora MVP dataset covering at least one course, core modules, sample symbols, combinations, reading rules, and exercises
- [x] 7.2 Verify admin workflows for creating, ordering, publishing, hiding, and updating lesson content and audio assets
- [x] 7.3 Test the public experience across modern desktop and mobile browsers, including audio playback and navigation flows
- [x] 7.4 Document setup, deployment, and content-authoring expectations for future implementation work
