# Phonora content authoring guide

## Recommended editor workflow

1. Open Directus Studio.
2. In your Directus user profile, choose the admin UI language you want to work in (`English` or `Русский`) when available.
3. Open the singleton **course** record that `cms:setup` creates automatically and edit its bilingual site/course copy.
4. Create or update reusable **audio_assets** first.
5. Create reusable **example_words** and attach audio where needed.
6. Create the lesson content entity:
   - **phonetic_symbols** for single-sound cards
   - **sound_combinations** for diphthongs / combinations
   - **reading_rules** for spelling-to-sound rules
   - **exercises** for practice sets
7. Create or update **lesson_blocks** to place each lesson inside a module.
8. Fill in both `*_en` and `*_ru` fields for learner-facing text on every record that will be published.
9. Set `status = published` and `visibility = visible` for any content that should appear publicly.

## Collection overview

- `courses` — public course shell and hero copy with bilingual course text
- `modules` — ordered learning sections with bilingual titles and summaries
- `lesson_blocks` — ordered public lesson entries inside modules with bilingual learner-facing labels
- `audio_assets` — reusable audio metadata linked to Directus files; title/description can be bilingual
- `example_words` — reusable words, transcription, localized translations, localized notes, audio
- `phonetic_symbols` — symbol lessons with bilingual explanation fields
- `sound_combinations` — combination lessons with bilingual explanation fields
- `reading_rules` — reading rule lessons and linked reinforcement exercises with bilingual text
- `exercises` — practice containers with bilingual titles, summaries, and instructions
- `exercise_items` — typed question records with bilingual prompts and explanations

## Bilingual authoring rules

- Use `*_en` for learner-facing English text.
- Use `*_ru` for learner-facing Russian text.
- Legacy single-language fields are not part of the authoring model anymore.
- If a Russian translation is missing, the public site falls back to English instead of showing blank text.
- Before publishing, review both language variants intentionally; fallback is a safety net, not the preferred final state.

## Publication rules

- Public frontend reads only records with `status = published`.
- `lesson_blocks` must also have `visibility = visible`.
- Draft or hidden content stays available in Directus Studio but is excluded from the public app in every locale.

## Exercise authoring notes

Supported `exercise_items.type` values:

- `audio_to_symbol`
- `symbol_to_audio`
- `symbol_to_word`
- `transcription_to_word`
- `stress_selection`
- `similar_sound_discrimination`
- `reading_rule_application`

`options` is stored as JSON. Each option may contain bilingual display labels:

```json
{
  "id": "option-id",
  "label_en": "English label",
  "label_ru": "Русская подпись",
  "word": "ship",
  "transcription": "/ʃɪp/",
  "symbol": "/ɪ/",
  "audio_asset_id": "<audio asset primary key>"
}
```

`correct_option_ids` is a JSON array of option ids.

## Audio guidance

- Keep file names descriptive and stable.
- Use one asset per distinct pronunciation example where possible.
- Reuse the same audio asset across lessons and exercises instead of re-uploading duplicate files.
- Store attribution or sourcing details in `license_note` when non-generated audio is used.

## Admin workspace language notes

- Directus Studio shell language depends on the Directus user/profile setting and platform support.
- Project-specific field notes are written so editors can understand the bilingual workflow in either admin language.
- When testing editor workflows, verify that both English and Russian-speaking editors can identify where to enter learner-facing copy.
