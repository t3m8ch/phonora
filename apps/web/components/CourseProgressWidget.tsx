"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import {
  getOverallCourseProgress,
  PROGRESS_UPDATED_EVENT,
  type CourseProgressSummary,
} from "@/lib/progress";
import { statsPath } from "@/lib/routes";
import type { CourseOverview } from "@/lib/types";

function AnimatedPercent({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = roundedValue.on("change", setDisplayValue);
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: "easeOut",
    });

    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [motionValue, roundedValue, value]);

  return <>{displayValue}%</>;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const progressColor = (percent: number) => {
  if (percent < 35) {
    return "#6aa58a";
  }

  if (percent < 70) {
    return "#0f9f8f";
  }

  return "#0f766e";
};

export function CourseProgressWidget({
  course,
  locale,
}: {
  course: CourseOverview;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const totalLessons = course.modules.reduce((sum, moduleItem) => sum + moduleItem.lessonCount, 0);
  const [progress, setProgress] = useState<CourseProgressSummary>({
    totalLessons,
    completedLessons: 0,
    totalModules: course.modules.length,
    completedModules: 0,
    percent: 0,
  });
  const percent = clampPercent(progress.percent);
  const color = progressColor(percent);

  useEffect(() => {
    const refreshProgress = () => setProgress(getOverallCourseProgress(course.modules));

    refreshProgress();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
  }, [course.modules]);

  return (
    <Link className="progressWidgetLink" href={statsPath(locale)} aria-label={dictionary.progressWidget.openStats}>
      <motion.article
        className="card progressWidget"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="progressWidgetCopy">
          <p className="eyebrow">{dictionary.progressWidget.title}</p>
          <div className="progressWidgetPercent" style={{ color }}>
            <AnimatedPercent value={percent} />
          </div>
          <div className="progressWidgetStats">
            <span>
              {progress.completedLessons}/{progress.totalLessons}{" "}
              {dictionary.progressWidget.completedLessons}
            </span>
            <span>
              {progress.completedModules}/{progress.totalModules}{" "}
              {dictionary.progressWidget.completedModules}
            </span>
          </div>
          <span className="button secondary progressWidgetCta">{dictionary.progressWidget.openStats}</span>
        </div>

        <div
          className="soundWaveProgress"
          role="img"
          aria-label={dictionary.progressWidget.soundWave}
          style={{ ["--progress-color" as string]: color }}
        >
          {Array.from({ length: 18 }).map((_, index) => {
            const active = (index + 0.5) / 18 <= percent / 100;
            const height = 30 + ((index * 17) % 54);

            return (
              <motion.span
                key={index}
                className={active ? "active" : ""}
                initial={{ scaleY: 0.28, opacity: 0.35 }}
                animate={{
                  scaleY: active ? [0.45, 1, 0.62] : 0.28,
                  opacity: active ? 1 : 0.28,
                }}
                transition={{
                  duration: 1.6,
                  delay: index * 0.035,
                  repeat: active ? Infinity : 0,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                style={{ height }}
              />
            );
          })}
          <motion.div
            className="soundWaveFill"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            aria-hidden="true"
          />
        </div>
      </motion.article>
    </Link>
  );
}
