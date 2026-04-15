## MODIFIED Requirements

### Requirement: Admins shall manage structured learning content without code changes
The system SHALL provide an admin-managed content model for courses, modules, lesson blocks, phonetic symbols, sound combinations, reading rules, exercises, example words, and related metadata, and SHALL allow localized Russian and English text variants to be stored on the same content records without requiring duplicate records per language.

#### Scenario: Admin creates a new phonetic lesson with bilingual content
- **WHEN** an authorized admin creates new lesson content in the CMS and enters Russian and English values for the localizable fields
- **THEN** the system stores both language variants as structured content that can later be rendered by the public frontend without code modification

### Requirement: Admins shall control ordering and publication state
The system SHALL allow authorized admins to define the order of modules and lesson blocks and to publish, unpublish, or hide content entities from the public site, and those ordering and publication controls SHALL apply consistently across both supported locales.

#### Scenario: Admin changes lesson order
- **WHEN** an authorized admin updates ordering for lesson blocks in a module
- **THEN** the public site reflects the new order for published learners in both Russian and English views

#### Scenario: Admin unpublishes content
- **WHEN** an authorized admin marks a lesson entity or lesson block as unpublished
- **THEN** the public site stops displaying that content in every public locale

## ADDED Requirements

### Requirement: Admins shall be able to edit locale-specific content intentionally
The system SHALL present bilingual authoring fields and guidance that clearly distinguish Russian and English content inputs for localizable learner-facing text.

#### Scenario: Admin edits a localized course record
- **WHEN** an authorized admin opens a course or lesson record in the CMS
- **THEN** the system shows distinct Russian and English fields or equivalents for each localizable text attribute

#### Scenario: Admin reviews translation completeness
- **WHEN** an authorized admin checks a record before publishing
- **THEN** the system provides enough field labeling or guidance to determine whether Russian and English content has been entered intentionally
