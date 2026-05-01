import { notFound } from "next/navigation";

import { CourseHero } from "@/components/CourseHero";
import { CourseProgressWidget } from "@/components/CourseProgressWidget";
import { EmptyState } from "@/components/EmptyState";
import { ModuleCard } from "@/components/ModuleCard";
import { getCourseOverview } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const course = await getCourseOverview(locale);

  if (!course) {
    return (
      <EmptyState
        locale={locale}
        title={dictionary.home.missingTitle}
        body={dictionary.home.missingBody}
        actionHref="https://directus.io/"
        actionLabel={dictionary.home.missingAction}
      />
    );
  }

  return (
    <div className="stack-xl">
      <CourseHero course={course} locale={locale} />

      <CourseProgressWidget course={course} locale={locale} />

      <section className="grid courseGrid">
        {course.modules.map((module) => (
          <ModuleCard key={module.id} module={module} locale={locale} />
        ))}
      </section>
    </div>
  );
}
