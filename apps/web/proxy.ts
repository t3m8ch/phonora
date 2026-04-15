import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  PREFERRED_LOCALE_COOKIE,
  resolveRequestLocale,
} from "@/lib/i18n";
import { localeFromPathname } from "@/lib/routes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPathname(pathname);

  if (pathname === "/") {
    const locale = resolveRequestLocale(
      request.cookies.get(PREFERRED_LOCALE_COOKIE)?.value,
      request.headers.get("accept-language"),
    );
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(PREFERRED_LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  if (pathLocale) {
    requestHeaders.set("x-phonora-locale", pathLocale);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (pathLocale) {
    response.cookies.set(PREFERRED_LOCALE_COOKIE, pathLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
