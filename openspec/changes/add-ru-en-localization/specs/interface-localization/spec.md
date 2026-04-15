## ADDED Requirements

### Requirement: Public locale shall be selected from user preference or browser language
The system SHALL resolve the initial public locale using a persisted user language preference first, then the browser language, and SHALL default to English when no Russian preference is detected.

#### Scenario: Returning learner has a saved locale
- **WHEN** a learner opens the public site and a previously selected locale is stored
- **THEN** the system routes the learner into that saved locale and renders the site in that language

#### Scenario: First-time learner prefers Russian in the browser
- **WHEN** a learner opens the public site without a saved locale and the browser language indicates Russian
- **THEN** the system routes the learner into the Russian public locale

#### Scenario: No Russian preference is available
- **WHEN** a learner opens the public site without a saved locale and the browser language does not indicate Russian
- **THEN** the system routes the learner into the English public locale

### Requirement: Learners shall be able to switch between Russian and English
The system SHALL provide a visible language switcher on the public site that lets learners change between Russian and English and SHALL persist the selected locale for future visits.

#### Scenario: Learner switches language on a lesson page
- **WHEN** a learner changes the language from English to Russian while viewing a public page
- **THEN** the system keeps the learner on the equivalent localized page and stores Russian as the preferred locale

### Requirement: Shared public interface labels shall render in the active locale
The system SHALL render shared public interface text, including site header labels, navigation actions, empty states, and lesson navigation controls, in the active locale.

#### Scenario: Learner browses the site in Russian
- **WHEN** a learner is in the Russian locale
- **THEN** the system displays shared interface labels and action text in Russian

#### Scenario: Requested translation is missing for a shared label
- **WHEN** a shared public interface label is unavailable in the active locale
- **THEN** the system displays the English fallback instead of an empty label

### Requirement: Admin workspace shall support Russian and English language selection
The system SHALL support admin use of the content workspace in Russian and English by documenting and configuring the admin experience so editors can work in either locale.

#### Scenario: Editor works in Russian admin context
- **WHEN** an editor selects Russian for the admin workspace
- **THEN** the admin shell and authoring guidance used by the project are available in Russian where supported by the platform

#### Scenario: Editor works in English admin context
- **WHEN** an editor selects English for the admin workspace
- **THEN** the admin shell and authoring guidance used by the project are available in English where supported by the platform
