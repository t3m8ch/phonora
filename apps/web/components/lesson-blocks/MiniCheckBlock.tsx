"use client";

import { useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import type { MiniCheckLessonBlock } from "@/lib/types";

import { blockText } from "./block-utils";

export function MiniCheckBlock({ block, locale }: { block: MiniCheckLessonBlock; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selectedId ? block.correctOptionIds.includes(selectedId) : false;

  return (
    <section className="card lessonBlock lessonBlockMiniCheck miniCheckBlock stack-md">
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.mini_check}</span>
      <h2>{blockText(block.question, locale)}</h2>
      <div className="optionList">
        {block.options.map((option) => {
          const selected = selectedId === option.id;
          const correct = submitted && block.correctOptionIds.includes(option.id);
          const incorrect = submitted && selected && !correct;

          return (
            <button
              className={[
                "optionButton",
                selected ? "optionButtonSelected" : "",
                correct ? "optionButtonCorrect" : "",
                incorrect ? "optionButtonIncorrect" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={submitted}
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
            >
              <span className="optionStateDot" aria-hidden="true" />
              <span className="optionContent">{blockText(option.label, locale)}</span>
            </button>
          );
        })}
      </div>
      <button
        className="button primary"
        type="button"
        disabled={!selectedId || submitted}
        onClick={() => setSubmitted(true)}
      >
        {dictionary.exercise.checkAnswers}
      </button>
      {submitted ? (
        <div className={`exerciseFeedback feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>{isCorrect ? dictionary.exercise.correct : dictionary.exercise.tryAgain}</strong>
          <p>{blockText(block.explanation, locale)}</p>
        </div>
      ) : null}
    </section>
  );
}
