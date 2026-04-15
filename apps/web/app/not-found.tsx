import { headers } from "next/headers";

import { EmptyState } from "@/components/EmptyState";
import { DEFAULT_LOCALE, getDictionary, normalizeLocale } from "@/lib/i18n";
import { coursePath } from "@/lib/routes";

export default async function NotFound() {
  const headerStore = await headers();
  const locale = normalizeLocale(headerStore.get("x-phonora-locale")) ?? DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);

  return (
    <EmptyState
      locale={locale}
      title={dictionary.notFound.title}
      body={dictionary.notFound.body}
      actionHref={coursePath(locale)}
      actionLabel={dictionary.notFound.action}
    />
  );
}
