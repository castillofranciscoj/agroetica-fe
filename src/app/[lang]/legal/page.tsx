// src/app/[lang]/legal/page.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* ------------- MAIN ------------- */}
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold">
          {t[lang].termsTitle}
        </h1>

        {/* INTRO */}
        <p>{t[lang].termsIntro}</p>

        {/* DEFINITIONS */}
        <h2 className="text-2xl font-semibold">
          {t[lang].definitionsTitle}
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].definitionsApp}</li>
          <li>{t[lang].definitionsData}</li>
          <li>{t[lang].definitionsPersonalData}</li>
          <li>{t[lang].definitionsService}</li>
          <li>{t[lang].definitionsSoftware}</li>
          <li>{t[lang].definitionsUser}</li>
        </ul>

        {/* SERVICE DESCRIPTION */}
        <h2 className="text-2xl font-semibold">
          {t[lang].serviceDescriptionTitle}
        </h2>
        <p>{t[lang].serviceDescriptionText1}</p>
        <p>{t[lang].serviceDescriptionText2}</p>

        {/* REGISTRATION */}
        <h2 className="text-2xl font-semibold">
          {t[lang].registrationTitle}
        </h2>
        <p>{t[lang].registrationText1}</p>
        <p>{t[lang].registrationText2}</p>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].registrationStep1}</li>
          <li>{t[lang].registrationStep2}</li>
          <li>{t[lang].registrationStep3}</li>
        </ul>

        {/* SERVICE LIMITS */}
        <h2 className="text-2xl font-semibold">
          {t[lang].serviceLimitsTitle}
        </h2>
        <p>{t[lang].serviceLimitsText1}</p>
        <p>{t[lang].serviceLimitsText2}</p>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].serviceLimitsItem1}</li>
          <li>{t[lang].serviceLimitsItem2}</li>
          <li>{t[lang].serviceLimitsItem3}</li>
        </ul>

        {/* USER COMMITMENTS */}
        <h2 className="text-2xl font-semibold">
          {t[lang].userCommitmentsTitle}
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].userCommitmentsItem1}</li>
          <li>{t[lang].userCommitmentsItem2}</li>
          <li>{t[lang].userCommitmentsItem3}</li>
        </ul>

        {/* LIABILITY */}
        <h2 className="text-2xl font-semibold">
          {t[lang].liabilityTitle}
        </h2>
        <p>{t[lang].liabilityText1}</p>
        <p>{t[lang].liabilityText2}</p>

        {/* LICENCE */}
        <h2 className="text-2xl font-semibold">
          {t[lang].licenseTitle}
        </h2>
        <p>{t[lang].licenseText}</p>

        {/* PAYMENTS */}
        <h2 className="text-2xl font-semibold">
          {t[lang].paymentsTitle}
        </h2>
        <p>{t[lang].paymentsText}</p>

        {/* UPDATES */}
        <h2 className="text-2xl font-semibold">
          {t[lang].updatesTitle}
        </h2>
        <p>{t[lang].updatesText}</p>

        {/* TERMINATION */}
        <h2 className="text-2xl font-semibold">
          {t[lang].terminationTitle}
        </h2>
        <p>{t[lang].terminationText}</p>

        {/* APPLICABLE LAW */}
        <h2 className="text-2xl font-semibold">
          {t[lang].applicableLawTitle}
        </h2>
        <p>{t[lang].applicableLawText}</p>

        {/* LAST UPDATED */}
        <p className="text-sm text-gray-500">
          {t[lang].termsLastUpdatedLabel}{' '}
          {new Date().toLocaleDateString()}
        </p>
      </main>

      {/* ------------- FOOTER ------------- */}
      <Footer />
    </div>
  );
}
