import Link from "next/link";

import { getDictionary, type Locale } from "@/lib/i18n";
import { modulePath } from "@/lib/routes";
import type { ModuleSummary } from "@/lib/types";

export function ModuleCard({
  module,
  locale,
}: {
  module: ModuleSummary;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <article className="card moduleCard">
      <div className="stack-sm">
        <p className="eyebrow">
          {dictionary.moduleCard.module} {module.order}
        </p>
        <h3>{module.title}</h3>
        <p className="muted">{module.summary ?? dictionary.moduleCard.fallbackSummary}</p>
      </div>
      <div className="moduleCardFooter">
        <span>
          {module.lessonCount} {dictionary.moduleCard.lessons}
        </span>
        <Link className="button secondary" href={modulePath(locale, module.slug)}>
          {dictionary.moduleCard.openModule}
        </Link>
      </div>
    </article>
  );
}
