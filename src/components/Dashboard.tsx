// src/components/Dashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const CO2_PER_HA = 2.5;
const PRICE_MEAN = 10;
const PRICE_MIN  = 5;
const PRICE_MAX  = 30;

/* same custom event name used in layout/page -------------------- */
const FARM_EVT = 'portal:selectedFarmIdChange';

interface DashboardProps {
  data: {
    farms: Array<{
      id: string;
      fields: Array<{
        areaHectares: number;
        crops: Array<{
          cropType: { name: string };
          cropAreaHectares: number;
        }>;
      }>;
    }>;
  };
}

export default function Dashboard({ data }: DashboardProps) {
  const { lang } = useLanguage();

  /* ── selected farm filter (persisted) ------------------------- */
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(
    () => (typeof window === 'undefined'
      ? undefined
      : localStorage.getItem('selectedFarmId') || undefined),
  );

  /* update on sidebar changes (same-tab or cross-tab) ------------ */
  useEffect(() => {
    const refresh = () =>
      setSelectedFarmId(localStorage.getItem('selectedFarmId') || undefined);

    window.addEventListener(FARM_EVT, refresh);
    window.addEventListener('storage', e => {
      if (e.key === 'selectedFarmId') refresh();
    });
    return () => {
      window.removeEventListener(FARM_EVT, refresh);
      window.removeEventListener('storage', refresh as unknown);
    };
  }, []);

  /* ── filter data ---------------------------------------------- */
  const farmsAll  = data?.farms ?? [];
  const farms     = selectedFarmId
    ? farmsAll.filter(f => f.id === selectedFarmId)
    : farmsAll;
  const fields    = farms.flatMap(f => f.fields);

  /* ── metrics --------------------------------------------------- */
  const totalLand = fields.reduce((sum, f) => sum + (f.areaHectares || 0), 0);

  /* crop distribution */
  const cropMap = new Map<string, number>();
  fields.forEach(f =>
    f.crops.forEach(c =>
      cropMap.set(
        c.cropType.name,
        (cropMap.get(c.cropType.name) || 0) + c.cropAreaHectares,
      ),
    ),
  );
  const cropStats = Array.from(cropMap.entries()).map(([name, area]) => ({
    name,
    area,
    pct: totalLand ? (area / totalLand) * 100 : 0,
  }));
  const recorded   = cropStats.reduce((s, c) => s + c.area, 0);
  const unrecorded = totalLand - recorded;
  if (unrecorded > 0) {
    cropStats.push({
      name : t[lang].unrecordedLabel,
      area : unrecorded,
      pct  : totalLand ? (unrecorded / totalLand) * 100 : 0,
    });
  }

  const pieData = {
    labels   : cropStats.map(c => c.name),
    datasets : [{
      data           : cropStats.map(c => +c.pct.toFixed(1)),
      backgroundColor: [
        '#4CAF50','#FFC107','#2196F3','#FF5722',
        '#9C27B0','#03A9F4','#8BC34A','#FF9800','#B0BEC5',
      ],
      hoverOffset: 6,
    }],
  };

  /* CO₂ offsets */
  const offsets = fields.map(f => (f.areaHectares || 0) * CO2_PER_HA);
  const minOff  = offsets.length ? Math.min(...offsets) : 0;
  const maxOff  = offsets.length ? Math.max(...offsets) : 0;
  const meanOff = offsets.length
    ? offsets.reduce((a, b) => a + b, 0) / offsets.length
    : 0;

  /* ── render ---------------------------------------------------- */
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{t[lang].dashboardTitle}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total land */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
          <h2 className="text-lg font-semibold">{t[lang].totalLandLabel}</h2>
          <p className="text-2xl">
            {totalLand.toFixed(2)} {t[lang].hectaresUnit}
          </p>
          <div className="border-t pt-3 space-y-1 text-sm text-gray-700">
            <p>{t[lang].numberOfFarmsLabel}: <strong>{farms.length}</strong></p>
            <p>{t[lang].numberOfLandsLabel}: <strong>{fields.length}</strong></p>
          </div>
        </div>

        {/* CO₂ offsets */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">
            {t[lang].co2OffsetsYearlyTitle}
          </h2>
          <p className="text-2xl mb-2">
            {meanOff.toFixed(2)} {t[lang].co2Unit}
          </p>
          <hr className="border-t mb-2" />
          <div className="text-sm text-gray-700 space-y-1">
            <p>{t[lang].minLabel}: <strong>{minOff.toFixed(2)} {t[lang].co2Unit}</strong></p>
            <p>{t[lang].maxLabel}: <strong>{maxOff.toFixed(2)} {t[lang].co2Unit}</strong></p>
          </div>
        </div>

        {/* VCM value */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">{t[lang].vcmValueTitle}</h2>
          <div className="text-xl mb-2 flex items-center">
            {(meanOff * PRICE_MEAN).toFixed(2)} {t[lang].currencyUnit}
            <span className="relative ml-2 group">
              <span className="text-gray-400 cursor-help">ℹ️</span>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2
                              rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0
                              transition-opacity group-hover:opacity-100">
                {t[lang].calculationTooltip}
              </div>
            </span>
          </div>
          <hr className="border-t mb-2" />
          <p className="text-2xl mb-2">
            {PRICE_MEAN.toFixed(0)} {t[lang].currencyUnit}
          </p>
          <hr className="border-t mb-2" />
          <div className="text-sm text-gray-700 space-y-1">
            <p>{t[lang].minLabel}: <strong>{PRICE_MIN} {t[lang].currencyUnit}</strong></p>
            <p>{t[lang].maxLabel}: <strong>{PRICE_MAX} {t[lang].currencyUnit}</strong></p>
          </div>
        </div>
      </div>

      {/* Crop distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-4">{t[lang].cropDistTitle}</h2>
        <div className="w-full h-64 mb-4">
          <Pie
            data={pieData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
            }}
          />
        </div>
        <ul className="space-y-2 text-sm">
          {cropStats.map((c, idx) => (
            <li key={`${c.name}-${idx}`} className="flex justify-between">
              <span>{c.name}</span>
              <span>
                {c.area.toFixed(2)} {t[lang].hectaresUnit} (
                {c.pct.toFixed(1)}{t[lang].percentUnit})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
