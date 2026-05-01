"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import { isLessonCompleted, markLessonCompleted, PROGRESS_UPDATED_EVENT } from "@/lib/progress";

export function LessonCompletion({
  locale,
  lessonId,
  lessonSlug,
  lessonTitle,
  moduleSlug,
  moduleTitle,
}: {
  locale: Locale;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  moduleSlug: string;
  moduleTitle: string;
}) {
  const dictionary = getDictionary(locale);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const refreshCompleted = () => setCompleted(isLessonCompleted(moduleSlug, lessonSlug, lessonId));

    refreshCompleted();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshCompleted);
    window.addEventListener("storage", refreshCompleted);

    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshCompleted);
      window.removeEventListener("storage", refreshCompleted);
    };
  }, [lessonId, lessonSlug, moduleSlug]);

  const handleComplete = () => {
    const nextData = markLessonCompleted(moduleSlug, lessonSlug, {
      lessonId,
      lessonTitle,
      moduleTitle,
    });
    setCompleted(Boolean(nextData.lessons[lessonId]?.completed));
  };

  return (
    <motion.section
      className={`card lessonCompletion ${completed ? "completed" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="stack-sm">
        <h2>{completed ? dictionary.lessonCompletion.completed : dictionary.lessonCompletion.markComplete}</h2>
        <p className="muted">
          {completed
            ? dictionary.lessonCompletion.alreadyCompleted
            : dictionary.lessonCompletion.reachedEnd}
        </p>
        {!completed ? <p>{dictionary.lessonCompletion.body}</p> : null}
      </div>
      <button
        className="button primary"
        type="button"
        disabled={completed}
        onClick={handleComplete}
      >
        {completed ? dictionary.lessonCompletion.completed : dictionary.lessonCompletion.markComplete}
      </button>
    </motion.section>
  );
}
