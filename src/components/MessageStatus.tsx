'use client';

import React            from 'react';
import { useQuery }     from '@apollo/client';
import { Loader }       from 'lucide-react';
import { useLanguage }  from '@/components/LanguageContext';
import { t }            from '@/i18n';
import { GET_MESSAGE_STATS } from '@/graphql/operations';   // ← centralised import

export default function MessageStatus() {
  const { lang } = useLanguage();

  /* stats query */
  const { data, loading, error } = useQuery(GET_MESSAGE_STATS, {
    fetchPolicy: 'network-only',
  });

  /* unpack once the query returns */
  const stats = {
    sent      : data?.sent       ?? 0,
    read      : data?.read       ?? 0,
    dismissed : data?.dismissed  ?? 0,
  };

  return (
    <section className="border rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold">{t[lang].statsTitle}</h2>

      {loading && (
        <p>
          <Loader className="inline w-4 h-4 animate-spin" />{' '}
          {t[lang].loadingLabel}
        </p>
      )}
      {error && <p className="text-red-600">{error.message}</p>}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t[lang].totalSentLabel}      value={stats.sent} />
        <StatCard label={t[lang].totalReadLabel}      value={stats.read} />
        <StatCard label={t[lang].totalDismissedLabel} value={stats.dismissed} />
      </div>
    </section>
  );
}

/* small display helper */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4 text-center">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
