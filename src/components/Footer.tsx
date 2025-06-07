// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

import NewsletterSignup from '@/components/NewsletterSignup';
import CookiesBanner    from '@/components/CookiesBanner';

/**
 * Site footer:
 * • contact block
 * • navigation column
 * • useful-links column
 * • newsletter signup
 * • cookies banner
 */
export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-gray-100 overflow-visible">
      {/* ───────── top grid ───────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 p-6">
        {/* ——— Contact block ————————————————— */}
        <div
          className="bg-white p-6 rounded shadow relative z-10 lg:-translate-y-12"
        >
          <div className="mb-4">
            <Logo />
          </div>
          <p className="flex items-center mb-2">
            <span className="mr-2">📍</span> Cianciana&nbsp;(AG), Sicily, Italy
          </p>
          <p className="flex items-center mb-2">
            <span className="mr-2">📞</span> +39&nbsp;334&nbsp;192&nbsp;4062
          </p>
          <p className="flex items-center">
            <span className="mr-2">✉️</span>
            <a href="mailto:ciao@agroetica.com" className="hover:underline">
              ciao@agroetica.com
            </a>
          </p>
        </div>

        {/* ——— Navigation links ——————————— */}
        <div className="min-w-0">
          <h3 className="font-semibold mb-4">{t[lang].navigationLabel}</h3>
          <ul className="space-y-2">
            <li><Link href="/"        className="hover:underline">{t[lang].homeLabel}</Link></li>
            <li><Link href="/product" className="hover:underline">{t[lang].productNavLabel}</Link></li>
            <li><Link href="/about"   className="hover:underline">{t[lang].aboutLabel}</Link></li>
            <li><Link href="/pricing" className="hover:text-green-600">{t[lang].navPricing}</Link></li>
            <li><Link href="/news"    className="hover:underline">{t[lang].blogLabel}</Link></li>
            <li><Link href="/portal"  className="hover:underline">{t[lang].portalButtonLabel}</Link></li>
          </ul>
        </div>

        {/* ——— Useful links ————————————— */}
        <div className="min-w-0">
          <h3 className="font-semibold mb-4">{t[lang].usefulLinksLabel}</h3>
          <ul className="space-y-2">
            <li><Link href="/careers" className="hover:underline">{t[lang].careersTitle}</Link></li>
            <li><Link href="/privacy" className="hover:underline">{t[lang].privacyPolicyLabel}</Link></li>
          </ul>
        </div>

        {/* ——— Newsletter ——————————————— */}
        <NewsletterSignup />
      </div>

      {/* ——— Cookies banner ———————————— */}
      <CookiesBanner />
    </footer>
  );
}
