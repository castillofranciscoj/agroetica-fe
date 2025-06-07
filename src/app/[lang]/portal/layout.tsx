// src/app/[lang]/portal/layout.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';

import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { GET_USER_FIELDS } from '@/graphql/operations';

/* ------------------------------------------------------------------ */
/*  Root layout for everything under “…/portal*”                      */
/* ------------------------------------------------------------------ */
export default function RootPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ----------  Hooks ---------- */
  const router       = useLocaleRouter();         // locale-aware push/replace
  const pathname     = usePathname();             // e.g. `/it/portal`
  const searchParams = useSearchParams();         // preserves ?phase=…
  const { status, data: session } = useSession(); // Next-Auth session

  /* Strip optional locale prefix so comparisons are easier */
  const pathNoLocale = pathname.replace(
    /^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/,
    '',
  );

  /* ──────────────────────────────────────────────────────────────── */
  /*  1 ▸ AUTH-GATE                                                 */
  /*     – Wait until status is final.                              */
  /*     – If unauthenticated and not on a public portal route,     */
  /*       redirect to login and preserve the requested URL.        */
  /* ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (status !== 'unauthenticated') return; // still loading or logged-in

    /* Public routes that do NOT require auth */
    if (pathNoLocale.startsWith('/portal/login')) return;

    /* Kick everything else to /portal/login, carrying “next” param */
    const back = `${pathname}${
      searchParams.toString() ? `?${searchParams}` : ''
    }`;

    router.replace(
      router.localeHref(`/portal/login?next=${encodeURIComponent(back)}`),
    );
  }, [status, pathname, pathNoLocale, searchParams, router]);

  /* ──────────────────────────────────────────────────────────────── */
  /*  2 ▸ EXISTING “register land” redirect (unchanged logic)        */
  /* ──────────────────────────────────────────────────────────────── */
  const userId = session?.user?.id;
  const phase  = searchParams.get('phase');

  const { data } = useQuery(GET_USER_FIELDS, {
    variables  : { userId },
    skip       : !userId || status !== 'authenticated',
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (
      status === 'authenticated' &&
      pathNoLocale === '/portal' &&
      phase === 'registerLand' &&
      data?.fields?.length
    ) {
      router.replace(`/portal/lands/${data.fields[0].id}`);
    }
  }, [status, pathNoLocale, phase, data, router]);

  /* ──────────────────────────────────────────────────────────────── */
  /*  3 ▸ RENDER                                                    */
  /*     – While Next-Auth is still finding the session, show null  */
  /*       (swap for a spinner component if preferred).             */
  /* ──────────────────────────────────────────────────────────────── */
  if (status === 'loading') return null; // or <FullScreenSpinner />

  return <>{children}</>;
}
