import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { StatsDashboard } from "@/components/StatsDashboard";
import { getCourseOverview } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { coursePath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function StatsPage({
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
        actionHref={coursePath(locale)}
        actionLabel={dictionary.notFound.action}
      />
    );
  }

  return <StatsDashboard course={course} locale={locale} />;
}
