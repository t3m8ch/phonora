import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { getModuleBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moduleDetail = await getModuleBySlug(slug);

  if (!moduleDetail) {
    return (
      <EmptyState
        title="Module not found"
        body="This module is missing, unpublished, or Directus is not reachable yet."
        actionHref="/"
        actionLabel="Back to course"
      />
    );
  }

  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <Link className="textLink" href="/">
          ← Back to course overview
        </Link>
        <p className="eyebrow">Module {moduleDetail.order}</p>
        <h1>{moduleDetail.title}</h1>
        {moduleDetail.summary ? <p className="lead">{moduleDetail.summary}</p> : null}
      </section>

      <section className="grid">
        {moduleDetail.lessons.map((lesson, index) => (
          <article key={lesson.id} className="card lessonListCard">
            <div className="stack-sm">
              <p className="eyebrow">
                Lesson {index + 1} · {lesson.lessonType.replaceAll("_", " ")}
              </p>
              <h3>{lesson.title}</h3>
              {lesson.description ? <p className="muted">{lesson.description}</p> : null}
            </div>
            <div className="lessonListFooter">
              {lesson.estimatedMinutes ? <span>{lesson.estimatedMinutes} min</span> : <span />}
              <Link className="button secondary" href={`/learn/${moduleDetail.slug}/${lesson.slug}`}>
                Start lesson
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
