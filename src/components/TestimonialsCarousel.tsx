/* src/components/TestimonialsCarousel.tsx */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

type Slide = {
  img:   string;
  quote: string;
  name:  string;
  farm:  string;
  link?: string;
};

export default function TestimonialsCarousel() {
  const { lang } = useLanguage();

  /* i18n-driven slides */
  const slides: Slide[] = [
    {
      /* Philippa  ➜  new image */
      img:   '/img/AdobeStock_245588049_2000px.jpeg',
      quote: t[lang].testim1Quote,
      name:  t[lang].testim1Name,
      farm:  t[lang].testim1Farm,
      link:  '/cases/oro-sicani',          // keep/change as you wish
    },
    {
      /* Giuseppe  ➜  new image + link so CTA shows */
      img:   '/img/agroetica-freestockpro-1007864.jpg',
      quote: t[lang].testim2Quote,
      name:  t[lang].testim2Name,
      farm:  t[lang].testim2Farm,
      link:  '/cases/della-rocca',         // NEW – enables Discover-more button
    },
  ];

  const [idx, setIdx] = useState(0);
  const current       = slides[idx];

  const next = () => setIdx((idx + 1) % slides.length);
  const prev = () => setIdx((idx - 1 + slides.length) % slides.length);

  return (
    <section className="max-w-6xl mx-auto px-6">
            {/* heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
  {t[lang].testimonialsHeading}
</h2>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.img}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={current.img}
                alt={current.name}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* text */}
        <div className="space-y-6">
          <blockquote className="text-2xl font-semibold leading-snug">
            “{current.quote}”
          </blockquote>
          <p className="font-medium">
            {current.name}
            <br />
            <span className="text-gray-600">{current.farm}</span>
          </p>

          {current.link && (
            <a
              href={current.link}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition"
            >
              {t[lang].learnCaseLabel}
            </a>
          )}
        </div>
      </div>

      {/* arrows */}
      <div className="flex justify-center gap-8 mt-8">
        <button
          aria-label="Previous testimonial"
          onClick={prev}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          aria-label="Next testimonial"
          onClick={next}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
