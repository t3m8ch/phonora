## ADDED Requirements

### Requirement: Published course overview shall be available to learners
The system SHALL provide a public course entry experience that presents the Phonora course purpose, available learning sections, and access to published modules and lesson blocks.

#### Scenario: Learner opens the course landing page
- **WHEN** a learner visits the public Phonora course entry page
- **THEN** the system displays the course title, course description, and links to published modules or sections

### Requirement: Modules and lesson blocks shall follow editor-defined order
The system SHALL render modules and lesson blocks in the order configured by admins so learners can follow the intended progression from symbols to combinations to reading rules and exercises.

#### Scenario: Learner browses course structure
- **WHEN** published modules and lesson blocks exist with explicit order values
- **THEN** the system displays them in that configured order

#### Scenario: Unpublished lesson block exists in a module
- **WHEN** a lesson block is marked as hidden or draft
- **THEN** the public course navigation excludes that lesson block

### Requirement: Lesson pages shall support progression navigation
The system SHALL provide navigation controls on learner-facing lesson pages so users can return to the parent module and move to adjacent published lesson blocks where applicable.

#### Scenario: Learner finishes a lesson block with a following published block
- **WHEN** the learner views the lesson page
- **THEN** the system provides a link to the next published lesson block and a link back to the containing module
