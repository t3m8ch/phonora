import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { getModuleBySlug } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { coursePath, lessonPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const moduleDetail = await getModuleBySlug(slug, locale);

  if (!moduleDetail) {
    return (
      <EmptyState
        locale={locale}
        title={dictionary.modulePage.missingTitle}
        body={dictionary.modulePage.missingBody}
        actionHref={coursePath(locale)}
        actionLabel={dictionary.modulePage.backToCourse}
      />
    );
  }

  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <Link className="textLink" href={coursePath(locale)}>
          ← {dictionary.modulePage.backToCourse}
        </Link>
        <p className="eyebrow">
          {dictionary.modulePage.module} {moduleDetail.order}
        </p>
        <h1>{moduleDetail.title}</h1>
        {moduleDetail.summary ? <p className="lead">{moduleDetail.summary}</p> : null}
      </section>

      <section className="grid">
        {moduleDetail.lessons.map((lesson, index) => (
          <article key={lesson.id} className="card lessonListCard">
            <div className="stack-sm">
              <p className="eyebrow">
                {dictionary.modulePage.lesson} {index + 1} · {dictionary.lessonTypes[lesson.lessonType]}
              </p>
              <h3>{lesson.title}</h3>
              {lesson.description ? <p className="muted">{lesson.description}</p> : null}
            </div>
            <div className="lessonListFooter">
              {lesson.estimatedMinutes ? (
                <span>
                  {lesson.estimatedMinutes} {dictionary.modulePage.minutes}
                </span>
              ) : (
                <span />
              )}
              <Link
                className="button secondary"
                href={lessonPath(locale, moduleDetail.slug, lesson.slug)}
              >
                {dictionary.modulePage.startLesson}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
