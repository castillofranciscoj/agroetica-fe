'use client';

import Link                 from 'next/link';
import { useState }         from 'react';
import { useLanguage }      from './LanguageContext';
import Logo                 from './Logo';
import { t }                from '@/i18n';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react';
import LanguagePicker       from './LanguagePicker';

export default function MarketingHeader() {
  const { lang } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <header
      className="fixed top-0 left-0 right-0 bg-white shadow z-50 h-[54px]"
      style={{ '--header-height': '54px' } as React.CSSProperties}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo + subtitle */}
        <Link href="/" className="flex items-center space-x-4">
          <Logo />
          <span className="text-sm text-gray-600">
            {t[lang].marketingSubtitle}
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex space-x-6 text-sm">
          <Link href="/product"  className="hover:underline">
            {t[lang].productNavLabel}
          </Link>
          <Link href="/about"    className="hover:underline">
            {t[lang].aboutLabel}
          </Link>
          <Link href="/pricing"  className="hover:text-green-600">
            {t[lang].navPricing}
          </Link>
          <Link href="/news"     className="hover:underline">
            {t[lang].blogLabel}
          </Link>
        </nav>

        {/* desktop right controls */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguagePicker />
          <Link href="/portal">
            <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600">
              {t[lang].portalButtonLabel}
            </button>
          </Link>
        </div>

        {/* mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* ───────── mobile menu ───────── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[54px] left-0 right-0 bg-white shadow-md z-10">
          <nav className="flex flex-col space-y-2 p-4">
            <Link href="/product" onClick={() => setMobileOpen(false)} className="text-sm hover:underline">
              {t[lang].productNavLabel}
            </Link>
            <Link href="/about"   onClick={() => setMobileOpen(false)} className="text-sm hover:underline">
              {t[lang].aboutLabel}
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="text-sm hover:text-green-600">
              {t[lang].navPricing}
            </Link>
            <Link href="/news"    onClick={() => setMobileOpen(false)} className="text-sm hover:underline">
              {t[lang].blogLabel}
            </Link>
            <Link href="/portal"  onClick={() => setMobileOpen(false)}>
              <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600 w-full mt-2">
                {t[lang].portalButtonLabel}
              </button>
            </Link>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <LanguagePicker
              mobile
              onAfterSelect={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
