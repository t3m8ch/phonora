import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PREFERRED_LOCALE_COOKIE,
  resolveRequestLocale,
} from "@/lib/i18n";
import { lessonPath } from "@/lib/routes";

export default async function LegacyLessonRedirect({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveRequestLocale(
    cookieStore.get(PREFERRED_LOCALE_COOKIE)?.value,
    headerStore.get("accept-language"),
  );

  redirect(lessonPath(locale, moduleSlug, lessonSlug));
}
