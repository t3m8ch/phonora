# Phonora QA checklist

## Automated checks

Run before shipping:

```bash
bun run lint
bun run build
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
3. Confirm the landing page shows:
   - hero copy
   - published modules in the expected order
   - links into each module
4. Open each module page and confirm:
   - lessons render in configured order
   - hidden or draft lessons do not appear
5. Open each lesson page and confirm:
   - previous / next navigation works
   - back-to-module link works
   - mobile layout remains readable
6. For study cards, confirm:
   - symbol or combination renders clearly
   - examples appear with transcription
   - attached audio controls are visible and playable
7. For reading rules, confirm:
   - rule statement, examples, exceptions, and reinforcement links render
8. For exercise lessons, confirm:
   - all item types render
   - selecting answers updates visual state
   - score summary appears after submission
   - reset clears the selection state
9. In Directus Studio, confirm editors can:
   - create a new lesson entity
   - attach example words and audio
   - change ordering
   - publish / hide content
   - replace an audio file

## Browser / viewport matrix

- Chrome desktop
- Safari desktop
- Firefox desktop
- Mobile Safari (or iOS simulator)
- Chrome for Android responsive viewport

## Notes from current implementation

- The repository includes generated placeholder WAV files for local seed data.
- The frontend gracefully shows empty states when Directus is unreachable or no published content exists.
