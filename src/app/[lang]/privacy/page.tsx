// src/app/privacy/page.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* ------------- MAIN ------------- */}
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-3xl font-bold">
          {t[lang].privacyPolicyTitle}
        </h1>

        <p>{t[lang].privacyPolicyIntro}</p>

        <h2 className="text-2xl font-semibold">
          {t[lang].infoWeCollectTitle}
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].infoWeCollectPersonalIdentifiers}</li>
          <li>{t[lang].infoWeCollectAuthData}</li>
          <li>{t[lang].infoWeCollectUsageData}</li>
        </ul>

        <h2 className="text-2xl font-semibold">
          {t[lang].howWeUseTitle}
        </h2>
        <p>{t[lang].howWeUseIntro}</p>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].howWeUseProvideMaintain}</li>
          <li>{t[lang].howWeUseAuthenticate}</li>
          <li>{t[lang].howWeUseImprovePersonalize}</li>
          <li>{t[lang].howWeUseCommunicate}</li>
        </ul>

        <h2 className="text-2xl font-semibold">
          {t[lang].sharingTitle}
        </h2>
        <p>{t[lang].sharingIntro}</p>
        <ul className="list-disc list-inside space-y-2">
          <li>{t[lang].sharingServiceProviders}</li>
          <li>{t[lang].sharingOAuth}</li>
          <li>{t[lang].sharingLawEnforcement}</li>
        </ul>

        <h2 className="text-2xl font-semibold">
          {t[lang].choicesTitle}
        </h2>
        <p>
          {t[lang].choicesDescription}{' '}
          <a href="mailto:ciao@agroetica.com" className="underline">
            ciao@agroetica.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold">
          {t[lang].cookiesTitle}
        </h2>
        <p>{t[lang].cookiesDescription}</p>

        <h2 className="text-2xl font-semibold">
          {t[lang].changesTitle}
        </h2>
        <p>{t[lang].changesDescription}</p>

        <p className="text-sm text-gray-500">
          {t[lang].privacyPolicyLastUpdatedLabel}{' '}
          {new Date().toLocaleDateString()}
        </p>

      </main>

      {/* ------------- FOOTER ------------- */}
      <Footer />
    </div>
  );
}
