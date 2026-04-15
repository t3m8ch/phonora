import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { ExercisePlayer } from "@/components/ExercisePlayer";
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
        <ExercisePlayer exercise={lesson.content} locale={locale} />
      ) : null}
      {lesson.content.kind === "reading_rule" ? (
        <ReadingRuleCard rule={lesson.content} locale={locale} />
      ) : null}
      {lesson.content.kind === "phonetic_symbol" || lesson.content.kind === "sound_combination" ? (
        <StudyCard card={lesson.content} locale={locale} />
      ) : null}
    </LessonLayout>
  );
}
