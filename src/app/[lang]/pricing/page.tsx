'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Image from 'next/image';
import Logo from '@/components/Logo';
import PricingTable from '@/components/PricingTable';
import Footer from '@/components/Footer';
import CtaBanner from '@/components/CtaBanner';          // ⬅️ new import

export default function PricingPage() {
  const { lang } = useLanguage();
  const plansRef = useRef<HTMLDivElement>(null);
  const scrollToPlans = () =>
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, delay },
  });

  return (
    <div className="flex flex-col min-h-screen pt-13">
      {/* ── HERO + IMPACT BANNER —──────────────────────────── */}
      <div className="-mx-6 space-y-0">
        {/* HERO */}
        <section className="relative h-[55vh] overflow-hidden">
          <Image
            src="/img/AdobeStock_1130505538_2000.jpeg"
            alt="Aerial view of crop rows"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.h1
              className="text-white text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl drop-shadow-md"
              {...fadeIn()}
            >
              {t[lang].pricingHeroTagline}
            </motion.h1>
            <motion.p
              className="text-white/90 mt-4 text-lg max-w-2xl"
              {...fadeIn(0.2)}
            >
              {t[lang].pricingHeroDesc}
            </motion.p>
            <motion.button
              onClick={scrollToPlans}
              className="mt-6 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              {...fadeIn(0.4)}
            >
              {t[lang].seePlansLabel}
            </motion.button>
          </div>
        </section>

        {/* ORANGE RIBBON  */}
        <section className="-mt-px bg-amber-500 text-white text-center py-2">
          <p className="font-medium">{t[lang].productPlansTeaserTitle}</p>
        </section>
      </div>

      {/* ── MAIN CONTENT —────────────────────────────────── */}
      {/* gap-15 → consistent spacing with other pages */}
      <main className="flex flex-col gap-15 px-6 py-16 flex-grow">
        {/* COMPARISON */}
        <section className="max-w-6xl mx-auto space-y-10">
          <motion.h2 className="text-3xl font-bold text-center" {...fadeIn()}>
            {t[lang].pricingComparisonTitle}
          </motion.h2>
          <motion.p
            className="text-center text-gray-700 max-w-2xl mx-auto"
            {...fadeIn(0.1)}
          >
            {t[lang].pricingComparisonSubtitle}
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            {...fadeIn(0.2)}
          >
            {/* Agroetica card */}
            <div className="border-2 border-green-600 rounded-lg p-6 shadow-lg bg-white flex flex-col items-center text-center ring-2 ring-green-400">
              <Logo className="w-32 h-auto" />
              <span className="mt-2 inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                {t[lang].bestValueTag}
              </span>
              <p className="mt-4 text-lg font-semibold text-green-700">
                {t[lang].productSectionComplianceTitle}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 text-left max-w-xs">
                <li>✓ PDF/XML export free</li>
                <li>✓ Automatic checks</li>
                <li>✓ NDVI preview included</li>
              </ul>
            </div>

            {/* Competitor card */}
            <div className="border rounded-lg p-6 shadow-md bg-gray-50 flex flex-col items-center text-center opacity-70">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                {t[lang].othersLabel}
              </h3>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Checks + Satellite PRO
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700 text-left max-w-xs">
                <li>✕ {t[lang].competitorPdfPaywall}</li>
                <li>✕ {t[lang].competitorNdviAddon}</li>
                <li>✕ {t[lang].competitorNoApi}</li>
                <li>✕ {t[lang].competitorLowRating}</li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* PLANS */}
        <section ref={plansRef} id="plans" className="max-w-6xl mx-auto space-y-10">
          <motion.h2 className="text-3xl font-bold text-center" {...fadeIn()}>
            {t[lang].choosePlanHeading}
          </motion.h2>
          <motion.div {...fadeIn(0.1)}>
            <PricingTable />
          </motion.div>
        </section>

        {/* FAQs */}
        <section className="-mx-6 px-6 space-y-8">
          <motion.h2 className="text-3xl font-bold text-center" {...fadeIn()}>
            {t[lang].pricingFaqHeading}
          </motion.h2>

          <div className="space-y-4">
            {[1, 2, 3].map((n, idx) => (
              <motion.details
                key={n}
                className="p-4 border rounded-lg"
                {...fadeIn(idx * 0.1)}
              >
                <summary className="cursor-pointer font-semibold">
                  {t[lang][`faq${n}Q`]}
                </summary>
                <p className="mt-2 text-gray-700 text-sm">
                  {t[lang][`faq${n}A`]}
                </p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* CTA BANNER – full-width, no rounded corners */}
        <div className="-mx-6 -mb-16">
          <CtaBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
