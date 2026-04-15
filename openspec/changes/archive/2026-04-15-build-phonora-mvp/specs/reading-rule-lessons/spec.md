## ADDED Requirements

### Requirement: Reading rule lessons shall connect spelling, transcription, and sound
The system SHALL provide learner-facing reading rule pages that present the rule statement, explanation, representative examples, and the relationship between written forms, transcription, and pronunciation.

#### Scenario: Learner opens a reading rule lesson
- **WHEN** a published reading rule lesson is requested
- **THEN** the system displays the rule statement, explanation, and examples that illustrate the rule

### Requirement: Reading rule lessons shall support exceptions and limitations
The system SHALL allow content authors to attach exception notes, limitations, or caveats to reading rule lessons and display them to learners.

#### Scenario: Rule contains exceptions
- **WHEN** a reading rule lesson has exception or limitation content configured
- **THEN** the system displays that content alongside the main rule explanation

### Requirement: Reading rule lessons shall link to reinforcement practice
The system SHALL allow a reading rule lesson to reference one or more exercises for reinforcement.

#### Scenario: Reading rule lesson includes practice
- **WHEN** a learner views a reading rule lesson with linked exercises
- **THEN** the system displays access to those exercises from the lesson page
