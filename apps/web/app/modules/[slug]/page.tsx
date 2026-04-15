import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PREFERRED_LOCALE_COOKIE,
  resolveRequestLocale,
} from "@/lib/i18n";
import { modulePath } from "@/lib/routes";

export default async function LegacyModuleRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveRequestLocale(
    cookieStore.get(PREFERRED_LOCALE_COOKIE)?.value,
    headerStore.get("accept-language"),
  );

  redirect(modulePath(locale, slug));
}
