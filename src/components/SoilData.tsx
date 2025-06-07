
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { GET_USER_FIELDS, GET_SOIL_MEASUREMENTS } from '@/graphql/operations';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

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

// Register Chart.js components once
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
const METRIC_DEFS = [
  { key: 'ph',            labelKey: 'phLabel',            color: '#4CAF50', precision: 2 },
  { key: 'organicMatter', labelKey: 'organicMatterLabel', color: '#FF9800', precision: 2 },
  { key: 'nitrogen',      labelKey: 'nitrogenLabel',      color: '#2196F3', precision: 2 },
  { key: 'moisture',      labelKey: 'moistureLabel',      color: '#00BCD4', precision: 2 },
  { key: 'temperature',   labelKey: 'temperatureLabel',   color: '#F44336', precision: 1 },
];

export default function SoilData() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const userId = session?.user?.id;

  const [fieldId, setFieldId]     = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(0);

  const {
    data: fieldsData,
    loading: fieldsLoading,
    error: fieldsError,
  } = useQuery(GET_USER_FIELDS, {
    skip: status !== 'authenticated' || !userId,
    variables: { userId: userId! },
  });

  const {
    data: measData,
    loading: measLoading,
    error: measError,
  } = useQuery(GET_SOIL_MEASUREMENTS, {
    skip: !fieldId,
    variables: {
      fieldIds: fieldId ? [fieldId] : [],
      ...(dateFrom && { dateFrom: dateFrom + 'T00:00:00Z' }),
      ...(dateTo   && { dateTo:   dateTo   + 'T23:59:59Z' }),
      skip: page * TAKE,
      take: TAKE,
    },
    fetchPolicy: 'network-only',
  });

  /* ───────────── memo-ised measurements (fixes ESLint warning) ───────────── */
  const measurements = useMemo(
    () => measData?.soilMeasurements ?? [],
    [measData?.soilMeasurements],
  );
  
  const sortedByDate = useMemo(
    () => [...measurements].sort(
      (a: unknown, b: unknown) =>
        new Date(a.measurementDate).getTime() -
        new Date(b.measurementDate).getTime()
    ),
    [measurements]
  );

  const labels = sortedByDate.map((m: unknown) =>
    new Date(m.measurementDate).toLocaleDateString(
      lang === 'ITA' ? 'it-IT' : 'en-US'
    )
  );

  const metrics = METRIC_DEFS.map((def) => ({
    ...def,
    label: t[lang][def.labelKey as keyof typeof t[unknown]],
  }));

  const containerRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  if (!containerRefs.current.length) {
    containerRefs.current = METRIC_DEFS.map(() => React.createRef());
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  useEffect(() => {
    if (fieldsData?.fields?.length && !fieldId) {
      setFieldId(fieldsData.fields[0].id);
      setPage(0);
    }
  }, [fieldsData, fieldId]);

  if (status === 'loading' || fieldsLoading) {
    return <p className="p-6">{t[lang].loading}</p>;
  }
  if (fieldsError) {
    return <p className="p-6 text-red-600">{fieldsError.message}</p>;
  }
  if (measLoading) {
    return <p className="p-6">{t[lang].loading}</p>;
  }
  if (measError) {
    return <p className="p-6 text-red-600">{measError.message}</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{t[lang].soilMeasurementsLabel}</h1>

      {/* Filters */}
      <form
        onSubmit={e => { e.preventDefault(); setPage(0); }}
        className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t[lang].filterByLandLabel}
          </label>
          <select
            value={fieldId}
            onChange={e => { setFieldId(e.target.value); setPage(0); }}
            className="w-full border rounded p-2"
          >
            {fieldsData.fields.map((l: unknown) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t[lang].dateFromLabel}</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t[lang].dateToLabel}</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {t[lang].applyFiltersButton}
          </button>
        </div>
      </form>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m, i) => {
          const data = {
            labels,
            datasets: [{
              label: m.label,
              data: sortedByDate.map((row: unknown) =>
                row[m.key] != null ? +row[m.key].toFixed(m.precision) : null
              ),
              borderColor: m.color,
              backgroundColor: 'transparent',
              tension: 0.3,
            }],
          };
          return (
            <div
              key={m.key}
              ref={containerRefs.current[i]}
              className="bg-white p-4 rounded-lg shadow relative"
            >
              <button
                onClick={() => {
                  const el = containerRefs.current[i].current!;
                  if (document.fullscreenElement === el) {
                    document.exitFullscreen();
                  } else {
                    el.requestFullscreen();
                  }
                }}
                className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
                title={t[lang].fullscreenButtonLabel}
              >⤢</button>
              <h3 className="text-center font-semibold mb-2">{m.label}</h3>
              <Line
                data={data}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { x: { display: true }, y: { display: true } },
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Table & Pagination */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">{t[lang].landLabel}</th>
              <th className="px-4 py-2">{t[lang].dateLabel}</th>
              <th className="px-4 py-2">{t[lang].sensorIdLabel}</th>
              {METRIC_DEFS.map(def => (
                <th key={def.key} className="px-4 py-2 text-right">
                  {t[lang][def.labelKey as keyof typeof t[unknown]]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {measurements.map((m: unknown) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{m.land.name}</td>
                <td className="px-4 py-2">
                  {new Date(m.measurementDate).toLocaleDateString(
                    lang === 'ITA' ? 'it-IT' : 'en-US'
                  )}
                </td>
                <td className="px-4 py-2">{m.sensorId || '—'}</td>
                {METRIC_DEFS.map(def => (
                  <td key={def.key} className="px-4 py-2 text-right">
                    {m[def.key]?.toFixed(def.precision) ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          disabled={measurements.length < TAKE}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          {t[lang].next} →
        </button>
      </div>
    </div>
  );
}