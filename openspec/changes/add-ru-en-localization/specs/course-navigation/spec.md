## MODIFIED Requirements

### Requirement: Published course overview shall be available to learners
The system SHALL provide a public course entry experience that presents the Phonora course purpose, available learning sections, and access to published modules and lesson blocks in the active locale, using the configured fallback locale when a translation is unavailable.

#### Scenario: Learner opens the course landing page in Russian
- **WHEN** a learner visits the public Phonora course entry page in the Russian locale
- **THEN** the system displays the localized course hero headline, hero subheadline, and links to published modules or sections in Russian

#### Scenario: Learner opens the course landing page with a missing translation
- **WHEN** a learner visits the public Phonora course entry page in a locale where some course copy is not translated
- **THEN** the system displays the fallback locale content instead of blank values

### Requirement: Modules and lesson blocks shall follow editor-defined order
The system SHALL render modules and lesson blocks in the order configured by admins so learners can follow the intended progression from symbols to combinations to reading rules and exercises, and SHALL display their titles and descriptions in the active locale.

#### Scenario: Learner browses course structure
- **WHEN** published modules and lesson blocks exist with explicit order values
- **THEN** the system displays them in that configured order using the active locale for learner-facing text

#### Scenario: Unpublished lesson block exists in a module
- **WHEN** a lesson block is marked as hidden or draft
- **THEN** the public course navigation excludes that lesson block in every public locale

### Requirement: Lesson pages shall support progression navigation
The system SHALL provide navigation controls on learner-facing lesson pages so users can return to the parent module and move to adjacent published lesson blocks where applicable, and those controls SHALL preserve the active locale.

#### Scenario: Learner finishes a lesson block with a following published block
- **WHEN** the learner views the lesson page
- **THEN** the system provides a link to the next published lesson block and a link back to the containing module within the same locale
