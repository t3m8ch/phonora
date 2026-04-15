import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      body="The requested page does not exist or has not been published yet."
      actionHref="/"
      actionLabel="Back to home"
    />
  );
}
