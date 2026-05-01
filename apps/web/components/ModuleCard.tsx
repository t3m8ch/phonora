import Link from "next/link";

import { ModuleProgressStatus } from "@/components/ModuleProgressStatus";
import { getModuleCardKind, getModuleVariant } from "@/lib/card-types";
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
  const moduleKind = getModuleCardKind(module);
  const moduleVariant = getModuleVariant(module);
  const moduleVariantClass =
    moduleVariant === "practice" ? "moduleCardPractice" : "moduleCardTheory";

  return (
    <article
      className={`card moduleCard ${moduleVariantClass} moduleCardKind-${moduleKind} moduleVariant-${moduleVariant}`}
    >
      <div className="stack-sm">
        <p className="eyebrow">
          {dictionary.moduleCard.module} {module.order}
        </p>
        <span className={`moduleVariantBadge ${moduleVariant}`}>
          {dictionary.moduleVariants[moduleVariant]}
        </span>
        <span className="contentTypeBadge">{dictionary.moduleKinds[moduleKind]}</span>
        <ModuleProgressStatus module={module} locale={locale} />
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
