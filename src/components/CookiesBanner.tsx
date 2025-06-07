// src/components/CookiesBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function CookiesBanner() {
  const { lang } = useLanguage();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookiesAccepted')) setShow(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookiesAccepted', 'all');
    setShow(false);
  };
  const deny = () => {
    localStorage.setItem('cookiesAccepted', 'denied');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-white border-t p-4 text-sm">
      <p className="max-w-4xl mx-auto mb-2">{t[lang].cookiesBannerText}</p>
      <div className="space-x-2">
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={acceptAll}>
          {t[lang].acceptAllLabel}
        </button>
        <button className="px-3 py-1 bg-gray-300 rounded" onClick={deny}>
          {t[lang].denyLabel}
        </button>
        <Link href="/cookies-settings" className="underline">
          {t[lang].settingsLabel}
        </Link>
      </div>
    </div>
  );
}
