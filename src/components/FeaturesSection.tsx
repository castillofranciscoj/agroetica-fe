/* src/components/FeaturesSection.tsx
   Animated feature cards with smart video sources (poster / mp4 / webm) */
'use client';

import React, { forwardRef } from 'react';
import Image                 from 'next/image';
import { motion }            from 'framer-motion';
import { useLanguage }       from '@/components/LanguageContext';
import { t }                 from '@/i18n';

type ImageMedia = { type: 'image'; src: string };
type VideoMedia = {
  type:   'video';
  mp4:    string;
  webm:   string;
  poster: string;
};
type FeatureMedia = ImageMedia | VideoMedia;


const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -40 : 40,   // gentle 40-px slide from left / right
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'tween',             // no spring overshoot
      ease: 'easeOut',
      duration: 0.5,             // smooth but snappy
    },
  },
};

const container = {
  hidden : { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const FeaturesSection = forwardRef<HTMLDivElement>((_, ref) => {
  const { lang } = useLanguage();

  const features: { media: FeatureMedia; title: string; desc: string }[] = [
    /* EU Digital Logbook — smart video */
    {
      media: {
        type  : 'video',
        mp4   : '/img/product-EU-digital-logbook-720p.mp4',
        webm  : '/img/product-EU-digital-logbook-720p.webm',
        poster: '/img/product-EU-digital-logbook-720p-poster.jpg',
      },
      title: t[lang].featureDigitalLogbookTitle,
      desc : t[lang].featureDigitalLogbookDesc,
    },
    /* Smart Alerts — still image */
    {
      media: { type: 'image', src: '/img/agroetica-sotiris-gkolias-331160-927802.jpg' },
      title: t[lang].featureSmartAlertsTitle,
      desc : t[lang].featureSmartAlertsDesc,
    },
    {
      media: { type: 'image', src: '/img/AdobeStock_1204541091_2000.jpeg' },
      title: t[lang].featureNDVITitle,
      desc : t[lang].featureNDVIDesc,
    },
    {
      media: { type: 'image', src: '/img/agroetica-nc-farm-bureau-mark-6792188.jpg' },
      title: t[lang].featureOpenAPITitle,
      desc : t[lang].featureOpenAPIDesc,
    },
    /* Carbon-Ready Data Pack — smart video */
    {
      media: {
        type  : 'video',
        mp4   : '/img/product-carbon-ready-720p.mp4',
        webm  : '/img/product-carbon-ready-720p.webm',
        poster: '/img/product-carbon-ready-720p-poster.jpg',
      },
      title: t[lang].featureCarbonPackTitle,
      desc : t[lang].featureCarbonPackDesc,
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>}
             className="max-w-4xl mx-auto space-y-12">
      {/* heading */}
      <motion.h2
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t[lang].pillarsHeading}
      </motion.h2>

      {/* cards */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            variants={cardVariants}
            className="overflow-hidden rounded-xl border border-gray-200
                       shadow-sm hover:shadow-md transition"
          >
            {/* header media */}
            <div className="relative h-32 w-full">
              {f.media.type === 'image' ? (
                <Image src={f.media.src} alt={f.title}
                       fill className="object-cover" />
              ) : (
                <video
                  playsInline autoPlay muted loop preload="none"
                  poster={f.media.poster}
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={f.media.webm} type="video/webm" />
                  <source src={f.media.mp4}  type="video/mp4"  />
                </video>
              )}

              <div className="absolute inset-0 bg-black/40 flex items-end">
                <h3 className="text-white font-semibold text-lg p-4">
                  {f.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
export default FeaturesSection;
