// src/components/JourneyMap.tsx
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from './LanguageContext';
import { t } from '@/i18n';
import { useQuery } from '@apollo/client';
import { GET_FARMER_JOURNEYS } from '@/graphql/operations';
import { Steps, Step } from '@/components/Stepper';
import CurrentPhasePanel from '@/components/CurrentPhasePanel';

export default function JourneyMap() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const userId = session?.user?.id;

  // Always call hook to preserve order
  const { data, loading, error } = useQuery(GET_FARMER_JOURNEYS, {
    variables: { where: { user: { id: { equals: userId! } } } },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/portal/login';
    }
  }, [status]);

  if (status === 'loading' || !userId || loading) {
    return <p className="p-6">{t[lang].loadingJourney}</p>;
  }
  if (error) {
    return (
      <p className="p-6 text-red-600">
        {t[lang].errorLoadingJourney}: {error.message}
      </p>
    );
  }

  const journey = data?.farmerJourneys?.[0];
  const phases = (journey?.phases || [])
    .slice()
    .sort((a, b) => a.order - b.order);

  // Compute status: first unlocked, others locked until requirements logic
  const phaseStatuses = phases.map((phase, idx) => {
    // phase.prerequisites empty -> unlocked
    const prereqsDone = (phase.prerequisites || []).length === 0 || false;
    const isCurrent = prereqsDone && idx === 0;
    return isCurrent ? 'current' : 'locked';
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">{t[lang].journeyTitle}</h1>
      <p className="text-lg text-gray-600 mb-6">{t[lang].journeySubtitle}</p>

      <Steps>
        {phases.map((phase, i) => (
          <Step
            key={phase.key}
            status={phaseStatuses[i] as unknown}
            label={t[lang][phase.key]}
            iconName={phase.icon}
            tooltip={
              phaseStatuses[i] === 'locked'
                ? t[lang].completePrereqTooltip
                : undefined
            }
          />
        ))}
      </Steps>

      <div className="mt-8">
        {phases.map((phase, i) =>
          phaseStatuses[i] === 'current' ? (
            <CurrentPhasePanel key={phase.key} phase={phase} />
          ) : null
        )}
      </div>
    </div>
  );
}
