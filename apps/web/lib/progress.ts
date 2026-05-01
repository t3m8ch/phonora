import type { ModuleSummary } from "@/lib/types";

export const PROGRESS_STORAGE_KEY = "phonora:local-progress:v1";
export const PROGRESS_UPDATED_EVENT = "phonora-progress-updated";

export type LessonProgressRecord = {
  lessonId: string;
  moduleSlug: string;
  moduleTitle?: string | null;
  lessonSlug: string;
  lessonTitle?: string | null;
  lastScore: number;
  bestScore: number;
  lastScorePercent: number;
  bestScorePercent: number;
  passed: boolean;
  completed: boolean;
  attemptsCount: number;
  completedAt?: string | null;
  updatedAt: string;
};

export type AttemptRecord = {
  id: string;
  lessonId: string;
  moduleSlug: string;
  moduleTitle?: string | null;
  lessonSlug: string;
  lessonTitle?: string | null;
  score: number;
  total: number;
  scorePercent: number;
  passed: boolean;
  updatedAt: string;
};

export type ProgressData = {
  completedLessonIds: string[];
  lessons: Record<string, LessonProgressRecord>;
  attempts: AttemptRecord[];
};

export type CourseProgressSummary = {
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  completedModules: number;
  percent: number;
};

export type ModuleProgressSummary = {
  moduleSlug: string;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  status: "not_started" | "in_progress" | "completed";
  bestScorePercent: number | null;
  attemptsCount: number;
};

export type KnowledgeStats = CourseProgressSummary & {
  bestScorePercent: number | null;
  attemptsCount: number;
  lastActivityAt: string | null;
  recentAttempts: AttemptRecord[];
  hasProgress: boolean;
};

export type SaveLessonResultInput = {
  lessonId: string;
  moduleSlug: string;
  moduleTitle?: string | null;
  lessonSlug: string;
  lessonTitle?: string | null;
  score: number;
  total: number;
  scorePercent: number;
  passingScorePercent?: number | null;
};

export type MarkLessonCompletedMetadata = {
  lessonId?: string;
  moduleTitle?: string | null;
  lessonTitle?: string | null;
};

const emptyProgressData = (): ProgressData => ({
  completedLessonIds: [],
  lessons: {},
  attempts: [],
});

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeProgressData = (value: Partial<ProgressData> | null | undefined): ProgressData => {
  const lessons = value?.lessons && typeof value.lessons === "object" ? value.lessons : {};
  const completedLessonIds = Array.isArray(value?.completedLessonIds)
    ? value.completedLessonIds
    : Object.values(lessons)
        .filter((lesson) => lesson.completed)
        .map((lesson) => lesson.lessonId);

  return {
    completedLessonIds: Array.from(new Set(completedLessonIds)),
    lessons,
    attempts: Array.isArray(value?.attempts) ? value.attempts : [],
  };
};

const writeProgressData = (data: ProgressData) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const isCourseLessonCompleted = (
  progress: ProgressData,
  moduleSlug: string,
  lesson: { id: string; slug: string },
) =>
  progress.completedLessonIds.includes(lesson.id) ||
  Boolean(progress.lessons[lesson.id]?.completed) ||
  Object.values(progress.lessons).some(
    (record) =>
      record.moduleSlug === moduleSlug &&
      record.lessonSlug === lesson.slug &&
      record.completed,
  );

export function getProgressData(): ProgressData {
  if (!canUseStorage()) {
    return emptyProgressData();
  }

  try {
    const rawValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return normalizeProgressData(rawValue ? (JSON.parse(rawValue) as Partial<ProgressData>) : null);
  } catch {
    return emptyProgressData();
  }
}

export function saveLessonResult(input: SaveLessonResultInput): ProgressData {
  const current = getProgressData();
  const previous = current.lessons[input.lessonId];
  const passed = input.passingScorePercent
    ? input.scorePercent >= input.passingScorePercent
    : input.scorePercent > 0;
  const completed = passed;
  const bestScore = Math.max(previous?.bestScore ?? 0, input.score);
  const bestScorePercent = Math.max(previous?.bestScorePercent ?? 0, input.scorePercent);
  const updatedAt = new Date().toISOString();

  const nextLesson: LessonProgressRecord = {
    lessonId: input.lessonId,
    moduleSlug: input.moduleSlug,
    moduleTitle: input.moduleTitle ?? previous?.moduleTitle ?? null,
    lessonSlug: input.lessonSlug,
    lessonTitle: input.lessonTitle ?? previous?.lessonTitle ?? null,
    lastScore: input.score,
    bestScore,
    lastScorePercent: input.scorePercent,
    bestScorePercent,
    passed,
    completed: previous?.completed || completed,
    attemptsCount: (previous?.attemptsCount ?? 0) + 1,
    completedAt: previous?.completedAt ?? (previous?.completed || completed ? updatedAt : null),
    updatedAt,
  };

  const completedLessonIds = new Set(current.completedLessonIds);
  if (nextLesson.completed) {
    completedLessonIds.add(input.lessonId);
  }

  const attempt: AttemptRecord = {
    id: `${input.lessonId}-${updatedAt}`,
    lessonId: input.lessonId,
    moduleSlug: input.moduleSlug,
    moduleTitle: input.moduleTitle ?? null,
    lessonSlug: input.lessonSlug,
    lessonTitle: input.lessonTitle ?? null,
    score: input.score,
    total: input.total,
    scorePercent: input.scorePercent,
    passed,
    updatedAt,
  };

  const nextData: ProgressData = {
    completedLessonIds: Array.from(completedLessonIds),
    lessons: {
      ...current.lessons,
      [input.lessonId]: nextLesson,
    },
    attempts: [attempt, ...current.attempts].slice(0, 50),
  };

  writeProgressData(nextData);
  return nextData;
}

export function markLessonCompleted(
  moduleSlug: string,
  lessonSlug: string,
  metadata?: MarkLessonCompletedMetadata,
): ProgressData {
  const lessonId = metadata?.lessonId ?? `${moduleSlug}/${lessonSlug}`;
  const current = getProgressData();
  const previous = current.lessons[lessonId];
  const updatedAt = new Date().toISOString();

  const nextLesson: LessonProgressRecord = {
    lessonId,
    moduleSlug,
    moduleTitle: metadata?.moduleTitle ?? previous?.moduleTitle ?? null,
    lessonSlug,
    lessonTitle: metadata?.lessonTitle ?? previous?.lessonTitle ?? null,
    lastScore: previous?.lastScore ?? 0,
    bestScore: previous?.bestScore ?? 0,
    lastScorePercent: previous?.lastScorePercent ?? 0,
    bestScorePercent: previous?.bestScorePercent ?? 0,
    passed: previous?.passed ?? true,
    completed: true,
    attemptsCount: previous?.attemptsCount ?? 0,
    completedAt: previous?.completedAt ?? updatedAt,
    updatedAt,
  };

  const completedLessonIds = new Set(current.completedLessonIds);
  completedLessonIds.add(lessonId);

  const nextData: ProgressData = {
    completedLessonIds: Array.from(completedLessonIds),
    lessons: {
      ...current.lessons,
      [lessonId]: nextLesson,
    },
    attempts: current.attempts,
  };

  writeProgressData(nextData);
  return nextData;
}

export function isLessonCompleted(
  moduleSlugOrLessonId: string,
  lessonSlug?: string,
  lessonId?: string,
) {
  const progress = getProgressData();
  const storageLessonId = lessonId ?? moduleSlugOrLessonId;

  if (progress.completedLessonIds.includes(storageLessonId) || progress.lessons[storageLessonId]?.completed) {
    return true;
  }

  if (!lessonSlug) {
    return false;
  }

  return Object.values(progress.lessons).some(
    (lesson) =>
      lesson.moduleSlug === moduleSlugOrLessonId &&
      lesson.lessonSlug === lessonSlug &&
      lesson.completed,
  );
}

export function getModuleProgress(module: ModuleSummary): ModuleProgressSummary {
  const progress = getProgressData();
  const lessons = module.lessons ?? [];
  const totalLessons = lessons.length || module.lessonCount;
  const completedLessons = lessons.filter((lesson) =>
    isCourseLessonCompleted(progress, module.slug, lesson),
  ).length;
  const moduleRecords = Object.values(progress.lessons).filter(
    (lesson) => lesson.moduleSlug === module.slug,
  );
  const attemptsCount = moduleRecords.reduce((sum, lesson) => sum + lesson.attemptsCount, 0);
  const bestScores = moduleRecords
    .filter((lesson) => lesson.attemptsCount > 0)
    .map((lesson) => lesson.bestScorePercent);
  const bestScorePercent = bestScores.length ? Math.max(...bestScores) : null;
  const percent = totalLessons
    ? clampPercent(Math.round((completedLessons / totalLessons) * 100))
    : 0;

  return {
    moduleSlug: module.slug,
    totalLessons,
    completedLessons,
    percent,
    status:
      completedLessons === 0
        ? "not_started"
        : completedLessons >= totalLessons
          ? "completed"
          : "in_progress",
    bestScorePercent,
    attemptsCount,
  };
}

export function getOverallCourseProgress(modules: ModuleSummary[]): CourseProgressSummary {
  const moduleProgress = modules.map(getModuleProgress);
  const totalLessons = moduleProgress.reduce((sum, item) => sum + item.totalLessons, 0);
  const completedLessons = moduleProgress.reduce((sum, item) => sum + item.completedLessons, 0);
  const totalModules = modules.length;
  const completedModules = moduleProgress.filter((item) => item.status === "completed").length;

  return {
    totalLessons,
    completedLessons,
    totalModules,
    completedModules,
    percent: totalLessons ? clampPercent(Math.round((completedLessons / totalLessons) * 100)) : 0,
  };
}

export function clearProgressData() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
  window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
}

export function getNextLessonToContinue(modules: ModuleSummary[]) {
  const progress = getProgressData();

  for (const courseModule of modules) {
    const nextLesson = (courseModule.lessons ?? []).find(
      (lesson) => !isCourseLessonCompleted(progress, courseModule.slug, lesson),
    );

    if (nextLesson) {
      return {
        module: courseModule,
        lesson: nextLesson,
      };
    }
  }

  return null;
}

export function getKnowledgeStats(modules: ModuleSummary[]): KnowledgeStats {
  const progress = getProgressData();
  const overall = getOverallCourseProgress(modules);
  const lessonRecords = Object.values(progress.lessons);
  const practiceRecords = lessonRecords.filter((lesson) => lesson.attemptsCount > 0);
  const bestScores = practiceRecords.map((lesson) => lesson.bestScorePercent);
  const attemptsCount = lessonRecords.reduce((sum, lesson) => sum + lesson.attemptsCount, 0);
  const lastActivityAt =
    lessonRecords
      .map((lesson) => lesson.updatedAt)
      .sort()
      .at(-1) ?? null;

  return {
    ...overall,
    bestScorePercent: bestScores.length ? Math.max(...bestScores) : null,
    attemptsCount,
    lastActivityAt,
    recentAttempts: progress.attempts.slice(0, 5),
    hasProgress: lessonRecords.length > 0 || progress.attempts.length > 0,
  };
}
