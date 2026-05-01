import type { ExerciseItemType, ExerciseView, LessonDetail, ModuleSummary } from "@/lib/types";

export type ModuleCardKind =
  | "sound_symbols"
  | "sound_combinations"
  | "reading_rules"
  | "practice"
  | "mixed";

export type ModuleVariant = "theory" | "practice";

export type LessonDifficulty = "beginner" | "intermediate" | "advanced";

export type LessonBlockKind =
  | "concept"
  | "pronunciation"
  | "example"
  | "mistake"
  | "rule"
  | "practice_note";

export type PracticeCardKind =
  | "listening"
  | "symbol"
  | "word"
  | "stress"
  | "rule"
  | "contrast";

export type PracticeVariant = "warmup" | "normal" | "challenge" | "exam";

const includesAny = (value: string, needles: string[]) =>
  needles.some((needle) => value.includes(needle));

export function getModuleCardKind(module: ModuleSummary): ModuleCardKind {
  const source = `${module.slug} ${module.themeLabel ?? ""} ${module.title}`.toLowerCase();

  if (includesAny(source, ["practice", "drill", "lab", "практи"])) {
    return "practice";
  }

  if (includesAny(source, ["rule", "reading", "чтен", "правил"])) {
    return "reading_rules";
  }

  if (includesAny(source, ["combination", "diphthong", "сочет", "дифтонг"])) {
    return "sound_combinations";
  }

  if (includesAny(source, ["symbol", "sound", "звук", "символ"])) {
    return "sound_symbols";
  }

  return "mixed";
}

export function getModuleVariant(module: ModuleSummary): ModuleVariant {
  if (module.lessons?.some((lesson) => lesson.lessonType === "exercise")) {
    return "practice";
  }

  const source = `${module.slug} ${module.themeLabel ?? ""} ${module.title}`.toLowerCase();
  return includesAny(source, ["practice", "drill", "lab", "практи", "РїСЂР°РєС‚Рё"])
    ? "practice"
    : "theory";
}

export function getLessonDifficulty(lesson: Pick<LessonDetail, "lessonType" | "order">): LessonDifficulty {
  if (lesson.lessonType === "exercise" || lesson.order >= 4) {
    return "advanced";
  }

  if (lesson.lessonType === "reading_rule" || lesson.order >= 2) {
    return "intermediate";
  }

  return "beginner";
}

export function getPracticeCardKind(type: ExerciseItemType): PracticeCardKind {
  switch (type) {
    case "audio_to_symbol":
    case "symbol_to_audio":
      return "listening";
    case "symbol_to_word":
    case "transcription_to_word":
      return "word";
    case "stress_selection":
      return "stress";
    case "similar_sound_discrimination":
      return "contrast";
    case "reading_rule_application":
      return "rule";
    default:
      return "symbol";
  }
}

export function getPracticeVariant(exercise: ExerciseView): PracticeVariant {
  const itemCount = exercise.items.length;
  const passingScore = exercise.passingScore ?? 0;
  const hasHardDiscrimination = exercise.items.some(
    (item) =>
      item.type === "similar_sound_discrimination" ||
      item.type === "reading_rule_application" ||
      item.correctOptionIds.length > 1,
  );

  if (!exercise.showItemFeedback && passingScore >= 80) {
    return "exam";
  }

  if (passingScore >= 85 || itemCount >= 10 || (hasHardDiscrimination && passingScore >= 75)) {
    return "challenge";
  }

  if (itemCount <= 3 && passingScore <= 70) {
    return "warmup";
  }

  return "normal";
}
