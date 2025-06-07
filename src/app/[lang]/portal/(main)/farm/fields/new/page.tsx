'use client';

import React          from 'react';
import { useSession } from 'next-auth/react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import FieldManager   from '@/components/FieldManager';
import { t }          from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

export default function NewFieldPage() {
  const { data: ses } = useSession();
  const router        = useLocaleRouter();
  const { lang }      = useLanguage();
  const userId        = ses?.user?.id;

  if (!userId)
    return <p className="p-6 text-gray-500">{t[lang].loadingLabel}…</p>;

  return (
    <FieldManager
      currentUserId={userId}
      onCancel={() => router.back()}
      onSaved={() => router.push('/portal/farm/fields')}
    />
  );
}
