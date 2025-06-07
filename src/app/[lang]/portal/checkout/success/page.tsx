'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function CheckoutSuccess() {
  const { lang } = useLanguage();

  /* one-shot confetti */
  useEffect(() => {
    confetti();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center text-center">
      {/* ── Hero banner ───────────────────────────────────────────── */}
      <div className="relative w-full h-48 md:h-64">
        <Image
          src="/img/agroetica-success-subscription-banner.jpg"
          alt="Subscription success banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* ── Confirmation card (no overlap) ───────────────────────── */}
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center max-w-lg w-[90%] mt-8">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />

        <h1 className="text-3xl font-extrabold mb-2 text-green-600">
          {t[lang].checkoutSuccessTitle}
        </h1>

        <p className="text-gray-700 mb-8">
          {t[lang].checkoutSuccessSubtitle}
        </p>

        <a
          href="/portal"
          className="inline-block bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
        >
          {t[lang].checkoutReturnButton}
        </a>
      </div>
    </div>
  );
}
