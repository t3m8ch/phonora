import { getDictionary, type Locale } from "@/lib/i18n";
import type { CourseOverview } from "@/lib/types";

export function CourseHero({
  course,
  locale,
}: {
  course: CourseOverview;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <section className="hero card">
      <div className="stack-lg">
        <p className="eyebrow">{dictionary.courseHero.eyebrow}</p>
        <h1>{course.heroHeadline ?? course.title}</h1>
        <p className="lead">{course.heroSubheadline ?? course.summary ?? course.description}</p>
      </div>
      <div className="heroStats">
        <div>
          <strong>{course.modules.length}</strong>
          <span>{dictionary.courseHero.modules}</span>
        </div>
        <div>
          <strong>{course.modules.reduce((sum, module) => sum + module.lessonCount, 0)}</strong>
          <span>{dictionary.courseHero.publishedLessons}</span>
        </div>
      </div>
    </section>
  );
}
