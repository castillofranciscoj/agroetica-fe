'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GET_FARMS } from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

interface Props {
  initialYear: number;
  defaultFormat?: 'pdf' | 'xlsx';
}

export default function ExportButtonQDCA({
  initialYear,
  defaultFormat = 'pdf',
}: Props) {
  const { lang } = useLanguage();                  // ⬅️ current locale
  const L = t[lang].exportQdca;                    // shortcuts

  /* farms */
  const { data, loading, error } = useQuery(GET_FARMS);
  const farms = data?.farms ?? [];

  /* local state */
  const [farmId, setFarmId] = useState<string | undefined>();
  const [year, setYear]     = useState(initialYear);
  const [format, setFormat] = useState<'pdf' | 'xlsx'>(defaultFormat);

  /* years list */
  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => cur - i);
  }, []);

  const href = farmId
    ? `/api/export/qdca?year=${year}&farmId=${farmId}&format=${format}`
    : '#';

  /* render */
  if (loading) return <p className="text-sm">{L.loadingFarms}</p>;
  if (error)   return <p className="text-red-600 text-sm">{L.errorFarms}</p>;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      {/* farm selector */}
      <label className="flex flex-col text-sm">
        {L.farmLabel}
        <select
          value={farmId ?? ''}
          onChange={e => setFarmId(e.target.value)}
          className="mt-1 rounded border px-2 py-1"
        >
          <option value="" disabled>
            {L.farmPlaceholder}
          </option>
          {farms.map((f: { id: string; name: string }) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      {/* year selector */}
      <label className="flex flex-col text-sm">
        {L.yearLabel}
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="mt-1 rounded border px-2 py-1"
        >
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      {/* format selector */}
      <label className="flex flex-col text-sm">
        {L.formatLabel}
        <select
          value={format}
          onChange={e => setFormat(e.target.value as 'pdf' | 'xlsx')}
          className="mt-1 rounded border px-2 py-1"
        >
          <option value="pdf">{L.pdf}</option>
          <option value="xlsx">{L.xlsx}</option>
        </select>
      </label>

      {/* download */}
      <a href={href} className="md:ml-4">
        <Button
          icon={<Download size={16} />}
          disabled={!farmId}
          className="w-full md:w-auto"
        >
          {L.download}
        </Button>
      </a>
    </div>
  );
}
