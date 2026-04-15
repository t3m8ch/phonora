import Link from "next/link";

import type { ModuleSummary } from "@/lib/types";

export function ModuleCard({ module }: { module: ModuleSummary }) {
  return (
    <article className="card moduleCard">
      <div className="stack-sm">
        <p className="eyebrow">Module {module.order}</p>
        <h3>{module.title}</h3>
        <p className="muted">{module.summary ?? "Structured practice with audio, examples, and navigation."}</p>
      </div>
      <div className="moduleCardFooter">
        <span>{module.lessonCount} lessons</span>
        <Link className="button secondary" href={`/modules/${module.slug}`}>
          Open module
        </Link>
      </div>
    </article>
  );
}
