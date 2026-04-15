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

export type AudioAssetRecord = {
  id: string;
  status: PublicationStatus;
  title: string;
  description?: string | null;
  transcript?: string | null;
  phonetic_focus?: string | null;
  license_note?: string | null;
  file?: DirectusFileRecord | null;
};

export type ExampleWordRecord = {
  id: string;
  status: PublicationStatus;
  word: string;
  transcription?: string | null;
  translation?: string | null;
  note?: string | null;
  primary_audio?: AudioAssetRecord | null;
};

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
  title: string;
  sound_type?: string | null;
  explanation: string;
  stress_note?: string | null;
  common_mistakes?: string | null;
  comparison_note?: string | null;
  primary_audio?: AudioAssetRecord | null;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
};

export type SoundCombinationRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  combination_text: string;
  title: string;
  explanation: string;
  comparison_note?: string | null;
  stress_note?: string | null;
  common_mistakes?: string | null;
  primary_audio?: AudioAssetRecord | null;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
};

export type ReadingRuleRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  title: string;
  rule_statement: string;
  explanation: string;
  exceptions?: string | null;
  limitations?: string | null;
  practice_intro?: string | null;
  examples?: Array<JunctionRecord<ExampleWordRecord>>;
  reinforcement_exercises?: Array<JunctionRecord<ExerciseRecord>>;
};

export type ExerciseOptionRecord = {
  id: string;
  label: string;
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
  prompt: string;
  prompt_note?: string | null;
  prompt_symbol?: string | null;
  prompt_word?: string | null;
  prompt_transcription?: string | null;
  prompt_audio?: AudioAssetRecord | null;
  linked_example_word?: ExampleWordRecord | null;
  options: ExerciseOptionRecord[];
  correct_option_ids: string[];
  explanation?: string | null;
};

export type ExerciseRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  title: string;
  summary?: string | null;
  instructions: string;
  show_item_feedback: boolean;
  passing_score?: number | null;
  items?: ExerciseItemRecord[];
};

export type LessonBlockRecord = {
  id: string;
  status: PublicationStatus;
  visibility: VisibilityState;
  slug: string;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  order: number;
  estimated_minutes?: number | null;
  module?: ModuleRecord | null;
  phonetic_symbol?: PhoneticSymbolRecord | null;
  sound_combination?: SoundCombinationRecord | null;
  reading_rule?: ReadingRuleRecord | null;
  exercise?: ExerciseRecord | null;
};

export type ModuleRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  title: string;
  summary?: string | null;
  theme_label?: string | null;
  order: number;
  course?: CourseRecord | null;
  lesson_blocks?: LessonBlockRecord[];
};

export type CourseRecord = {
  id: string;
  status: PublicationStatus;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  hero_headline?: string | null;
  hero_subheadline?: string | null;
  modules?: ModuleRecord[];
};

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
};

export type CourseOverview = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
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
};

export type ExerciseOption = {
  id: string;
  label: string;
  value?: string | null;
  word?: string | null;
  transcription?: string | null;
  symbol?: string | null;
  audio?: AudioAsset | null;
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

export type LessonContentView =
  | StudyCardView
  | ReadingRuleView
  | ExerciseView;

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  lessonType: LessonType;
  estimatedMinutes?: number | null;
  module: ModuleSummary;
  previousLesson?: LessonSummary | null;
  nextLesson?: LessonSummary | null;
  content: LessonContentView | null;
};
