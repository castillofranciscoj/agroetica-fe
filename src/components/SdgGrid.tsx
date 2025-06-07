/* src/components/SdgGrid.tsx
   Two-row layout, larger icons */

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

const sdgIds = [2, 8, 9, 12, 13, 15, 17];

const SdgGrid: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <motion.h2
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t[lang].sdgHeading}
      </motion.h2>

      {/* SDG cards — 2 rows / up to 4 columns */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {sdgIds.map((id) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center"
          >
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={`/img/sdgs/E_WEB_${id}.png`}
                alt={`SDG ${id} icon`}
                fill
                className="object-contain"
              />
            </div>

            <h4 className="font-semibold text-sm mb-1 text-gray-900">
              SDG {id} – {t[lang][`sdg.${id}.title`]}
            </h4>
            <p className="text-xs text-gray-600 leading-snug">
              {t[lang][`sdg.${id}.desc`]}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SdgGrid;
