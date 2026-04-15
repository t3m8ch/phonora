import type { CourseOverview } from "@/lib/types";

export function CourseHero({ course }: { course: CourseOverview }) {
  return (
    <section className="hero card">
      <div className="stack-lg">
        <p className="eyebrow">Phonora MVP</p>
        <h1>{course.heroHeadline ?? course.title}</h1>
        <p className="lead">{course.heroSubheadline ?? course.summary ?? course.description}</p>
      </div>
      <div className="heroStats">
        <div>
          <strong>{course.modules.length}</strong>
          <span>modules</span>
        </div>
        <div>
          <strong>{course.modules.reduce((sum, module) => sum + module.lessonCount, 0)}</strong>
          <span>published lessons</span>
        </div>
      </div>
    </section>
  );
}
