'use client';

import React          from 'react';
import { useSession } from 'next-auth/react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import FieldManager   from '@/components/FieldManager';

export default function EditFieldPage() {
  const { data: ses } = useSession();
  const router        = useLocaleRouter();
  const userId        = ses?.user?.id;

  if (!userId) return null;                // splash handled globally

  return (
    <FieldManager
      currentUserId={userId}
      mode="edit"
      onCancel={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}
