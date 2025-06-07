'use client';

import { motion } from 'framer-motion';
import Image      from 'next/image';
import { useQuery } from '@apollo/client';

import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';
import { GET_CATEGORY_KPI } from '@/graphql/operations';

const KPI_CATEGORY_ID = 'a9268ee5-53f0-40f2-9b7e-7a0eb94b9d8d';

/** Stand-alone “Climate Impact” block (was inline on Home) */
export default function ClimateImpactSection() {
  const { lang } = useLanguage();

  /* KPI data */
  const { data, loading, error } = useQuery(GET_CATEGORY_KPI, {
    variables: { id: KPI_CATEGORY_ID },
  });
  const kpis = data?.categoryKPI?.kpis ?? [];

  /* small fade helper */
  const fade = (d = 0) => ({
    initial:     { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true, amount: 0.3 },
    transition:  { duration: 0.8, delay: d },
  });

  return (
    <section
      id="impact"
      className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6"
    >
      {/* image */}
      <motion.div className="w-full h-64 relative order-2 md:order-1" {...fade()}>
        <Image
          src="/img/AdobeStock_245588049_2000px.jpeg"
          alt={t[lang].climateImpactImgAlt}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </motion.div>

      {/* text + KPIs */}
      <motion.div className="order-1 md:order-2" {...fade(0.1)}>
        <h2 className="text-3xl font-bold mb-2">
          {t[lang].climateImpactTitle}
        </h2>
        <p className="mb-6 text-gray-700">
          {t[lang].climateImpactSubtitle}
        </p>

        {loading && <p>{t[lang].loadingLabel}…</p>}
        {error   && <p className="text-red-600">{error.message}</p>}

        <dl className="space-y-4">
          {kpis.map((k: any) => (
            <div key={k.id}>
              <dt className="sr-only">{k.title}</dt>
              <dd className="text-xl font-semibold">{k.currentValue}</dd>
              <dd className="text-gray-600">{k.title}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}
