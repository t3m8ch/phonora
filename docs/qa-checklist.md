# Phonora QA checklist

## Automated checks

Run before shipping:

```bash
bun run lint
bun run build
```

Optional smoke verification after the local stack is running:

```bash
bun run qa:smoke
```

## Local functional checks

1. Start services:
   ```bash
   docker compose up -d
   bun run cms:setup
   bun run cms:seed
   bun run dev
   ```
2. Open `http://localhost:3000`.
3. Confirm locale redirect behavior:
   - `/` redirects to `/en` by default
   - `/` redirects to `/ru` when browser language prefers Russian and no saved preference overrides it
   - switching locale updates the URL and keeps you on the equivalent page when possible
4. Confirm the landing pages for `/en` and `/ru` show:
   - localized hero copy
   - published modules in the expected order
   - links into each module that preserve the current locale
5. Open each localized module page and confirm:
   - lessons render in configured order
   - hidden or draft lessons do not appear
   - lesson links preserve the current locale
6. Open each localized lesson page and confirm:
   - previous / next navigation works within the current locale
   - back-to-module link works within the current locale
   - mobile layout remains readable
7. For study cards, confirm in both locales:
   - symbol or combination renders clearly
   - localized explanations, notes, and example text appear
   - attached audio controls are visible and playable
8. For reading rules, confirm in both locales:
   - localized rule statement, examples, exceptions, and reinforcement text render
9. For exercise lessons, confirm in both locales:
   - all item types render
   - localized prompts, option labels, and feedback appear
   - selecting answers updates visual state
   - score summary appears after submission
   - reset clears the selection state
10. In Directus Studio, confirm editors can:
   - switch the admin workspace language to English or Russian when supported
   - create a new lesson entity
   - fill in both `*_en` and `*_ru` fields for learner-facing text
   - confirm legacy single-language fields such as `title` are no longer shown in localized collections
   - attach example words and audio
   - change ordering
   - publish / hide content
   - replace an audio file
11. Verify translation fallback:
   - temporarily leave a `*_ru` value empty on a non-critical record
   - confirm the Russian public page falls back to English rather than showing a blank label

## Browser / viewport matrix

- Chrome desktop
- Safari desktop
- Firefox desktop
- Mobile Safari (or iOS simulator)
- Chrome for Android responsive viewport

## Notes from current implementation

- The repository includes generated placeholder WAV files for local seed data.
- The frontend gracefully shows empty states when Directus is unreachable or no published content exists.
- Public locale preference is persisted via a cookie and refreshed by locale-prefixed navigation.
