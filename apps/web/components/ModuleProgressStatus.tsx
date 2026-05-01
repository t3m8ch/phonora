"use client";

import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import {
  getModuleProgress,
  PROGRESS_UPDATED_EVENT,
  type ModuleProgressSummary,
} from "@/lib/progress";
import type { ModuleSummary } from "@/lib/types";

export function ModuleProgressStatus({
  module,
  locale,
}: {
  module: ModuleSummary;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const [progress, setProgress] = useState<ModuleProgressSummary>({
    moduleSlug: module.slug,
    totalLessons: module.lessonCount,
    completedLessons: 0,
    percent: 0,
    status: "not_started",
    bestScorePercent: null,
    attemptsCount: 0,
  });

  useEffect(() => {
    const refreshProgress = () => setProgress(getModuleProgress(module));

    refreshProgress();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
  }, [module]);

  return (
    <span className={`moduleStatusBadge ${progress.status}`}>
      {dictionary.moduleCard.statuses[progress.status]}
    </span>
  );
}
