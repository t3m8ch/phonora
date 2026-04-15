import { EmptyState } from "@/components/EmptyState";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { LessonLayout } from "@/components/LessonLayout";
import { ReadingRuleCard, StudyCard } from "@/components/StudyCard";
import { getLessonByModuleAndSlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;
  const lesson = await getLessonByModuleAndSlug(moduleSlug, lessonSlug);

  if (!lesson || !lesson.content) {
    return (
      <EmptyState
        title="Lesson not found"
        body="The lesson could not be loaded. It may be unpublished, incomplete, or Directus is unavailable."
        actionHref={`/modules/${moduleSlug}`}
        actionLabel="Back to module"
      />
    );
  }

  return (
    <LessonLayout lesson={lesson}>
      {lesson.content.kind === "exercise" ? <ExercisePlayer exercise={lesson.content} /> : null}
      {lesson.content.kind === "reading_rule" ? <ReadingRuleCard rule={lesson.content} /> : null}
      {(lesson.content.kind === "phonetic_symbol" || lesson.content.kind === "sound_combination") ? (
        <StudyCard card={lesson.content} />
      ) : null}
    </LessonLayout>
  );
}
