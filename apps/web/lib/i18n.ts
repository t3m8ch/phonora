export const SUPPORTED_LOCALES = ["en", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const PREFERRED_LOCALE_COOKIE = "preferred-locale";

const localeSet = new Set<string>(SUPPORTED_LOCALES);

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().split("-")[0];
  return isLocale(normalized) ? normalized : null;
}

export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const matches = header
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .map((part) => normalizeLocale(part))
    .filter((value): value is Locale => Boolean(value));

  return matches.find((value) => value === "ru") ?? DEFAULT_LOCALE;
}

export function resolveRequestLocale(
  storedLocale: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  return normalizeLocale(storedLocale) ?? detectLocaleFromAcceptLanguage(acceptLanguage);
}

export function resolveLocalizedValue(
  values: Partial<Record<Locale, string | null | undefined>>,
  locale: Locale,
): string | null {
  const requested = values[locale]?.trim();
  if (requested) {
    return requested;
  }

  const fallback = values[DEFAULT_LOCALE]?.trim();
  return fallback || null;
}

export type Dictionary = {
  metadata: {
    title: string;
    description: string;
  };
  nav: {
    course: string;
    brandTagline: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    russian: string;
  };
  courseHero: {
    eyebrow: string;
    modules: string;
    publishedLessons: string;
  };
  moduleCard: {
    module: string;
    fallbackSummary: string;
    lessons: string;
    openModule: string;
    statuses: Record<"not_started" | "in_progress" | "completed", string>;
  };
  moduleVariants: Record<"theory" | "practice", string>;
  moduleKinds: Record<string, string>;
  lessonDifficulty: Record<string, string>;
  lessonBlockKinds: Record<string, string>;
  lessonBlockTypes: Record<string, string>;
  practiceKinds: Record<string, string>;
  practiceVariants: Record<"warmup" | "normal" | "challenge" | "exam", string>;
  practiceVariantDescriptions: Record<"warmup" | "normal" | "challenge" | "exam", string>;
  authoring: {
    modeLabel: string;
    enabledStatus: string;
    localSaveHint: string;
    panelTitle: string;
    panelBody: string;
    enableHint: string;
    edit: string;
    chooseBlockType: string;
    editBlock: string;
    theoryBlocks: string;
    practiceBlocks: string;
    addBlock: string;
    addBlockBelow: string;
    save: string;
    saveBlock: string;
    cancel: string;
    updateBlock: string;
    deleteBlock: string;
    moveUp: string;
    moveDown: string;
    exportJson: string;
    importJson: string;
    clearDraft: string;
    importDraftPlaceholder: string;
    importDraftError: string;
    clearDraftConfirm: string;
    deleteBlockConfirm: string;
    discardChangesConfirm: string;
    exportHelp: string;
    disableMode: string;
    blockTitle: string;
    blockBody: string;
    blockKind: string;
    titleRu: string;
    titleEn: string;
    bodyRu: string;
    bodyEn: string;
    symbol: string;
    transcription: string;
    options: string;
    correctOptionIds: string;
    explanationRu: string;
    explanationEn: string;
    audioUrl: string;
    audioAssetId: string;
    audioPreviewFile: string;
    audioPreviewHint: string;
    variant: string;
    savedLocally: string;
    emptyBlocks: string;
    unknownBlockType: string;
  };
  progressWidget: {
    title: string;
    completedLessons: string;
    completedModules: string;
    openStats: string;
    soundWave: string;
  };
  stats: {
    title: string;
    description: string;
    overallProgress: string;
    completedLessons: string;
    completedModules: string;
    bestPracticeScore: string;
    attempts: string;
    lastActivity: string;
    modules: string;
    recentResults: string;
    noRecentResults: string;
    noScore: string;
    never: string;
    openModule: string;
    resetProgress: string;
    resetConfirm: string;
    testingTitle: string;
    testingBody: string;
    resetAllProgress: string;
    emptyTitle: string;
    emptyBody: string;
    startLearning: string;
    status: string;
    score: string;
    date: string;
    statuses: Record<"not_started" | "in_progress" | "completed", string>;
  };
  emptyState: {
    eyebrow: string;
  };
  home: {
    missingTitle: string;
    missingBody: string;
    missingAction: string;
  };
  modulePage: {
    missingTitle: string;
    missingBody: string;
    backToCourse: string;
    module: string;
    lesson: string;
    startLesson: string;
    minutes: string;
  };
  lessonPage: {
    missingTitle: string;
    missingBody: string;
    backToModule: string;
  };
  lessonLayout: {
    backTo: string;
    previous: string;
    next: string;
    startOfModule: string;
    moduleComplete: string;
    minutes: string;
  };
  lessonCompletion: {
    reachedEnd: string;
    body: string;
    markComplete: string;
    completed: string;
    alreadyCompleted: string;
  };
  lessonTypes: Record<string, string>;
  audio: {
    listen: string;
    missing: string;
  };
  studyCard: {
    howItSounds: string;
    stressNote: string;
    commonMistakes: string;
    compareWithSimilarSounds: string;
    examples: string;
  };
  readingRule: {
    ruleStatement: string;
    exceptions: string;
    limits: string;
    examples: string;
    reinforcement: string;
    reinforcementFallback: string;
  };
  exercise: {
    practice: string;
    task: string;
    of: string;
    items: string;
    passingScore: string;
    linkedExample: string;
    checkAnswers: string;
    reset: string;
    correct: string;
    tryAgain: string;
    score: string;
    passed: string;
    retry: string;
    review: string;
    instantFeedback: string;
    yes: string;
    no: string;
    itemTypes: Record<string, string>;
    interactionHints: Record<string, string>;
  };
  notFound: {
    title: string;
    body: string;
    action: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    metadata: {
      title: "Phonora",
      description:
        "Learn English phonetics, transcription, and reading rules with structured audio practice.",
    },
    nav: {
      course: "Course",
      brandTagline: "English phonetics trainer",
    },
    languageSwitcher: {
      label: "Language",
      english: "English",
      russian: "Русский",
    },
    courseHero: {
      eyebrow: "Phonora MVP",
      modules: "modules",
      publishedLessons: "published lessons",
    },
    moduleCard: {
      module: "Module",
      fallbackSummary: "Structured practice with audio, examples, and navigation.",
      lessons: "lessons",
      openModule: "Open module",
      statuses: {
        not_started: "Not started",
        in_progress: "In progress",
        completed: "Completed",
      },
    },
    moduleVariants: {
      theory: "Theory",
      practice: "Practice",
    },
    moduleKinds: {
      sound_symbols: "Sound symbols",
      sound_combinations: "Sound combinations",
      reading_rules: "Reading rules",
      practice: "Practice",
      mixed: "Mixed module",
    },
    lessonDifficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    lessonBlockKinds: {
      concept: "Concept",
      pronunciation: "Pronunciation",
      example: "Example",
      mistake: "Common mistake",
      rule: "Rule",
      practice_note: "Practice note",
    },
    lessonBlockTypes: {
      sound_visual: "Sound symbol",
      sound_audio: "How it sounds",
      examples: "Examples",
      info: "Important note",
      sound_comparison: "Sound comparison",
      mini_check: "Mini check",
    },
    practiceKinds: {
      listening: "Listening",
      symbol: "Symbol",
      word: "Word match",
      stress: "Stress",
      rule: "Rule use",
      contrast: "Sound contrast",
    },
    practiceVariants: {
      warmup: "Warm-up",
      normal: "Practice",
      challenge: "Challenge",
      exam: "Exam mode",
    },
    practiceVariantDescriptions: {
      warmup: "Light tasks to recall sound symbols before deeper practice.",
      normal: "A steady practice mode for building reliable recognition.",
      challenge: "Harder contrasts with more similar sounds and fewer hints.",
      exam: "A final check where the result matters after completion.",
    },
    authoring: {
      modeLabel: "Developer mode",
      enabledStatus: "Developer mode is enabled",
      localSaveHint: "Changes are saved locally in this browser",
      panelTitle: "Developer authoring mode",
      panelBody: "Local MVP editor for lesson blocks. Drafts are saved only in this browser and can be exported as JSON.",
      enableHint: "Add ?dev=1 to the lesson URL to enable local authoring mode.",
      edit: "Edit",
      chooseBlockType: "Choose block type",
      editBlock: "Edit block",
      theoryBlocks: "Theory blocks",
      practiceBlocks: "Practice cards",
      addBlock: "Add block",
      addBlockBelow: "Add block below",
      save: "Save",
      saveBlock: "Save block",
      cancel: "Cancel",
      updateBlock: "Update block",
      deleteBlock: "Delete block",
      moveUp: "Move up",
      moveDown: "Move down",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      clearDraft: "Clear draft",
      importDraftPlaceholder: "Paste exported Phonora draft JSON here.",
      importDraftError: "Could not import this JSON.",
      clearDraftConfirm: "Clear local authoring draft?",
      deleteBlockConfirm: "Delete this block?",
      discardChangesConfirm: "Discard unsaved changes?",
      exportHelp: "Use this JSON as a handoff draft for Directus content authoring.",
      disableMode: "Disable mode",
      blockTitle: "Block title",
      blockBody: "Block body",
      blockKind: "Block type",
      titleRu: "Title RU",
      titleEn: "Title EN",
      bodyRu: "Description/body RU",
      bodyEn: "Description/body EN",
      symbol: "Symbol",
      transcription: "Transcription",
      options: "Options",
      correctOptionIds: "Correct option IDs",
      explanationRu: "Explanation RU",
      explanationEn: "Explanation EN",
      audioUrl: "Audio URL",
      audioAssetId: "Audio asset ID",
      audioPreviewFile: "Preview audio file",
      audioPreviewHint: "Local file is used for preview only. To store it permanently, upload audio to Directus and use the audio asset.",
      variant: "Difficulty / variant",
      savedLocally: "Saved locally",
      emptyBlocks: "No local blocks for this lesson yet.",
      unknownBlockType: "Unknown block type",
    },
    progressWidget: {
      title: "Your progress",
      completedLessons: "completed lessons",
      completedModules: "completed modules",
      openStats: "Open stats",
      soundWave: "Sound wave progress",
    },
    stats: {
      title: "Knowledge stats",
      description: "Your progress across lessons, practice, and scores.",
      overallProgress: "Course progress",
      completedLessons: "Completed lessons",
      completedModules: "Completed modules",
      bestPracticeScore: "Best practice score",
      attempts: "Attempts",
      lastActivity: "Last activity",
      modules: "Modules",
      recentResults: "Recent results",
      noRecentResults: "No practice attempts yet.",
      noScore: "No score yet",
      never: "Never",
      openModule: "Open module",
      resetProgress: "Reset progress",
      resetConfirm: "Reset all local progress for Phonora?",
      testingTitle: "Progress testing",
      testingBody: "This button clears local progress in this browser. Use it only for testing.",
      resetAllProgress: "Reset all progress",
      emptyTitle: "You have not started learning yet",
      emptyBody: "Complete a practice lesson to see your knowledge stats here.",
      startLearning: "Start learning",
      status: "Status",
      score: "Score",
      date: "Date",
      statuses: {
        not_started: "Not started",
        in_progress: "In progress",
        completed: "Completed",
      },
    },
    emptyState: {
      eyebrow: "Content unavailable",
    },
    home: {
      missingTitle: "Connect Directus to load the course",
      missingBody:
        "Phonora reads published content from Directus. Start the local stack, bootstrap the schema, and seed starter content to see the learning path here.",
      missingAction: "Open Directus docs",
    },
    modulePage: {
      missingTitle: "Module not found",
      missingBody:
        "This module is missing, unpublished, or Directus is not reachable yet.",
      backToCourse: "Back to course overview",
      module: "Module",
      lesson: "Lesson",
      startLesson: "Start lesson",
      minutes: "min",
    },
    lessonPage: {
      missingTitle: "Lesson not found",
      missingBody:
        "The lesson could not be loaded. It may be unpublished, incomplete, or Directus is unavailable.",
      backToModule: "Back to module",
    },
    lessonLayout: {
      backTo: "Back to",
      previous: "Previous",
      next: "Next",
      startOfModule: "Start of module",
      moduleComplete: "Module complete",
      minutes: "min",
    },
    lessonCompletion: {
      reachedEnd: "You reached the end of the lesson",
      body: "If the material is clear, mark the lesson as completed.",
      markComplete: "Mark lesson as completed",
      completed: "Lesson completed",
      alreadyCompleted: "This lesson is already marked as completed",
    },
    lessonTypes: {
      phonetic_symbol: "phonetic symbol",
      sound_combination: "sound combination",
      reading_rule: "reading rule",
      exercise: "exercise",
    },
    audio: {
      listen: "Listen",
      missing: "Audio preview will appear here when an audio URL or asset is added.",
    },
    studyCard: {
      howItSounds: "How it sounds",
      stressNote: "Stress note",
      commonMistakes: "Common mistakes",
      compareWithSimilarSounds: "Compare with similar sounds",
      examples: "Examples",
    },
    readingRule: {
      ruleStatement: "Rule statement",
      exceptions: "Exceptions",
      limits: "Limits",
      examples: "Examples",
      reinforcement: "Reinforcement",
      reinforcementFallback: "Use the linked exercise to practise the rule in context.",
    },
    exercise: {
      practice: "Practice",
      task: "Task",
      of: "of",
      items: "items",
      passingScore: "Passing score",
      linkedExample: "Linked example",
      checkAnswers: "Check answers",
      reset: "Reset",
      correct: "Correct",
      tryAgain: "Try again",
      score: "Score",
      passed: "Nice work — you reached the target score.",
      retry: "You can review the explanations above and try again.",
      review: "Review each item above to reinforce the sound or reading rule.",
      instantFeedback: "Instant feedback enabled",
      yes: "yes",
      no: "no",
      itemTypes: {
        audio_to_symbol: "audio to symbol",
        symbol_to_audio: "symbol to audio",
        symbol_to_word: "symbol to word",
        transcription_to_word: "transcription to word",
        stress_selection: "stress selection",
        similar_sound_discrimination: "similar sound discrimination",
        reading_rule_application: "reading rule application",
      },
      interactionHints: {
        audio_to_symbol: "Listen to the audio and choose the matching symbol.",
        symbol_to_audio: "Look at the symbol and choose the audio label that matches it.",
        symbol_to_word: "Choose the word that contains the target sound.",
        transcription_to_word: "Pick the word that matches the transcription.",
        stress_selection: "Choose the option with the correct stress pattern.",
        similar_sound_discrimination: "Pick the option that contains the target sound contrast.",
        reading_rule_application: "Choose the option that best applies the reading rule.",
      },
    },
    notFound: {
      title: "Page not found",
      body: "The requested page does not exist or has not been published yet.",
      action: "Back to home",
    },
  },
  ru: {
    metadata: {
      title: "Phonora",
      description:
        "Изучайте английскую фонетику, транскрипцию и правила чтения с помощью структурированной аудио-практики.",
    },
    nav: {
      course: "Курс",
      brandTagline: "Тренажёр английской фонетики",
    },
    languageSwitcher: {
      label: "Язык",
      english: "English",
      russian: "Русский",
    },
    courseHero: {
      eyebrow: "Phonora MVP",
      modules: "модулей",
      publishedLessons: "опубликованных уроков",
    },
    moduleCard: {
      module: "Модуль",
      fallbackSummary: "Структурированная практика с аудио, примерами и навигацией.",
      lessons: "уроков",
      openModule: "Открыть модуль",
      statuses: {
        not_started: "Не начат",
        in_progress: "В процессе",
        completed: "Завершён",
      },
    },
    moduleVariants: {
      theory: "Теория",
      practice: "Практика",
    },
    moduleKinds: {
      sound_symbols: "Символы звуков",
      sound_combinations: "Сочетания звуков",
      reading_rules: "Правила чтения",
      practice: "Практика",
      mixed: "Смешанный модуль",
    },
    lessonDifficulty: {
      beginner: "Начальный",
      intermediate: "Средний",
      advanced: "Продвинутый",
    },
    lessonBlockKinds: {
      concept: "Понятие",
      pronunciation: "Произношение",
      example: "Пример",
      mistake: "Частая ошибка",
      rule: "Правило",
      practice_note: "Заметка к практике",
    },
    lessonBlockTypes: {
      sound_visual: "Как выглядит звук",
      sound_audio: "Как произносится",
      examples: "Примеры",
      info: "Важная информация",
      sound_comparison: "Сравнение звуков",
      mini_check: "Мини-проверка",
    },
    practiceKinds: {
      listening: "Аудирование",
      symbol: "Символ",
      word: "Слово",
      stress: "Ударение",
      rule: "Применение правила",
      contrast: "Контраст звуков",
    },
    practiceVariants: {
      warmup: "Разминка",
      normal: "Тренировка",
      challenge: "Сложная тренировка",
      exam: "Контрольная попытка",
    },
    practiceVariantDescriptions: {
      warmup: "Лёгкие задания, чтобы вспомнить символы перед основной практикой.",
      normal: "Обычный режим тренировки для устойчивого распознавания.",
      challenge: "Более сложные контрасты с похожими звуками и меньшим количеством подсказок.",
      exam: "Итоговая проверка, где результат важен после завершения.",
    },
    authoring: {
      modeLabel: "Режим разработчика",
      enabledStatus: "Режим разработчика включён",
      localSaveHint: "Изменения сохраняются локально в этом браузере",
      panelTitle: "Режим разработчика контента",
      panelBody: "Локальный MVP-редактор блоков урока. Черновики сохраняются только в этом браузере и экспортируются в JSON.",
      enableHint: "Добавьте ?dev=1 к URL урока, чтобы включить локальный режим наполнения.",
      edit: "Редактировать",
      chooseBlockType: "Выберите тип карточки",
      editBlock: "Редактировать блок",
      theoryBlocks: "Теоретические блоки",
      practiceBlocks: "Практические карточки",
      addBlock: "Добавить блок",
      addBlockBelow: "Добавить блок ниже",
      save: "Сохранить",
      saveBlock: "Сохранить блок",
      cancel: "Отмена",
      updateBlock: "Обновить блок",
      deleteBlock: "Удалить блок",
      moveUp: "Вверх",
      moveDown: "Вниз",
      exportJson: "Экспорт JSON",
      importJson: "Импорт JSON",
      clearDraft: "Очистить черновик",
      importDraftPlaceholder: "Вставьте экспортированный JSON-черновик Phonora.",
      importDraftError: "Не удалось импортировать этот JSON.",
      clearDraftConfirm: "Очистить локальный черновик наполнения?",
      deleteBlockConfirm: "Удалить этот блок?",
      discardChangesConfirm: "Закрыть форму и потерять несохранённые изменения?",
      exportHelp: "Используйте этот JSON как черновик для переноса контента в Directus.",
      disableMode: "Выключить режим",
      blockTitle: "Заголовок блока",
      blockBody: "Текст блока",
      blockKind: "Тип блока",
      titleRu: "Заголовок RU",
      titleEn: "Заголовок EN",
      bodyRu: "Описание/текст RU",
      bodyEn: "Описание/текст EN",
      symbol: "Символ",
      transcription: "Транскрипция",
      options: "Варианты",
      correctOptionIds: "ID правильных вариантов",
      explanationRu: "Объяснение RU",
      explanationEn: "Объяснение EN",
      audioUrl: "Audio URL",
      audioAssetId: "Audio asset ID",
      audioPreviewFile: "Аудиофайл для предпросмотра",
      audioPreviewHint: "Локальный файл используется только для предпросмотра. Для постоянного хранения загрузите аудио в Directus и укажите audio asset.",
      variant: "Сложность / вариант",
      savedLocally: "Сохранено локально",
      emptyBlocks: "Локальных блоков для этого урока пока нет.",
      unknownBlockType: "Неизвестный тип блока",
    },
    progressWidget: {
      title: "Ваш прогресс",
      completedLessons: "завершённых уроков",
      completedModules: "завершённых модулей",
      openStats: "Открыть статистику",
      soundWave: "Звуковая волна прогресса",
    },
    stats: {
      title: "Статистика знаний",
      description: "Ваш прогресс по урокам, практике и результатам.",
      overallProgress: "Прогресс курса",
      completedLessons: "Завершённые уроки",
      completedModules: "Завершённые модули",
      bestPracticeScore: "Лучший результат практики",
      attempts: "Попытки",
      lastActivity: "Последняя активность",
      modules: "Модули",
      recentResults: "Последние результаты",
      noRecentResults: "Попыток практики пока нет.",
      noScore: "Пока нет результата",
      never: "Никогда",
      openModule: "Открыть модуль",
      resetProgress: "Сбросить прогресс",
      resetConfirm: "Сбросить весь локальный прогресс Phonora?",
      testingTitle: "Тестирование прогресса",
      testingBody: "Эта кнопка очищает локальный прогресс в браузере. Используйте только для проверки.",
      resetAllProgress: "Сбросить весь прогресс",
      emptyTitle: "Вы ещё не начали обучение",
      emptyBody: "Пройдите практический урок, чтобы увидеть статистику знаний.",
      startLearning: "Начать обучение",
      status: "Статус",
      score: "Результат",
      date: "Дата",
      statuses: {
        not_started: "Не начат",
        in_progress: "В процессе",
        completed: "Завершён",
      },
    },
    emptyState: {
      eyebrow: "Контент недоступен",
    },
    home: {
      missingTitle: "Подключите Directus, чтобы загрузить курс",
      missingBody:
        "Phonora читает опубликованный контент из Directus. Запустите локальный стек, создайте схему и загрузите стартовые данные, чтобы увидеть учебный путь здесь.",
      missingAction: "Открыть документацию Directus",
    },
    modulePage: {
      missingTitle: "Модуль не найден",
      missingBody:
        "Этот модуль отсутствует, не опубликован или Directus пока недоступен.",
      backToCourse: "Назад к обзору курса",
      module: "Модуль",
      lesson: "Урок",
      startLesson: "Начать урок",
      minutes: "мин",
    },
    lessonPage: {
      missingTitle: "Урок не найден",
      missingBody:
        "Не удалось загрузить урок. Возможно, он не опубликован, не завершён или Directus недоступен.",
      backToModule: "Назад к модулю",
    },
    lessonLayout: {
      backTo: "Назад к",
      previous: "Назад",
      next: "Далее",
      startOfModule: "Начало модуля",
      moduleComplete: "Модуль завершён",
      minutes: "мин",
    },
    lessonCompletion: {
      reachedEnd: "Вы дошли до конца урока",
      body: "Если материал понятен, отметьте урок как завершённый.",
      markComplete: "Завершить урок",
      completed: "Урок завершён",
      alreadyCompleted: "Этот урок уже отмечен как завершённый",
    },
    lessonTypes: {
      phonetic_symbol: "фонетический символ",
      sound_combination: "сочетание звуков",
      reading_rule: "правило чтения",
      exercise: "упражнение",
    },
    audio: {
      listen: "Слушать",
      missing: "Предпросмотр аудио появится здесь, когда будет добавлен audio URL или asset.",
    },
    studyCard: {
      howItSounds: "Как это звучит",
      stressNote: "Ударение",
      commonMistakes: "Частые ошибки",
      compareWithSimilarSounds: "Сравните с похожими звуками",
      examples: "Примеры",
    },
    readingRule: {
      ruleStatement: "Формулировка правила",
      exceptions: "Исключения",
      limits: "Ограничения",
      examples: "Примеры",
      reinforcement: "Закрепление",
      reinforcementFallback: "Используйте связанное упражнение, чтобы потренировать правило в контексте.",
    },
    exercise: {
      practice: "Практика",
      task: "Задание",
      of: "из",
      items: "заданий",
      passingScore: "Проходной балл",
      linkedExample: "Связанный пример",
      checkAnswers: "Проверить ответы",
      reset: "Сбросить",
      correct: "Верно",
      tryAgain: "Попробуйте ещё раз",
      score: "Результат",
      passed: "Отлично — вы достигли целевого результата.",
      retry: "Вы можете посмотреть объяснения выше и попробовать ещё раз.",
      review: "Просмотрите задания выше, чтобы закрепить звук или правило чтения.",
      instantFeedback: "Мгновенная обратная связь",
      yes: "да",
      no: "нет",
      itemTypes: {
        audio_to_symbol: "аудио → символ",
        symbol_to_audio: "символ → аудио",
        symbol_to_word: "символ → слово",
        transcription_to_word: "транскрипция → слово",
        stress_selection: "ударение",
        similar_sound_discrimination: "различение похожих звуков",
        reading_rule_application: "применение правила чтения",
      },
      interactionHints: {
        audio_to_symbol: "Прослушайте аудио и выберите подходящий символ.",
        symbol_to_audio: "Посмотрите на символ и выберите подходящую аудио-метку.",
        symbol_to_word: "Выберите слово, которое содержит нужный звук.",
        transcription_to_word: "Выберите слово, которое соответствует транскрипции.",
        stress_selection: "Выберите вариант с ударением на втором слоге.",
        similar_sound_discrimination: "Выберите вариант с нужным звуковым противопоставлением.",
        reading_rule_application: "Выберите вариант, который лучше всего показывает правило чтения.",
      },
    },
    notFound: {
      title: "Страница не найдена",
      body: "Запрошенная страница не существует или ещё не опубликована.",
      action: "На главную",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
