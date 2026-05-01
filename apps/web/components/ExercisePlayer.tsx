"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthoringContentDrawer } from "@/components/AuthoringContentDrawer";
import { AudioPlayer } from "@/components/AudioPlayer";
import {
  AUTHORING_UPDATED_EVENT,
  getEditableExerciseItems,
  isAuthoringModeEnabled,
  saveEditableExerciseItems,
} from "@/lib/authoring";
import { getPracticeCardKind, getPracticeVariant } from "@/lib/card-types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { saveLessonResult } from "@/lib/progress";
import type { ExerciseItemView, ExerciseView } from "@/lib/types";

type SelectionState = Record<string, string[]>;

function evaluateSelection(item: ExerciseItemView, selectedIds: string[]) {
  const expected = [...item.correctOptionIds].sort().join("|");
  const actual = [...selectedIds].sort().join("|");
  return actual.length > 0 && actual === expected;
}

function ExerciseItemCard({
  item,
  itemNumber,
  totalItems,
  selectedIds,
  setSelectedIds,
  submitted,
  showFeedback,
  locale,
}: {
  item: ExerciseItemView;
  itemNumber: number;
  totalItems: number;
  selectedIds: string[];
  setSelectedIds: (nextValue: string[]) => void;
  submitted: boolean;
  showFeedback: boolean;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const isMultiSelect = item.correctOptionIds.length > 1;
  const isCorrect = submitted ? evaluateSelection(item, selectedIds) : null;
  const practiceKind = getPracticeCardKind(item.type);
  const optionsHaveAudio = item.options.some((option) => Boolean(option.audio));
  const shouldShowPromptAudio =
    Boolean(item.promptAudio) || (item.type === "audio_to_symbol" && !optionsHaveAudio);

  return (
    <article className={`card exerciseItem practiceKind-${practiceKind}`} id={`exercise-item-${item.id}`}>
      <div className="exerciseItemHeader">
        <span className="exerciseTaskCount">
          {dictionary.exercise.task} {itemNumber} {dictionary.exercise.of} {totalItems}
        </span>
        <span className="exerciseTypeBadge">{dictionary.exercise.itemTypes[item.type]}</span>
        <span className="contentTypeBadge">{dictionary.practiceKinds[practiceKind]}</span>
      </div>

      <div className="exercisePrompt stack-sm">
        <h3>{item.prompt}</h3>
        <p className="exerciseInstruction">{dictionary.exercise.interactionHints[item.type]}</p>
        <div className="exercisePromptVisual">
          {item.promptSymbol ? <p className="symbolInline">{item.promptSymbol}</p> : null}
          {item.promptWord ? (
            <p className="exercisePromptWord">
              <strong>{item.promptWord}</strong>
            </p>
          ) : null}
          {item.promptTranscription ? <p className="mono exercisePromptTranscription">{item.promptTranscription}</p> : null}
        </div>
        {item.promptNote ? <p className="muted">{item.promptNote}</p> : null}
        {shouldShowPromptAudio ? <AudioPlayer audio={item.promptAudio} locale={locale} /> : null}
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
          const isCorrectOption = item.correctOptionIds.includes(option.id);
          const missedCorrectOption = submitted && !isCorrect && isCorrectOption && !checked;
          const optionClassName = [
            "optionButton",
            checked ? "optionButtonSelected" : "",
            submitted && checked && isCorrectOption ? "optionButtonCorrect" : "",
            submitted && checked && !isCorrectOption ? "optionButtonIncorrect" : "",
            missedCorrectOption ? "optionButtonMissedCorrect" : "",
            submitted ? "optionButtonDisabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option.id}
              type="button"
              className={optionClassName}
              disabled={submitted}
              aria-pressed={checked}
              onClick={() => {
                if (submitted) {
                  return;
                }

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
              <span className="optionStateDot" aria-hidden="true" />
              <span className="optionContent">
                <span className="optionHeader">{option.label}</span>
                {option.symbol ? <span className="symbolInline small">{option.symbol}</span> : null}
                {option.word ? <span className="optionWord">{option.word}</span> : null}
                {option.transcription ? <span className="mono">{option.transcription}</span> : null}
                {option.audio ? <AudioPlayer audio={option.audio} locale={locale} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {showFeedback && submitted ? (
        <div className={`exerciseFeedback feedback ${isCorrect ? "correct" : "incorrect"}`}>
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
  lessonId,
  lessonSlug,
  lessonTitle,
  moduleSlug,
  moduleTitle,
}: {
  exercise: ExerciseView;
  locale: Locale;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  moduleSlug: string;
  moduleTitle: string;
}) {
  const dictionary = getDictionary(locale);
  const practiceVariant = getPracticeVariant(exercise);
  const practiceVariantClass = {
    warmup: "practiceWarmup",
    normal: "practiceNormal",
    challenge: "practiceChallenge",
    exam: "practiceExam",
  }[practiceVariant];
  const [selection, setSelection] = useState<SelectionState>({});
  const [submitted, setSubmitted] = useState(false);
  const [authoringMode, setAuthoringModeState] = useState(false);
  const [editableItems, setEditableItems] = useState<ExerciseItemView[]>(exercise.items);
  const [drawerState, setDrawerState] = useState<{
    index: number;
    item?: ExerciseItemView | null;
  } | null>(null);
  const hasSelectedAnswers = Object.values(selection).some((selectedIds) => selectedIds.length > 0);

  useEffect(() => {
    const refresh = () => {
      setAuthoringModeState(isAuthoringModeEnabled());
      setEditableItems(getEditableExerciseItems(moduleSlug, lessonSlug, exercise.items));
    };
    const frame = window.requestAnimationFrame(refresh);

    window.addEventListener(AUTHORING_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(AUTHORING_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [exercise.items, lessonSlug, moduleSlug]);

  const persistItems = (nextItems: ExerciseItemView[]) => {
    setEditableItems(nextItems);
    saveEditableExerciseItems(moduleSlug, lessonSlug, nextItems);
  };

  const score = useMemo(() => {
    return editableItems.reduce((sum, item) => {
      const selectedIds = selection[item.id] ?? [];
      return sum + (evaluateSelection(item, selectedIds) ? 1 : 0);
    }, 0);
  }, [editableItems, selection]);

  const percentage = editableItems.length
    ? Math.round((score / editableItems.length) * 100)
    : 0;

  const handleSubmit = () => {
    setSubmitted(true);
    saveLessonResult({
      lessonId,
      lessonSlug,
      lessonTitle,
      moduleSlug,
      moduleTitle,
      score,
      total: editableItems.length,
      scorePercent: percentage,
      passingScorePercent: exercise.passingScore ?? null,
    });
  };

  return (
    <section className="stack-lg" id={`exercise-${exercise.slug}`}>
      <section
        className={`card lessonCard exerciseIntro ${practiceVariantClass} practiceVariant-${practiceVariant} stack-md`}
      >
        <div className="exerciseIntroHeader">
          <p className="eyebrow">{dictionary.exercise.practice}</p>
          <span className={`practiceVariantBadge ${practiceVariant}`}>
            {dictionary.practiceVariants[practiceVariant]}
          </span>
        </div>
        <h2>{exercise.title}</h2>
        {exercise.summary ? <p className="lead">{exercise.summary}</p> : null}
        <p className="muted">{dictionary.practiceVariantDescriptions[practiceVariant]}</p>
        <p>{exercise.instructions}</p>
        <div className="exerciseSummary">
          <span>
            {editableItems.length} {dictionary.exercise.items}
          </span>
          {exercise.passingScore ? (
            <span>
              {dictionary.exercise.passingScore}: {exercise.passingScore}%
            </span>
          ) : null}
        </div>
      </section>

      {editableItems.map((item, index) => (
        <div
          className={
            authoringMode
              ? "editableLessonBlock authoringEditable isAuthoring"
              : "editableLessonBlock"
          }
          key={item.id}
        >
          {authoringMode ? (
            <div className="authoringControls" aria-label={dictionary.authoring.modeLabel}>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => setDrawerState({ index, item })}
              >
                {dictionary.authoring.edit}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => setDrawerState({ index, item: null })}
              >
                {dictionary.authoring.addBlockBelow}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => {
                  if (window.confirm(dictionary.authoring.deleteBlockConfirm)) {
                    persistItems(editableItems.filter((current) => current.id !== item.id));
                  }
                }}
              >
                {dictionary.authoring.deleteBlock}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const nextItems = [...editableItems];
                  [nextItems[index], nextItems[index - 1]] = [nextItems[index - 1], nextItems[index]];
                  persistItems(nextItems);
                }}
              >
                {dictionary.authoring.moveUp}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                disabled={index === editableItems.length - 1}
                onClick={() => {
                  const nextItems = [...editableItems];
                  [nextItems[index], nextItems[index + 1]] = [nextItems[index + 1], nextItems[index]];
                  persistItems(nextItems);
                }}
              >
                {dictionary.authoring.moveDown}
              </button>
            </div>
          ) : null}
          <ExerciseItemCard
            item={item}
            itemNumber={index + 1}
            totalItems={editableItems.length}
            selectedIds={selection[item.id] ?? []}
            setSelectedIds={(nextValue) => {
              setSelection((current) => ({ ...current, [item.id]: nextValue }));
            }}
            submitted={submitted}
            showFeedback={exercise.showItemFeedback}
            locale={locale}
          />
        </div>
      ))}

      <section className="card lessonCard stack-md">
        <div className="exerciseActions">
          <button
            className="button primary"
            type="button"
            disabled={!hasSelectedAnswers || submitted}
            onClick={handleSubmit}
          >
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
            className={`exerciseResult exerciseFeedback feedback ${
              percentage >= (exercise.passingScore ?? 0) ? "correct" : "incorrect"
            }`}
          >
            <strong>{dictionary.exercise.score}</strong>
            <div className="exerciseResultStats">
              <span>
                {score}/{editableItems.length}
              </span>
              <span>{percentage}%</span>
              {exercise.passingScore ? (
                <span>
                  {dictionary.exercise.passingScore}: {exercise.passingScore}%
                </span>
              ) : null}
            </div>
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
      {drawerState ? (
        <AuthoringContentDrawer
          key={`${drawerState.index}-${drawerState.item?.id ?? "new"}`}
          locale={locale}
          mode="practice"
          initial={drawerState.item}
          insertAfterLabel={dictionary.authoring.addBlockBelow}
          onCancel={() => setDrawerState(null)}
          onSave={(value) => {
            const nextItem = value as ExerciseItemView;
            if (drawerState.item) {
              persistItems(
                editableItems.map((item) => (item.id === nextItem.id ? nextItem : item)),
              );
            } else {
              persistItems([
                ...editableItems.slice(0, drawerState.index + 1),
                nextItem,
                ...editableItems.slice(drawerState.index + 1),
              ]);
            }
            setDrawerState(null);
          }}
        />
      ) : null}
    </section>
  );
}
