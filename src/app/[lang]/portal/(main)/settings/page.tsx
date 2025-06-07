'use client';

export const dynamic = 'force-dynamic';

import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import SubscriptionsPanel from '@/components/SubscriptionsPanel';
import SubscriptionCards from '@/components/SubscriptionCards';





export default function SettingsPage() {
  const { lang } = useLanguage();

  return (
    <div className="p-6 space-y-10 max-w-3xl mx-auto">
      {/* ———  Title  ——————————————————————————— */}
      <header>
        <h1 className="text-3xl font-extrabold">
          {t[lang].settingsHeading ?? 'Settings'}
        </h1>
        <p className="text-gray-600 mt-2">
          {t[lang].settingsSubtitle ??
            'Manage your organisation, subscriptions and more.'}
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {t[lang].subscriptionsHeading ?? 'Subscriptions'}
        </h2>
        <SubscriptionCards />
      </section>


      

      {/* Placeholder for other settings sections */}
      {/* <section>…</section> */}
    </div>
  );
}
