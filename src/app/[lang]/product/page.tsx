// src/app/[lang]/product/page.tsx
'use client';

import Image  from 'next/image';
import Link   from 'next/link';
import { motion } from 'framer-motion';

import { useLanguage } from '@/components/LanguageContext';
import { t }            from '@/i18n';

import PillarGrid          from '@/components/PillarGrid';
import FeaturesSection     from '@/components/FeaturesSection';
import BenefitsSection     from '@/components/BenefitsSection';      // ← NEW
import ComplianceCtaBanner from '@/components/ComplianceCtaBanner'; // ← NEW
import CtaBanner           from '@/components/CtaBanner';
import Footer              from '@/components/Footer';

export default function ProductPage() {
  const { lang } = useLanguage();

  /* small fade-in helper */
  const fadeIn = (delay = 0) => ({
    initial:     { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true, amount: 0.3 },
    transition:  { duration: 0.8, delay },
  });

  return (
    <div className="flex flex-col min-h-screen pt-13">
      {/* ───────── HERO ───────── */}
      <section className="relative h-[60vh] overflow-hidden -mx-6">
        <Image
          src="/img/AdobeStock_884876440_2000.jpeg"
          alt={t[lang].productHeroImageAlt}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.h1
            className="text-white text-4xl md:text-5xl font-extrabold leading-tight max-w-4xl drop-shadow-md"
            {...fadeIn()}
          >
            {t[lang].productHeroTitle}
          </motion.h1>
          <motion.p
            className="text-white/90 mt-4 text-lg max-w-2xl"
            {...fadeIn(0.2)}
          >
            {t[lang].productHeroSubtitle}
          </motion.p>
          <motion.div {...fadeIn(0.4)}>
            <Link
              href="#features"
              className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow"
            >
              {t[lang].productHeroCTA}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───────── MAIN BODY ───────── */}
      <main className="flex flex-col gap-16 px-6 py-16 flex-grow">
        {/* Pillars intro */}
        <section className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold">{t[lang].pillarsSectionTitle}</h2>
          <PillarGrid />
        </section>

        {/* Feature cards */}
        <section id="features">
          <FeaturesSection />
        </section>

        {/* Compliance mid-scroll banner */}
        <div className="-mx-6">
          <ComplianceCtaBanner />
        </div>

        {/* Why-switch benefits */}
        <BenefitsSection />

        {/* Standard green CTA banner */}
        <div className="-mx-6 -mb-16">
          <CtaBanner />
        </div>
      </main>

      {/* ───────── FOOTER ───────── */}
      <Footer />
    </div>
  );
}
