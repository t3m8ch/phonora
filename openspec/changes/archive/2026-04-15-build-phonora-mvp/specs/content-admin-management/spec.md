## ADDED Requirements

### Requirement: Admins shall manage structured learning content without code changes
The system SHALL provide an admin-managed content model for courses, modules, lesson blocks, phonetic symbols, sound combinations, reading rules, exercises, example words, and related metadata.

#### Scenario: Admin creates a new phonetic lesson
- **WHEN** an authorized admin creates new lesson content in the CMS
- **THEN** the system stores it as structured content that can later be rendered by the public frontend without code modification

### Requirement: Admins shall control ordering and publication state
The system SHALL allow authorized admins to define the order of modules and lesson blocks and to publish, unpublish, or hide content entities from the public site.

#### Scenario: Admin changes lesson order
- **WHEN** an authorized admin updates ordering for lesson blocks in a module
- **THEN** the public site reflects the new order for published learners

#### Scenario: Admin unpublishes content
- **WHEN** an authorized admin marks a lesson entity or lesson block as unpublished
- **THEN** the public site stops displaying that content

### Requirement: Admins shall upload and reuse audio assets
The system SHALL allow authorized admins to upload audio assets, replace them, and associate the same asset with multiple lessons or exercise items.

#### Scenario: Admin reuses an existing audio asset
- **WHEN** an authorized admin links one uploaded audio asset to multiple content records
- **THEN** the system stores those associations without requiring duplicate file uploads
