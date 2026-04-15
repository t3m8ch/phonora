"use client";

import { useMemo, useState } from "react";

import { AudioPlayer } from "@/components/AudioPlayer";
import type { ExerciseItemView, ExerciseView } from "@/lib/types";

type SelectionState = Record<string, string[]>;

const interactionHint: Record<ExerciseItemView["type"], string> = {
  audio_to_symbol: "Listen to the audio and choose the matching symbol.",
  symbol_to_audio: "Look at the symbol and choose the audio label that matches it.",
  symbol_to_word: "Choose the word that contains the target sound.",
  transcription_to_word: "Pick the word that matches the transcription.",
  stress_selection: "Choose the option with the correct stress pattern.",
  similar_sound_discrimination: "Pick the option that contains the target sound contrast.",
  reading_rule_application: "Choose the option that best applies the reading rule.",
};

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
}: {
  item: ExerciseItemView;
  selectedIds: string[];
  setSelectedIds: (nextValue: string[]) => void;
  submitted: boolean;
  showFeedback: boolean;
}) {
  const isMultiSelect = item.correctOptionIds.length > 1;
  const isCorrect = submitted ? evaluateSelection(item, selectedIds) : null;

  return (
    <article className="card exerciseItem" id={`exercise-item-${item.id}`}>
      <div className="stack-sm">
        <p className="eyebrow">{item.type.replaceAll("_", " ")}</p>
        <h3>{item.prompt}</h3>
        <p className="muted">{interactionHint[item.type]}</p>
        {item.promptSymbol ? <p className="symbolInline">{item.promptSymbol}</p> : null}
        {item.promptWord ? <p><strong>{item.promptWord}</strong></p> : null}
        {item.promptTranscription ? <p className="mono">{item.promptTranscription}</p> : null}
        {item.promptNote ? <p>{item.promptNote}</p> : null}
        <AudioPlayer audio={item.promptAudio} />
        {item.linkedExampleWord ? (
          <div className="subCard stack-sm">
            <span className="eyebrow">Linked example</span>
            <strong>{item.linkedExampleWord.word}</strong>
            {item.linkedExampleWord.transcription ? (
              <p className="mono">{item.linkedExampleWord.transcription}</p>
            ) : null}
            <AudioPlayer audio={item.linkedExampleWord.audio} />
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
              {option.audio ? <AudioPlayer audio={option.audio} /> : null}
            </button>
          );
        })}
      </div>

      {showFeedback && submitted ? (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>{isCorrect ? "Correct" : "Try again"}</strong>
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function ExercisePlayer({ exercise }: { exercise: ExerciseView }) {
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
        <p className="eyebrow">Practice</p>
        <h2>{exercise.title}</h2>
        {exercise.summary ? <p className="lead">{exercise.summary}</p> : null}
        <p>{exercise.instructions}</p>
        <div className="exerciseSummary">
          <span>{exercise.items.length} items</span>
          {exercise.passingScore ? <span>Passing score: {exercise.passingScore}%</span> : null}
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
        />
      ))}

      <section className="card lessonCard stack-md">
        <div className="exerciseActions">
          <button className="button primary" type="button" onClick={() => setSubmitted(true)}>
            Check answers
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setSelection({});
              setSubmitted(false);
            }}
          >
            Reset
          </button>
        </div>
        {submitted ? (
          <div className={`feedback ${percentage >= (exercise.passingScore ?? 0) ? "correct" : "incorrect"}`}>
            <strong>
              Score: {score}/{exercise.items.length} ({percentage}%)
            </strong>
            <p>
              {exercise.passingScore
                ? percentage >= exercise.passingScore
                  ? "Nice work — you reached the target score."
                  : "You can review the explanations above and try again."
                : "Review each item above to reinforce the sound or reading rule."}
            </p>
            <p className="muted">
              Instant feedback enabled: {exercise.showItemFeedback ? "yes" : "summary only"}
            </p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
