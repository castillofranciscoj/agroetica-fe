'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

const PillarGrid: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Compliance */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
        <span className="text-4xl">📜</span>
        <h3 className="font-semibold text-lg mt-4">{t[lang].pillarComplyTitle}</h3>
        <p className="text-gray-600 mt-2 leading-relaxed">{t[lang].pillarComplyDesc}</p>
      </div>

      {/* Technology */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
        <span className="text-4xl">🛰️</span>
        <h3 className="font-semibold text-lg mt-4">{t[lang].pillarTechTitle}</h3>
        <p className="text-gray-600 mt-2 leading-relaxed">{t[lang].pillarTechDesc}</p>
      </div>

      {/* Sustainability */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
        <span className="text-4xl">♻️</span>
        <h3 className="font-semibold text-lg mt-4">{t[lang].pillarSustainTitle}</h3>
        <p className="text-gray-600 mt-2 leading-relaxed">{t[lang].pillarSustainDesc}</p>
      </div>
    </motion.div>
  );
};

export default PillarGrid;
