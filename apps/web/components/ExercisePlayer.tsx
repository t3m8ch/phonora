"use client";

import { useMemo, useState } from "react";

import { AudioPlayer } from "@/components/AudioPlayer";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ExerciseItemView, ExerciseView } from "@/lib/types";

type SelectionState = Record<string, string[]>;

function evaluateSelection(item: ExerciseItemView, selectedIds: string[]) {
  const expected = [...item.correctOptionIds].sort().join("|");
  const actual = [...selectedIds].sort().join("|");
  return actual.length > 0 && actual === expected;
}

function ExerciseItemCard({
  item,
  selectedIds,
  setSelectedIds,
  submitted,
  showFeedback,
  locale,
}: {
  item: ExerciseItemView;
  selectedIds: string[];
  setSelectedIds: (nextValue: string[]) => void;
  submitted: boolean;
  showFeedback: boolean;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const isMultiSelect = item.correctOptionIds.length > 1;
  const isCorrect = submitted ? evaluateSelection(item, selectedIds) : null;

  return (
    <article className="card exerciseItem" id={`exercise-item-${item.id}`}>
      <div className="stack-sm">
        <p className="eyebrow">{dictionary.exercise.itemTypes[item.type]}</p>
        <h3>{item.prompt}</h3>
        <p className="muted">{dictionary.exercise.interactionHints[item.type]}</p>
        {item.promptSymbol ? <p className="symbolInline">{item.promptSymbol}</p> : null}
        {item.promptWord ? (
          <p>
            <strong>{item.promptWord}</strong>
          </p>
        ) : null}
        {item.promptTranscription ? <p className="mono">{item.promptTranscription}</p> : null}
        {item.promptNote ? <p>{item.promptNote}</p> : null}
        <AudioPlayer audio={item.promptAudio} locale={locale} />
        {item.linkedExampleWord ? (
          <div className="subCard stack-sm">
            <span className="eyebrow">{dictionary.exercise.linkedExample}</span>
            <strong>{item.linkedExampleWord.word}</strong>
            {item.linkedExampleWord.transcription ? (
              <p className="mono">{item.linkedExampleWord.transcription}</p>
            ) : null}
            <AudioPlayer audio={item.linkedExampleWord.audio} locale={locale} />
          </div>
        ) : null}
      </div>

      <div className="optionList">
        {item.options.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`optionButton ${checked ? "selected" : ""}`}
              onClick={() => {
                if (isMultiSelect) {
                  setSelectedIds(
                    checked
                      ? selectedIds.filter((id) => id !== option.id)
                      : [...selectedIds, option.id],
                  );
                } else {
                  setSelectedIds([option.id]);
                }
              }}
            >
              <span className="optionHeader">{option.label}</span>
              {option.symbol ? <span className="symbolInline small">{option.symbol}</span> : null}
              {option.word ? <span>{option.word}</span> : null}
              {option.transcription ? <span className="mono">{option.transcription}</span> : null}
              {option.audio ? <AudioPlayer audio={option.audio} locale={locale} /> : null}
            </button>
          );
        })}
      </div>

      {showFeedback && submitted ? (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>{isCorrect ? dictionary.exercise.correct : dictionary.exercise.tryAgain}</strong>
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function ExercisePlayer({
  exercise,
  locale,
}: {
  exercise: ExerciseView;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const [selection, setSelection] = useState<SelectionState>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return exercise.items.reduce((sum, item) => {
      const selectedIds = selection[item.id] ?? [];
      return sum + (evaluateSelection(item, selectedIds) ? 1 : 0);
    }, 0);
  }, [exercise.items, selection]);

  const percentage = exercise.items.length
    ? Math.round((score / exercise.items.length) * 100)
    : 0;

  return (
    <section className="stack-lg" id={`exercise-${exercise.slug}`}>
      <section className="card lessonCard stack-md">
        <p className="eyebrow">{dictionary.exercise.practice}</p>
        <h2>{exercise.title}</h2>
        {exercise.summary ? <p className="lead">{exercise.summary}</p> : null}
        <p>{exercise.instructions}</p>
        <div className="exerciseSummary">
          <span>
            {exercise.items.length} {dictionary.exercise.items}
          </span>
          {exercise.passingScore ? (
            <span>
              {dictionary.exercise.passingScore}: {exercise.passingScore}%
            </span>
          ) : null}
        </div>
      </section>

      {exercise.items.map((item) => (
        <ExerciseItemCard
          key={item.id}
          item={item}
          selectedIds={selection[item.id] ?? []}
          setSelectedIds={(nextValue) => {
            setSelection((current) => ({ ...current, [item.id]: nextValue }));
          }}
          submitted={submitted}
          showFeedback={exercise.showItemFeedback}
          locale={locale}
        />
      ))}

      <section className="card lessonCard stack-md">
        <div className="exerciseActions">
          <button className="button primary" type="button" onClick={() => setSubmitted(true)}>
            {dictionary.exercise.checkAnswers}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setSelection({});
              setSubmitted(false);
            }}
          >
            {dictionary.exercise.reset}
          </button>
        </div>
        {submitted ? (
          <div
            className={`feedback ${
              percentage >= (exercise.passingScore ?? 0) ? "correct" : "incorrect"
            }`}
          >
            <strong>
              {dictionary.exercise.score}: {score}/{exercise.items.length} ({percentage}%)
            </strong>
            <p>
              {exercise.passingScore
                ? percentage >= exercise.passingScore
                  ? dictionary.exercise.passed
                  : dictionary.exercise.retry
                : dictionary.exercise.review}
            </p>
            <p className="muted">
              {dictionary.exercise.instantFeedback}: {exercise.showItemFeedback ? dictionary.exercise.yes : dictionary.exercise.no}
            </p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
