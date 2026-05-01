import { directusRequest } from "@/lib/directus";
import { env } from "@/lib/env";
import type { Locale } from "@/lib/i18n";
import {
  mapCourseOverview,
  mapLessonDetail,
  mapModuleDetail,
} from "@/lib/mappers";
import type {
  CourseOverview,
  CourseRecord,
  LessonBlockRecord,
  LessonDetail,
  ModuleDetail,
  ModuleRecord,
} from "@/lib/types";

const localizedFields = (...fieldNames: string[]) =>
  fieldNames.flatMap((field) => [`${field}_en`, `${field}_ru`]);

const courseFields = [
  "id",
  "status",
  ...localizedFields("hero_headline", "hero_subheadline"),
  "modules.id",
  "modules.status",
  "modules.slug",
  ...localizedFields("modules.title", "modules.summary", "modules.theme_label"),
  "modules.order",
  "modules.lesson_blocks.id",
  "modules.lesson_blocks.status",
  "modules.lesson_blocks.visibility",
  "modules.lesson_blocks.slug",
  ...localizedFields("modules.lesson_blocks.title", "modules.lesson_blocks.description"),
  "modules.lesson_blocks.lesson_type",
  "modules.lesson_blocks.order",
  "modules.lesson_blocks.estimated_minutes",
].join(",");

const moduleFields = [
  "id",
  "status",
  "slug",
  ...localizedFields("title", "summary", "theme_label"),
  "order",
  "lesson_blocks.id",
  "lesson_blocks.status",
  "lesson_blocks.visibility",
  "lesson_blocks.slug",
  ...localizedFields("lesson_blocks.title", "lesson_blocks.description"),
  "lesson_blocks.lesson_type",
  "lesson_blocks.order",
  "lesson_blocks.estimated_minutes",
].join(",");

const lessonFields = [
  "id",
  "status",
  "visibility",
  "slug",
  ...localizedFields("title", "description"),
  "lesson_type",
  "order",
  "estimated_minutes",
  "phonetic_symbol.id",
  "phonetic_symbol.slug",
  "phonetic_symbol.symbol",
  ...localizedFields(
    "phonetic_symbol.title",
    "phonetic_symbol.sound_type",
    "phonetic_symbol.explanation",
    "phonetic_symbol.stress_note",
    "phonetic_symbol.common_mistakes",
    "phonetic_symbol.comparison_note",
  ),
  "phonetic_symbol.primary_audio.id",
  ...localizedFields(
    "phonetic_symbol.primary_audio.title",
    "phonetic_symbol.primary_audio.description",
  ),
  "phonetic_symbol.primary_audio.transcript",
  "phonetic_symbol.primary_audio.phonetic_focus",
  "phonetic_symbol.primary_audio.file.id",
  "phonetic_symbol.examples.id",
  "phonetic_symbol.examples.sort",
  "phonetic_symbol.examples.example_words_id.id",
  "phonetic_symbol.examples.example_words_id.word",
  "phonetic_symbol.examples.example_words_id.transcription",
  ...localizedFields(
    "phonetic_symbol.examples.example_words_id.translation",
    "phonetic_symbol.examples.example_words_id.note",
  ),
  "phonetic_symbol.examples.example_words_id.primary_audio.id",
  ...localizedFields(
    "phonetic_symbol.examples.example_words_id.primary_audio.title",
    "phonetic_symbol.examples.example_words_id.primary_audio.description",
  ),
  "phonetic_symbol.examples.example_words_id.primary_audio.file.id",
  "sound_combination.id",
  "sound_combination.slug",
  "sound_combination.combination_text",
  ...localizedFields(
    "sound_combination.title",
    "sound_combination.explanation",
    "sound_combination.stress_note",
    "sound_combination.common_mistakes",
    "sound_combination.comparison_note",
  ),
  "sound_combination.primary_audio.id",
  ...localizedFields(
    "sound_combination.primary_audio.title",
    "sound_combination.primary_audio.description",
  ),
  "sound_combination.primary_audio.transcript",
  "sound_combination.primary_audio.phonetic_focus",
  "sound_combination.primary_audio.file.id",
  "sound_combination.examples.id",
  "sound_combination.examples.sort",
  "sound_combination.examples.example_words_id.id",
  "sound_combination.examples.example_words_id.word",
  "sound_combination.examples.example_words_id.transcription",
  ...localizedFields(
    "sound_combination.examples.example_words_id.translation",
    "sound_combination.examples.example_words_id.note",
  ),
  "sound_combination.examples.example_words_id.primary_audio.id",
  ...localizedFields(
    "sound_combination.examples.example_words_id.primary_audio.title",
    "sound_combination.examples.example_words_id.primary_audio.description",
  ),
  "sound_combination.examples.example_words_id.primary_audio.file.id",
  "reading_rule.id",
  "reading_rule.slug",
  ...localizedFields(
    "reading_rule.title",
    "reading_rule.rule_statement",
    "reading_rule.explanation",
    "reading_rule.exceptions",
    "reading_rule.limitations",
    "reading_rule.practice_intro",
  ),
  "reading_rule.examples.id",
  "reading_rule.examples.sort",
  "reading_rule.examples.example_words_id.id",
  "reading_rule.examples.example_words_id.word",
  "reading_rule.examples.example_words_id.transcription",
  ...localizedFields(
    "reading_rule.examples.example_words_id.translation",
    "reading_rule.examples.example_words_id.note",
  ),
  "reading_rule.examples.example_words_id.primary_audio.id",
  ...localizedFields(
    "reading_rule.examples.example_words_id.primary_audio.title",
    "reading_rule.examples.example_words_id.primary_audio.description",
  ),
  "reading_rule.examples.example_words_id.primary_audio.file.id",
  "reading_rule.reinforcement_exercises.id",
  "reading_rule.reinforcement_exercises.sort",
  "reading_rule.reinforcement_exercises.exercises_id.id",
  "reading_rule.reinforcement_exercises.exercises_id.slug",
  ...localizedFields(
    "reading_rule.reinforcement_exercises.exercises_id.title",
    "reading_rule.reinforcement_exercises.exercises_id.summary",
  ),
  "exercise.id",
  "exercise.slug",
  ...localizedFields("exercise.title", "exercise.summary", "exercise.instructions"),
  "exercise.show_item_feedback",
  "exercise.passing_score",
  "exercise.items.id",
  "exercise.items.sort",
  "exercise.items.type",
  ...localizedFields(
    "exercise.items.prompt",
    "exercise.items.prompt_note",
    "exercise.items.explanation",
  ),
  "exercise.items.prompt_symbol",
  "exercise.items.prompt_word",
  "exercise.items.prompt_transcription",
  "exercise.items.correct_option_ids",
  "exercise.items.options",
  "exercise.items.prompt_audio.id",
  ...localizedFields(
    "exercise.items.prompt_audio.title",
    "exercise.items.prompt_audio.description",
  ),
  "exercise.items.prompt_audio.file.id",
  "exercise.items.linked_example_word.id",
  "exercise.items.linked_example_word.word",
  "exercise.items.linked_example_word.transcription",
  ...localizedFields(
    "exercise.items.linked_example_word.translation",
    "exercise.items.linked_example_word.note",
  ),
  "exercise.items.linked_example_word.primary_audio.id",
  ...localizedFields(
    "exercise.items.linked_example_word.primary_audio.title",
    "exercise.items.linked_example_word.primary_audio.description",
  ),
  "exercise.items.linked_example_word.primary_audio.file.id",
]
  .map((field) => `lesson_blocks.${field}`)
  .join(",");

const isPublished = (record?: { status?: string | null } | null) =>
  record?.status === env.publishedStatus;

const isVisibleLesson = (
  record?: { status?: string | null; visibility?: string | null } | null,
) =>
  record?.status === env.publishedStatus &&
  record?.visibility === env.publishedVisibility;

export async function getCourseOverview(locale: Locale): Promise<CourseOverview | null> {
  const course = await directusRequest<CourseRecord>("/items/courses", {
    fields: courseFields,
  });

  if (!course || course.status !== env.publishedStatus) {
    return null;
  }

  return mapCourseOverview(
    {
      ...course,
      modules: (course.modules ?? [])
        .filter(isPublished)
        .map((module) => ({
          ...module,
          lesson_blocks: (module.lesson_blocks ?? []).filter(isVisibleLesson),
        })),
    },
    locale,
  );
}

export async function getModuleBySlug(
  slug: string,
  locale: Locale,
): Promise<ModuleDetail | null> {
  const data = await directusRequest<ModuleRecord[]>("/items/modules", {
    fields: moduleFields,
    limit: 1,
    filter: {
      status: { _eq: env.publishedStatus },
      slug: { _eq: slug },
    },
  });

  const moduleRecord = data?.[0];
  if (!moduleRecord) {
    return null;
  }

  return mapModuleDetail(
    {
      ...moduleRecord,
      lesson_blocks: (moduleRecord.lesson_blocks ?? []).filter(isVisibleLesson),
    },
    locale,
  );
}

export async function getLessonByModuleAndSlug(
  moduleSlug: string,
  lessonSlug: string,
  locale: Locale,
): Promise<LessonDetail | null> {
  const data = await directusRequest<ModuleRecord[]>("/items/modules", {
    fields: `id,slug,${localizedFields("title", "summary", "theme_label").join(",")},order,${lessonFields}`,
    limit: 1,
    filter: {
      status: { _eq: env.publishedStatus },
      slug: { _eq: moduleSlug },
    },
  });

  const moduleRecord = data?.[0];
  if (!moduleRecord) {
    return null;
  }

  const filteredModule = {
    ...moduleRecord,
    lesson_blocks: (moduleRecord.lesson_blocks ?? []).filter(isVisibleLesson),
  };

  const lessonRecord = filteredModule.lesson_blocks?.find(
    (lesson) => lesson.slug === lessonSlug,
  ) as LessonBlockRecord | undefined;

  return lessonRecord ? mapLessonDetail(filteredModule, lessonRecord, locale) : null;
}
