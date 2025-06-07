// CtaBanner.tsx – reusable full-width call-to-action banner
'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

const CtaBanner: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <section className="w-full bg-green-600 text-center py-12 text-white">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 px-4">
        {t[lang].ctaBannerHeading}
      </h2>

      {/* animated button – identical to hero CTA */}
      <Link
        href="/portal"                                /* locale prefix auto-added by Next */
        className="
          group inline-flex items-center justify-center
          bg-white text-green-700 font-semibold
          px-8 py-3 rounded-lg shadow
          transition transform duration-200 ease-out
          hover:scale-105 hover:bg-gray-100 focus:outline-none
        "
      >
        {t[lang].ctaBannerButton}

        <ArrowRight
          size={28}                                   /* bigger arrow */
          className="
            ml-0 w-0 opacity-0
            transition-all duration-200 ease-out
            group-hover:ml-3 group-hover:w-6 group-hover:opacity-100
          "
        />
      </Link>
    </section>
  );
};

export default CtaBanner;
