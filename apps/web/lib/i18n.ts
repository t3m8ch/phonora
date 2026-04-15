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
    lessonTypes: {
      phonetic_symbol: "phonetic symbol",
      sound_combination: "sound combination",
      reading_rule: "reading rule",
      exercise: "exercise",
    },
    audio: {
      listen: "Listen",
      missing: "Audio will appear here once an audio asset is attached.",
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
    lessonTypes: {
      phonetic_symbol: "фонетический символ",
      sound_combination: "сочетание звуков",
      reading_rule: "правило чтения",
      exercise: "упражнение",
    },
    audio: {
      listen: "Слушать",
      missing: "Аудио появится здесь, когда будет прикреплён аудиофайл.",
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
