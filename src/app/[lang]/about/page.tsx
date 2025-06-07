// src/app/[lang]/about/page.tsx
// About – hero video now uses optimised `about-hero-720p` sources
'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Footer from '@/components/Footer';
import SdgGrid from '@/components/SdgGrid';
import CtaBanner from '@/components/CtaBanner';

export default function AboutPage() {
  const { lang } = useLanguage();

  const overviewRef = useRef<HTMLDivElement>(null);
  const sdgRef      = useRef<HTMLDivElement>(null);

  const scrollTo = (r: React.RefObject<HTMLElement | null>) =>
    r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-6 py-13 space-y-32">
        {/* ── HERO – full-width optimised video ───────── */}
        <section className="relative h-[50vh] overflow-hidden -mx-6">
          <video
            playsInline
            autoPlay
            muted
            loop
            preload="none"
            poster="/img/about-hero-720p-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/img/about-hero-720p.webm" type="video/webm" />
            <source src="/img/about-hero-720p.mp4"  type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.h1
              className="text-white text-4xl md:text-5xl font-extrabold leading-tight max-w-4xl drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t[lang].aboutHeroTagline}
            </motion.h1>

            <motion.button
              onClick={() => scrollTo(overviewRef)}
              className="mt-6 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {t[lang].learnMoreLabel}
            </motion.button>
          </div>
        </section>
        {/* ── OVERVIEW ──────────────────────────────── */}
        <section ref={overviewRef} className="max-w-4xl mx-auto space-y-6 -mt-16">
          <h2 className="text-3xl font-bold">{t[lang].missionSectionTitle}</h2>

          {/* optional subtitle – shown only if the key is present */}
          {t[lang].missionSectionSubtitle && (
            <h3 className="text-xl font-semibold text-green-700">
              {t[lang].missionSectionSubtitle}
            </h3>
          )}

          <p className="text-gray-700 leading-relaxed">{t[lang].missionPara1}</p>
          <p className="text-gray-700 leading-relaxed">{t[lang].missionPara2}</p>
        </section>


        {/* ── SDGs ────────────────────────────────────── */}
        <section ref={sdgRef} className="max-w-6xl mx-auto -mt-16">
          <SdgGrid />
        </section>

        {/* ── CTA BANNER ──────────────────────────────── */}
        <div className="-mx-6 -mt-16 -mb-16">
          <CtaBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
