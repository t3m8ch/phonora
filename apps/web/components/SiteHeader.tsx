"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { AuthoringModeToggle } from "@/components/AuthoringModeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DEFAULT_LOCALE, getDictionary } from "@/lib/i18n";
import { coursePath, localeFromPathname } from "@/lib/routes";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname) ?? DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <header className="siteHeader">
      <Link href={coursePath(locale)} className="brand">
        <span className="brandMark">Ph</span>
        <span>
          <strong>Phonora</strong>
          <small>{dictionary.nav.brandTagline}</small>
        </span>
      </Link>
      <div className="siteHeaderActions">
        <nav className="siteNav">
          <Link href={coursePath(locale)}>{dictionary.nav.course}</Link>
        </nav>
        <LanguageSwitcher locale={locale} />
        <AuthoringModeToggle dictionary={dictionary} />
      </div>
    </header>
  );
}
