// src/app/[lang]/portal/(main)/layout.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery }       from '@apollo/client';
import { useSession }     from 'next-auth/react';
import { usePathname }    from 'next/navigation';
import { useLanguage }    from '@/components/LanguageContext';
import { useLocaleRouter } from '@/lib/useLocaleRouter';

import {
  GET_DASHBOARD,
  GET_FARMS,
  CHECK_PARTNER_MEMBERSHIP,              /* ★ NEW */
}                        from '@/graphql/operations';

import * as Icons        from 'lucide-react';
import { t }             from '@/i18n';

import JourneySidebar    from '@/components/JourneySidebar';
import { NAV_SECTIONS }  from '@/constants/navItems';

import Dashboard         from '@/components/Dashboard';
import dynamic           from 'next/dynamic';
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

/* ───────────── localStorage patch for farm-change event ───────────── */
declare global { interface Window { __farmPatch?: true } }
const FARM_EVT = 'portal:selectedFarmIdChange';

if (typeof window !== 'undefined' && !window.__farmPatch) {
  const original = window.localStorage.setItem;

  // ✅ 1) use rest-params (no more unused `val`, no more `arguments`)
  window.localStorage.setItem = function (...args) {
    const [key] = args as [string, ...unknown[]];
    original.apply(this, args as unknown);
    if (key === 'selectedFarmId') {
      window.dispatchEvent(new Event(FARM_EVT));
    }
  };

  window.__farmPatch = true;
}

/* ========================================================================= */
/*  LAYOUT                                                                   */
/* ========================================================================= */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { lang }          = useLanguage();
  const router            = useLocaleRouter();
  const userId            = session?.user?.id;
  const isAdmin           = !!session?.user?.isAdmin;

  const [open, setOpen]   = useState(true);
  const previousOpen      = useRef(true);

  /* -------------------------------------------------- route helpers ---- */
  /* -------------------------------------------------- route helpers ---- */
  const pathnameWithLocale = usePathname();                 // e.g. /en/portal/…
  const pathNoLocale = pathnameWithLocale.replace(
    /^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/,
    ''
  );

  const isDashboard  = pathNoLocale === '/portal';
  const isMapView    = pathNoLocale.startsWith('/portal/map');
  const isFieldView  = pathNoLocale.startsWith('/portal/fields');

  /* -------------------------------------------------- farms ------------- */
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : localStorage.getItem('selectedFarmId') || undefined,
  );

  /* persist farm selection */
  useEffect(() => {
    if (selectedFarmId !== undefined) {
      localStorage.setItem('selectedFarmId', selectedFarmId);
    }
  }, [selectedFarmId]);

  /* refresh when farm changes (this tab or other tabs) */
  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(FARM_EVT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(FARM_EVT, refresh);
    };
  }, [router]);

  /* -------------------------------------------------- sidebar collapse -- */
  useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

    // 1. remember the last manual state while *not* on map / field routes
    useEffect(() => {
      if (!isFieldView && !isMapView) {
        previousOpen.current = open;
      }
    }, [open, isFieldView, isMapView]);

    // 2. collapse / restore when the route type changes
    useEffect(() => {
      if (isFieldView || isMapView) {
        setOpen(false);
      } else {
        setOpen(previousOpen.current);
      }
    }, [isFieldView, isMapView]);

  /* -------------------------------------------------- queries ----------- */
  const { data: dashData, loading: dLoading, error: dError } = useQuery(
    GET_DASHBOARD,
    { fetchPolicy: 'network-only' },
  );

  const { data: farmsData } = useQuery(GET_FARMS, {
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  /* is this user a referral-partner? ----------------------------------- */
  const { data: partnerData } = useQuery(CHECK_PARTNER_MEMBERSHIP, {
    variables  : userId ? { userId } : undefined,
    skip       : !userId,
    fetchPolicy: 'cache-first',
  });
  const isPartner = (partnerData?.memberships?.length ?? 0) > 0;

  /* -------------------------------------------------- loading / error --- */
  if (dLoading) {
    return <p className="p-6">{t[lang].loadingDashboard}</p>;
  }
  if (dError) {
    return (
      <p className="p-6 text-red-600">
        {t[lang].errorLoadingDashboard}
      </p>
    );
  }

  /* ========================================================================= */
  /*  RENDER                                                                   */
  /* ========================================================================= */
  return (
    <div className="flex h-screen">
      {/* ──────────────────────── Sidebar ─────────────────────────────── */}
      <aside
        className={`bg-white transition-all duration-200 ${open ? 'w-64' : 'w-16'}`}
        style={{
          position  : 'sticky',
          top       : 'var(--header-gap)',
          height    : 'calc(100vh - var(--header-gap))',
          alignSelf : 'flex-start',
        }}
      >
        {/* collapse / expand btn */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            className="fixed z-40 left-2 transition
                       hover:bg-green-50 hover:text-green-700 active:scale-95"
            style={{ top: 'calc(var(--header-gap) + 0.25rem)' }}
          >
            {open ? <Icons.ChevronLeft size={22} /> : <Icons.Menu size={22} />}
          </button>
        </div>

        {open ? (
          /* expanded sidebar */
          <nav className="overflow-y-auto h-full">
            <JourneySidebar
              farms={farmsData?.farms ?? []}
              selectedFarmId={selectedFarmId}
              onSelectFarm={id => setSelectedFarmId(id || undefined)}
              isAdmin={isAdmin}
              isPartner={isPartner}         
            />
          </nav>
        ) : (
          /* collapsed sidebar */
          <div className="p-2 space-y-2">
            {/*
              -------------------------------------------------------------
              Build a flat list of visible items, then pick the single
              href that best matches the current path (longest match).
            */}
            {(() => {
              const visibleItems = NAV_SECTIONS
                .filter(sec =>
                  (isAdmin   || sec.titleKey !== 'adminSectionTitle') &&
                  (isPartner || sec.titleKey !== 'referralSectionTitle')
                )
                .flatMap(sec => sec.items);

              let activeHref: string | null = null;
              visibleItems.forEach(it => {
                if (
                  pathNoLocale === it.href ||
                  pathNoLocale === it.href + '/' ||
                  pathNoLocale.startsWith(it.href + '/')
                ) {
                  if (!activeHref || it.href.length > activeHref.length) {
                    activeHref = it.href;
                  }
                }
              });

              return visibleItems.map(item => {
                const Icon = (Icons as unknown)[item.icon] || Icons.Circle;
                const active = item.href === activeHref;

                return (
                  <button
                    key={item.key}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-center p-2 rounded hover:bg-gray-100 ${
                      active ? 'bg-green-100 text-green-700' : ''
                    }`}
                    title={t[lang][item.labelKey]}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              });
            })()}
          </div>
        )}
      </aside>

      {/* ─────────────────────── Main content ─────────────────────────── */}
      <main
        className={`flex-1 overflow-auto ${
          isFieldView || isMapView ? '' : 'px-6 pb-6'
        }`}
        style={{
          paddingTop: isFieldView || isMapView ? 0 : 'var(--header-gap-lg)',
        }}
      >
        {isFieldView ? (
          children                       /* /portal/fields/[id] */
        ) : isMapView ? (
          <MapView />                    /* /portal/map          */
        ) : isDashboard ? (
          <Dashboard data={dashData} />  /* /portal              */
        ) : (
          children                       /* every other route    */
        )}
      </main>
    </div>
  );
}
