import Link from "next/link";

import { getDictionary, type Locale } from "@/lib/i18n";

type EmptyStateProps = {
  locale: Locale;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  eyebrow?: string;
};

export function EmptyState({
  locale,
  title,
  body,
  actionHref,
  actionLabel,
  eyebrow,
}: EmptyStateProps) {
  const dictionary = getDictionary(locale);

  return (
    <section className="emptyState card">
      <p className="eyebrow">{eyebrow ?? dictionary.emptyState.eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      {actionHref && actionLabel ? (
        <Link className="button secondary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
