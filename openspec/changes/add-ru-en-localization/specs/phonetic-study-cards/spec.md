## MODIFIED Requirements

### Requirement: Phonetic symbol cards shall present core learning data
The system SHALL provide learner-facing pages for individual phonetic symbols that include the symbol itself, sound type or label, explanation text, example words, and audio playback, and SHALL render localizable learner-facing text in the active locale with fallback behavior when needed.

#### Scenario: Learner opens a phonetic symbol card in the active locale
- **WHEN** a published phonetic symbol card is requested
- **THEN** the system displays the symbol, localized explanatory text, linked examples, and at least one playable audio source for the active locale

### Requirement: Sound combination cards shall explain combined pronunciation
The system SHALL provide learner-facing pages for sound combinations that include the combination text, explanation of how it sounds, example words, and audio playback, and SHALL render localizable learner-facing text in the active locale with fallback behavior when needed.

#### Scenario: Learner opens a sound combination card in the active locale
- **WHEN** a published sound combination card is requested
- **THEN** the system displays the combination, localized explanation, examples, and playable audio for the active locale

### Requirement: Study cards shall support pronunciation guidance
The system SHALL allow study cards to include stress notes, common mistake notes, or comparison guidance for similar sounds when such guidance is provided by content authors, and SHALL render those notes in the active locale.

#### Scenario: Card contains comparison guidance
- **WHEN** a phonetic symbol or sound combination has comparison or mistake notes configured
- **THEN** the system displays those notes as localized learner-facing content on the card
