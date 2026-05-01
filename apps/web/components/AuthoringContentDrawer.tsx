"use client";

import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import type {
  ExerciseItemType,
  ExerciseItemView,
  LessonBlockView,
} from "@/lib/types";

type AuthoringMode = "theory" | "practice";
type SaveValue = LessonBlockView | ExerciseItemView;

const theoryTypes = [
  "sound_visual",
  "sound_audio",
  "examples",
  "info",
  "sound_comparison",
  "mini_check",
] as const;

const practiceTypes: ExerciseItemType[] = [
  "audio_to_symbol",
  "symbol_to_audio",
  "symbol_to_word",
  "transcription_to_word",
  "stress_selection",
  "similar_sound_discrimination",
  "reading_rule_application",
];

type FormState = {
  type: string;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  symbol: string;
  transcription: string;
  options: string;
  correctOptionIds: string;
  explanationRu: string;
  explanationEn: string;
  audioUrl: string;
  audioAssetId: string;
  originalFileName: string;
  variant: string;
};

const localized = (value: { ru?: string | null; en?: string | null } | undefined) => ({
  ru: value?.ru ?? "",
  en: value?.en ?? "",
});

const optionsToText = (value: ExerciseItemView["options"] = []) =>
  value
    .map((option) =>
      [
        option.id,
        option.label,
        option.symbol ?? "",
        option.word ?? "",
        option.transcription ?? "",
        option.audioUrl ?? option.audio?.url ?? "",
        option.audioAssetId ?? "",
        option.originalFileName ?? "",
      ].join("|"),
    )
    .join("\n");

const textToOptions = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, symbol, word, transcription, audioUrl, audioAssetId, originalFileName] =
        line.split("|");
      const optionId = id?.trim() || `option-${index + 1}`;
      const optionAudioUrl = audioUrl?.trim() || "";
      const optionAudioAssetId = audioAssetId?.trim() || "";

      return {
        id: optionId,
        label: label?.trim() || optionId,
        symbol: symbol?.trim() || null,
        word: word?.trim() || null,
        transcription: transcription?.trim() || null,
        audioUrl: optionAudioUrl || null,
        audioAssetId: optionAudioAssetId || null,
        originalFileName: originalFileName?.trim() || null,
        audio: optionAudioUrl || optionAudioAssetId
          ? {
              id: `${optionId}-audio`,
              title: label?.trim() || optionId,
              url: optionAudioUrl || optionAudioAssetId,
              description: null,
              transcript: null,
              phoneticFocus: null,
            }
          : null,
      };
    });

const stateFromInitial = (
  mode: AuthoringMode,
  initial?: SaveValue | null,
  initialType?: string,
): FormState => {
  if (initial && "type" in initial && mode === "theory") {
    const block = initial as LessonBlockView;
    const title =
      block.type === "sound_comparison"
        ? { ru: "", en: "" }
        : block.type === "mini_check"
          ? localized(block.question)
          : localized("title" in block ? block.title : undefined);
    const body =
      block.type === "info"
        ? localized(block.body)
        : block.type === "sound_comparison"
          ? localized(block.explanation)
          : block.type === "mini_check"
            ? localized(block.explanation)
            : "description" in block
              ? localized(block.description)
              : { ru: "", en: "" };

    return {
      type: block.type,
      titleRu: title.ru,
      titleEn: title.en,
      bodyRu: body.ru,
      bodyEn: body.en,
      symbol:
        block.type === "sound_visual" || block.type === "sound_audio"
          ? block.symbol ?? ""
          : block.type === "sound_comparison"
            ? `${block.leftSymbol}|${block.rightSymbol}`
            : "",
      transcription: block.type === "sound_audio" ? block.transcript ?? "" : "",
      options:
        block.type === "examples"
          ? block.examples
              .map((example) =>
                [
                  example.id,
                  example.word,
                  example.transcription ?? "",
                  example.translation.ru ?? "",
                  example.translation.en ?? "",
                  example.audio?.url ?? example.audioUrl ?? "",
                  example.audioAssetId ?? "",
                  example.originalFileName ?? "",
                ].join("|"),
              )
              .join("\n")
          : block.type === "mini_check"
            ? block.options
                .map((option) => [option.id, option.label.ru ?? "", option.label.en ?? ""].join("|"))
                .join("\n")
            : "",
      correctOptionIds:
        block.type === "mini_check" ? block.correctOptionIds.join(",") : "",
      explanationRu: body.ru,
      explanationEn: body.en,
      audioUrl: block.type === "sound_audio" ? block.audio?.url ?? block.audioUrl ?? "" : "",
      audioAssetId: block.type === "sound_audio" ? block.audioAssetId ?? "" : "",
      originalFileName: block.type === "sound_audio" ? block.originalFileName ?? "" : "",
      variant: block.type === "info" ? block.tone : "",
    };
  }

  if (initial && mode === "practice") {
    const item = initial as ExerciseItemView;
    return {
      type: item.type,
      titleRu: item.prompt,
      titleEn: item.prompt,
      bodyRu: item.promptNote ?? "",
      bodyEn: item.promptNote ?? "",
      symbol: item.promptSymbol ?? "",
      transcription: item.promptTranscription ?? "",
      options: optionsToText(item.options),
      correctOptionIds: item.correctOptionIds.join(","),
      explanationRu: item.explanation ?? "",
      explanationEn: item.explanation ?? "",
      audioUrl: item.promptAudioUrl ?? item.promptAudio?.url ?? "",
      audioAssetId: item.promptAudioAssetId ?? "",
      originalFileName: item.originalFileName ?? "",
      variant: "",
    };
  }

  return {
    type: initialType ?? (mode === "theory" ? "info" : "audio_to_symbol"),
    titleRu: "",
    titleEn: "",
    bodyRu: "",
    bodyEn: "",
    symbol: "",
    transcription: "",
    options: "",
    correctOptionIds: "",
    explanationRu: "",
    explanationEn: "",
    audioUrl: "",
    audioAssetId: "",
    originalFileName: "",
    variant: "",
  };
};

const buildTheoryBlock = (state: FormState, initial?: SaveValue | null): LessonBlockView => {
  const id = initial && "id" in initial ? initial.id : `local-${state.type}-${crypto.randomUUID()}`;
  const title = { ru: state.titleRu, en: state.titleEn };
  const description = { ru: state.bodyRu, en: state.bodyEn };

  if (state.type === "sound_visual") {
    return { id, type: "sound_visual", symbol: state.symbol, title, description };
  }

  if (state.type === "sound_audio") {
    return {
      id,
      type: "sound_audio",
      title,
      description,
      symbol: state.symbol || null,
      transcript: state.transcription || null,
      audioUrl: state.audioUrl || null,
      audioAssetId: state.audioAssetId || null,
      originalFileName: state.originalFileName || null,
    };
  }

  if (state.type === "examples") {
    return {
      id,
      type: "examples",
      title,
      examples: state.options
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [
            exampleId,
            word,
            transcription,
            translationRu,
            translationEn,
            audioUrl,
            audioAssetId,
            originalFileName,
          ] =
            line.split("|");

          return {
            id: exampleId?.trim() || `example-${index + 1}`,
            word: word?.trim() || "",
            transcription: transcription?.trim() || null,
            translation: { ru: translationRu?.trim() ?? "", en: translationEn?.trim() ?? "" },
            audioUrl: audioUrl?.trim() || null,
            audioAssetId: audioAssetId?.trim() || null,
            originalFileName: originalFileName?.trim() || null,
          };
        }),
    };
  }

  if (state.type === "sound_comparison") {
    const [leftSymbol, rightSymbol] = state.symbol.split("|");
    return {
      id,
      type: "sound_comparison",
      leftSymbol: leftSymbol?.trim() || "",
      rightSymbol: rightSymbol?.trim() || "",
      leftExamples: [],
      rightExamples: [],
      explanation: description,
    };
  }

  if (state.type === "mini_check") {
    return {
      id,
      type: "mini_check",
      question: title,
      explanation: { ru: state.explanationRu || state.bodyRu, en: state.explanationEn || state.bodyEn },
      correctOptionIds: state.correctOptionIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      options: state.options
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [optionId, labelRu, labelEn] = line.split("|");
          const idValue = optionId?.trim() || `option-${index + 1}`;

          return {
            id: idValue,
            label: { ru: labelRu?.trim() || idValue, en: labelEn?.trim() || labelRu?.trim() || idValue },
          };
        }),
    };
  }

  return {
    id,
    type: "info",
    title,
    body: description,
    tone: state.variant === "tip" || state.variant === "warning" ? state.variant : "neutral",
  };
};

const buildPracticeItem = (state: FormState, initial?: SaveValue | null): ExerciseItemView => {
  const id = initial && "id" in initial ? initial.id : `local-${state.type}-${crypto.randomUUID()}`;
  const options = textToOptions(state.options);

  return {
    id,
    type: state.type as ExerciseItemType,
    prompt: state.titleRu || state.titleEn,
    promptNote: state.bodyRu || state.bodyEn || null,
    promptSymbol: state.symbol || null,
    promptWord: null,
    promptTranscription: state.transcription || null,
    promptAudioUrl: state.audioUrl || null,
    promptAudioAssetId: state.audioAssetId || null,
    originalFileName: state.originalFileName || null,
    promptAudio: state.audioUrl || state.audioAssetId
      ? {
          id: `${id}-audio`,
          title: state.titleEn || state.titleRu || id,
          url: state.audioUrl || state.audioAssetId,
          description: null,
          transcript: null,
          phoneticFocus: null,
        }
      : null,
    linkedExampleWord: null,
    options,
    correctOptionIds: state.correctOptionIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    explanation: state.explanationRu || state.explanationEn || null,
  };
};

export function AuthoringContentDrawer({
  locale,
  mode,
  initial,
  insertAfterLabel,
  onCancel,
  onSave,
}: {
  locale: Locale;
  mode: AuthoringMode;
  initial?: SaveValue | null;
  insertAfterLabel?: string;
  onCancel: () => void;
  onSave: (value: SaveValue) => void;
}) {
  const dictionary = getDictionary(locale);
  const [initialSignature] = useState(() => JSON.stringify(stateFromInitial(mode, initial)));
  const [state, setState] = useState(() => stateFromInitial(mode, initial));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const types = mode === "theory" ? theoryTypes : practiceTypes;
  const isDirty = JSON.stringify(state) !== initialSignature || Boolean(previewUrl);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updateField = (field: keyof FormState, value: string) =>
    setState((current) => ({ ...current, [field]: value }));

  const handleCancel = () => {
    if (!isDirty || window.confirm(dictionary.authoring.discardChangesConfirm)) {
      onCancel();
    }
  };

  const showBody = state.type !== "examples";
  const showSymbol = ["sound_visual", "sound_audio", "sound_comparison", "audio_to_symbol", "symbol_to_audio", "symbol_to_word"].includes(state.type);
  const showAudio = ["sound_audio", "audio_to_symbol", "symbol_to_audio"].includes(state.type);
  const showOptions = mode === "practice" || ["examples", "mini_check"].includes(state.type);
  const showCorrect = mode === "practice" || state.type === "mini_check";
  const showExplanation = mode === "practice" || ["mini_check", "sound_comparison"].includes(state.type);

  return (
    <div className="authoringDrawerBackdrop" role="presentation">
      <aside className="authoringDrawer authoringModal" role="dialog" aria-modal="true" aria-labelledby="authoring-drawer-title">
        <div className="authoringDrawerHeader">
          <div className="stack-sm">
            <p className="eyebrow">
              {mode === "theory" ? dictionary.authoring.theoryBlocks : dictionary.authoring.practiceBlocks}
            </p>
            <h2 id="authoring-drawer-title">
              {initial ? dictionary.authoring.editBlock : dictionary.authoring.chooseBlockType}
            </h2>
            {insertAfterLabel ? <p className="muted">{insertAfterLabel}</p> : null}
          </div>
          <button className="button secondary" type="button" onClick={handleCancel}>
            {dictionary.authoring.cancel}
          </button>
        </div>

        <div className="authoringTypeGrid">
          {types.map((type) => (
            <button
              className={`authoringTypeButton${state.type === type ? " active" : ""}`}
              key={type}
              type="button"
              onClick={() => updateField("type", type)}
            >
              {mode === "theory"
                ? dictionary.lessonBlockTypes[type]
                : dictionary.exercise.itemTypes[type]}
            </button>
          ))}
        </div>

        <div className="grid authoringFormGrid">
          <label className="fieldLabel">
            <span>{dictionary.authoring.titleRu}</span>
            <input value={state.titleRu} onChange={(event) => updateField("titleRu", event.target.value)} />
          </label>
          <label className="fieldLabel">
            <span>{dictionary.authoring.titleEn}</span>
            <input value={state.titleEn} onChange={(event) => updateField("titleEn", event.target.value)} />
          </label>
          {showBody ? (
            <>
              <label className="fieldLabel">
                <span>{dictionary.authoring.bodyRu}</span>
                <textarea rows={4} value={state.bodyRu} onChange={(event) => updateField("bodyRu", event.target.value)} />
              </label>
              <label className="fieldLabel">
                <span>{dictionary.authoring.bodyEn}</span>
                <textarea rows={4} value={state.bodyEn} onChange={(event) => updateField("bodyEn", event.target.value)} />
              </label>
            </>
          ) : null}
          {showSymbol ? (
            <label className="fieldLabel">
              <span>{dictionary.authoring.symbol}</span>
              <input value={state.symbol} onChange={(event) => updateField("symbol", event.target.value)} />
            </label>
          ) : null}
          <label className="fieldLabel">
            <span>{dictionary.authoring.transcription}</span>
            <input value={state.transcription} onChange={(event) => updateField("transcription", event.target.value)} />
          </label>
          {showAudio ? (
            <>
              <label className="fieldLabel">
                <span>{dictionary.authoring.audioUrl}</span>
                <input value={state.audioUrl} onChange={(event) => updateField("audioUrl", event.target.value)} />
              </label>
              <label className="fieldLabel">
                <span>{dictionary.authoring.audioAssetId}</span>
                <input value={state.audioAssetId} onChange={(event) => updateField("audioAssetId", event.target.value)} />
              </label>
              <label className="fieldLabel authoringWideField">
                <span>{dictionary.authoring.audioPreviewFile}</span>
                <input
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }

                    setPreviewUrl(URL.createObjectURL(file));
                    updateField("originalFileName", file.name);
                  }}
                />
                <span className="muted">{dictionary.authoring.audioPreviewHint}</span>
                {state.originalFileName ? <span className="muted">{state.originalFileName}</span> : null}
                {previewUrl ? (
                  <audio className="audioElement" controls src={previewUrl}>
                    {dictionary.audio.listen}
                  </audio>
                ) : null}
              </label>
            </>
          ) : null}
          <label className="fieldLabel">
            <span>{dictionary.authoring.variant}</span>
            <input value={state.variant} onChange={(event) => updateField("variant", event.target.value)} />
          </label>
          {showOptions ? (
            <label className="fieldLabel authoringWideField">
              <span>{dictionary.authoring.options}</span>
              <textarea rows={5} value={state.options} onChange={(event) => updateField("options", event.target.value)} />
            </label>
          ) : null}
          {showCorrect ? (
            <label className="fieldLabel">
              <span>{dictionary.authoring.correctOptionIds}</span>
              <input value={state.correctOptionIds} onChange={(event) => updateField("correctOptionIds", event.target.value)} />
            </label>
          ) : null}
          {showExplanation ? (
            <>
              <label className="fieldLabel">
                <span>{dictionary.authoring.explanationRu}</span>
                <textarea rows={3} value={state.explanationRu} onChange={(event) => updateField("explanationRu", event.target.value)} />
              </label>
              <label className="fieldLabel">
                <span>{dictionary.authoring.explanationEn}</span>
                <textarea rows={3} value={state.explanationEn} onChange={(event) => updateField("explanationEn", event.target.value)} />
              </label>
            </>
          ) : null}
        </div>

        <div className="exerciseActions authoringDrawerActions">
          <button
            className="button primary"
            type="button"
            onClick={() => onSave(mode === "theory" ? buildTheoryBlock(state, initial) : buildPracticeItem(state, initial))}
          >
            {dictionary.authoring.saveBlock}
          </button>
          <button className="button secondary" type="button" onClick={handleCancel}>
            {dictionary.authoring.cancel}
          </button>
        </div>
      </aside>
    </div>
  );
}
