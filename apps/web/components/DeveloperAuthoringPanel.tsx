"use client";

import { useEffect, useMemo, useState } from "react";

import type { LessonBlockKind } from "@/lib/card-types";
import {
  AUTHORING_UPDATED_EVENT,
  deleteAuthoringBlock,
  getExerciseItemOverrides,
  getLessonAuthoringBlocks,
  getLessonBlockOverrides,
  isAuthoringModeEnabled,
  saveAuthoringBlock,
  setAuthoringMode,
  type AuthoringBlock,
} from "@/lib/authoring";
import { getDictionary, type Locale } from "@/lib/i18n";

const blockKinds: LessonBlockKind[] = [
  "concept",
  "pronunciation",
  "example",
  "mistake",
  "rule",
  "practice_note",
];

type DraftState = {
  id?: string;
  kind: LessonBlockKind;
  title: string;
  body: string;
};

const emptyDraft = (): DraftState => ({
  kind: "concept",
  title: "",
  body: "",
});

export function DeveloperAuthoringPanel({
  locale,
  moduleSlug,
  lessonSlug,
  lessonTitle,
}: {
  locale: Locale;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
}) {
  const dictionary = getDictionary(locale);
  const [enabled, setEnabled] = useState(false);
  const [blocks, setBlocks] = useState<AuthoringBlock[]>([]);
  const [lessonBlockOverrides, setLessonBlockOverrides] = useState(() => getLessonBlockOverrides());
  const [exerciseItemOverrides, setExerciseItemOverrides] = useState(() => getExerciseItemOverrides());
  const [draft, setDraft] = useState<DraftState>(() => emptyDraft());
  const [showExport, setShowExport] = useState(false);

  const exportValue = useMemo(
    () =>
      JSON.stringify(
        {
          moduleSlug,
          lessonSlug,
          lessonTitle,
          blocks,
          lessonBlockOverrides,
          exerciseItemOverrides,
        },
        null,
        2,
      ),
    [blocks, exerciseItemOverrides, lessonBlockOverrides, lessonSlug, lessonTitle, moduleSlug],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") {
      setAuthoringMode(true);
    }

    const frame = window.requestAnimationFrame(() => {
      setEnabled(isAuthoringModeEnabled());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refreshBlocks = () => {
      setBlocks(getLessonAuthoringBlocks(moduleSlug, lessonSlug));
      setLessonBlockOverrides(getLessonBlockOverrides());
      setExerciseItemOverrides(getExerciseItemOverrides());
    };

    refreshBlocks();
    window.addEventListener(AUTHORING_UPDATED_EVENT, refreshBlocks);
    window.addEventListener("storage", refreshBlocks);

    return () => {
      window.removeEventListener(AUTHORING_UPDATED_EVENT, refreshBlocks);
      window.removeEventListener("storage", refreshBlocks);
    };
  }, [enabled, lessonSlug, moduleSlug]);

  if (!enabled) {
    return null;
  }

  const handleSubmit = () => {
    if (!draft.title.trim() && !draft.body.trim()) {
      return;
    }

    saveAuthoringBlock({
      id: draft.id,
      moduleSlug,
      lessonSlug,
      kind: draft.kind,
      title: draft.title.trim(),
      body: draft.body.trim(),
    });
    setDraft(emptyDraft());
  };

  return (
    <section className="card authoringPanel stack-lg">
      <div className="authoringPanelHeader">
        <div className="stack-sm">
          <p className="eyebrow">{dictionary.authoring.panelTitle}</p>
          <h2>{lessonTitle}</h2>
          <p>{dictionary.authoring.panelBody}</p>
        </div>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setAuthoringMode(false);
            setEnabled(false);
          }}
        >
          {dictionary.authoring.disableMode}
        </button>
      </div>

      <div className="grid authoringGrid">
        <div className="stack-md">
          <label className="fieldLabel">
            <span>{dictionary.authoring.blockKind}</span>
            <select
              value={draft.kind}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  kind: event.target.value as LessonBlockKind,
                }))
              }
            >
              {blockKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {dictionary.lessonBlockKinds[kind]}
                </option>
              ))}
            </select>
          </label>
          <label className="fieldLabel">
            <span>{dictionary.authoring.blockTitle}</span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="fieldLabel">
            <span>{dictionary.authoring.blockBody}</span>
            <textarea
              value={draft.body}
              rows={6}
              onChange={(event) =>
                setDraft((current) => ({ ...current, body: event.target.value }))
              }
            />
          </label>
          <div className="exerciseActions">
            <button className="button primary" type="button" onClick={handleSubmit}>
              {draft.id ? dictionary.authoring.updateBlock : dictionary.authoring.addBlock}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setShowExport((current) => !current)}
            >
              {dictionary.authoring.exportJson}
            </button>
          </div>
        </div>

        <div className="stack-md">
          {blocks.length ? (
            blocks.map((block) => (
              <article key={block.id} className={`subCard authoringBlock lessonBlockKind-${block.kind}`}>
                <span className="contentTypeBadge">{dictionary.lessonBlockKinds[block.kind]}</span>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
                <p className="muted">{dictionary.authoring.savedLocally}</p>
                <div className="exerciseActions">
                  <button className="button secondary" type="button" onClick={() => setDraft(block)}>
                    {dictionary.authoring.updateBlock}
                  </button>
                  <button className="button secondary" type="button" onClick={() => deleteAuthoringBlock(block.id)}>
                    {dictionary.authoring.deleteBlock}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">{dictionary.authoring.emptyBlocks}</p>
          )}
        </div>
      </div>

      {showExport ? (
        <div className="stack-sm">
          <p className="muted">{dictionary.authoring.exportHelp}</p>
          <textarea className="exportTextarea" readOnly rows={10} value={exportValue} />
        </div>
      ) : null}
    </section>
  );
}
