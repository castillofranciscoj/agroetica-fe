// src/app/radar-measurements/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession }      from 'next-auth/react';
import { useQuery }        from '@apollo/client';
import {
  GET_USER_FIELDS,
  GET_NPP_BASELINES,
  GET_LAND_COVER_STATS,
  GET_SOC_STOCKS,
  GET_SOIL_MOISTURE,
} from '@/graphql/operations';
import { useLanguage }     from '@/components/LanguageContext';
import { t }               from '@/i18n';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const TAKE = 50;
const TYPES = [
  { value: 'npp',        label: 'Annual Net Primary Productivity (NPP)' },
  { value: 'landCover',  label: 'Land Cover Statistics' },
  { value: 'soc',        label: 'Soil Organic Carbon stock' },
  { value: 'moisture',   label: 'SMAP Soil‑Moisture observations' },
] as const;
type TypeKey = typeof TYPES[number]['value'];

export default function RadarMeasurementsPage() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const userId = session?.user?.id;

  const [landId, setLandId] = useState<string>('');
  const [type,   setType]   = useState<TypeKey>('npp');
  const [page,   setPage]   = useState(0);

// 1) fetch user's lands -------------------------------------------------
const {
  data: landsData,
  loading: landsLoading,
  error: landsError,
} = useQuery(GET_USER_FIELDS, {
  skip: status !== 'authenticated' || !userId,
  variables: { userId: userId! },
});

/*  👉 keep a **stable** reference so ESLint is happy
    (no new [] on every render when data is still undefined)          */
const lands = useMemo(() => landsData?.lands ?? [], [landsData?.lands]);

  // 2) fetch whichever dataset is active
  const nppQ = useQuery(GET_NPP_BASELINES, {
    skip: type !== 'npp' || !landId,
    variables: { landId, skip: page * TAKE, take: TAKE },
  });
  const lcQ = useQuery(GET_LAND_COVER_STATS, {
    skip: type !== 'landCover' || !landId,
    variables: { landId, skip: page * TAKE, take: TAKE },
  });
  const socQ = useQuery(GET_SOC_STOCKS, {
    skip: type !== 'soc' || !landId,
    variables: { landId, skip: page * TAKE, take: TAKE },
  });
  const moistQ = useQuery(GET_SOIL_MOISTURE, {
    skip: type !== 'moisture' || !landId,
    variables: { landId, skip: page * TAKE, take: TAKE },
  });

  // pick the right data
  const records = useMemo(() => {
    if (type === 'npp')       return nppQ.data?.netPrimaryProductivities     || [];
    if (type === 'landCover') return lcQ.data?.landCoverStatistics         || [];
    if (type === 'soc')       return socQ.data?.soilOrganicCarbonStocks   || [];
    return moistQ.data?.soilMoistureObservations                          || [];
  }, [type, nppQ.data, lcQ.data, socQ.data, moistQ.data]);

  // determine loading & error
  let loading = false, error: Error | null = null;
  if (type === 'npp')            { loading = nppQ.loading;   error = nppQ.error; }
  else if (type === 'landCover') { loading = lcQ.loading;    error = lcQ.error; }
  else if (type === 'soc')       { loading = socQ.loading;   error = socQ.error; }
  else                           { loading = moistQ.loading; error = moistQ.error; }

  // defaults
  useEffect(() => {
    if (lands.length && !landId) {
      setLandId(lands[0].id);
      setPage(0);
    }
  }, [lands, landId]);

  // whenever type or land changes, reset page
  useEffect(() => {
    setPage(0);
  }, [type, landId]);

  // prepare chart
  const sorted = useMemo(() => [...records].sort((a: unknown, b: unknown) => {
    const aKey = type === 'moisture' ? a.date : a.year;
    const bKey = type === 'moisture' ? b.date : b.year;
    return new Date(aKey).valueOf() - new Date(bKey).valueOf();
  }), [records, type]);

  const labels = sorted.map((r: unknown) =>
    type === 'moisture'
      ? new Date(r.date).toLocaleDateString(lang === 'ITA' ? 'it-IT' : 'en-US')
      : String(r.year)
  );

  // build datasets
  let datasets = [];
  if (type === 'landCover') {
    const allCodes = Array.from(
      new Set(sorted.flatMap(r => Object.keys(r.breakdown || {})))
    );
    datasets = allCodes.map((code, idx) => ({
      label: code,
      data: sorted.map(r => (r.breakdown?.[code] ?? 0) * 100),
      borderColor: ['#3B82F6','#EF4444','#F59E0B','#10B981','#8B5CF6'][idx % 5],
      backgroundColor: 'transparent',
    }));
  } else {
    const key =
      type === 'npp'    ? 'co2e' :
      type === 'soc'    ? 'totalSOC' :
                         'meanMoisture';
    datasets = [{
      label: t[lang].valueLabel,
      data: sorted.map(r => +((r as unknown)[key] ?? 0).toFixed(2)),
      borderColor: '#3B82F6',
      backgroundColor: 'transparent',
    }];
  }

  // redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  if (status === 'loading' || landsLoading || loading) {
    return <p className="p-6">{t[lang].loading}</p>;
  }
  if (landsError || error) {
    return <p className="p-6 text-red-600">{(landsError || error)!.message}</p>;
  }

  const landName = lands.find(l => l.id === landId)?.name || '—';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        {t[lang].radarMeasurementsLabel}
      </h1>

      {/* Filters */}
      <form className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">
            {t[lang].filterByLandLabel}
          </label>
          <select
            className="w-full border rounded p-2"
            value={landId}
            onChange={e => setLandId(e.target.value)}
          >
            {lands.map(l =>
              <option key={l.id} value={l.id}>{l.name}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Select Radar Data
          </label>
          <select
            className="w-full border rounded p-2"
            value={type}
            onChange={e => setType(e.target.value as TypeKey)}
          >
            {TYPES.map(t0 =>
              <option key={t0.value} value={t0.value}>{t0.label}</option>
            )}
          </select>
        </div>
      </form>

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow">
        <Line
          data={{ labels, datasets }}
          options={{ plugins:{ legend:{ position:'bottom' } }, scales:{ x:{}, y:{} } }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">{t[lang].landLabel}</th>
              <th className="px-4 py-2">{t[lang].dateLabel}</th>
              <th className="px-4 py-2">{t[lang].typeLabel}</th>
              <th className="px-4 py-2 text-right">{t[lang].valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r: unknown) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{landName}</td>
                <td className="px-4 py-2">
                  {type === 'moisture'
                    ? new Date(r.date).toLocaleDateString(lang==='ITA'?'it-IT':'en-US')
                    : r.year}
                </td>
                <td className="px-4 py-2">
                  {TYPES.find(x=>x.value===type)!.label}
                </td>
                <td className="px-4 py-2 text-right">
                  {type === 'landCover'
                    ? '—'
                    : type === 'npp'
                      ? r.co2e.toFixed(2)
                      : type === 'soc'
                        ? r.totalSOC.toFixed(2)
                        : r.meanMoisture.toFixed(2)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          ← {t[lang].prev}
        </button>
        <span className="text-sm">Page {page + 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={records.length < TAKE}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          {t[lang].next} →
        </button>
      </div>
    </div>
  );
}
