# phonetic-study-cards Specification

## Purpose
TBD - created by archiving change build-phonora-mvp. Update Purpose after archive.
## Requirements
### Requirement: Phonetic symbol cards shall present core learning data
The system SHALL provide learner-facing pages for individual phonetic symbols that include the symbol itself, sound type or label, explanation text, example words, and audio playback.

#### Scenario: Learner opens a phonetic symbol card
- **WHEN** a published phonetic symbol card is requested
- **THEN** the system displays the symbol, explanatory text, linked examples, and at least one playable audio source

### Requirement: Sound combination cards shall explain combined pronunciation
The system SHALL provide learner-facing pages for sound combinations that include the combination text, explanation of how it sounds, example words, and audio playback.

#### Scenario: Learner opens a sound combination card
- **WHEN** a published sound combination card is requested
- **THEN** the system displays the combination, explanation, examples, and playable audio

### Requirement: Study cards shall support pronunciation guidance
The system SHALL allow study cards to include stress notes, common mistake notes, or comparison guidance for similar sounds when such guidance is provided by content authors.

#### Scenario: Card contains comparison guidance
- **WHEN** a phonetic symbol or sound combination has comparison or mistake notes configured
- **THEN** the system displays those notes as part of the learner-facing card

