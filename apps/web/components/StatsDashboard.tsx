"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import {
  clearProgressData,
  getKnowledgeStats,
  PROGRESS_UPDATED_EVENT,
  type KnowledgeStats,
} from "@/lib/progress";
import { coursePath, lessonPath } from "@/lib/routes";
import type { CourseOverview } from "@/lib/types";

const formatPercent = (value: number | null, fallback: string) =>
  value === null ? fallback : `${value}%`;

function formatDate(value: string | null, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StatsDashboard({
  course,
  locale,
}: {
  course: CourseOverview;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const totalLessons = course.modules.reduce((sum, moduleItem) => sum + moduleItem.lessonCount, 0);
  const [stats, setStats] = useState<KnowledgeStats>({
    totalLessons,
    completedLessons: 0,
    totalModules: course.modules.length,
    completedModules: 0,
    percent: 0,
    bestScorePercent: null,
    attemptsCount: 0,
    lastActivityAt: null,
    recentAttempts: [],
    hasProgress: false,
  });
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons?.[0];
  const startHref = firstModule && firstLesson
    ? lessonPath(locale, firstModule.slug, firstLesson.slug)
    : coursePath(locale);

  useEffect(() => {
    const refreshStats = () => setStats(getKnowledgeStats(course.modules));

    refreshStats();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshStats);
    window.addEventListener("storage", refreshStats);

    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshStats);
      window.removeEventListener("storage", refreshStats);
    };
  }, [course.modules]);

  const handleReset = () => {
    if (window.confirm(dictionary.stats.resetConfirm)) {
      clearProgressData();
      setStats(getKnowledgeStats(course.modules));
    }
  };

  return (
    <div className="stack-xl">
      <motion.section
        className="card statsHero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="stack-sm">
          <p className="eyebrow">{dictionary.stats.overallProgress}</p>
          <h1>{dictionary.stats.title}</h1>
          <p className="lead">{dictionary.stats.description}</p>
        </div>
      </motion.section>

      {!stats.hasProgress ? (
        <motion.section
          className="card emptyState statsEmptyState"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <p className="eyebrow">{dictionary.stats.overallProgress}</p>
          <h2>{dictionary.stats.emptyTitle}</h2>
          <p>{dictionary.stats.emptyBody}</p>
          <Link className="button primary" href={startHref}>
            {dictionary.stats.startLearning}
          </Link>
        </motion.section>
      ) : null}

      <section className="grid statsGrid">
        {[
          [dictionary.stats.overallProgress, `${stats.percent}%`],
          [
            dictionary.stats.completedLessons,
            `${stats.completedLessons}/${stats.totalLessons}`,
          ],
          [
            dictionary.stats.completedModules,
            `${stats.completedModules}/${stats.totalModules}`,
          ],
          [
            dictionary.stats.bestPracticeScore,
            formatPercent(stats.bestScorePercent, dictionary.stats.noScore),
          ],
          [dictionary.stats.attempts, String(stats.attemptsCount)],
          [
            dictionary.stats.lastActivity,
            formatDate(stats.lastActivityAt, locale, dictionary.stats.never),
          ],
        ].map(([label, value], index) => (
          <motion.article
            className="card statMetric"
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </motion.article>
        ))}
      </section>

      <section className="stack-md">
        <h2>{dictionary.stats.recentResults}</h2>
        {stats.recentAttempts.length ? (
          <div className="stack-sm">
            {stats.recentAttempts.map((attempt, index) => (
              <motion.article
                className="card recentAttempt"
                key={attempt.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.035 }}
              >
                <div>
                  <strong>{attempt.lessonTitle ?? attempt.lessonSlug}</strong>
                  <p className="muted">{attempt.moduleTitle ?? attempt.moduleSlug}</p>
                </div>
                <span>
                  {dictionary.stats.score}: {attempt.score}/{attempt.total} ({attempt.scorePercent}%)
                </span>
                <span>{formatDate(attempt.updatedAt, locale, dictionary.stats.never)}</span>
              </motion.article>
            ))}
          </div>
        ) : (
          <p className="muted">{dictionary.stats.noRecentResults}</p>
        )}
      </section>

      <motion.section
        className="card progressTestingCard"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.03 }}
      >
        <div className="stack-sm">
          <p className="eyebrow">{dictionary.stats.testingTitle}</p>
          <h2>{dictionary.stats.resetAllProgress}</h2>
          <p>{dictionary.stats.testingBody}</p>
        </div>
        <button className="button danger" type="button" onClick={handleReset}>
          {dictionary.stats.resetAllProgress}
        </button>
      </motion.section>
    </div>
  );
}
