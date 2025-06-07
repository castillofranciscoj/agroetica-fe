// src/components/ComplianceCtaBanner.tsx
// Mid-scroll CTA focused on the 2026 EU digital-logbook mandate
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

const ComplianceCtaBanner: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <section className="w-full bg-amber-600 text-center py-12 text-white px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        {t[lang].complianceCtaHeading}
      </h2>

      <p className="mb-6 max-w-3xl mx-auto text-white/90">
        {t[lang].complianceCtaSub}
      </p>

      {/* animated button (same style as hero / CtaBanner) */}
      <Link
        href="/portal"                               /* locale prefix handled by Next */
        className="
          group inline-flex items-center justify-center
          bg-white text-amber-700 font-semibold
          px-8 py-3 rounded-lg shadow
          transition transform duration-200 ease-out
          hover:scale-105 hover:bg-gray-100 focus:outline-none
        "
      >
        {t[lang].complianceCtaButton}

        <ArrowRight
          size={30}
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

export default ComplianceCtaBanner;
