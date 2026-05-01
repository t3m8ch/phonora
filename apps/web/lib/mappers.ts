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
  LessonBlockView,
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

const localized = (value?: string | null) => ({
  en: value ?? null,
  ru: value ?? null,
});

const mapExamplesBlock = (id: string, examples: ExampleWord[]): LessonBlockView | null =>
  examples.length
    ? {
        id,
        type: "examples",
        examples: examples.map((example) => ({
          id: example.id,
          word: example.word,
          transcription: example.transcription,
          translation: localized(example.translation),
          audio: example.audio,
        })),
      }
    : null;

const compactBlocks = (blocks: Array<LessonBlockView | null>) =>
  blocks.filter((block): block is LessonBlockView => Boolean(block));

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
  lessons: (record.lesson_blocks ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((lesson) => mapLessonSummary(lesson, locale)),
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
): StudyCardView => {
  const title = pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "";
  const explanation =
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "";
  const label =
    pickLocalizedText(record as unknown as Record<string, unknown>, "sound_type", locale) ?? null;
  const stressNote =
    pickLocalizedText(record as unknown as Record<string, unknown>, "stress_note", locale) ?? null;
  const commonMistakes =
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "common_mistakes",
      locale,
    ) ?? null;
  const comparisonNote =
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "comparison_note",
      locale,
    ) ?? null;
  const audio = mapAudioAsset(record.primary_audio, locale);
  const examples = mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale);

  return {
    kind: "phonetic_symbol",
    slug: record.slug,
    title,
    symbolOrCombination: record.symbol,
    label,
    explanation,
    stressNote,
    commonMistakes,
    comparisonNote,
    audio,
    examples,
    blocks: compactBlocks([
      {
        id: `${record.slug}-visual`,
        type: "sound_visual",
        symbol: record.symbol,
        title: localized(title),
        description: localized(explanation),
      },
      audio
        ? {
            id: `${record.slug}-audio`,
            type: "sound_audio",
            audio,
            title: localized(title),
            description: localized(label ?? explanation),
            transcript: audio.transcript,
            symbol: record.symbol,
          }
        : null,
      mapExamplesBlock(`${record.slug}-examples`, examples),
      stressNote
        ? {
            id: `${record.slug}-stress-note`,
            type: "info",
            title: localized("Stress note"),
            body: localized(stressNote),
            tone: "tip",
          }
        : null,
      commonMistakes
        ? {
            id: `${record.slug}-common-mistakes`,
            type: "info",
            title: localized("Common mistakes"),
            body: localized(commonMistakes),
            tone: "warning",
          }
        : null,
      comparisonNote
        ? {
            id: `${record.slug}-comparison`,
            type: "sound_comparison",
            leftSymbol: record.symbol,
            rightSymbol: "",
            leftExamples: examples.map((example) => example.word).slice(0, 3),
            rightExamples: [],
            explanation: localized(comparisonNote),
          }
        : null,
    ]),
  };
};

const mapStudyCardFromCombination = (
  record: SoundCombinationRecord,
  locale: Locale,
): StudyCardView => {
  const title = pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "";
  const explanation =
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "";
  const stressNote =
    pickLocalizedText(record as unknown as Record<string, unknown>, "stress_note", locale) ?? null;
  const commonMistakes =
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "common_mistakes",
      locale,
    ) ?? null;
  const comparisonNote =
    pickLocalizedText(
      record as unknown as Record<string, unknown>,
      "comparison_note",
      locale,
    ) ?? null;
  const audio = mapAudioAsset(record.primary_audio, locale);
  const examples = mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale);

  return {
    kind: "sound_combination",
    slug: record.slug,
    title,
    symbolOrCombination: record.combination_text,
    label: null,
    explanation,
    stressNote,
    commonMistakes,
    comparisonNote,
    audio,
    examples,
    blocks: compactBlocks([
      {
        id: `${record.slug}-visual`,
        type: "sound_visual",
        symbol: record.combination_text,
        title: localized(title),
        description: localized(explanation),
      },
      audio
        ? {
            id: `${record.slug}-audio`,
            type: "sound_audio",
            audio,
            title: localized(title),
            description: localized(explanation),
            transcript: audio.transcript,
            symbol: record.combination_text,
          }
        : null,
      mapExamplesBlock(`${record.slug}-examples`, examples),
      stressNote
        ? {
            id: `${record.slug}-stress-note`,
            type: "info",
            title: localized("Stress note"),
            body: localized(stressNote),
            tone: "tip",
          }
        : null,
      commonMistakes
        ? {
            id: `${record.slug}-common-mistakes`,
            type: "info",
            title: localized("Common mistakes"),
            body: localized(commonMistakes),
            tone: "warning",
          }
        : null,
      comparisonNote
        ? {
            id: `${record.slug}-comparison`,
            type: "sound_comparison",
            leftSymbol: record.combination_text,
            rightSymbol: "",
            leftExamples: examples.map((example) => example.word).slice(0, 3),
            rightExamples: [],
            explanation: localized(comparisonNote),
          }
        : null,
    ]),
  };
};

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

const mapReadingRule = (record: ReadingRuleRecord, locale: Locale): ReadingRuleView => {
  const title = pickLocalizedText(record as unknown as Record<string, unknown>, "title", locale) ?? "";
  const ruleStatement =
    pickLocalizedText(record as unknown as Record<string, unknown>, "rule_statement", locale) ??
    "";
  const explanation =
    pickLocalizedText(record as unknown as Record<string, unknown>, "explanation", locale) ?? "";
  const exceptions =
    pickLocalizedText(record as unknown as Record<string, unknown>, "exceptions", locale) ?? null;
  const limitations =
    pickLocalizedText(record as unknown as Record<string, unknown>, "limitations", locale) ??
    null;
  const practiceIntro =
    pickLocalizedText(record as unknown as Record<string, unknown>, "practice_intro", locale) ??
    null;
  const examples = mapExampleList(record.examples as Array<Record<string, unknown>> | undefined, locale);
  const reinforcementExercises = (record.reinforcement_exercises ?? [])
    .map((entry) => pickJunctionValue<ExerciseRecord>(entry))
    .filter((value): value is ExerciseRecord => Boolean(value))
    .map((exercise) => ({
      slug: exercise.slug,
      title:
        pickLocalizedText(exercise as unknown as Record<string, unknown>, "title", locale) ?? "",
      summary:
        pickLocalizedText(exercise as unknown as Record<string, unknown>, "summary", locale) ??
        null,
    }));

  return {
    kind: "reading_rule",
    slug: record.slug,
    title,
    ruleStatement,
    explanation,
    exceptions,
    limitations,
    practiceIntro,
    examples,
    reinforcementExercises,
    blocks: compactBlocks([
      {
        id: `${record.slug}-rule`,
        type: "info",
        title: localized(ruleStatement || title),
        body: localized(explanation),
        tone: "neutral",
      },
      exceptions
        ? {
            id: `${record.slug}-exceptions`,
            type: "info",
            title: localized("Exceptions"),
            body: localized(exceptions),
            tone: "warning",
          }
        : null,
      limitations
        ? {
            id: `${record.slug}-limits`,
            type: "info",
            title: localized("Limits"),
            body: localized(limitations),
            tone: "tip",
          }
        : null,
      mapExamplesBlock(`${record.slug}-examples`, examples),
      practiceIntro
        ? {
            id: `${record.slug}-practice-note`,
            type: "info",
            title: localized("Practice note"),
            body: localized(practiceIntro),
            tone: "tip",
          }
        : null,
    ]),
  };
};

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
    order: lessonRecord.order,
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
