// src/components/ClimateGraph.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

const CURRENT_YEAR = new Date().getFullYear();

type ClimatePoint = {
  month: string;
  T2M: number;
  RH2M: number;
  PRECTOT: number;
};

export default function ClimateGraph({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { lang } = useLanguage();
  const [data, setData] = useState<ClimatePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR - 1);

  const [avgT2M, setAvgT2M] = useState<number | null>(null);
  const [avgRH2M, setAvgRH2M] = useState<number | null>(null);
  const [sumPrecip, setSumPrecip] = useState<number | null>(null);

  // Fetch selected year data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/power/monthly?type=monthly&lat=${latitude}&lon=${longitude}&year=${selectedYear}`
        );
        if (!res.ok) throw new Error(`Monthly API returned ${res.status}`);
        const json = await res.json();
        const raw = json.properties.parameter;
        const { T2M = {}, RH2M = {}, PRECTOTCORR = {} } = raw;

        const isNum = /^\d+$/.test(Object.keys(T2M)[0] || '');
        const months = isNum
          ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
          : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const names = [
          t[lang].jan, t[lang].feb, t[lang].mar, t[lang].apr,
          t[lang].may, t[lang].jun, t[lang].jul, t[lang].aug,
          t[lang].sep, t[lang].oct, t[lang].nov, t[lang].dec,
        ];

        const values: ClimatePoint[] = months.map((m, i) => ({
          month: `${names[i]} ${selectedYear}`,
          T2M: +T2M[`${selectedYear}${m}`] || 0,
          RH2M: +RH2M[`${selectedYear}${m}`] || 0,
          PRECTOT: +PRECTOTCORR[`${selectedYear}${m}`] || 0,
        }));

        setData(values);
        setAvgT2M(
          values.reduce((sum, v) => sum + v.T2M, 0) / values.length || null
        );
        setAvgRH2M(
          values.reduce((sum, v) => sum + v.RH2M, 0) / values.length || null
        );
        setSumPrecip(
          values.reduce((sum, v) => sum + v.PRECTOT, 0) || null
        );
      } catch (e: unknown) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [latitude, longitude, selectedYear, lang]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">
        {t[lang].climateOverviewTitle}
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t[lang].selectYearLabel}
      </label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(+e.target.value)}
        className="border rounded p-2 mb-4"
      >
        {Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - i).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center p-4 bg-white rounded shadow">
          <Icons.Thermometer className="w-6 h-6 text-red-500 mr-2" />
          <div>
            <div className="text-sm">{t[lang].avgTemp}</div>
            <div className="text-xl font-semibold">
              {avgT2M != null ? avgT2M.toFixed(1) : '—'}{t[lang].avgTempUnit}
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-white rounded shadow">
          <Icons.CloudRain className="w-6 h-6 text-green-500 mr-2" />
          <div>
            <div className="text-sm">{t[lang].precipitation}</div>
            <div className="text-xl font-semibold">
              {sumPrecip != null ? sumPrecip.toFixed(1) : '—'}{t[lang].precipitationUnit}
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-white rounded shadow">
          <Icons.Droplet className="w-6 h-6 text-blue-500 mr-2" />
          <div>
            <div className="text-sm">{t[lang].humidity}</div>
            <div className="text-xl font-semibold">
              {avgRH2M != null ? avgRH2M.toFixed(0) : '—'}{t[lang].humidityUnit}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p>{t[lang].loadingWeather}…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="T2M"     name={t[lang].avgTemp}       fill="#EF4444" />
              <Bar dataKey="PRECTOT" name={t[lang].precipitation} fill="#10B981" />
              <Bar dataKey="RH2M"    name={t[lang].humidity}      fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
