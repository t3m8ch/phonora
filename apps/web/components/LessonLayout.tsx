import Link from "next/link";

import { getDictionary, type Locale } from "@/lib/i18n";
import { lessonPath, modulePath } from "@/lib/routes";
import type { LessonDetail } from "@/lib/types";

export function LessonLayout({
  lesson,
  locale,
  children,
}: {
  lesson: LessonDetail;
  locale: Locale;
  children: React.ReactNode;
}) {
  const dictionary = getDictionary(locale);

  return (
    <div className="stack-xl">
      <section className="card lessonHeader">
        <div className="stack-sm">
          <Link className="textLink" href={modulePath(locale, lesson.module.slug)}>
            ← {dictionary.lessonLayout.backTo} {lesson.module.title}
          </Link>
          <p className="eyebrow">{dictionary.lessonTypes[lesson.lessonType]}</p>
          <h1>{lesson.title}</h1>
          {lesson.description ? <p className="lead">{lesson.description}</p> : null}
        </div>
        <div className="lessonMeta">
          <span>{lesson.module.title}</span>
          {lesson.estimatedMinutes ? (
            <span>
              {lesson.estimatedMinutes} {dictionary.lessonLayout.minutes}
            </span>
          ) : null}
        </div>
      </section>

      {children}

      <nav className="lessonNav">
        {lesson.previousLesson ? (
          <Link
            className="card navCard"
            href={lessonPath(locale, lesson.module.slug, lesson.previousLesson.slug)}
          >
            <span className="eyebrow">{dictionary.lessonLayout.previous}</span>
            <strong>{lesson.previousLesson.title}</strong>
          </Link>
        ) : (
          <div className="card navCard disabled">
            <span className="eyebrow">{dictionary.lessonLayout.previous}</span>
            <strong>{dictionary.lessonLayout.startOfModule}</strong>
          </div>
        )}
        {lesson.nextLesson ? (
          <Link
            className="card navCard"
            href={lessonPath(locale, lesson.module.slug, lesson.nextLesson.slug)}
          >
            <span className="eyebrow">{dictionary.lessonLayout.next}</span>
            <strong>{lesson.nextLesson.title}</strong>
          </Link>
        ) : (
          <div className="card navCard disabled">
            <span className="eyebrow">{dictionary.lessonLayout.next}</span>
            <strong>{dictionary.lessonLayout.moduleComplete}</strong>
          </div>
        )}
      </nav>
    </div>
  );
}
