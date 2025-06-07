'use client';

import React, { useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { GET_PLANS } from '@/graphql/operations';
import { subscribePlan } from '@/app/[lang]/pricing/actions';

export default function PricingTable() {
  const router = useLocaleRouter();
  const searchParams = useSearchParams();
  const buyPlan = searchParams.get('buy');
  const { lang } = useLanguage();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const { data, loading, error } = useQuery(GET_PLANS, { errorPolicy: 'all' });

  /* Auto-checkout after login redirect */
  useEffect(() => {
    if (buyPlan && session?.user && buyPlan !== 'free') handleBuy(buyPlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyPlan, session?.user]);

  async function handleBuy(planKey: string) {
    if (!session?.user) {
      router.push(`/portal/login?next=/pricing?buy=${planKey}`);
      return;
    }
    try {
      const url = await subscribePlan(planKey);
      if (url) window.location.assign(url);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Checkout failed, please try again.');
    }
  }

  /* —— helpers —— */
  const order = ['free', 'starter', 'pro'];
  const sortPlans = (arr: any[]) => [...arr].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  const fallbackFeatures: Record<string, string[]> = {
    free: [
      t[lang].featLogbook,
      t[lang].featFieldDraw,
      t[lang].featNdviPreview,
      t[lang].featAlerts3,
      t[lang].featCarbonTracker,
    ],
    starter: [
      t[lang].featEverythingFree,
      t[lang].featNdviHistory,
      t[lang].featCropPlanner,
      t[lang].featUnlimitedAlerts,
      t[lang].featApiAccess,
    ],
    pro: [
      t[lang].featEverythingStarter,
      t[lang].featCarbonDashboard,
      t[lang].featIotConnectors,
      t[lang].featCoopPortal,
      t[lang].featPrioritySupport,
    ],
  };

  const cardClasses = (key: string) => {
    switch (key) {
      case 'starter':
        return 'border-2 border-green-600 shadow-lg relative';
      case 'pro':
        return 'border shadow relative';
      default:
        return 'border shadow';
    }
  };

  const ribbon = (key: string) => {
    if (key === 'starter')
      return (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
          {t[lang].bestValueTag}
        </span>
      );
    if (key === 'pro')
      return (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
          {t[lang].allInTag}
        </span>
      );
    return null;
  };

  if (loading) return <p>{t[lang].loadingLabel ?? 'Loading…'}</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <>
      <ul className="grid gap-8 md:grid-cols-3">
        {sortPlans(data.plans).map((p: any) => {
          const price = p.activePrice;
          const priceCurrency = price.amount.toLocaleString(undefined, {
            style: 'currency',
            currency: price.currency.toUpperCase(),
          });

          const clickHandler = () => {
            if (p.key === 'free') {
              router.push('/portal');
            } else {
              startTransition(() => handleBuy(p.key));
            }
          };

          const features = p.features?.length ? p.features : fallbackFeatures[p.key] ?? [];

          return (
            <li key={p.id} className={`${cardClasses(p.key)} rounded-lg p-8 flex flex-col items-center text-center bg-white`}>
              {ribbon(p.key)}

              <h3 className="text-xl font-bold mb-2">{p.label.toUpperCase()}</h3>
              <p className="text-3xl font-extrabold mb-1">{priceCurrency}</p>
              {p.key !== 'free' && (
                <p className="text-xs text-gray-500 mb-4">/ {t[lang].pricingYear}</p>
              )}

              <ul className="space-y-1 text-sm text-gray-700 mb-6 text-left max-w-xs">
                {features.map((f: string) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>

              <button
                disabled={isPending && p.key !== 'free'}
                onClick={clickHandler}
                className={`w-full py-2 rounded font-semibold text-sm ${
                  p.key === 'pro'
                    ? 'bg-gray-800 hover:bg-gray-900 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-60`}
              >
                {isPending && p.key !== 'free' ? t[lang].redirectingLabel ?? 'Redirecting…' : t[lang].startNowLabel}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-500 mt-6 text-center">{t[lang].vatDisclaimer}</p>
    </>
  );
}