import type { Locale } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export const coursePath = (locale: Locale) => `/${locale}`;

export const statsPath = (locale: Locale) => `/${locale}/stats`;

export const modulePath = (locale: Locale, slug: string) => `/${locale}/modules/${slug}`;

export const lessonPath = (locale: Locale, moduleSlug: string, lessonSlug: string) =>
  `/${locale}/learn/${moduleSlug}/${lessonSlug}`;

export function switchLocaleInPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return coursePath(locale);
  }

  if (isLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return `/${[locale, ...segments].join("/")}`;
}

export function localeFromPathname(pathname: string): Locale | null {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  return isLocale(firstSegment) ? firstSegment : null;
}

export function fallbackLocalePath(pathname: string) {
  return switchLocaleInPath(pathname, DEFAULT_LOCALE);
}
