// middleware.ts
import { GRAPHQL_MAX_INT } from 'graphql';
import { NextResponse, type NextRequest } from 'next/server';

/* ─── helper types ─── */
type GeoRequest = NextRequest & {
  geo?: { country?: string };
};

const VALID = ['en', 'it', 'es', 'fr','pt', 'de','da','nl','pl','gr'] as const;
type Lang = (typeof VALID)[number];

/* ────────────────────────────────────────────────────────────── */

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;
  const geo = (request as GeoRequest).geo;

  /* 1 ─ skip assets & already-prefixed paths */
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')   ||
    /^\/(?:en|it|es|fr|pt|de|da|nl|pl|gr)(\/|$)/.test(pathname)
  ) {
    return NextResponse.next();
  }

  /* 2 ─ cookie wins if valid */
  const cookieLang = request.cookies.get('lang')?.value as Lang | undefined;
  if (cookieLang && VALID.includes(cookieLang)) {
    nextUrl.pathname = `/${cookieLang}${pathname}`;
    return NextResponse.redirect(nextUrl);
  }

  /* 3 ─ geo fallback (production) */
  const COUNTRY_TO_LOCALE: Record<string, Lang> = {
    IT: 'it',
    ES: 'es',
    AR: 'es',
    FR: 'fr',
    PT: 'pt',
    DE: 'de',
    DA: 'da',
    NL: 'nl',
    PL: 'pl',
    GR: 'gr',
  };
  const country = geo?.country || request.headers.get('x-vercel-ip-country') || '';

  /* 4 ─ Accept-Language fallback (development) */
  const accept  = request.headers.get('accept-language') ?? '';
  const browser = accept.split(',')[0]?.split('-')[0]?.toLowerCase() as Lang | '';

  const locale =
    COUNTRY_TO_LOCALE[country] ??
    (browser === 'it' || browser === 'fr' || browser === 'es' || browser === 'pt'  || browser === 'de' || browser === 'da' || browser === 'nl' || browser === 'pl'  || browser === 'gr'  ? browser : 'en');

  nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(nextUrl);
}

/* apply to everything except Next internals & static assets */
export const config = {
  matcher: '/((?!_next|favicon.ico|robots.txt|images|fonts).*)',
};
