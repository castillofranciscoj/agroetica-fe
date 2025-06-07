'use client';

import Head           from 'next/head';
import Image          from 'next/image';
import Link           from 'next/link';
import { motion }     from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { useLanguage }         from '@/components/LanguageContext';
import { t }                   from '@/i18n';
import Footer                  from '@/components/Footer';
import CtaBanner               from '@/components/CtaBanner';
import TestimonialsCarousel    from '@/components/TestimonialsCarousel';
import FarmAppSection          from '@/components/FarmAppSection';
import SustainabilitySection   from '@/components/SustainabilitySection';
import SupportSection          from '@/components/SupportSection';

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      {/* ─────────────────────── SEO ─────────────────────── */}
      <Head>
        <title>{t[lang].homeSeoTitle}</title>
        <meta name="description" content={t[lang].homeSeoDescription} />
      </Head>

      <div className="flex flex-col pt-13">
        {/* ───────────────────── HERO ───────────────────── */}
        <section className="relative flex flex-col min-h-[60vh] overflow-hidden -mx-6">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/img/AdobeStock_423364592.mov"
            autoPlay
            loop
            muted
            playsInline
            poster="/img/hero-poster.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4"
          >
            <h1 className="text-white text-3xl md:text-5xl font-extrabold max-w-3xl leading-tight drop-shadow-md">
              {t[lang].heroMainTitle}
            </h1>

            <p className="text-white/90 mt-4 text-lg max-w-2xl">
              {t[lang].heroMainSubtitle}
            </p>

            {/* ———  animated CTA  ——— */}
            <Link
              href="/portal"
              className="
                group mt-6 inline-flex items-center
                bg-green-600 hover:bg-green-700
                text-white font-semibold px-6 py-3 rounded-lg shadow
                transition transform duration-200 ease-out
                hover:scale-105 active:scale-100
              "
            >
              {/* text */}
              <span>{t[lang].heroMainCTA}</span>

              {/* arrow – slides / fades in */}
              <ArrowRight
                size={30}
                className="
                  ml-0 w-0 opacity-0
                  transition-all duration-200 ease-out
                  group-hover:ml-2 group-hover:w-5 group-hover:opacity-100
                "
              />
            </Link>
          </motion.div>

          {/* ribbons */}
          <div className="relative z-20 shrink-0">
            <div className="bg-gray-900 text-white text-center py-2 text-sm">
              {t[lang].metricBarContent}
            </div>
            <div className="bg-amber-500 text-white text-center py-2 text-sm font-semibold">
              {t[lang].ribbonComplianceUrgency}
            </div>
          </div>
        </section>

        {/* ────────────── SECTIONS ───────────── */}
        <div className="mt-16">
          <TestimonialsCarousel />
        </div>

        <FarmAppSection />

        {/* mid-page CTA banner already has its own button styling */}
        <div className="-mx-6">
          <CtaBanner />
        </div>

        <Footer />
      </div>
    </>
  );
}
