import Link from "next/link";

import type { LessonDetail } from "@/lib/types";

export function LessonLayout({
  lesson,
  children,
}: {
  lesson: LessonDetail;
  children: React.ReactNode;
}) {
  return (
    <div className="stack-xl">
      <section className="card lessonHeader">
        <div className="stack-sm">
          <Link className="textLink" href={`/modules/${lesson.module.slug}`}>
            ← Back to {lesson.module.title}
          </Link>
          <p className="eyebrow">{lesson.lessonType.replaceAll("_", " ")}</p>
          <h1>{lesson.title}</h1>
          {lesson.description ? <p className="lead">{lesson.description}</p> : null}
        </div>
        <div className="lessonMeta">
          <span>{lesson.module.title}</span>
          {lesson.estimatedMinutes ? <span>{lesson.estimatedMinutes} min</span> : null}
        </div>
      </section>

      {children}

      <nav className="lessonNav">
        {lesson.previousLesson ? (
          <Link className="card navCard" href={`/learn/${lesson.module.slug}/${lesson.previousLesson.slug}`}>
            <span className="eyebrow">Previous</span>
            <strong>{lesson.previousLesson.title}</strong>
          </Link>
        ) : (
          <div className="card navCard disabled">
            <span className="eyebrow">Previous</span>
            <strong>Start of module</strong>
          </div>
        )}
        {lesson.nextLesson ? (
          <Link className="card navCard" href={`/learn/${lesson.module.slug}/${lesson.nextLesson.slug}`}>
            <span className="eyebrow">Next</span>
            <strong>{lesson.nextLesson.title}</strong>
          </Link>
        ) : (
          <div className="card navCard disabled">
            <span className="eyebrow">Next</span>
            <strong>Module complete</strong>
          </div>
        )}
      </nav>
    </div>
  );
}
