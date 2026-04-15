## ADDED Requirements

### Requirement: The system shall support the MVP exercise types
The system SHALL support exercise delivery for at least the following types: choose a phonetic symbol by audio, choose audio by symbol, match symbol to word, match transcription to word, choose correct stress, distinguish similar sounds, and apply reading rules.

#### Scenario: Learner opens a supported exercise
- **WHEN** an exercise is configured with one of the supported MVP exercise types
- **THEN** the system renders prompts, options, and media appropriate for that exercise type

### Requirement: Exercise items shall support reusable prompts and media
The system SHALL allow each exercise item to reference reusable text, transcription, word, and audio content so that existing assets can be reused across multiple exercises.

#### Scenario: Exercise item references existing audio and word examples
- **WHEN** an exercise item is linked to reusable content assets
- **THEN** the system renders the linked prompt data without requiring duplicate content definitions in the frontend code

### Requirement: Exercises shall provide answer evaluation feedback
The system SHALL evaluate learner responses for exercise items and present correctness feedback or result states defined for the exercise flow.

#### Scenario: Learner submits an answer
- **WHEN** the learner selects or matches an answer and submits the response
- **THEN** the system evaluates the response against the configured correct answer and shows the result state
