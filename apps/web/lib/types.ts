import type { Locale } from "@/lib/i18n";

export type PublicationStatus = "draft" | "published" | "archived";
export type VisibilityState = "visible" | "hidden";

export type LessonType =
  | "phonetic_symbol"
  | "sound_combination"
  | "reading_rule"
  | "exercise";

export type ExerciseItemType =
  | "audio_to_symbol"
  | "symbol_to_audio"
  | "symbol_to_word"
  | "transcription_to_word"
  | "stress_selection"
  | "similar_sound_discrimination"
  | "reading_rule_application";

export type DirectusFileRecord = {
  id: string;
  title?: string | null;
  filename_download?: string | null;
  type?: string | null;
};

type LocalizedTextField<Key extends string> = {
  [K in `${Key}_en` | `${Key}_ru`]?: string | null;
};

export type AudioAssetRecord = {
  id: string;
  status: PublicationStatus;
  transcript?: string | null;
  phonetic_focus?: string | null;
  license_note?: string | null;
  file?: DirectusFileRecord | null;
} & LocalizedTextField<"title" | "description">;

export type ExampleWordRecord = {
  id: string;
  status: PublicationStatus;
  word: string;
  transcription?: string | null;
  primary_audio?: AudioAssetRecord | null;
} & LocalizedTextField<"translation" | "note">;

export type JunctionRecord<T> = {
  id: string;
  sort?: number | null;
  [key: string]: T | string | number | null | undefined;
};

export type PhoneticSymbolRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  symbol: string;
  primary_audio?: AudioAssetRecord | null;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
} & LocalizedTextField<
  | "title"
  | "sound_type"
  | "explanation"
  | "stress_note"
  | "common_mistakes"
  | "comparison_note"
>;

export type SoundCombinationRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  combination_text: string;
  primary_audio?: AudioAssetRecord | null;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
} & LocalizedTextField<
  | "title"
  | "explanation"
  | "stress_note"
  | "common_mistakes"
  | "comparison_note"
>;

export type ReadingRuleRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
  reinforcement_exercises?: Array<JunctionRecord<ExerciseRecord>>;
} & LocalizedTextField<
  | "title"
  | "rule_statement"
  | "explanation"
  | "exceptions"
  | "limitations"
  | "practice_intro"
>;

export type ExerciseOptionRecord = {
  id: string;
  label_en?: string | null;
  label_ru?: string | null;
  value?: string | null;
  word?: string | null;
  transcription?: string | null;
  symbol?: string | null;
  audio_asset_id?: string | null;
};

export type ExerciseItemRecord = {
  id: string;
  exercise: string;
  sort: number;
  type: ExerciseItemType;
  prompt_symbol?: string | null;
  prompt_word?: string | null;
  prompt_transcription?: string | null;
  prompt_audio?: AudioAssetRecord | null;
  linked_example_word?: ExampleWordRecord | null;
  options: ExerciseOptionRecord[];
  correct_option_ids: string[];
} & LocalizedTextField<"prompt" | "prompt_note" | "explanation">;

export type ExerciseRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  show_item_feedback: boolean;
  passing_score?: number | null;
  items?: ExerciseItemRecord[];
} & LocalizedTextField<"title" | "summary" | "instructions">;

export type LessonBlockRecord = {
  id: string;
  status: PublicationStatus;
  visibility: VisibilityState;
  slug: string;
  lesson_type: LessonType;
  order: number;
  estimated_minutes?: number | null;
  module?: ModuleRecord | null;
  phonetic_symbol?: PhoneticSymbolRecord | null;
  sound_combination?: SoundCombinationRecord | null;
  reading_rule?: ReadingRuleRecord | null;
  exercise?: ExerciseRecord | null;
} & LocalizedTextField<"title" | "description">;

export type ModuleRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  order: number;
  course?: CourseRecord | null;
  lesson_blocks?: LessonBlockRecord[];
} & LocalizedTextField<"title" | "summary" | "theme_label">;

export type CourseRecord = {
  id: string;
  status: PublicationStatus;
  modules?: ModuleRecord[];
} & LocalizedTextField<"hero_headline" | "hero_subheadline">;

export type AudioAsset = {
  id: string;
  title: string;
  url: string;
  transcript?: string | null;
  description?: string | null;
  phoneticFocus?: string | null;
};

export type ExampleWord = {
  id: string;
  word: string;
  transcription?: string | null;
  translation?: string | null;
  note?: string | null;
  audio?: AudioAsset | null;
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  lessonType: LessonType;
  order: number;
  estimatedMinutes?: number | null;
};

export type ModuleSummary = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  themeLabel?: string | null;
  order: number;
  lessonCount: number;
  lessons?: LessonSummary[];
};

export type CourseOverview = {
  id: string;
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  modules: ModuleSummary[];
};

export type ModuleDetail = ModuleSummary & {
  lessons: LessonSummary[];
};

export type StudyCardView = {
  kind: "phonetic_symbol" | "sound_combination";
  slug: string;
  title: string;
  symbolOrCombination: string;
  label?: string | null;
  explanation: string;
  stressNote?: string | null;
  commonMistakes?: string | null;
  comparisonNote?: string | null;
  audio?: AudioAsset | null;
  examples: ExampleWord[];
  blocks?: LessonBlockView[];
};

export type ReadingRuleView = {
  kind: "reading_rule";
  slug: string;
  title: string;
  ruleStatement: string;
  explanation: string;
  exceptions?: string | null;
  limitations?: string | null;
  practiceIntro?: string | null;
  examples: ExampleWord[];
  reinforcementExercises: Array<Pick<ExerciseView, "slug" | "title" | "summary">>;
  blocks?: LessonBlockView[];
};

export type ExerciseOption = {
  id: string;
  label: string;
  value?: string | null;
  word?: string | null;
  transcription?: string | null;
  symbol?: string | null;
  audio?: AudioAsset | null;
  audioUrl?: string | null;
  audioAssetId?: string | null;
  originalFileName?: string | null;
};

export type ExerciseItemView = {
  id: string;
  type: ExerciseItemType;
  prompt: string;
  promptNote?: string | null;
  promptSymbol?: string | null;
  promptWord?: string | null;
  promptTranscription?: string | null;
  promptAudio?: AudioAsset | null;
  promptAudioUrl?: string | null;
  promptAudioAssetId?: string | null;
  originalFileName?: string | null;
  linkedExampleWord?: ExampleWord | null;
  options: ExerciseOption[];
  correctOptionIds: string[];
  explanation?: string | null;
};

export type ExerciseView = {
  kind: "exercise";
  slug: string;
  title: string;
  summary?: string | null;
  instructions: string;
  showItemFeedback: boolean;
  passingScore?: number | null;
  items: ExerciseItemView[];
};

type LocalizedValue = {
  en?: string | null;
  ru?: string | null;
};

export type SoundVisualLessonBlock = {
  id: string;
  type: "sound_visual";
  symbol: string;
  title: LocalizedValue;
  description: LocalizedValue;
};

export type SoundAudioLessonBlock = {
  id: string;
  type: "sound_audio";
  audio?: AudioAsset | null;
  audioUrl?: string | null;
  audioAssetId?: string | null;
  originalFileName?: string | null;
  title: LocalizedValue;
  description: LocalizedValue;
  transcript?: string | null;
  symbol?: string | null;
};

export type ExamplesLessonBlock = {
  id: string;
  type: "examples";
  title?: LocalizedValue;
  examples: Array<{
    id: string;
    word: string;
    transcription?: string | null;
    translation: LocalizedValue;
    audio?: AudioAsset | null;
    audioUrl?: string | null;
    audioAssetId?: string | null;
    originalFileName?: string | null;
  }>;
};

export type InfoLessonBlock = {
  id: string;
  type: "info";
  title: LocalizedValue;
  body: LocalizedValue;
  tone: "neutral" | "tip" | "warning";
};

export type SoundComparisonLessonBlock = {
  id: string;
  type: "sound_comparison";
  leftSymbol: string;
  rightSymbol: string;
  leftExamples: string[];
  rightExamples: string[];
  explanation: LocalizedValue;
};

export type MiniCheckLessonBlock = {
  id: string;
  type: "mini_check";
  question: LocalizedValue;
  options: Array<{
    id: string;
    label: LocalizedValue;
  }>;
  correctOptionIds: string[];
  explanation: LocalizedValue;
};

export type LessonBlockView =
  | SoundVisualLessonBlock
  | SoundAudioLessonBlock
  | ExamplesLessonBlock
  | InfoLessonBlock
  | SoundComparisonLessonBlock
  | MiniCheckLessonBlock;

export type LessonContentView = StudyCardView | ReadingRuleView | ExerciseView;

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  lessonType: LessonType;
  order: number;
  estimatedMinutes?: number | null;
  module: ModuleSummary;
  previousLesson?: LessonSummary | null;
  nextLesson?: LessonSummary | null;
  content: LessonContentView | null;
};

export type LocalizedRouteParams = {
  locale: Locale;
};
