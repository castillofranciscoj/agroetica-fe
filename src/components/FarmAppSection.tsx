'use client';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

/** title-key → emoji helper */
const FEATURE_EMOJIS: Record<string, string> = {
  featureDigitalLogbookTitle: '📒',
  featureSmartAlertsTitle:    '🔔',
  featureNDVITitle:           '🛰️',
  featureOpenAPITitle:        '🔗',
  featureCarbonPackTitle:     '♻️',
};

export default function FarmAppSection() {
  const { lang } = useLanguage();

  /* build the list from i18n keys so it‘s 100 % localised */
  const featureKeys = [
    'featureDigitalLogbookTitle',
    'featureSmartAlertsTitle',
    'featureNDVITitle',
    'featureOpenAPITitle',
    'featureCarbonPackTitle',
  ] as const;

  return (
    <section className="bg-orange-50 py-16 px-6">
      {/* heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
        {t[lang].onePlatformHeading /* ← add in your i18n */ ?? 'One platform to manage your farm'}
      </h2>

      {/* two-column layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* FEATURES LIST */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {featureKeys.map((key) => (
            <li key={key} className="flex items-center space-x-3">
              <span className="text-2xl">{FEATURE_EMOJIS[key]}</span>
              <span className="font-medium">{t[lang][key]}</span>
            </li>
          ))}
        </ul>

        {/* MOCK-UP IMAGE */}
        <div className="relative w-full h-64 md:h-96">
          <Image
            src="/img/agroetica-screen-web-001.png"   /* update path if your new mock-up differs */
            alt={t[lang].farmAppMockAlt ?? 'Farm platform mock-up'}
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

{/* CTA */}
<div className="text-center mt-12">
  <a
    href={`/${lang}/product`}
    className="inline-block bg-green-600 hover:bg-green-700
               text-white font-semibold px-8 py-3 rounded-lg shadow transition"
  >
    {t[lang].discoverPlatformLabel /* “Discover the platform” */}
  </a>
</div>
    </section>
  );
}
