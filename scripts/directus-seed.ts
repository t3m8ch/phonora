import path from "node:path";

import {
  createItem,
  directusRequest,
  directusUpload,
  getAdminToken,
  readItems,
  updateItem,
  upsertByUnique,
} from "./directus-utils";

type SeedData = typeof import("../cms/seed-data/phonora-mvp.json");
type LocalizedText = { en: string; ru: string };
type IdMap = Map<string, string>;

const seedPath = path.join(process.cwd(), "cms/seed-data/phonora-mvp.json");
const seedData = (await Bun.file(seedPath).json()) as SeedData;

const localizedTextFields = (field: string, value?: LocalizedText | null) => {
  if (!value) {
    return {};
  }

  return {
    [`${field}_en`]: value.en,
    [`${field}_ru`]: value.ru,
  };
};

const localizedOptionLabel = (value: LocalizedText) => ({
  label_en: value.en,
  label_ru: value.ru,
});

async function findOneByField(
  token: string,
  collection: string,
  field: string,
  value: string | number,
) {
  const query = new URLSearchParams({
    filter: JSON.stringify({ [field]: { _eq: value } }),
    limit: "1",
  }).toString();

  const response = await readItems<Record<string, unknown> & { id: string }>(
    token,
    collection,
    `?${query}`,
  );

  return response.data[0] ?? null;
}

async function ensureFile(token: string, asset: SeedData["audioAssets"][number]) {
  const existingFiles = await directusRequest<{ data: Array<{ id: string }> }>(
    token,
    `/files?filter[title][_eq]=${encodeURIComponent(asset.title.en)}&limit=1`,
  );
  const existing = existingFiles.data[0];
  if (existing) {
    return String(existing.id);
  }

  const uploaded = await directusUpload(
    token,
    path.join(process.cwd(), "cms/assets", asset.file),
    asset.title.en,
  );

  return uploaded.data.id;
}

async function ensureJunction(
  token: string,
  collection: string,
  payload: Record<string, unknown>,
) {
  const query = new URLSearchParams({
    filter: JSON.stringify(payload),
    limit: "1",
  }).toString();

  const existing = await readItems<Record<string, unknown> & { id: string }>(
    token,
    collection,
    `?${query}`,
  );

  if (!existing.data[0]) {
    await createItem(token, collection, payload);
  }
}

async function ensureExerciseItem(
  token: string,
  exerciseId: string,
  item: SeedData["exercises"][number]["items"][number],
  audioMap: IdMap,
  exampleMap: IdMap,
) {
  const existing = await findOneByField(token, "exercise_items", "sort", item.sort);
  const payload = {
    exercise: exerciseId,
    sort: item.sort,
    type: item.type,
    ...localizedTextFields("prompt", item.prompt),
    ...localizedTextFields("prompt_note", item.prompt_note ?? null),
    prompt_symbol: item.prompt_symbol ?? null,
    prompt_word: item.prompt_word ?? null,
    prompt_transcription: item.prompt_transcription ?? null,
    prompt_audio: item.prompt_audio ? audioMap.get(item.prompt_audio) : null,
    linked_example_word: item.linked_example_word
      ? exampleMap.get(item.linked_example_word)
      : null,
    options: item.options.map((option) => ({
      id: option.id,
      ...localizedOptionLabel(option.label),
      value: option.value ?? null,
      word: option.word ?? null,
      transcription: option.transcription ?? null,
      symbol: option.symbol ?? null,
      audio_asset_id: option.audio_asset_id ? audioMap.get(option.audio_asset_id) : null,
    })),
    correct_option_ids: item.correct_option_ids,
    ...localizedTextFields("explanation", item.explanation ?? null),
  };

  if (existing && String(existing.exercise) === String(exerciseId)) {
    await updateItem(token, "exercise_items", String(existing.id), payload);
    return String(existing.id);
  }

  const created = await createItem(token, "exercise_items", payload);
  return String(created.data.id);
}

async function main() {
  const token = await getAdminToken();
  const audioMap: IdMap = new Map();
  const exampleMap: IdMap = new Map();
  const symbolMap: IdMap = new Map();
  const combinationMap: IdMap = new Map();
  const ruleMap: IdMap = new Map();
  const exerciseMap: IdMap = new Map();
  const moduleMap: IdMap = new Map();

  console.log("Seeding course");
  const course = await upsertByUnique(token, "courses", "slug", seedData.course.slug, {
    status: "published",
    slug: seedData.course.slug,
    ...localizedTextFields("title", seedData.course.title),
    ...localizedTextFields("summary", seedData.course.summary),
    ...localizedTextFields("description", seedData.course.description),
    ...localizedTextFields("hero_headline", seedData.course.hero_headline),
    ...localizedTextFields("hero_subheadline", seedData.course.hero_subheadline),
  });
  const courseId = String(course.data.id);

  console.log("Uploading audio files and audio asset records");
  for (const asset of seedData.audioAssets) {
    const fileId = await ensureFile(token, asset);
    const record = await upsertByUnique(token, "audio_assets", "title_en", asset.title.en, {
      status: "published",
      ...localizedTextFields("title", asset.title),
      ...localizedTextFields("description", asset.description),
      transcript: asset.transcript,
      phonetic_focus: asset.phonetic_focus,
      license_note: "Generated project placeholder audio",
      file: fileId,
    });
    audioMap.set(asset.key, String(record.data.id));
  }

  console.log("Seeding reusable example words");
  for (const word of seedData.exampleWords) {
    const record = await upsertByUnique(token, "example_words", "word", word.word, {
      status: "published",
      word: word.word,
      transcription: word.transcription,
      ...localizedTextFields("translation", word.translation),
      ...localizedTextFields("note", word.note),
      primary_audio: word.primary_audio ? audioMap.get(word.primary_audio) : null,
    });
    exampleMap.set(word.key, String(record.data.id));
  }

  console.log("Seeding modules");
  for (const module of seedData.modules) {
    const record = await upsertByUnique(token, "modules", "slug", module.slug, {
      status: "published",
      course: courseId,
      slug: module.slug,
      ...localizedTextFields("title", module.title),
      ...localizedTextFields("summary", module.summary),
      ...localizedTextFields("theme_label", module.theme_label),
      order: module.order,
    });
    moduleMap.set(module.key, String(record.data.id));
  }

  console.log("Seeding phonetic symbols");
  for (const symbol of seedData.phoneticSymbols) {
    const record = await upsertByUnique(token, "phonetic_symbols", "slug", symbol.slug, {
      status: "published",
      slug: symbol.slug,
      symbol: symbol.symbol,
      ...localizedTextFields("title", symbol.title),
      ...localizedTextFields("sound_type", symbol.sound_type),
      ...localizedTextFields("explanation", symbol.explanation),
      ...localizedTextFields("stress_note", symbol.stress_note),
      ...localizedTextFields("common_mistakes", symbol.common_mistakes),
      ...localizedTextFields("comparison_note", symbol.comparison_note),
      primary_audio: symbol.primary_audio ? audioMap.get(symbol.primary_audio) : null,
    });
    const symbolId = String(record.data.id);
    symbolMap.set(symbol.key, symbolId);

    for (const [index, exampleKey] of symbol.example_keys.entries()) {
      await ensureJunction(token, "phonetic_symbols_example_words", {
        phonetic_symbols_id: symbolId,
        example_words_id: exampleMap.get(exampleKey),
        sort: index + 1,
      });
    }
  }

  console.log("Seeding sound combinations");
  for (const combination of seedData.soundCombinations) {
    const record = await upsertByUnique(token, "sound_combinations", "slug", combination.slug, {
      status: "published",
      slug: combination.slug,
      combination_text: combination.combination_text,
      ...localizedTextFields("title", combination.title),
      ...localizedTextFields("explanation", combination.explanation),
      ...localizedTextFields("stress_note", combination.stress_note),
      ...localizedTextFields("common_mistakes", combination.common_mistakes),
      ...localizedTextFields("comparison_note", combination.comparison_note),
      primary_audio: combination.primary_audio
        ? audioMap.get(combination.primary_audio)
        : null,
    });
    const combinationId = String(record.data.id);
    combinationMap.set(combination.key, combinationId);

    for (const [index, exampleKey] of combination.example_keys.entries()) {
      await ensureJunction(token, "sound_combinations_example_words", {
        sound_combinations_id: combinationId,
        example_words_id: exampleMap.get(exampleKey),
        sort: index + 1,
      });
    }
  }

  console.log("Seeding exercises and items");
  for (const exercise of seedData.exercises) {
    const record = await upsertByUnique(token, "exercises", "slug", exercise.slug, {
      status: "published",
      slug: exercise.slug,
      ...localizedTextFields("title", exercise.title),
      ...localizedTextFields("summary", exercise.summary),
      ...localizedTextFields("instructions", exercise.instructions),
      show_item_feedback: exercise.show_item_feedback,
      passing_score: exercise.passing_score,
    });
    const exerciseId = String(record.data.id);
    exerciseMap.set(exercise.key, exerciseId);

    for (const item of exercise.items) {
      await ensureExerciseItem(token, exerciseId, item, audioMap, exampleMap);
    }
  }

  console.log("Seeding reading rules");
  for (const rule of seedData.readingRules) {
    const record = await upsertByUnique(token, "reading_rules", "slug", rule.slug, {
      status: "published",
      slug: rule.slug,
      ...localizedTextFields("title", rule.title),
      ...localizedTextFields("rule_statement", rule.rule_statement),
      ...localizedTextFields("explanation", rule.explanation),
      ...localizedTextFields("exceptions", rule.exceptions),
      ...localizedTextFields("limitations", rule.limitations),
      ...localizedTextFields("practice_intro", rule.practice_intro),
    });
    const ruleId = String(record.data.id);
    ruleMap.set(rule.key, ruleId);

    for (const [index, exampleKey] of rule.example_keys.entries()) {
      await ensureJunction(token, "reading_rules_example_words", {
        reading_rules_id: ruleId,
        example_words_id: exampleMap.get(exampleKey),
        sort: index + 1,
      });
    }

    for (const [index, exerciseKey] of rule.reinforcement_exercise_keys.entries()) {
      await ensureJunction(token, "reading_rules_exercises", {
        reading_rules_id: ruleId,
        exercises_id: exerciseMap.get(exerciseKey),
        sort: index + 1,
      });
    }
  }

  console.log("Creating lesson blocks");
  for (const lesson of seedData.lessonBlocks) {
    await upsertByUnique(token, "lesson_blocks", "slug", lesson.slug, {
      status: "published",
      visibility: "visible",
      module: moduleMap.get(lesson.module),
      slug: lesson.slug,
      ...localizedTextFields("title", lesson.title),
      ...localizedTextFields("description", lesson.description),
      lesson_type: lesson.lesson_type,
      order: lesson.order,
      estimated_minutes: lesson.estimated_minutes,
      phonetic_symbol: lesson.phonetic_symbol ? symbolMap.get(lesson.phonetic_symbol) : null,
      sound_combination: lesson.sound_combination
        ? combinationMap.get(lesson.sound_combination)
        : null,
      reading_rule: lesson.reading_rule ? ruleMap.get(lesson.reading_rule) : null,
      exercise: lesson.exercise ? exerciseMap.get(lesson.exercise) : null,
    });
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
