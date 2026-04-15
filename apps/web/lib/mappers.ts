import { assetUrl } from "@/lib/env";
import { type Locale, resolveLocalizedValue } from "@/lib/i18n";
import type {
  AudioAsset,
  AudioAssetRecord,
  CourseOverview,
  CourseRecord,
  ExampleWord,
  ExampleWordRecord,
  ExerciseOption,
  ExerciseOptionRecord,
  ExerciseRecord,
  ExerciseView,
  LessonBlockRecord,
  LessonContentView,
  LessonDetail,
  LessonSummary,
  ModuleDetail,
  ModuleRecord,
  ModuleSummary,
  PhoneticSymbolRecord,
  ReadingRuleRecord,
  ReadingRuleView,
  SoundCombinationRecord,
  StudyCardView,
} from "@/lib/types";

const pickJunctionValue = <T extends object>(entry: Record<string, unknown>) => {
  const relationValue = Object.values(entry).find(
    (value) => typeof value === "object" && value !== null && "id" in (value as object),
  );

  return (relationValue as T | undefined) ?? null;
};

const getString = (value: unknown) => (typeof value === "string" ? value : null);

const pickLocalizedText = (record: Record<string, unknown>, field: string, locale: Locale) =>
  resolveLocalizedValue(
    {
      en: getString(record[`${field}_en`]),
      ru: getString(record[`${field}_ru`]),
    },
    locale,
  );

export const mapAudioAsset = (
  record: AudioAssetRecord | null | undefined,
  locale: Locale,
): AudioAsset | null => {
  if (!record?.file?.id) {
    return null;
  }

  return {
    id: record.id,
    title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
    description:
      pickLocalizedText(record as unknown as Record<string, unknown>, "description", locale) ??
      null,
    transcript: record.transcript ?? null,
    phoneticFocus: record.phonetic_focus ?? null,
    url: assetUrl(record.file.id),
  };
};

export const mapExampleWord = (
  record: ExampleWordRecord | null | undefined,
  locale: Locale,
): ExampleWord | null => {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    word: record.word,
    transcription: record.transcription ?? null,
    translation:
      pickLocalizedText(record as unknown as Record<string, unknown>, "translation", locale) ??
      null,
    note: pickLocalizedText(record as unknown as Record<string, unknown>, "note", locale) ?? null,
    audio: mapAudioAsset(record.primary_audio, locale),
  };
};

const mapExampleList = (
  junctions: Array<Record<string, unknown>> | undefined,
  locale: Locale,
) =>
  (junctions ?? [])
    .map((entry) => pickJunctionValue<ExampleWordRecord>(entry))
    .map((record) => mapExampleWord(record, locale))
    .filter((record): record is ExampleWord => Boolean(record));

export const mapModuleSummary = (record: ModuleRecord, locale: Locale): ModuleSummary => ({
  id: record.id,
  slug: record.slug,
  title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
  summary:
    pickLocalizedText(record as unknown as Record<string, unknown>, "summary", locale) ?? null,
  themeLabel:
    pickLocalizedText(record as unknown as Record<string, unknown>, "theme_label", locale) ?? null,
  order: record.order,
  lessonCount: record.lesson_blocks?.length ?? 0,
});

export const mapLessonSummary = (
  record: LessonBlockRecord,
  locale: Locale,
): LessonSummary => ({
  id: record.id,
  slug: record.slug,
  title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
  description:
    pickLocalizedText(record as unknown as Record<string, unknown>, "description", locale) ?? null,
  lessonType: record.lesson_type,
  order: record.order,
  estimatedMinutes: record.estimated_minutes ?? null,
});

export const mapCourseOverview = (
  record: CourseRecord,
  locale: Locale,
): CourseOverview => ({
  id: record.id,
  heroHeadline:
    pickLocalizedText(record as unknown as Record<string, unknown>, "hero_headline", locale) ??
    null,
  heroSubheadline:
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "hero_subheadline",
      locale,
    ) ?? null,
  modules: (record.modules ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((module) => mapModuleSummary(module, locale)),
});

export const mapModuleDetail = (record: ModuleRecord, locale: Locale): ModuleDetail => ({
  ...mapModuleSummary(record, locale),
  lessons: (record.lesson_blocks ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((lesson) => mapLessonSummary(lesson, locale)),
});

const mapStudyCardFromSymbol = (
  record: PhoneticSymbolRecord,
  locale: Locale,
): StudyCardView => ({
  kind: "phonetic_symbol",
  slug: record.slug,
  title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
  symbolOrCombination: record.symbol,
  label:
    pickLocalizedText(record as unknown as Record<string, unknown>, "sound_type", locale) ?? null,
  explanation:
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "",
  stressNote:
    pickLocalizedText(record as unknown as Record<string, unknown>, "stress_note", locale) ?? null,
  commonMistakes:
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "common_mistakes",
      locale,
    ) ?? null,
  comparisonNote:
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "comparison_note",
      locale,
    ) ?? null,
  audio: mapAudioAsset(record.primary_audio, locale),
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale),
});

const mapStudyCardFromCombination = (
  record: SoundCombinationRecord,
  locale: Locale,
): StudyCardView => ({
  kind: "sound_combination",
  slug: record.slug,
  title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
  symbolOrCombination: record.combination_text,
  label: null,
  explanation:
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "",
  stressNote:
    pickLocalizedText(record as unknown as Record<string, unknown>, "stress_note", locale) ?? null,
  commonMistakes:
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "common_mistakes",
      locale,
    ) ?? null,
  comparisonNote:
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "comparison_note",
      locale,
    ) ?? null,
  audio: mapAudioAsset(record.primary_audio, locale),
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale),
});

const mapExerciseOption = (
  record: ExerciseOptionRecord,
  audioLibrary: Map<string, AudioAsset>,
  locale: Locale,
): ExerciseOption => {
  const label =
    resolveLocalizedValue(
      {
        en: record.label_en,
        ru: record.label_ru,
      },
      locale,
    ) ?? "";

  return {
    id: record.id,
    label,
    value: record.value ?? null,
    word: record.word ?? null,
    transcription: record.transcription ?? null,
    symbol: record.symbol ?? null,
    audio: record.audio_asset_id
      ? audioLibrary.get(record.audio_asset_id) ?? {
          id: record.audio_asset_id,
          title: label,
          url: assetUrl(record.audio_asset_id),
          description: null,
          transcript: null,
          phoneticFocus: null,
        }
      : null,
  };
};

export const mapExercise = (record: ExerciseRecord, locale: Locale): ExerciseView => {
  const audioLibrary = new Map<string, AudioAsset>();

  record.items?.forEach((item) => {
    const promptAudio = mapAudioAsset(item.prompt_audio, locale);
    if (promptAudio && item.prompt_audio) {
      audioLibrary.set(item.prompt_audio.id, promptAudio);
    }

    const linkedExampleAudio = mapAudioAsset(item.linked_example_word?.primary_audio, locale);
    if (linkedExampleAudio && item.linked_example_word?.primary_audio) {
      audioLibrary.set(item.linked_example_word.primary_audio.id, linkedExampleAudio);
    }
  });

  return {
    kind: "exercise",
    slug: record.slug,
    title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
    summary:
      pickLocalizedText(record as unknown as Record<string, unknown>, "summary", locale) ?? null,
    instructions:
      pickLocalizedText(record as unknown as Record<string, unknown>, "instructions", locale) ??
      "",
    showItemFeedback: record.show_item_feedback,
    passingScore: record.passing_score ?? null,
    items: (record.items ?? [])
      .slice()
      .sort((left, right) => left.sort - right.sort)
      .map((item) => ({
        id: item.id,
        type: item.type,
        prompt:
          pickLocalizedText(item as unknown as Record<string, unknown>, "prompt", locale) ?? "",
        promptNote:
          pickLocalizedText(item as unknown as Record<string, unknown>, "prompt_note", locale) ??
          null,
        promptSymbol: item.prompt_symbol ?? null,
        promptWord: item.prompt_word ?? null,
        promptTranscription: item.prompt_transcription ?? null,
        promptAudio: mapAudioAsset(item.prompt_audio, locale),
        linkedExampleWord: mapExampleWord(item.linked_example_word, locale),
        options: item.options.map((option) => mapExerciseOption(option, audioLibrary, locale)),
        correctOptionIds: item.correct_option_ids,
        explanation:
          pickLocalizedText(item as unknown as Record<string, unknown>, "explanation", locale) ??
          null,
      })),
  };
};

const mapReadingRule = (record: ReadingRuleRecord, locale: Locale): ReadingRuleView => ({
  kind: "reading_rule",
  slug: record.slug,
  title: pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "",
  ruleStatement:
    pickLocalizedText(record as unknown as Record<string, unknown>, "rule_statement", locale) ??
    "",
  explanation:
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "",
  exceptions:
    pickLocalizedText(record as unknown as Record<string, unknown>, "exceptions", locale) ?? null,
  limitations:
    pickLocalizedText(record as unknown as Record<string, unknown>, "limitations", locale) ??
    null,
  practiceIntro:
    pickLocalizedText(record as unknown as Record<string, unknown>, "practice_intro", locale) ??
    null,
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale),
  reinforcementExercises: (record.reinforcement_exercises ?? [])
    .map((entry) => pickJunctionValue<ExerciseRecord>(entry))
    .filter((value): value is ExerciseRecord => Boolean(value))
    .map((exercise) => ({
      slug: exercise.slug,
      title:
        pickLocalizedText(exercise as unknown as Record<string, unknown>, "title", locale) ?? "",
      summary:
        pickLocalizedText(exercise as unknown as Record<string, unknown>, "summary", locale) ??
        null,
    })),
});

export const mapLessonContent = (
  lesson: LessonBlockRecord,
  locale: Locale,
): LessonContentView | null => {
  switch (lesson.lesson_type) {
    case "phonetic_symbol":
      return lesson.phonetic_symbol ? mapStudyCardFromSymbol(lesson.phonetic_symbol, locale) : null;
    case "sound_combination":
      return lesson.sound_combination
        ? mapStudyCardFromCombination(lesson.sound_combination, locale)
        : null;
    case "reading_rule":
      return lesson.reading_rule ? mapReadingRule(lesson.reading_rule, locale) : null;
    case "exercise":
      return lesson.exercise ? mapExercise(lesson.exercise, locale) : null;
    default:
      return null;
  }
};

export const mapLessonDetail = (
  moduleRecord: ModuleRecord,
  lessonRecord: LessonBlockRecord,
  locale: Locale,
): LessonDetail => {
  const orderedLessons = (moduleRecord.lesson_blocks ?? [])
    .slice()
    .sort((left, right) => left.order - right.order);
  const currentIndex = orderedLessons.findIndex((item) => item.slug === lessonRecord.slug);

  return {
    id: lessonRecord.id,
    slug: lessonRecord.slug,
    title: pickLocalizedText(lessonRecord as unknown as Record<string, unknown>, "title", locale) ?? "",
    description:
      pickLocalizedText(lessonRecord as unknown as Record<string, unknown>, "description", locale) ??
      null,
    lessonType: lessonRecord.lesson_type,
    estimatedMinutes: lessonRecord.estimated_minutes ?? null,
    module: mapModuleSummary(moduleRecord, locale),
    previousLesson:
      currentIndex > 0 ? mapLessonSummary(orderedLessons[currentIndex - 1], locale) : null,
    nextLesson:
      currentIndex >= 0 && currentIndex < orderedLessons.length - 1
        ? mapLessonSummary(orderedLessons[currentIndex + 1], locale)
        : null,
    content: mapLessonContent(lessonRecord, locale),
  };
};
