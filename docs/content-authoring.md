# Phonora content authoring guide

## Recommended editor workflow

1. Open Directus Studio.
2. Create or update reusable **audio_assets** first.
3. Create reusable **example_words** and attach audio where needed.
4. Create the lesson content entity:
   - **phonetic_symbols** for single-sound cards
   - **sound_combinations** for diphthongs / combinations
   - **reading_rules** for spelling-to-sound rules
   - **exercises** for practice sets
5. Create or update **lesson_blocks** to place each lesson inside a module.
6. Set `status = published` and `visibility = visible` for any content that should appear publicly.

## Collection overview

- `courses` — public course shell and hero copy
- `modules` — ordered learning sections
- `lesson_blocks` — ordered public lesson entries inside modules
- `audio_assets` — reusable audio metadata linked to Directus files
- `example_words` — reusable words, transcription, translations, notes, audio
- `phonetic_symbols` — symbol lessons
- `sound_combinations` — combination lessons
- `reading_rules` — reading rule lessons and linked reinforcement exercises
- `exercises` — practice containers
- `exercise_items` — typed question records

## Publication rules

- Public frontend reads only records with `status = published`.
- `lesson_blocks` must also have `visibility = visible`.
- Draft or hidden content stays available in Directus Studio but is excluded from the public app.

## Exercise authoring notes

Supported `exercise_items.type` values:

- `audio_to_symbol`
- `symbol_to_audio`
- `symbol_to_word`
- `transcription_to_word`
- `stress_selection`
- `similar_sound_discrimination`
- `reading_rule_application`

`options` is stored as JSON. Each option may contain:

```json
{
  "id": "option-id",
  "label": "Option label",
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
