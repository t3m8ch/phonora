import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PREFERRED_LOCALE_COOKIE,
  resolveRequestLocale,
} from "@/lib/i18n";
import { coursePath } from "@/lib/routes";

export default async function RootRedirectPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveRequestLocale(
    cookieStore.get(PREFERRED_LOCALE_COOKIE)?.value,
    headerStore.get("accept-language"),
  );

  redirect(coursePath(locale));
}
