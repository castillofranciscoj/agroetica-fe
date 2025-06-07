/* ──────────────────────────────────────────────────────────────
   src/components/JourneySidebar.tsx
──────────────────────────────────────────────────────────────── */
'use client';

import Link                    from 'next/link';
import * as React              from 'react';
import { usePathname }         from 'next/navigation';
import * as Icons              from 'lucide-react';

import { useLanguage }         from '@/components/LanguageContext';
import { t }                   from '@/i18n';
import { NAV_SECTIONS }        from '@/constants/navItems';

interface JourneySidebarProps {
  farms           : { id: string; name: string }[];
  selectedFarmId? : string;
  onSelectFarm?   : (id: string) => void;
  isAdmin         : boolean;
  isPartner       : boolean;
}

export default function JourneySidebar({
  farms,
  selectedFarmId,
  onSelectFarm,
  isAdmin,
  isPartner,
}: JourneySidebarProps) {
  const { lang } = useLanguage();

  /* strip locale prefix from pathname */
  const pathnameWithLocale = usePathname();
  const pathname = pathnameWithLocale.replace(
    /^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/,
    ''
  );

  /* ───────── helpers ───────── */

  const linkClass = (active: boolean) =>
    `flex items-center w-full text-left px-3 py-1 rounded transition-colors ${
      active
        ? 'bg-green-50 text-green-700'
        : 'hover:bg-gray-100 hover:text-gray-800'
    }`;

  /* filter sections per role */
  const visibleSections = NAV_SECTIONS.filter(
    s =>
      (isAdmin   || s.titleKey !== 'adminSectionTitle') &&
      (isPartner || s.titleKey !== 'referralSectionTitle'),
  );

  /* find the single longest-matching href */
  let activeHref: string | null = null;
  visibleSections.forEach(sec =>
    sec.items.forEach(it => {
      if (
        pathname === it.href ||
        pathname === it.href + '/' ||
        pathname.startsWith(it.href + '/')
      ) {
        if (!activeHref || it.href.length > activeHref.length) {
          activeHref = it.href;
        }
      }
    }),
  );

  /* ───────── render ───────── */
  return (
    <nav className="w-64 bg-white h-screen sticky top-0 overflow-y-auto">
      {/* FARM SELECTOR -------------------------------------------------- */}
      <div className="px-4 pt-4 pb-3 border-b">
        <label
          htmlFor="sidebar-farm-select"
          className="block text-xs font-semibold text-gray-500 uppercase mb-1"
        >
          {t[lang].farmLabel ?? 'Farm'}
        </label>
        <select
          id="sidebar-farm-select"
          className="w-full border rounded px-2 py-1 text-sm"
          value={selectedFarmId ?? ''}
          onChange={e => onSelectFarm?.(e.target.value || '')}
        >
          <option value="">{t[lang].allFarms ?? '— All farms —'}</option>
          {farms.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* NAVIGATION ----------------------------------------------------- */}
      <ul className="p-4 space-y-1">
        {visibleSections.map(section => (
          <React.Fragment key={section.titleKey || 'loose'}>
            {section.titleKey && (
              <li className="px-3 py-1 text-xs font-semibold uppercase text-gray-400">
                {t[lang][section.titleKey]}
              </li>
            )}

            {section.items.map(item => {
              const Icon =
                // @ts-expect-error dynamic icon name
                (Icons as unknown)[item.icon] || Icons.Circle;
              const isActive = item.href === activeHref;

              return (
                <li key={item.key}>
                  <Link href={item.href} className={linkClass(isActive)}>
                    <Icon
                      className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        isActive ? 'text-green-600' : 'text-gray-500'
                      }`}
                    />
                    <span className="flex-grow text-sm truncate">
                      {t[lang][item.labelKey]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
}
