import { directusRequest, getAdminToken } from "./directus-utils";

type CollectionDefinition = {
  collection: string;
  meta: Record<string, unknown>;
  schema?: Record<string, unknown>;
};

type FieldDefinition = {
  field: string;
  type?: string;
  meta?: Record<string, unknown>;
  schema?: Record<string, unknown>;
};

type RelationDefinition = {
  collection: string;
  field: string;
  related_collection: string;
  meta?: Record<string, unknown>;
  schema?: Record<string, unknown>;
};

type SnapshotCollection = {
  collection: string;
  meta: Record<string, unknown> | null;
  schema: Record<string, unknown> | null;
};

type SnapshotField = {
  collection: string;
  field: string;
  type: string;
  schema: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
};

type SnapshotRelation = {
  collection: string;
  field: string;
  related_collection: string | null;
  schema: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
};

type Snapshot = {
  version: number;
  directus: string;
  vendor?: string;
  collections: SnapshotCollection[];
  fields: SnapshotField[];
  relations: SnapshotRelation[];
};

const statusChoices = [
  { text: "Draft", value: "draft" },
  { text: "Published", value: "published" },
  { text: "Archived", value: "archived" },
];

const visibilityChoices = [
  { text: "Visible", value: "visible" },
  { text: "Hidden", value: "hidden" },
];

const exerciseTypeChoices = [
  "audio_to_symbol",
  "symbol_to_audio",
  "symbol_to_word",
  "transcription_to_word",
  "stress_selection",
  "similar_sound_discrimination",
  "reading_rule_application",
].map((value) => ({ text: value, value }));

const lessonTypeChoices = [
  "phonetic_symbol",
  "sound_combination",
  "reading_rule",
  "exercise",
].map((value) => ({ text: value, value }));

type LocalizedFieldOptions = {
  interface: "input" | "input-multiline" | "input-rich-text-html";
  width?: "half" | "full";
  note: string;
  maxLength?: number;
};

const localizedFieldDefinitions = (
  field: string,
  options: LocalizedFieldOptions,
): FieldDefinition[] => {
  const isText = options.interface !== "input";
  const width = options.width ?? (isText ? "full" : "half");

  return [
    {
      field: `${field}_en`,
      type: isText ? "text" : "string",
      meta: {
        interface: options.interface,
        width,
        note: `${options.note} (English)`,
      },
      schema: isText
        ? { data_type: "text" }
        : { data_type: "varchar", max_length: options.maxLength ?? 255 },
    },
    {
      field: `${field}_ru`,
      type: isText ? "text" : "string",
      meta: {
        interface: options.interface,
        width,
        note: `${options.note} (Русский)`,
      },
      schema: isText
        ? { data_type: "text" }
        : { data_type: "varchar", max_length: options.maxLength ?? 255 },
    },
  ];
};

const collectionTranslations = (
  en: { translation: string; singular: string; plural: string },
  ru: { translation: string; singular: string; plural: string },
) => [
  { language: "en-US", ...en },
  { language: "ru-RU", ...ru },
];

const bilingualNote = (en: string, ru: string) => `${en} / ${ru}`;

const fieldLabelBases: Record<string, { en: string; ru: string }> = {
  status: { en: "Publication status", ru: "Статус публикации" },
  visibility: { en: "Public visibility", ru: "Видимость на сайте" },
  modules: { en: "Modules", ru: "Модули" },
  course: { en: "Landing page", ru: "Лендинг" },
  slug: { en: "URL slug", ru: "URL-слаг" },
  title: { en: "Title", ru: "Название" },
  summary: { en: "Summary", ru: "Краткое описание" },
  hero_headline: { en: "Main headline", ru: "Главный заголовок" },
  hero_subheadline: { en: "Supporting text", ru: "Подзаголовок" },
  theme_label: { en: "Badge text", ru: "Текст бейджа" },
  lesson_blocks: { en: "Lessons", ru: "Уроки" },
  description: { en: "Description", ru: "Описание" },
  lesson_type: { en: "Lesson kind", ru: "Вид урока" },
  order: { en: "Display order", ru: "Порядок показа" },
  estimated_minutes: { en: "Estimated time (min)", ru: "Примерное время (мин)" },
  phonetic_symbol: { en: "Phonetic symbol", ru: "Фонетический символ" },
  sound_combination: { en: "Sound combination", ru: "Сочетание звуков" },
  reading_rule: { en: "Reading rule", ru: "Правило чтения" },
  exercise: { en: "Exercise", ru: "Упражнение" },
  transcript: { en: "Transcript", ru: "Транскрипт" },
  phonetic_focus: { en: "Phonetic focus", ru: "Фонетический фокус" },
  license_note: { en: "Source note", ru: "Примечание об источнике" },
  file: { en: "Audio file", ru: "Аудиофайл" },
  word: { en: "Word", ru: "Слово" },
  transcription: { en: "Transcription", ru: "Транскрипция" },
  translation: { en: "Meaning", ru: "Перевод" },
  note: { en: "Learner note", ru: "Примечание" },
  primary_audio: { en: "Audio", ru: "Аудио" },
  symbol: { en: "Symbol", ru: "Символ" },
  sound_type: { en: "Sound label", ru: "Подпись звука" },
  explanation: { en: "Explanation", ru: "Объяснение" },
  stress_note: { en: "Stress note", ru: "Примечание об ударении" },
  common_mistakes: { en: "Common mistakes", ru: "Типичные ошибки" },
  comparison_note: { en: "Compare with", ru: "Сравнить с" },
  examples: { en: "Example words", ru: "Примеры слов" },
  phonetic_symbols_id: { en: "Phonetic symbol", ru: "Фонетический символ" },
  example_words_id: { en: "Example word", ru: "Пример слова" },
  combination_text: { en: "Combination", ru: "Сочетание" },
  sound_combinations_id: { en: "Sound combination", ru: "Сочетание звуков" },
  rule_statement: { en: "Rule", ru: "Правило" },
  exceptions: { en: "Exceptions", ru: "Исключения" },
  limitations: { en: "Limits", ru: "Ограничения" },
  practice_intro: { en: "Intro before practice", ru: "Подводка к практике" },
  reinforcement_exercises: { en: "Practice exercises", ru: "Упражнения для закрепления" },
  reading_rules_id: { en: "Reading rule", ru: "Правило чтения" },
  exercises_id: { en: "Exercise", ru: "Упражнение" },
  show_item_feedback: { en: "Feedback after each question", ru: "Обратная связь после каждого вопроса" },
  passing_score: { en: "Passing score (%)", ru: "Проходной балл (%)" },
  items: { en: "Questions", ru: "Вопросы" },
  type: { en: "Question type", ru: "Тип вопроса" },
  prompt: { en: "Question text", ru: "Текст вопроса" },
  prompt_note: { en: "Hint", ru: "Подсказка" },
  prompt_symbol: { en: "Symbol in question", ru: "Символ в вопросе" },
  prompt_word: { en: "Word in question", ru: "Слово в вопросе" },
  prompt_transcription: { en: "Transcription in question", ru: "Транскрипция в вопросе" },
  prompt_audio: { en: "Question audio", ru: "Аудио вопроса" },
  linked_example_word: { en: "Linked example word", ru: "Связанный пример слова" },
  options: { en: "Answer options", ru: "Варианты ответов" },
  correct_option_ids: { en: "Correct answers", ru: "Правильные ответы" },
};

const fieldLabelOverrides: Record<string, { en: string; ru: string }> = {
  "courses.modules": { en: "Modules on page", ru: "Модули на странице" },
  "modules.course": { en: "Landing page", ru: "Лендинг" },
  "lesson_blocks.module": { en: "Module", ru: "Модуль" },
  "reading_rules.reinforcement_exercises": {
    en: "Practice exercises",
    ru: "Упражнения для закрепления",
  },
  "exercise_items.exercise": { en: "Parent exercise", ru: "Родительское упражнение" },
};

const fieldNoteBases: Record<string, { en: string; ru: string }> = {
  status: {
    en: "Choose whether this record is draft or published.",
    ru: "Выберите, будет запись черновиком или опубликованной.",
  },
  visibility: {
    en: "Show or hide this lesson on the public site.",
    ru: "Показывать или скрывать этот урок на сайте.",
  },
  modules: {
    en: "Modules shown on the landing page.",
    ru: "Модули, которые показываются на лендинге.",
  },
  course: {
    en: "Attach this module to the single landing page record.",
    ru: "Привяжите модуль к единственной записи лендинга.",
  },
  slug: {
    en: "Used in the public URL. Use lowercase Latin letters and hyphens.",
    ru: "Используется в публичном URL. Используйте строчные латинские буквы и дефисы.",
  },
  title: {
    en: "Short title shown to learners.",
    ru: "Короткое название, которое видят ученики.",
  },
  summary: {
    en: "Short supporting text shown in cards and lists.",
    ru: "Короткий текст для карточек и списков.",
  },
  hero_headline: {
    en: "Main headline on the landing page.",
    ru: "Главный заголовок на лендинге.",
  },
  hero_subheadline: {
    en: "Supporting text under the main headline.",
    ru: "Текст под главным заголовком.",
  },
  theme_label: {
    en: "Small badge text shown on the module card.",
    ru: "Небольшая подпись на карточке модуля.",
  },
  lesson_blocks: {
    en: "Lessons inside this module.",
    ru: "Уроки внутри этого модуля.",
  },
  description: {
    en: "Short description shown in lesson lists.",
    ru: "Короткое описание в списках уроков.",
  },
  lesson_type: {
    en: "Choose what kind of lesson this block opens.",
    ru: "Выберите, какой тип урока открывает этот блок.",
  },
  order: {
    en: "Smaller numbers appear first.",
    ru: "Чем меньше число, тем выше элемент.",
  },
  estimated_minutes: {
    en: "Optional time estimate shown to learners.",
    ru: "Необязательная оценка времени для ученика.",
  },
  phonetic_symbol: {
    en: "Choose the phonetic symbol lesson used by this block.",
    ru: "Выберите урок с фонетическим символом для этого блока.",
  },
  sound_combination: {
    en: "Choose the sound combination lesson used by this block.",
    ru: "Выберите урок о сочетании звуков для этого блока.",
  },
  reading_rule: {
    en: "Choose the reading rule lesson used by this block.",
    ru: "Выберите урок о правиле чтения для этого блока.",
  },
  exercise: {
    en: "Choose the exercise used here.",
    ru: "Выберите упражнение, которое используется здесь.",
  },
  transcript: {
    en: "Optional short transcript, for example /ɪ/.",
    ru: "Необязательная краткая запись, например /ɪ/.",
  },
  phonetic_focus: {
    en: "Optional internal note about the sound this audio highlights.",
    ru: "Необязательная внутренняя пометка о том, какой звук показывает это аудио.",
  },
  license_note: {
    en: "Store source or attribution details here.",
    ru: "Укажите здесь источник или атрибуцию.",
  },
  file: {
    en: "Upload or replace the audio file used on the site.",
    ru: "Загрузите или замените аудиофайл, который используется на сайте.",
  },
  word: {
    en: "Base word shown to learners.",
    ru: "Слово, которое видит ученик.",
  },
  transcription: {
    en: "IPA transcription shown with the word.",
    ru: "Транскрипция IPA, которая показывается рядом со словом.",
  },
  translation: {
    en: "Meaning of the word for learners.",
    ru: "Перевод слова для учеников.",
  },
  note: {
    en: "Extra learner-facing note.",
    ru: "Дополнительное примечание для ученика.",
  },
  primary_audio: {
    en: "Main pronunciation audio for this item.",
    ru: "Основное аудио произношения для этого элемента.",
  },
  symbol: {
    en: "IPA symbol shown on the card.",
    ru: "Символ IPA на карточке.",
  },
  sound_type: {
    en: "Short label such as vowel, consonant, or diphthong.",
    ru: "Короткая подпись, например гласный, согласный или дифтонг.",
  },
  explanation: {
    en: "Main explanation shown to learners.",
    ru: "Основное объяснение для ученика.",
  },
  stress_note: {
    en: "Extra note about stress or emphasis.",
    ru: "Дополнительная пометка про ударение.",
  },
  common_mistakes: {
    en: "Typical mistakes to watch out for.",
    ru: "Типичные ошибки, на которые стоит обратить внимание.",
  },
  comparison_note: {
    en: "Optional comparison with nearby sounds or patterns.",
    ru: "Необязательное сравнение с похожими звуками или паттернами.",
  },
  examples: {
    en: "Reusable example words shown in this lesson or card.",
    ru: "Переиспользуемые примеры слов для этого урока или карточки.",
  },
  combination_text: {
    en: "Text of the sound combination or diphthong.",
    ru: "Текст сочетания звуков или дифтонга.",
  },
  rule_statement: {
    en: "Short statement of the reading rule.",
    ru: "Краткая формулировка правила чтения.",
  },
  exceptions: {
    en: "Words or cases that do not follow the rule.",
    ru: "Слова или случаи, которые не подчиняются правилу.",
  },
  limitations: {
    en: "Where the rule does or does not apply.",
    ru: "Где правило работает, а где нет.",
  },
  practice_intro: {
    en: "Intro text shown before practice tasks.",
    ru: "Текст перед упражнениями.",
  },
  reinforcement_exercises: {
    en: "Exercises shown under this reading rule.",
    ru: "Упражнения, которые показываются под этим правилом.",
  },
  show_item_feedback: {
    en: "Show right or wrong feedback after each submitted question.",
    ru: "Показывать правильный или неправильный ответ после каждого вопроса.",
  },
  passing_score: {
    en: "Optional passing threshold from 0 to 100.",
    ru: "Необязательный проходной порог от 0 до 100.",
  },
  items: {
    en: "Questions inside this exercise.",
    ru: "Вопросы внутри этого упражнения.",
  },
  type: {
    en: "Choose how this question works.",
    ru: "Выберите, как работает этот вопрос.",
  },
  prompt: {
    en: "Main text of the question.",
    ru: "Основной текст вопроса.",
  },
  prompt_note: {
    en: "Optional hint shown near the question.",
    ru: "Необязательная подсказка рядом с вопросом.",
  },
  prompt_symbol: {
    en: "Fill when the question uses a symbol prompt.",
    ru: "Заполняйте, если вопрос строится вокруг символа.",
  },
  prompt_word: {
    en: "Fill when the question uses a word prompt.",
    ru: "Заполняйте, если вопрос строится вокруг слова.",
  },
  prompt_transcription: {
    en: "Fill when the question uses a transcription prompt.",
    ru: "Заполняйте, если вопрос строится вокруг транскрипции.",
  },
  prompt_audio: {
    en: "Attach audio when the question starts from listening.",
    ru: "Прикрепите аудио, если вопрос начинается с прослушивания.",
  },
  linked_example_word: {
    en: "Optional example word connected to this question.",
    ru: "Необязательный пример слова, связанный с этим вопросом.",
  },
  options: {
    en: "JSON list of answer options. Use label_en and label_ru inside each option.",
    ru: "JSON-список вариантов ответа. Используйте label_en и label_ru внутри каждого варианта.",
  },
  correct_option_ids: {
    en: "IDs of the correct answer options.",
    ru: "ID правильных вариантов ответа.",
  },
};

const fieldNoteOverrides: Record<string, { en: string; ru: string }> = {
  "exercise_items.exercise": {
    en: "Choose which exercise this question belongs to.",
    ru: "Выберите, к какому упражнению относится этот вопрос.",
  },
  "lesson_blocks.exercise": {
    en: "Choose the exercise opened by this lesson block.",
    ru: "Выберите упражнение, которое открывает этот блок урока.",
  },
};

const getBaseFieldKey = (field: string) => field.replace(/_(en|ru)$/, "");

const getFieldLabels = (collection: string, field: string) => {
  const baseField = getBaseFieldKey(field);
  return fieldLabelOverrides[`${collection}.${baseField}`] ?? fieldLabelBases[baseField] ?? null;
};

const getFieldNoteBase = (collection: string, field: string) => {
  const baseField = getBaseFieldKey(field);
  return fieldNoteOverrides[`${collection}.${baseField}`] ?? fieldNoteBases[baseField] ?? null;
};

const buildFieldTranslations = (collection: string, field: string) => {
  const suffixMatch = field.match(/_(en|ru)$/);
  const localeSuffix = suffixMatch ? suffixMatch[1].toUpperCase() : null;
  const labels = getFieldLabels(collection, field);

  if (!labels) {
    return null;
  }

  return [
    {
      language: "en-US",
      translation: localeSuffix ? `${labels.en} (${localeSuffix})` : labels.en,
    },
    {
      language: "ru-RU",
      translation: localeSuffix ? `${labels.ru} (${localeSuffix})` : labels.ru,
    },
  ];
};

const buildFieldNote = (collection: string, field: string, fallback?: unknown) => {
  const suffixMatch = field.match(/_(en|ru)$/);
  const locale = suffixMatch?.[1] ?? null;
  const note = getFieldNoteBase(collection, field);

  if (!note) {
    return typeof fallback === "string" ? fallback : null;
  }

  if (locale === "en") {
    return bilingualNote(`${note.en} Fill in English.`, `${note.ru} Заполните английскую версию.`);
  }

  if (locale === "ru") {
    return bilingualNote(`${note.en} Fill in Russian.`, `${note.ru} Заполните русскую версию.`);
  }

  return bilingualNote(note.en, note.ru);
};

const collections: CollectionDefinition[] = [
  {
    collection: "courses",
    meta: {
      icon: "web",
      note: "Singleton landing page hero copy for the Phonora site.",
      singleton: true,
      translations: collectionTranslations(
        { translation: "Landing Page", singular: "Landing Page", plural: "Landing Pages" },
        { translation: "Лендинг", singular: "Лендинг", plural: "Лендинги" },
      ),
    },
  },
  {
    collection: "modules",
    meta: {
      icon: "view_list",
      note: "Ordered modules within a course.",
      translations: collectionTranslations(
        { translation: "Modules", singular: "Module", plural: "Modules" },
        { translation: "Модули", singular: "Модуль", plural: "Модули" },
      ),
    },
  },
  {
    collection: "lesson_blocks",
    meta: {
      icon: "dashboard_customize",
      note: "Ordered public learning blocks inside a module.",
      translations: collectionTranslations(
        { translation: "Lesson Blocks", singular: "Lesson Block", plural: "Lesson Blocks" },
        { translation: "Блоки уроков", singular: "Блок урока", plural: "Блоки уроков" },
      ),
    },
  },
  {
    collection: "audio_assets",
    meta: {
      icon: "audio_file",
      note: "Reusable audio records that point to Directus files.",
      translations: collectionTranslations(
        { translation: "Audio Assets", singular: "Audio Asset", plural: "Audio Assets" },
        { translation: "Аудиоресурсы", singular: "Аудиоресурс", plural: "Аудиоресурсы" },
      ),
    },
  },
  {
    collection: "example_words",
    meta: {
      icon: "format_quote",
      note: "Reusable example words and transcriptions.",
      translations: collectionTranslations(
        { translation: "Example Words", singular: "Example Word", plural: "Example Words" },
        { translation: "Примеры слов", singular: "Пример слова", plural: "Примеры слов" },
      ),
    },
  },
  {
    collection: "phonetic_symbols",
    meta: {
      icon: "record_voice_over",
      note: "Phonetic symbol study cards.",
      translations: collectionTranslations(
        {
          translation: "Phonetic Symbols",
          singular: "Phonetic Symbol",
          plural: "Phonetic Symbols",
        },
        {
          translation: "Фонетические символы",
          singular: "Фонетический символ",
          plural: "Фонетические символы",
        },
      ),
    },
  },
  {
    collection: "phonetic_symbols_example_words",
    meta: {
      hidden: true,
      icon: "swap_horiz",
      note: "Junction: phonetic symbols ↔ example words.",
      translations: collectionTranslations(
        {
          translation: "Phonetic Symbols ↔ Example Words",
          singular: "Phonetic Symbol ↔ Example Word",
          plural: "Phonetic Symbols ↔ Example Words",
        },
        {
          translation: "Фонетические символы ↔ примеры слов",
          singular: "Фонетический символ ↔ пример слова",
          plural: "Фонетические символы ↔ примеры слов",
        },
      ),
    },
  },
  {
    collection: "sound_combinations",
    meta: {
      icon: "merge_type",
      note: "Sound combination and diphthong study cards.",
      translations: collectionTranslations(
        {
          translation: "Sound Combinations",
          singular: "Sound Combination",
          plural: "Sound Combinations",
        },
        {
          translation: "Сочетания звуков",
          singular: "Сочетание звуков",
          plural: "Сочетания звуков",
        },
      ),
    },
  },
  {
    collection: "sound_combinations_example_words",
    meta: {
      hidden: true,
      icon: "swap_horiz",
      note: "Junction: sound combinations ↔ example words.",
      translations: collectionTranslations(
        {
          translation: "Sound Combinations ↔ Example Words",
          singular: "Sound Combination ↔ Example Word",
          plural: "Sound Combinations ↔ Example Words",
        },
        {
          translation: "Сочетания звуков ↔ примеры слов",
          singular: "Сочетание звуков ↔ пример слова",
          plural: "Сочетания звуков ↔ примеры слов",
        },
      ),
    },
  },
  {
    collection: "reading_rules",
    meta: {
      icon: "menu_book",
      note: "Reading rule lessons.",
      translations: collectionTranslations(
        { translation: "Reading Rules", singular: "Reading Rule", plural: "Reading Rules" },
        { translation: "Правила чтения", singular: "Правило чтения", plural: "Правила чтения" },
      ),
    },
  },
  {
    collection: "reading_rules_example_words",
    meta: {
      hidden: true,
      icon: "swap_horiz",
      note: "Junction: reading rules ↔ example words.",
      translations: collectionTranslations(
        {
          translation: "Reading Rules ↔ Example Words",
          singular: "Reading Rule ↔ Example Word",
          plural: "Reading Rules ↔ Example Words",
        },
        {
          translation: "Правила чтения ↔ примеры слов",
          singular: "Правило чтения ↔ пример слова",
          plural: "Правила чтения ↔ примеры слов",
        },
      ),
    },
  },
  {
    collection: "reading_rules_exercises",
    meta: {
      hidden: true,
      icon: "swap_horiz",
      note: "Junction: reading rules ↔ reinforcement exercises.",
      translations: collectionTranslations(
        {
          translation: "Reading Rules ↔ Exercises",
          singular: "Reading Rule ↔ Exercise",
          plural: "Reading Rules ↔ Exercises",
        },
        {
          translation: "Правила чтения ↔ упражнения",
          singular: "Правило чтения ↔ упражнение",
          plural: "Правила чтения ↔ упражнения",
        },
      ),
    },
  },
  {
    collection: "exercises",
    meta: {
      icon: "quiz",
      note: "Exercise containers.",
      translations: collectionTranslations(
        { translation: "Exercises", singular: "Exercise", plural: "Exercises" },
        { translation: "Упражнения", singular: "Упражнение", plural: "Упражнения" },
      ),
    },
  },
  {
    collection: "exercise_items",
    meta: {
      icon: "checklist",
      note: "Question-level exercise items.",
      translations: collectionTranslations(
        { translation: "Exercise Items", singular: "Exercise Item", plural: "Exercise Items" },
        { translation: "Элементы упражнений", singular: "Элемент упражнения", plural: "Элементы упражнений" },
      ),
    },
  },
];

const fields: Record<string, FieldDefinition[]> = {
  courses: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    ...localizedFieldDefinitions("hero_headline", { interface: "input", note: "Localized hero headline", width: "full" }),
    ...localizedFieldDefinitions("hero_subheadline", { interface: "input-multiline", note: "Localized hero subheadline", width: "full" }),
    { field: "modules", type: "alias", meta: { special: ["o2m"], interface: "list-o2m" } },
  ],
  modules: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "course", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized module title" }),
    ...localizedFieldDefinitions("summary", { interface: "input-multiline", note: "Localized module summary", width: "full" }),
    { field: "theme_label", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    ...localizedFieldDefinitions("theme_label", { interface: "input", note: "Localized module theme label" }),
    { field: "order", type: "integer", meta: { interface: "input", width: "half" }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
    { field: "lesson_blocks", type: "alias", meta: { special: ["o2m"], interface: "list-o2m" } },
  ],
  lesson_blocks: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "visibility", type: "string", meta: { interface: "select-dropdown", options: { choices: visibilityChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "visible", is_nullable: false } },
    { field: "module", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized lesson title", width: "full" }),
    ...localizedFieldDefinitions("description", { interface: "input-multiline", note: "Localized lesson description", width: "full" }),
    { field: "lesson_type", type: "string", meta: { interface: "select-dropdown", options: { choices: lessonTypeChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 50, is_nullable: false } },
    { field: "order", type: "integer", meta: { interface: "input", width: "half" }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
    { field: "estimated_minutes", type: "integer", meta: { interface: "input", width: "half" }, schema: { data_type: "integer" } },
    { field: "phonetic_symbol", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half", note: "Attach when lesson_type = phonetic_symbol" }, schema: { data_type: "uuid" } },
    { field: "sound_combination", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half", note: "Attach when lesson_type = sound_combination" }, schema: { data_type: "uuid" } },
    { field: "reading_rule", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half", note: "Attach when lesson_type = reading_rule" }, schema: { data_type: "uuid" } },
    { field: "exercise", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half", note: "Attach when lesson_type = exercise" }, schema: { data_type: "uuid" } },
  ],
  audio_assets: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized audio title" }),
    ...localizedFieldDefinitions("description", { interface: "input-multiline", note: "Localized audio description", width: "full" }),
    { field: "transcript", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    { field: "phonetic_focus", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    { field: "license_note", type: "text", meta: { interface: "input-multiline", width: "full" }, schema: { data_type: "text" } },
    { field: "file", type: "uuid", meta: { interface: "file", width: "full" }, schema: { data_type: "uuid" } },
  ],
  example_words: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "word", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_nullable: false } },
    { field: "transcription", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    ...localizedFieldDefinitions("translation", { interface: "input", note: "Localized example translation" }),
    ...localizedFieldDefinitions("note", { interface: "input-multiline", note: "Localized example note", width: "full" }),
    { field: "primary_audio", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
  ],
  phonetic_symbols: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    { field: "symbol", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized phonetic symbol title" }),
    ...localizedFieldDefinitions("sound_type", { interface: "input", note: "Localized sound type label" }),
    ...localizedFieldDefinitions("explanation", { interface: "input-rich-text-html", note: "Localized symbol explanation", width: "full" }),
    ...localizedFieldDefinitions("stress_note", { interface: "input-multiline", note: "Localized stress note", width: "full" }),
    ...localizedFieldDefinitions("common_mistakes", { interface: "input-multiline", note: "Localized common mistakes guidance", width: "full" }),
    ...localizedFieldDefinitions("comparison_note", { interface: "input-multiline", note: "Localized comparison guidance", width: "full" }),
    { field: "primary_audio", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "examples", type: "alias", meta: { special: ["m2m"], interface: "list-m2m" } },
  ],
  phonetic_symbols_example_words: [
    { field: "phonetic_symbols_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "example_words_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "sort", type: "integer", meta: { hidden: true }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
  ],
  sound_combinations: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    { field: "combination_text", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized sound combination title" }),
    ...localizedFieldDefinitions("explanation", { interface: "input-rich-text-html", note: "Localized combination explanation", width: "full" }),
    ...localizedFieldDefinitions("stress_note", { interface: "input-multiline", note: "Localized stress note", width: "full" }),
    ...localizedFieldDefinitions("common_mistakes", { interface: "input-multiline", note: "Localized common mistakes guidance", width: "full" }),
    ...localizedFieldDefinitions("comparison_note", { interface: "input-multiline", note: "Localized comparison guidance", width: "full" }),
    { field: "primary_audio", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "examples", type: "alias", meta: { special: ["m2m"], interface: "list-m2m" } },
  ],
  sound_combinations_example_words: [
    { field: "sound_combinations_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "example_words_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "sort", type: "integer", meta: { hidden: true }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
  ],
  reading_rules: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized reading rule title", width: "full" }),
    ...localizedFieldDefinitions("rule_statement", { interface: "input", note: "Localized rule statement", width: "full" }),
    ...localizedFieldDefinitions("explanation", { interface: "input-rich-text-html", note: "Localized rule explanation", width: "full" }),
    ...localizedFieldDefinitions("exceptions", { interface: "input-multiline", note: "Localized exceptions", width: "full" }),
    ...localizedFieldDefinitions("limitations", { interface: "input-multiline", note: "Localized limitations", width: "full" }),
    ...localizedFieldDefinitions("practice_intro", { interface: "input-multiline", note: "Localized practice intro", width: "full" }),
    { field: "examples", type: "alias", meta: { special: ["m2m"], interface: "list-m2m" } },
    { field: "reinforcement_exercises", type: "alias", meta: { special: ["m2m"], interface: "list-m2m" } },
  ],
  reading_rules_example_words: [
    { field: "reading_rules_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "example_words_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "sort", type: "integer", meta: { hidden: true }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
  ],
  reading_rules_exercises: [
    { field: "reading_rules_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "exercises_id", type: "uuid", meta: { hidden: true }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "sort", type: "integer", meta: { hidden: true }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
  ],
  exercises: [
    { field: "status", type: "string", meta: { interface: "select-dropdown", options: { choices: statusChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 20, default_value: "draft", is_nullable: false } },
    { field: "slug", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255, is_unique: true, is_nullable: false } },
    ...localizedFieldDefinitions("title", { interface: "input", note: "Localized exercise title", width: "full" }),
    ...localizedFieldDefinitions("summary", { interface: "input-multiline", note: "Localized exercise summary", width: "full" }),
    ...localizedFieldDefinitions("instructions", { interface: "input-rich-text-html", note: "Localized exercise instructions", width: "full" }),
    { field: "show_item_feedback", type: "boolean", meta: { interface: "boolean", width: "half" }, schema: { data_type: "boolean", default_value: true, is_nullable: false } },
    { field: "passing_score", type: "integer", meta: { interface: "slider", width: "half" }, schema: { data_type: "integer" } },
    { field: "items", type: "alias", meta: { special: ["o2m"], interface: "list-o2m" } },
  ],
  exercise_items: [
    { field: "exercise", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid", is_nullable: false } },
    { field: "sort", type: "integer", meta: { interface: "input", width: "half" }, schema: { data_type: "integer", default_value: 1, is_nullable: false } },
    { field: "type", type: "string", meta: { interface: "select-dropdown", options: { choices: exerciseTypeChoices }, width: "half" }, schema: { data_type: "varchar", max_length: 100, is_nullable: false } },
    ...localizedFieldDefinitions("prompt", { interface: "input-multiline", note: "Localized exercise prompt", width: "full" }),
    ...localizedFieldDefinitions("prompt_note", { interface: "input-multiline", note: "Localized prompt note", width: "full" }),
    { field: "prompt_symbol", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    { field: "prompt_word", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    { field: "prompt_transcription", type: "string", meta: { interface: "input", width: "half" }, schema: { data_type: "varchar", max_length: 255 } },
    { field: "prompt_audio", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "linked_example_word", type: "uuid", meta: { interface: "select-dropdown-m2o", width: "half" }, schema: { data_type: "uuid" } },
    { field: "options", type: "json", meta: { interface: "input-code", options: { template: "json" }, width: "full", note: "Use label_en and label_ru in each option for bilingual display text." }, schema: { data_type: "json", is_nullable: false } },
    { field: "correct_option_ids", type: "json", meta: { interface: "tags", width: "full" }, schema: { data_type: "json", is_nullable: false } },
    ...localizedFieldDefinitions("explanation", { interface: "input-multiline", note: "Localized answer explanation", width: "full" }),
  ],
};

const relations: RelationDefinition[] = [
  { collection: "modules", field: "course", related_collection: "courses", meta: { many_collection: "modules", many_field: "course", one_collection: "courses", one_field: "modules" } },
  { collection: "lesson_blocks", field: "module", related_collection: "modules", meta: { many_collection: "lesson_blocks", many_field: "module", one_collection: "modules", one_field: "lesson_blocks" } },
  { collection: "lesson_blocks", field: "phonetic_symbol", related_collection: "phonetic_symbols" },
  { collection: "lesson_blocks", field: "sound_combination", related_collection: "sound_combinations" },
  { collection: "lesson_blocks", field: "reading_rule", related_collection: "reading_rules" },
  { collection: "lesson_blocks", field: "exercise", related_collection: "exercises" },
  { collection: "audio_assets", field: "file", related_collection: "directus_files" },
  { collection: "example_words", field: "primary_audio", related_collection: "audio_assets" },
  { collection: "phonetic_symbols", field: "primary_audio", related_collection: "audio_assets" },
  { collection: "sound_combinations", field: "primary_audio", related_collection: "audio_assets" },
  { collection: "phonetic_symbols_example_words", field: "phonetic_symbols_id", related_collection: "phonetic_symbols", meta: { junction_field: "example_words_id", one_field: "examples" } },
  { collection: "phonetic_symbols_example_words", field: "example_words_id", related_collection: "example_words", meta: { junction_field: "phonetic_symbols_id" } },
  { collection: "sound_combinations_example_words", field: "sound_combinations_id", related_collection: "sound_combinations", meta: { junction_field: "example_words_id", one_field: "examples" } },
  { collection: "sound_combinations_example_words", field: "example_words_id", related_collection: "example_words", meta: { junction_field: "sound_combinations_id" } },
  { collection: "reading_rules_example_words", field: "reading_rules_id", related_collection: "reading_rules", meta: { junction_field: "example_words_id", one_field: "examples" } },
  { collection: "reading_rules_example_words", field: "example_words_id", related_collection: "example_words", meta: { junction_field: "reading_rules_id" } },
  { collection: "reading_rules_exercises", field: "reading_rules_id", related_collection: "reading_rules", meta: { junction_field: "exercises_id", one_field: "reinforcement_exercises" } },
  { collection: "reading_rules_exercises", field: "exercises_id", related_collection: "exercises", meta: { junction_field: "reading_rules_id" } },
  { collection: "exercise_items", field: "exercise", related_collection: "exercises", meta: { many_collection: "exercise_items", many_field: "exercise", one_collection: "exercises", one_field: "items" } },
  { collection: "exercise_items", field: "prompt_audio", related_collection: "audio_assets" },
  { collection: "exercise_items", field: "linked_example_word", related_collection: "example_words" },
];

const roles = [
  { name: "Phonora Content Admin", description: "Can manage all Phonora learning content and media." },
  { name: "Phonora Public Reader", description: "Read-only access for published course content." },
];

const publicCollections = [
  "courses",
  "modules",
  "lesson_blocks",
  "audio_assets",
  "example_words",
  "phonetic_symbols",
  "sound_combinations",
  "reading_rules",
  "reading_rules_exercises",
  "reading_rules_example_words",
  "phonetic_symbols_example_words",
  "sound_combinations_example_words",
  "exercises",
  "exercise_items",
  "directus_files",
];

const baseCollectionMeta = (meta: Record<string, unknown>) => ({
  accountability: "all",
  archive_app_filter: true,
  archive_field: null,
  archive_value: null,
  collapse: "open",
  color: null,
  display_template: null,
  group: null,
  hidden: false,
  item_duplication_fields: null,
  preview_url: null,
  singleton: false,
  sort: null,
  sort_field: null,
  translations: null,
  unarchive_value: null,
  versioning: false,
  ...meta,
});

const baseFieldMeta = (collection: string, field: string, meta?: Record<string, unknown>) => ({
  collection,
  field,
  group: null,
  hidden: false,
  interface: null,
  display: null,
  options: null,
  display_options: null,
  readonly: false,
  required: false,
  sort: null,
  special: null,
  translations: buildFieldTranslations(collection, field),
  width: "full",
  note: buildFieldNote(collection, field, meta?.note),
  conditions: null,
  validation: null,
  validation_message: null,
  ...meta,
  translations: buildFieldTranslations(collection, field),
  note: buildFieldNote(collection, field, meta?.note),
});

const idField = (collection: string): SnapshotField => ({
  collection,
  field: "id",
  type: "uuid",
  schema: {
    name: "id",
    table: collection,
    data_type: "uuid",
    default_value: null,
    max_length: null,
    numeric_precision: null,
    numeric_scale: null,
    is_nullable: false,
    is_unique: true,
    is_indexed: true,
    is_primary_key: true,
    is_generated: false,
    generation_expression: null,
    has_auto_increment: false,
    foreign_key_table: null,
    foreign_key_column: null,
    comment: null,
  },
  meta: baseFieldMeta(collection, "id", {
    hidden: true,
    readonly: true,
    interface: "input",
    special: ["uuid"],
    width: "half",
  }),
});

function buildField(collection: string, definition: FieldDefinition): SnapshotField {
  const isAlias = definition.type === "alias" || definition.meta?.special;
  const schema = isAlias
    ? null
    : {
        name: definition.field,
        table: collection,
        data_type: definition.schema?.data_type ?? definition.type ?? "string",
        default_value: definition.schema?.default_value ?? null,
        max_length: definition.schema?.max_length ?? null,
        numeric_precision: definition.schema?.numeric_precision ?? null,
        numeric_scale: definition.schema?.numeric_scale ?? null,
        is_nullable: definition.schema?.is_nullable ?? true,
        is_unique: definition.schema?.is_unique ?? false,
        is_indexed: definition.schema?.is_indexed ?? Boolean(definition.schema?.is_unique),
        is_primary_key: definition.schema?.is_primary_key ?? false,
        is_generated: definition.schema?.is_generated ?? false,
        generation_expression: definition.schema?.generation_expression ?? null,
        has_auto_increment: definition.schema?.has_auto_increment ?? false,
        foreign_key_table: definition.schema?.foreign_key_table ?? null,
        foreign_key_column: definition.schema?.foreign_key_column ?? null,
        comment: definition.schema?.comment ?? null,
      };

  return {
    collection,
    field: definition.field,
    type: definition.type ?? "alias",
    schema,
    meta: baseFieldMeta(collection, definition.field, definition.meta),
  };
}

function buildRelation(definition: RelationDefinition): SnapshotRelation {
  return {
    collection: definition.collection,
    field: definition.field,
    related_collection: definition.related_collection,
    schema: {
      table: definition.collection,
      column: definition.field,
      foreign_key_table: definition.related_collection,
      foreign_key_column: "id",
      constraint_name: definition.schema?.constraint_name ?? `${definition.collection}_${definition.field}_foreign`,
      on_update: definition.schema?.on_update ?? "NO ACTION",
      on_delete: definition.schema?.on_delete ?? "SET NULL",
    },
    meta: {
      many_collection: definition.meta?.many_collection ?? definition.collection,
      many_field: definition.meta?.many_field ?? definition.field,
      one_collection: definition.meta?.one_collection ?? definition.related_collection,
      one_field: definition.meta?.one_field ?? null,
      one_collection_field: definition.meta?.one_collection_field ?? null,
      one_allowed_collections: definition.meta?.one_allowed_collections ?? null,
      one_deselect_action: definition.meta?.one_deselect_action ?? "nullify",
      junction_field: definition.meta?.junction_field ?? null,
      sort_field: definition.meta?.sort_field ?? null,
    },
  };
}

function buildSnapshot(base: Snapshot, includeGeneratedIdFields: boolean): Snapshot {
  return {
    version: base.version,
    directus: base.directus,
    vendor: base.vendor,
    collections: collections.map((definition) => ({
      collection: definition.collection,
      meta: baseCollectionMeta({ collection: definition.collection, ...definition.meta }),
      schema: { name: definition.collection },
    })),
    fields: collections.flatMap((collection) => {
      const existingIdField = base.fields.find(
        (field) => field.collection === collection.collection && field.field === "id",
      );

      return [
        includeGeneratedIdFields
          ? idField(collection.collection)
          : existingIdField ?? idField(collection.collection),
        ...(fields[collection.collection] ?? []).map((definition) =>
          buildField(collection.collection, definition),
        ),
      ];
    }),
    relations: relations.map(buildRelation),
  };
}

async function ensureRole(token: string, role: { name: string; description: string }) {
  const response = await directusRequest<{ data: Array<{ id: string; name: string }> }>(
    token,
    `/roles?filter[name][_eq]=${encodeURIComponent(role.name)}&limit=1`,
  );
  const existing = response.data[0];

  if (existing) {
    await directusRequest(token, `/roles/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify(role),
    });
    return existing.id;
  }

  const created = await directusRequest<{ data: { id: string } }>(token, "/roles", {
    method: "POST",
    body: JSON.stringify(role),
  });

  return created.data.id;
}

async function ensurePolicy(
  token: string,
  policy: { name: string; description: string; admin_access?: boolean; app_access?: boolean },
) {
  const response = await directusRequest<{ data: Array<{ id: string; name: string }> }>(
    token,
    `/policies?filter[name][_eq]=${encodeURIComponent(policy.name)}&limit=1`,
  );
  const existing = response.data[0];

  if (existing) {
    await directusRequest(token, `/policies/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        icon: policy.admin_access ? "verified" : "policy",
        ...policy,
      }),
    });
    return existing.id;
  }

  const created = await directusRequest<{ data: { id: string } }>(token, "/policies", {
    method: "POST",
    body: JSON.stringify({
      icon: policy.admin_access ? "verified" : "policy",
      ...policy,
    }),
  });

  return created.data.id;
}

async function ensureAccess(
  token: string,
  payload: { role?: string | null; user?: string | null; policy: string; sort?: number },
) {
  const query = new URLSearchParams({
    ...(payload.role ? { "filter[role][_eq]": payload.role } : { "filter[role][_null]": "true" }),
    ...(payload.user ? { "filter[user][_eq]": payload.user } : { "filter[user][_null]": "true" }),
    "filter[policy][_eq]": payload.policy,
    limit: "1",
  });

  const response = await directusRequest<{ data: Array<{ id: string }> }>(
    token,
    `/access?${query.toString()}`,
  );

  if (response.data[0]) {
    return response.data[0].id;
  }

  const created = await directusRequest<{ data: { id: string } }>(token, "/access", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return created.data.id;
}

async function ensurePermission(
  token: string,
  payload: Record<string, unknown>,
  key: { policy: string | null; action: string; collection: string },
) {
  const query = new URLSearchParams({
    ...(key.policy ? { "filter[policy][_eq]": key.policy } : { "filter[policy][_null]": "true" }),
    "filter[action][_eq]": key.action,
    "filter[collection][_eq]": key.collection,
    limit: "1",
  });

  const response = await directusRequest<{ data: Array<{ id: string }> }>(
    token,
    `/permissions?${query.toString()}`,
  );
  const existing = response.data[0];

  if (existing) {
    await directusRequest(token, `/permissions/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return;
  }

  await directusRequest(token, "/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function ensureCollectionMeta(
  token: string,
  collection: string,
  meta: Record<string, unknown>,
) {
  const { translations, ...rest } = meta;

  if (Object.keys(rest).length > 0) {
    await directusRequest(token, `/collections/${collection}`, {
      method: "PATCH",
      body: JSON.stringify({ meta: rest }),
    });
  }

  if (translations) {
    await directusRequest(token, `/collections/${collection}`, {
      method: "PATCH",
      body: JSON.stringify({ meta: { translations } }),
    });
  }
}

async function ensureFieldPresentation(
  token: string,
  collection: string,
  field: string,
  presentation: { note: string | null; translations: Array<Record<string, unknown>> | null },
) {
  if (presentation.note !== null) {
    await directusRequest(token, `/fields/${collection}/${field}`, {
      method: "PATCH",
      body: JSON.stringify({ meta: { note: presentation.note } }),
    });
  }

  if (presentation.translations) {
    await directusRequest(token, `/fields/${collection}/${field}`, {
      method: "PATCH",
      body: JSON.stringify({ meta: { translations: presentation.translations } }),
    });
  }
}

async function ensureSingletonCourse(token: string) {
  try {
    const existing = await directusRequest<{ data: { id?: string } }>(
      token,
      "/items/courses?fields=id",
    );

    if (existing.data.id) {
      return existing.data.id;
    }
  } catch {
    // No singleton record exists yet.
  }

  const response = await directusRequest<{ data: { id?: string } }>(token, "/items/courses", {
    method: "PATCH",
    body: JSON.stringify({
      status: "published",
      hero_headline_en: "Build your Phonora course in Directus.",
      hero_headline_ru: "Соберите курс Phonora в Directus.",
      hero_subheadline_en: "Edit the singleton course, then add modules and lessons.",
      hero_subheadline_ru: "Отредактируйте единственный курс, затем добавьте модули и уроки.",
    }),
  });

  return response.data.id ?? null;
}

async function main() {
  const token = await getAdminToken();
  const current = await directusRequest<{ data: Snapshot }>(token, "/schema/snapshot");
  const schemaAlreadyApplied = current.data.collections.some(
    (collection) => collection.collection === "courses" && collection.schema !== null,
  );
  const desired = buildSnapshot(current.data, !schemaAlreadyApplied);
  const snapshotPath = "/tmp/phonora-schema.json";
  await Bun.write(snapshotPath, JSON.stringify(desired, null, 2));

  console.log("Copying schema snapshot into Directus container");
  let result = Bun.spawnSync(["docker", "cp", snapshotPath, "phonora-directus:/tmp/phonora-schema.json"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0) {
    throw new Error(`docker cp failed with exit code ${result.exitCode}`);
  }

  console.log("Applying schema snapshot through Directus CLI");
  result = Bun.spawnSync(
    ["docker", "compose", "exec", "-T", "directus", "npx", "directus", "schema", "apply", "/tmp/phonora-schema.json", "-y"],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if (result.exitCode !== 0) {
    throw new Error(`directus schema apply failed with exit code ${result.exitCode}`);
  }

  for (const definition of collections) {
    await ensureCollectionMeta(token, definition.collection, definition.meta);
  }

  for (const [collection, definitions] of Object.entries(fields)) {
    for (const definition of definitions) {
      await ensureFieldPresentation(token, collection, definition.field, {
        note: buildFieldNote(collection, definition.field, definition.meta?.note),
        translations: buildFieldTranslations(collection, definition.field),
      });
    }
  }

  const roleIds = new Map<string, string>();
  for (const role of roles) {
    console.log(`Ensuring role ${role.name}`);
    roleIds.set(role.name, await ensureRole(token, role));
  }

  const adminRoleId = roleIds.get("Phonora Content Admin") ?? null;
  const publicRoleId = roleIds.get("Phonora Public Reader") ?? null;

  const adminPolicyId = await ensurePolicy(token, {
    name: "Phonora Content Admin Policy",
    description: "Full admin access for Phonora content managers.",
    admin_access: true,
    app_access: true,
  });

  if (adminRoleId) {
    await ensureAccess(token, {
      role: adminRoleId,
      user: null,
      policy: adminPolicyId,
      sort: 1,
    });
  }

  const publicPolicyId = await ensurePolicy(token, {
    name: "Phonora Public Policy",
    description: "Published-only public read access for the learner frontend.",
    admin_access: false,
    app_access: false,
  });

  await ensureAccess(token, {
    role: null,
    user: null,
    policy: publicPolicyId,
    sort: 100,
  });

  if (publicRoleId) {
    await ensureAccess(token, {
      role: publicRoleId,
      user: null,
      policy: publicPolicyId,
      sort: 1,
    });
  }

  const statusCollections = new Set([
    "courses",
    "modules",
    "lesson_blocks",
    "audio_assets",
    "example_words",
    "phonetic_symbols",
    "sound_combinations",
    "reading_rules",
    "exercises",
  ]);

  for (const collection of publicCollections) {
    await ensurePermission(
      token,
      {
        policy: publicPolicyId,
        action: "read",
        collection,
        permissions:
          collection === "lesson_blocks"
            ? {
                _and: [
                  { status: { _eq: "published" } },
                  { visibility: { _eq: "visible" } },
                ],
              }
            : statusCollections.has(collection)
              ? { status: { _eq: "published" } }
              : {},
        validation: {},
        presets: {},
        fields: ["*"],
      },
      { policy: publicPolicyId, action: "read", collection },
    );
  }

  console.log("Ensuring singleton course");
  await ensureSingletonCourse(token);

  console.log("Directus bootstrap complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
