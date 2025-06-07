'use client';

import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function CheckoutError() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-extrabold mb-4 text-red-600">
        {t[lang].checkoutErrorTitle}
      </h1>
      <p className="text-lg text-gray-700 text-center mb-8">
        {t[lang].checkoutErrorSubtitle}
      </p>
      <a
        href="/pricing"
        className="bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700"
      >
        {t[lang].checkoutReturnButton}
      </a>
    </div>
  );
}

