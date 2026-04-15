import Link from "next/link";

type EmptyStateProps = {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <section className="emptyState card">
      <p className="eyebrow">Content unavailable</p>
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
