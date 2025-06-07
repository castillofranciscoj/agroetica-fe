'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import { GET_SUBSCRIPTIONS_BY_USER } from '@/graphql/operations';

/**
 * Subscription list with a simple status filter.
 */
export default function SubscriptionsPanel() {
  const { lang } = useLanguage();
  const { data: sess } = useSession();

  /* keep hook order stable */
  const {
    data,
    loading,
    error,
  } = useQuery(GET_SUBSCRIPTIONS_BY_USER, {
    variables: { userId: sess?.user?.id },
    skip: !sess?.user,
    fetchPolicy: 'cache-and-network',
  });

  /* ───────────────────────────────────────── filter state */
  const [statusFilter, setStatus] = useState<'all' | string>('all');

  if (!sess?.user) return null;
  if (loading) return <p>{t[lang].loadingLabel}</p>;
  if (error)   return <p className="text-red-600">{error.message}</p>;

  const rawSubs =
    data?.user?.memberships?.[0]?.organisation?.subscriptions ?? [];

  const subs =
    statusFilter === 'all'
      ? rawSubs
      : rawSubs.filter((s: any) => s.status === statusFilter);

  /* gather unique statuses for dropdown */
  const statuses: string[] = Array.from(
    new Set(rawSubs.map((s: any) => s.status)),
  ).sort();

  return (
    <div className="space-y-4">
      {/* filter control */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {t[lang].filterStatusLabel ?? 'Status:'}
        </label>
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">{t[lang].allLabel ?? 'All'}</option>
          {statuses.map(s => (
            <option key={s} value={s}>{t[lang][`subscriptionStatus.${s}`] ?? s}</option>
          ))}
        </select>
      </div>

      {/* subscription list */}
      {subs.length === 0 ? (
        <p>{t[lang].noSubscriptionsLabel}</p>
      ) : (
        <ul className="space-y-4">
          {subs.map((s: any) => {
            const priceYearly = (s.price.amount / 100).toLocaleString(undefined, {
              style: 'currency',
              currency: s.price.currency.toUpperCase(),
              maximumFractionDigits: 0,
            });
            const periodEnd = s.currentPeriodEnd && new Date(s.currentPeriodEnd).toLocaleDateString();
            return (
              <li key={s.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{s.plan.label}</h3>
                    <p className="text-sm text-gray-600">
                      {t[lang][`subscriptionStatus.${s.status}`] ?? s.status}
                    </p>
                  </div>
                  <span className="text-xl font-bold">{priceYearly}</span>
                </div>
                {periodEnd && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t[lang].renewsLabel}: {periodEnd}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
