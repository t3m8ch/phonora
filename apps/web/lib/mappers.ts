import { assetUrl } from "@/lib/env";
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
  ReadingRuleRecord,
  ReadingRuleView,
  SoundCombinationRecord,
  StudyCardView,
  PhoneticSymbolRecord,
} from "@/lib/types";

const pickJunctionValue = <T extends object>(entry: Record<string, unknown>) => {
  const relationValue = Object.values(entry).find(
    (value) => typeof value === "object" && value !== null && "id" in (value as object),
  );

  return (relationValue as T | undefined) ?? null;
};

export const mapAudioAsset = (record?: AudioAssetRecord | null): AudioAsset | null => {
  if (!record?.file?.id) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    description: record.description ?? null,
    transcript: record.transcript ?? null,
    phoneticFocus: record.phonetic_focus ?? null,
    url: assetUrl(record.file.id),
  };
};

export const mapExampleWord = (record?: ExampleWordRecord | null): ExampleWord | null => {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    word: record.word,
    transcription: record.transcription ?? null,
    translation: record.translation ?? null,
    note: record.note ?? null,
    audio: mapAudioAsset(record.primary_audio),
  };
};

const mapExampleList = (junctions?: Array<Record<string, unknown>>) =>
  (junctions ?? [])
    .map((entry) => pickJunctionValue<ExampleWordRecord>(entry))
    .map((record) => mapExampleWord(record))
    .filter((record): record is ExampleWord => Boolean(record));

export const mapModuleSummary = (record: ModuleRecord): ModuleSummary => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  summary: record.summary ?? null,
  themeLabel: record.theme_label ?? null,
  order: record.order,
  lessonCount: record.lesson_blocks?.length ?? 0,
});

export const mapLessonSummary = (record: LessonBlockRecord): LessonSummary => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  description: record.description ?? null,
  lessonType: record.lesson_type,
  order: record.order,
  estimatedMinutes: record.estimated_minutes ?? null,
});

export const mapCourseOverview = (record: CourseRecord): CourseOverview => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  summary: record.summary ?? null,
  description: record.description ?? null,
  heroHeadline: record.hero_headline ?? null,
  heroSubheadline: record.hero_subheadline ?? null,
  modules: (record.modules ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map(mapModuleSummary),
});

export const mapModuleDetail = (record: ModuleRecord): ModuleDetail => ({
  ...mapModuleSummary(record),
  lessons: (record.lesson_blocks ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map(mapLessonSummary),
});

const mapStudyCardFromSymbol = (record: PhoneticSymbolRecord): StudyCardView => ({
  kind: "phonetic_symbol",
  slug: record.slug,
  title: record.title,
  symbolOrCombination: record.symbol,
  label: record.sound_type ?? null,
  explanation: record.explanation,
  stressNote: record.stress_note ?? null,
  commonMistakes: record.common_mistakes ?? null,
  comparisonNote: record.comparison_note ?? null,
  audio: mapAudioAsset(record.primary_audio),
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined),
});

const mapStudyCardFromCombination = (
  record: SoundCombinationRecord,
): StudyCardView => ({
  kind: "sound_combination",
  slug: record.slug,
  title: record.title,
  symbolOrCombination: record.combination_text,
  label: null,
  explanation: record.explanation,
  stressNote: record.stress_note ?? null,
  commonMistakes: record.common_mistakes ?? null,
  comparisonNote: record.comparison_note ?? null,
  audio: mapAudioAsset(record.primary_audio),
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined),
});

const mapExerciseOption = (
  record: ExerciseOptionRecord,
  audioLibrary: Map<string, AudioAsset>,
): ExerciseOption => ({
  id: record.id,
  label: record.label,
  value: record.value ?? null,
  word: record.word ?? null,
  transcription: record.transcription ?? null,
  symbol: record.symbol ?? null,
  audio: record.audio_asset_id ? audioLibrary.get(record.audio_asset_id) ?? null : null,
});

export const mapExercise = (record: ExerciseRecord): ExerciseView => {
  const audioLibrary = new Map<string, AudioAsset>();

  record.items?.forEach((item) => {
    const promptAudio = mapAudioAsset(item.prompt_audio);
    if (promptAudio && item.prompt_audio) {
      audioLibrary.set(item.prompt_audio.id, promptAudio);
    }

    const linkedExampleAudio = mapAudioAsset(item.linked_example_word?.primary_audio);
    if (linkedExampleAudio && item.linked_example_word?.primary_audio) {
      audioLibrary.set(item.linked_example_word.primary_audio.id, linkedExampleAudio);
    }
  });

  return {
    kind: "exercise",
    slug: record.slug,
    title: record.title,
    summary: record.summary ?? null,
    instructions: record.instructions,
    showItemFeedback: record.show_item_feedback,
    passingScore: record.passing_score ?? null,
    items: (record.items ?? [])
      .slice()
      .sort((left, right) => left.sort - right.sort)
      .map((item) => ({
        id: item.id,
        type: item.type,
        prompt: item.prompt,
        promptNote: item.prompt_note ?? null,
        promptSymbol: item.prompt_symbol ?? null,
        promptWord: item.prompt_word ?? null,
        promptTranscription: item.prompt_transcription ?? null,
        promptAudio: mapAudioAsset(item.prompt_audio),
        linkedExampleWord: mapExampleWord(item.linked_example_word),
        options: item.options.map((option) => mapExerciseOption(option, audioLibrary)),
        correctOptionIds: item.correct_option_ids,
        explanation: item.explanation ?? null,
      })),
  };
};

const mapReadingRule = (record: ReadingRuleRecord): ReadingRuleView => ({
  kind: "reading_rule",
  slug: record.slug,
  title: record.title,
  ruleStatement: record.rule_statement,
  explanation: record.explanation,
  exceptions: record.exceptions ?? null,
  limitations: record.limitations ?? null,
  practiceIntro: record.practice_intro ?? null,
  examples: mapExampleList(record.examples as Array<Record<string, unknown>> | undefined),
  reinforcementExercises: (record.reinforcement_exercises ?? [])
    .map((entry) => pickJunctionValue<ExerciseRecord>(entry))
    .filter((value): value is ExerciseRecord => Boolean(value))
    .map((exercise) => ({
      slug: exercise.slug,
      title: exercise.title,
      summary: exercise.summary ?? null,
    })),
});

export const mapLessonContent = (
  lesson: LessonBlockRecord,
): LessonContentView | null => {
  switch (lesson.lesson_type) {
    case "phonetic_symbol":
      return lesson.phonetic_symbol ? mapStudyCardFromSymbol(lesson.phonetic_symbol) : null;
    case "sound_combination":
      return lesson.sound_combination
        ? mapStudyCardFromCombination(lesson.sound_combination)
        : null;
    case "reading_rule":
      return lesson.reading_rule ? mapReadingRule(lesson.reading_rule) : null;
    case "exercise":
      return lesson.exercise ? mapExercise(lesson.exercise) : null;
    default:
      return null;
  }
};

export const mapLessonDetail = (
  moduleRecord: ModuleRecord,
  lessonRecord: LessonBlockRecord,
): LessonDetail => {
  const orderedLessons = (moduleRecord.lesson_blocks ?? [])
    .slice()
    .sort((left, right) => left.order - right.order);
  const currentIndex = orderedLessons.findIndex((item) => item.slug === lessonRecord.slug);

  return {
    id: lessonRecord.id,
    slug: lessonRecord.slug,
    title: lessonRecord.title,
    description: lessonRecord.description ?? null,
    lessonType: lessonRecord.lesson_type,
    estimatedMinutes: lessonRecord.estimated_minutes ?? null,
    module: mapModuleSummary(moduleRecord),
    previousLesson: currentIndex > 0 ? mapLessonSummary(orderedLessons[currentIndex - 1]) : null,
    nextLesson:
      currentIndex >= 0 && currentIndex < orderedLessons.length - 1
        ? mapLessonSummary(orderedLessons[currentIndex + 1])
        : null,
    content: mapLessonContent(lessonRecord),
  };
};
