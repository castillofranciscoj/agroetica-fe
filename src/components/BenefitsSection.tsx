// “Why farmers switch…” benefit cards with emoji
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

const cardVariants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -60 : 60, y: 20 }),
  visible:             { opacity: 1, x: 0, y: 0, transition: { duration: 0.6 } },
};

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function BenefitsSection() {
  const { lang } = useLanguage();

  const benefits = [
    { emoji: '⚡',  title: t[lang].benefitSetupTitle,   desc: t[lang].benefitSetupDesc   },
    { emoji: '💶',  title: t[lang].benefitPriceTitle,   desc: t[lang].benefitPriceDesc   },
    { emoji: '🌱',  title: t[lang].benefitIncomeTitle,  desc: t[lang].benefitIncomeDesc  },
    { emoji: '👩‍🌾', title: t[lang].benefitBuiltByTitle, desc: t[lang].benefitBuiltByDesc },
  ];

  return (
    <section className="max-w-4xl mx-auto space-y-12">
      <motion.h2
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t[lang].whyHeading}
      </motion.h2>

      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            custom={i}
            variants={cardVariants}
            className="relative rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
          >
            <span className="absolute top-4 right-5 text-xl">{b.emoji}</span>
            <h3 className="font-semibold text-lg mb-2 pr-6">{b.title}</h3>
            <p className="text-gray-600 leading-relaxed pr-6">{b.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
