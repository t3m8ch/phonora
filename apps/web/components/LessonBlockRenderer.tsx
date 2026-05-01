"use client";

import { useEffect, useState } from "react";

import { AuthoringContentDrawer } from "@/components/AuthoringContentDrawer";
import { ExamplesBlock } from "@/components/lesson-blocks/ExamplesBlock";
import { InfoBlock } from "@/components/lesson-blocks/InfoBlock";
import { MiniCheckBlock } from "@/components/lesson-blocks/MiniCheckBlock";
import { SoundAudioBlock } from "@/components/lesson-blocks/SoundAudioBlock";
import { SoundComparisonBlock } from "@/components/lesson-blocks/SoundComparisonBlock";
import { SoundVisualBlock } from "@/components/lesson-blocks/SoundVisualBlock";
import {
  AUTHORING_UPDATED_EVENT,
  getEditableLessonBlocks,
  isAuthoringModeEnabled,
  saveEditableLessonBlocks,
} from "@/lib/authoring";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { LessonBlockView } from "@/lib/types";

const blockRegistry = {
  sound_visual: SoundVisualBlock,
  sound_audio: SoundAudioBlock,
  examples: ExamplesBlock,
  info: InfoBlock,
  sound_comparison: SoundComparisonBlock,
  mini_check: MiniCheckBlock,
};

function renderBlock(block: LessonBlockView, locale: Locale) {
  const dictionary = getDictionary(locale);

  switch (block.type) {
    case "sound_visual":
      return <SoundVisualBlock block={block} locale={locale} />;
    case "sound_audio":
      return <SoundAudioBlock block={block} locale={locale} />;
    case "examples":
      return <ExamplesBlock block={block} locale={locale} />;
    case "info":
      return <InfoBlock block={block} locale={locale} />;
    case "sound_comparison":
      return <SoundComparisonBlock block={block} locale={locale} />;
    case "mini_check":
      return <MiniCheckBlock block={block} locale={locale} />;
    default:
      return (
        <section className="card lessonBlock lessonBlockInfo">
          <span className="contentTypeBadge">{dictionary.authoring.unknownBlockType}</span>
          <h2>{dictionary.authoring.unknownBlockType}</h2>
          <p className="muted">{String((block as { type?: string }).type ?? "unknown")}</p>
        </section>
      );
  }
}

export function LessonBlockRenderer({
  blocks,
  locale,
  moduleSlug,
  lessonSlug,
}: {
  blocks: LessonBlockView[];
  locale: Locale;
  moduleSlug: string;
  lessonSlug: string;
}) {
  const dictionary = getDictionary(locale);
  const [authoringMode, setAuthoringModeState] = useState(false);
  const [editableBlocks, setEditableBlocks] = useState<LessonBlockView[]>(blocks);
  const [drawerState, setDrawerState] = useState<{
    index: number;
    block?: LessonBlockView | null;
  } | null>(null);

  useEffect(() => {
    const refresh = () => {
      setAuthoringModeState(isAuthoringModeEnabled());
      setEditableBlocks(getEditableLessonBlocks(moduleSlug, lessonSlug, blocks));
    };
    const frame = window.requestAnimationFrame(refresh);

    window.addEventListener(AUTHORING_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(AUTHORING_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [blocks, lessonSlug, moduleSlug]);

  const persistBlocks = (nextBlocks: LessonBlockView[]) => {
    setEditableBlocks(nextBlocks);
    saveEditableLessonBlocks(moduleSlug, lessonSlug, nextBlocks);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editableBlocks.length) {
      return;
    }

    const nextBlocks = [...editableBlocks];
    [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
    persistBlocks(nextBlocks);
  };

  return (
    <div className="lessonBlocks stack-lg">
      {editableBlocks.map((block, index) => (
        <div
          className={
            authoringMode
              ? "editableLessonBlock authoringEditable isAuthoring"
              : "editableLessonBlock"
          }
          key={block.id}
        >
          {authoringMode ? (
            <div className="authoringControls" aria-label={dictionary.authoring.modeLabel}>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => setDrawerState({ index, block })}
              >
                {dictionary.authoring.edit}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => setDrawerState({ index, block: null })}
              >
                {dictionary.authoring.addBlockBelow}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                onClick={() => {
                  if (window.confirm(dictionary.authoring.deleteBlockConfirm)) {
                    persistBlocks(editableBlocks.filter((item) => item.id !== block.id));
                  }
                }}
              >
                {dictionary.authoring.deleteBlock}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                disabled={index === 0}
                onClick={() => moveBlock(index, -1)}
              >
                {dictionary.authoring.moveUp}
              </button>
              <button
                className="authoringControlButton"
                type="button"
                disabled={index === editableBlocks.length - 1}
                onClick={() => moveBlock(index, 1)}
              >
                {dictionary.authoring.moveDown}
              </button>
            </div>
          ) : null}
          {renderBlock(block, locale)}
        </div>
      ))}
      {drawerState ? (
        <AuthoringContentDrawer
          key={`${drawerState.index}-${drawerState.block?.id ?? "new"}`}
          locale={locale}
          mode="theory"
          initial={drawerState.block}
          insertAfterLabel={dictionary.authoring.addBlockBelow}
          onCancel={() => setDrawerState(null)}
          onSave={(value) => {
            const nextBlock = value as LessonBlockView;
            if (drawerState.block) {
              persistBlocks(
                editableBlocks.map((block) => (block.id === nextBlock.id ? nextBlock : block)),
              );
            } else {
              persistBlocks([
                ...editableBlocks.slice(0, drawerState.index + 1),
                nextBlock,
                ...editableBlocks.slice(drawerState.index + 1),
              ]);
            }
            setDrawerState(null);
          }}
        />
      ) : null}
    </div>
  );
}

export { blockRegistry };
