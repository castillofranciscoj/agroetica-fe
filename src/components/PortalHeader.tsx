// src/components/PortalHeader.tsx
'use client';

import Link                     from 'next/link';
import { useState }             from 'react';
import { useLanguage }          from './LanguageContext';
import Logo                     from './Logo';
import { t }                    from '@/i18n';
import {
  User as UserIcon,
  Menu as MenuIcon,
  X    as XIcon,
}                               from 'lucide-react';
import { useSession, signOut }  from 'next-auth/react';
import { usePathname }          from 'next/navigation';
import MessageBell              from '@/components/MessageBell';
import LanguagePicker           from './LanguagePicker';
import { useLocaleRouter }      from '@/lib/useLocaleRouter';

export default function PortalHeader() {
  /* ─────────────  Hooks (ALWAYS in the same order)  ───────────── */
  const { lang }        = useLanguage();          // #1
  const router          = useLocaleRouter();      // #2
  const pathname        = usePathname();          // #3
  const [mobileOpen,  setMobileOpen]  = useState(false); // #4
  const [profileOpen, setProfileOpen] = useState(false); // #5
  const { data: session } = useSession();         // #6

  /* ─────────────  Derived flags  ───────────── */
  const isLoginRoute = /^\/(?:en|it|es|fr|pt|de|da|nl|pl|gr)?\/?portal\/login\/?$/.test(
    pathname,
  );

  /* 👉  Nothing at all on the login page (hooks already executed) */
  if (isLoginRoute) return null;

  /* ───────────────────────────────────────────────────────────── */
  /*  Normal header below                                         */
  /* ───────────────────────────────────────────────────────────── */
  return (
    <header className="fixed top-0 left-0 right-0 h-[54px] bg-white shadow z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* logo + subtitle */}
        <Link href="/portal" className="flex items-center space-x-4">
          <Logo />
          <span className="text-sm text-gray-600">
            {t[lang].farmerPortalLabel}
          </span>
        </Link>

        {/* desktop nav (chat link kept for future use) */}
        <nav className="hidden md:flex space-x-6 text-sm">
          <Link href="/portal/chat" className="hover:underline">
            {/* {t[lang].chatLabel} */}
          </Link>
        </nav>

        {/* right controls */}
        <div className="hidden md:flex items-center space-x-4">
          <MessageBell />
          <LanguagePicker />

          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center space-x-1 p-1 rounded hover:bg-gray-100"
            >
              <UserIcon size={20} />
              <svg
                className={`w-3 h-3 text-gray-600 transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg z-60">
                <div className="px-4 py-2 text-sm border-b truncate">
                  {session?.user?.name ?? session?.user?.email}
                </div>
                <button
                  onClick={() =>
                    signOut({ callbackUrl: router.localeHref('/portal/login') })
                  }
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {t[lang].logoutLabel}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* mobile burger */}
        <button
          onClick={() => {
            setMobileOpen(o => !o);
            setProfileOpen(false);
          }}
          className="md:hidden p-2 rounded hover:bg-gray-100"
        >
          {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[54px] left-0 right-0 bg-white shadow-md z-50">
          <nav className="flex flex-col space-y-2 p-4" />
          <div className="border-t border-gray-200 p-4 space-y-2">
            <LanguagePicker mobile onAfterSelect={() => setMobileOpen(false)} />
            <div className="pt-2">
              <div className="px-2 py-1 text-sm">
                {session?.user?.name ?? session?.user?.email}
              </div>
              <button
                onClick={() => {
                  signOut({ callbackUrl: router.localeHref('/portal/login') });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                {t[lang].logoutLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
