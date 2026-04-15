"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DEFAULT_LOCALE,
  getDictionary,
  PREFERRED_LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n";
import { localeFromPathname, switchLocaleInPath } from "@/lib/routes";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const activeLocale = localeFromPathname(pathname) ?? locale ?? DEFAULT_LOCALE;
  const dictionary = getDictionary(activeLocale);

  return (
    <div className="languageSwitcher" aria-label={dictionary.languageSwitcher.label}>
      {(["en", "ru"] as const).map((targetLocale) => {
        const active = targetLocale === activeLocale;

        return (
          <Link
            key={targetLocale}
            href={switchLocaleInPath(pathname, targetLocale)}
            className={`langButton ${active ? "active" : ""}`}
            hrefLang={targetLocale}
            onClick={() => {
              document.cookie = `${PREFERRED_LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
            }}
          >
            {targetLocale === "en"
              ? dictionary.languageSwitcher.english
              : dictionary.languageSwitcher.russian}
          </Link>
        );
      })}
    </div>
  );
}
