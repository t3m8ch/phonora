import { notFound } from "next/navigation";

import { DeveloperAuthoringPanel } from "@/components/DeveloperAuthoringPanel";
import { EmptyState } from "@/components/EmptyState";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { LessonBlockRenderer } from "@/components/LessonBlockRenderer";
import { LessonCompletion } from "@/components/LessonCompletion";
import { LessonLayout } from "@/components/LessonLayout";
import { ReadingRuleCard, StudyCard } from "@/components/StudyCard";
import { getLessonByModuleAndSlug } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { modulePath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { locale, moduleSlug, lessonSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const lesson = await getLessonByModuleAndSlug(moduleSlug, lessonSlug, locale);

  if (!lesson || !lesson.content) {
    return (
      <EmptyState
        locale={locale}
        title={dictionary.lessonPage.missingTitle}
        body={dictionary.lessonPage.missingBody}
        actionHref={modulePath(locale, moduleSlug)}
        actionLabel={dictionary.lessonPage.backToModule}
      />
    );
  }

  return (
    <LessonLayout lesson={lesson} locale={locale}>
      {lesson.content.kind === "exercise" ? (
        <ExercisePlayer
          exercise={lesson.content}
          locale={locale}
          lessonId={lesson.id}
          lessonSlug={lesson.slug}
          lessonTitle={lesson.title}
          moduleSlug={lesson.module.slug}
          moduleTitle={lesson.module.title}
        />
      ) : null}
      {lesson.content.kind !== "exercise" && lesson.content.blocks?.length ? (
        <LessonBlockRenderer
          blocks={lesson.content.blocks}
          locale={locale}
          lessonSlug={lesson.slug}
          moduleSlug={lesson.module.slug}
        />
      ) : null}
      {lesson.content.kind === "reading_rule" && !lesson.content.blocks?.length ? (
        <ReadingRuleCard rule={lesson.content} locale={locale} />
      ) : null}
      {(lesson.content.kind === "phonetic_symbol" || lesson.content.kind === "sound_combination") &&
      !lesson.content.blocks?.length ? (
        <StudyCard card={lesson.content} locale={locale} />
      ) : null}
      <DeveloperAuthoringPanel
        locale={locale}
        moduleSlug={lesson.module.slug}
        lessonSlug={lesson.slug}
        lessonTitle={lesson.title}
      />
      {lesson.content.kind !== "exercise" ? (
        <LessonCompletion
          locale={locale}
          lessonId={lesson.id}
          lessonSlug={lesson.slug}
          lessonTitle={lesson.title}
          moduleSlug={lesson.module.slug}
          moduleTitle={lesson.module.title}
        />
      ) : null}
    </LessonLayout>
  );
}
