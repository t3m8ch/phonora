import type { LessonBlockKind } from "@/lib/card-types";
import type { ExerciseItemView, LessonBlockView, LessonContentView } from "@/lib/types";

export const AUTHORING_MODE_KEY = "phonora_authoring_mode";
export const CONTENT_DRAFT_KEY = "phonora_content_draft_v1";
export const AUTHORING_STORAGE_KEY = CONTENT_DRAFT_KEY;
export const AUTHORING_UPDATED_EVENT = "phonora-authoring-updated";

const LEGACY_AUTHORING_MODE_KEY = "phonora:authoring-mode";
const LEGACY_AUTHORING_STORAGE_KEY = "phonora:authoring-drafts:v1";
const LEGACY_BLOCK_OVERRIDES_KEY = "phonora:lesson-block-overrides:v1";
const LEGACY_EXERCISE_OVERRIDES_KEY = "phonora:exercise-item-overrides:v1";

export type AuthoringBlock = {
  id: string;
  moduleSlug: string;
  lessonSlug: string;
  kind: LessonBlockKind;
  title: string;
  body: string;
  updatedAt: string;
};

export type AuthoringData = {
  blocks: AuthoringBlock[];
};

export type AuthoringBlockInput = Omit<AuthoringBlock, "id" | "updatedAt"> & {
  id?: string;
};

export type DraftContent = {
  version: 1;
  updatedAt: string | null;
  blocks: AuthoringBlock[];
  lessonBlockOverrides: Record<string, LessonBlockView[]>;
  exerciseItemOverrides: Record<string, ExerciseItemView[]>;
};

const emptyDraftContent = (): DraftContent => ({
  version: 1,
  updatedAt: null,
  blocks: [],
  lessonBlockOverrides: {},
  exerciseItemOverrides: {},
});

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);
const lessonKey = (moduleSlug: string, lessonSlug: string) => `${moduleSlug}/${lessonSlug}`;

const readJson = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeDraft = (value: Partial<DraftContent> | null | undefined): DraftContent => ({
  version: 1,
  updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : null,
  blocks: Array.isArray(value?.blocks) ? value.blocks : [],
  lessonBlockOverrides:
    value?.lessonBlockOverrides &&
    typeof value.lessonBlockOverrides === "object" &&
    !Array.isArray(value.lessonBlockOverrides)
      ? value.lessonBlockOverrides
      : {},
  exerciseItemOverrides:
    value?.exerciseItemOverrides &&
    typeof value.exerciseItemOverrides === "object" &&
    !Array.isArray(value.exerciseItemOverrides)
      ? value.exerciseItemOverrides
      : {},
});

const readLegacyDraft = (): DraftContent => {
  const legacyBlocks = readJson<Partial<AuthoringData>>(LEGACY_AUTHORING_STORAGE_KEY, {});
  const legacyLessonBlocks = readJson<Record<string, LessonBlockView[]>>(
    LEGACY_BLOCK_OVERRIDES_KEY,
    {},
  );
  const legacyExercises = readJson<Record<string, ExerciseItemView[]>>(
    LEGACY_EXERCISE_OVERRIDES_KEY,
    {},
  );

  return normalizeDraft({
    blocks: Array.isArray(legacyBlocks.blocks) ? legacyBlocks.blocks : [],
    lessonBlockOverrides:
      legacyLessonBlocks && typeof legacyLessonBlocks === "object" ? legacyLessonBlocks : {},
    exerciseItemOverrides:
      legacyExercises && typeof legacyExercises === "object" ? legacyExercises : {},
  });
};

const writeDraftContent = (draft: DraftContent) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    CONTENT_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    }),
  );
  window.dispatchEvent(new Event(AUTHORING_UPDATED_EVENT));
};

export function getAuthoringMode() {
  if (!canUseStorage()) {
    return false;
  }

  return (
    window.localStorage.getItem(AUTHORING_MODE_KEY) === "true" ||
    window.localStorage.getItem(LEGACY_AUTHORING_MODE_KEY) === "1"
  );
}

export function setAuthoringMode(enabled: boolean) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTHORING_MODE_KEY, enabled ? "true" : "false");
  window.localStorage.removeItem(LEGACY_AUTHORING_MODE_KEY);
  window.dispatchEvent(new Event(AUTHORING_UPDATED_EVENT));
}

export function getDraftContent() {
  if (!canUseStorage()) {
    return emptyDraftContent();
  }

  const current = window.localStorage.getItem(CONTENT_DRAFT_KEY);
  if (current) {
    return normalizeDraft(readJson<Partial<DraftContent>>(CONTENT_DRAFT_KEY, {}));
  }

  return readLegacyDraft();
}

export function saveDraftContent(nextDraft: DraftContent | Partial<DraftContent>) {
  const current = getDraftContent();
  writeDraftContent(
    normalizeDraft({
      ...current,
      ...nextDraft,
      lessonBlockOverrides: {
        ...current.lessonBlockOverrides,
        ...(nextDraft.lessonBlockOverrides ?? {}),
      },
      exerciseItemOverrides: {
        ...current.exerciseItemOverrides,
        ...(nextDraft.exerciseItemOverrides ?? {}),
      },
      blocks: nextDraft.blocks ?? current.blocks,
    }),
  );
}

export function clearDraftContent() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CONTENT_DRAFT_KEY);
  window.localStorage.removeItem(LEGACY_AUTHORING_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_BLOCK_OVERRIDES_KEY);
  window.localStorage.removeItem(LEGACY_EXERCISE_OVERRIDES_KEY);
  window.dispatchEvent(new Event(AUTHORING_UPDATED_EVENT));
}

export function exportDraftContent() {
  return JSON.stringify(getDraftContent(), null, 2);
}

export function importDraftContent(jsonValue: string) {
  const parsed = JSON.parse(jsonValue) as Partial<DraftContent>;
  const draft = normalizeDraft(parsed);
  writeDraftContent(draft);
  return draft;
}

export function applyDraftToLessonContent<T extends LessonContentView | null>(
  moduleSlug: string,
  lessonSlug: string,
  content: T,
): T {
  if (!content) {
    return content;
  }

  const draft = getDraftContent();
  const key = lessonKey(moduleSlug, lessonSlug);

  if (content.kind === "exercise" && draft.exerciseItemOverrides[key]) {
    return {
      ...content,
      items: draft.exerciseItemOverrides[key],
    } as T;
  }

  if ("blocks" in content && content.blocks && draft.lessonBlockOverrides[key]) {
    return {
      ...content,
      blocks: draft.lessonBlockOverrides[key],
    } as T;
  }

  return content;
}

export function getAuthoringData() {
  return { blocks: getDraftContent().blocks };
}

export function getLessonAuthoringBlocks(moduleSlug: string, lessonSlug: string) {
  return getDraftContent().blocks.filter(
    (block) => block.moduleSlug === moduleSlug && block.lessonSlug === lessonSlug,
  );
}

export function saveAuthoringBlock(input: AuthoringBlockInput) {
  const current = getDraftContent();
  const updatedAt = new Date().toISOString();
  const id = input.id ?? `${input.moduleSlug}/${input.lessonSlug}/${updatedAt}`;
  const nextBlock: AuthoringBlock = {
    ...input,
    id,
    updatedAt,
  };
  const blocks = current.blocks.some((block) => block.id === id)
    ? current.blocks.map((block) => (block.id === id ? nextBlock : block))
    : [nextBlock, ...current.blocks];

  saveDraftContent({ blocks });
  return nextBlock;
}

export function deleteAuthoringBlock(id: string) {
  const current = getDraftContent();
  saveDraftContent({ blocks: current.blocks.filter((block) => block.id !== id) });
}

export function getEditableLessonBlocks(
  moduleSlug: string,
  lessonSlug: string,
  fallbackBlocks: LessonBlockView[],
) {
  return getDraftContent().lessonBlockOverrides[lessonKey(moduleSlug, lessonSlug)] ?? fallbackBlocks;
}

export function getLessonBlockOverrides() {
  return getDraftContent().lessonBlockOverrides;
}

export function saveEditableLessonBlocks(
  moduleSlug: string,
  lessonSlug: string,
  blocks: LessonBlockView[],
) {
  saveDraftContent({
    lessonBlockOverrides: {
      [lessonKey(moduleSlug, lessonSlug)]: blocks,
    },
  });
}

export function getEditableExerciseItems(
  moduleSlug: string,
  lessonSlug: string,
  fallbackItems: ExerciseItemView[],
) {
  return getDraftContent().exerciseItemOverrides[lessonKey(moduleSlug, lessonSlug)] ?? fallbackItems;
}

export function getExerciseItemOverrides() {
  return getDraftContent().exerciseItemOverrides;
}

export function saveEditableExerciseItems(
  moduleSlug: string,
  lessonSlug: string,
  items: ExerciseItemView[],
) {
  saveDraftContent({
    exerciseItemOverrides: {
      [lessonKey(moduleSlug, lessonSlug)]: items,
    },
  });
}

export const isAuthoringModeEnabled = getAuthoringMode;
