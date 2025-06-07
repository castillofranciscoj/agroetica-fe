'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import { GET_SUBSCRIPTIONS_BY_USER, GET_PLANS } from '@/graphql/operations';
import { subscribePlan } from '@/app/[lang]/pricing/actions';
import { X } from 'lucide-react';

export default function SubscriptionCards() {
  const { lang } = useLanguage();
  const { data: sess } = useSession();
  const uid = sess?.user?.id;
  const [openFor, setOpenFor] = useState<string | null>(null);

  /* queries */
  const { data: subData, loading: lSubs } = useQuery(
    GET_SUBSCRIPTIONS_BY_USER,
    { variables: { userId: uid }, skip: !uid },
  );
  const { data: planData, loading: lPlans } = useQuery(GET_PLANS);

  if (!uid || lSubs || lPlans) return null;

  /* rank map (lower-case keys) */
  const rank: Record<string, number> = { free: 0, starter: 1, pro: 2 };

  /* plans sorted by rank (unknown → -1 so they stay first) */
  const allPlans = [...(planData?.plans ?? [])].sort((a: any, b: any) => {
    const ra = rank[(a.key ?? '').toLowerCase()] ?? -1;
    const rb = rank[(b.key ?? '').toLowerCase()] ?? -1;
    return ra - rb;
  });
  const priciest   = allPlans.at(-1);
  const secondBest = allPlans.at(-2);

  /* subscriptions */
  const subs =
    subData?.user?.memberships?.[0]?.organisation?.subscriptions ?? [];

  if (subs.length === 0) return <p>{t[lang].noSubscriptionsLabel}</p>;

/* helper: return only tiers above the current one */
const safeRank = (k?: string) =>
  k ? rank[k.toLowerCase()] ?? -1 : -1;

const getUpgradeChoices = (currentKey?: string) =>
  allPlans.filter((p: any) => safeRank(p.key) > safeRank(currentKey));


  const handleUpgrade = async (planKey: string) => {
    const url = await subscribePlan(planKey);
    window.location.assign(url);
  };

  /* render */
  return (
    <div className="space-y-6">
      {subs.map((s: any) => {
        const upgrades = getUpgradeChoices(s.plan?.key);

        return (
          <div
            key={s.id}
            className="border p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-bold">{s.plan?.label ?? '—'}</h3>
              <p className="text-sm text-gray-600">
                {t[lang][`subscriptionStatus.${s.status}`] ?? s.status}
              </p>
            </div>

            {upgrades.length === 0 ? (
              <a
                href="mailto:sales@agroetica.com"
                className="underline text-green-700 font-medium"
              >
                {t[lang].enterpriseCTA ??
                  'Looking for Enterprise? Let’s talk'}
              </a>
            ) : (
              <button
                onClick={() => setOpenFor(s.id)}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                {t[lang].upgradeButtonLabel ?? 'Upgrade'}
              </button>
            )}
          </div>
        );
      })}

      {/* Modal (only if upgrades exist) */}
      {openFor && (() => {
        const currentSub = subs.find((x: any) => x.id === openFor);
        if (!currentSub) return null;
        const choices = getUpgradeChoices(currentSub.plan?.key);
        if (choices.length === 0) return null;

        return (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-start justify-center overflow-y-auto p-6">
            <div className="bg-white max-w-5xl w-full rounded-xl shadow-lg overflow-hidden">
              {/* header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-2xl font-bold">
                  {t[lang].upgradeModalTitle ?? 'Upgrade your plan'}
                </h2>
                <button onClick={() => setOpenFor(null)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* current plan (left) */}
                <div className="border p-4 rounded-lg shadow-md md:col-span-1">
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">
                    {t[lang].currentPlanLabel ?? 'Current plan'}
                  </h3>
                  <p className="text-2xl font-bold mb-1">
                    {currentSub.plan?.label ?? '—'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {(currentSub.price.amount / 100).toLocaleString(undefined, {
                      style: 'currency',
                      currency: currentSub.price.currency.toUpperCase(),
                      maximumFractionDigits: 0,
                    })}{' '}
                    / {t[lang]['pricing:year'] ?? 'year'}
                  </p>
                </div>

                {/* upgrade choices (right) */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                  {choices.map((p: any) => {
                    const badge =
                      p.id === priciest?.id
                        ? 'featured'
                        : p.id === secondBest?.id
                        ? 'best'
                        : null;

                    return (
                      <div
                        key={p.id}
                        className={`border p-6 rounded-lg shadow relative ${
                          badge === 'featured' ? 'ring-2 ring-green-600' : ''
                        }`}
                      >
                        {badge === 'best' && (
                          <span className="absolute -top-3 left-4 bg-yellow-400 text-xs font-semibold px-3 py-1 rounded-full shadow">
                            {t[lang].bestValueLabel ?? 'Best value'}
                          </span>
                        )}
                        <h3 className="text-xl font-bold mb-2">{p.label}</h3>
                        <p className="text-3xl font-extrabold mb-4">
                          {(p.activePrice.amount / 100).toLocaleString(
                            undefined,
                            {
                              style: 'currency',
                              currency: p.activePrice.currency.toUpperCase(),
                              maximumFractionDigits: 0,
                            },
                          )}{' '}
                          / {t[lang]['pricing:year'] ?? 'year'}
                        </p>
                        <button
                          onClick={() => handleUpgrade(p.key)}
                          className={`w-full py-2 rounded-lg font-semibold ${
                            badge === 'featured'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'border border-green-600 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {t[lang].upgradeToLabel ?? 'Upgrade to'} {p.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
