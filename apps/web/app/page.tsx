import { CourseHero } from "@/components/CourseHero";
import { EmptyState } from "@/components/EmptyState";
import { ModuleCard } from "@/components/ModuleCard";
import { getCourseOverview } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const course = await getCourseOverview();

  if (!course) {
    return (
      <EmptyState
        title="Connect Directus to load the course"
        body="Phonora reads published content from Directus. Start the local stack, bootstrap the schema, and seed starter content to see the learning path here."
        actionHref="https://directus.io/"
        actionLabel="Open Directus docs"
      />
    );
  }

  return (
    <div className="stack-xl">
      <CourseHero course={course} />

      <section className="grid courseGrid">
        {course.modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </section>
    </div>
  );
}
