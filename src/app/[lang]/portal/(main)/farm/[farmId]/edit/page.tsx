//src/app/[lang]/portal/(main)/farm/[farmId]/edit/page.tsx


'use client';

import React from 'react';
import { useSession }       from 'next-auth/react';
import { useLocaleRouter }  from '@/lib/useLocaleRouter';
import FarmManager          from '@/components/FarmManager';

/** “Edit Farm” – identical wrapper to the Add-Farm page
 *  - left: `<FarmManager mode="edit" … />`
 *  - right: interactive LocationPicker handled inside FarmManager
 */
export default function EditFarmPage() {
  const { data: ses } = useSession();
  const router        = useLocaleRouter();
  const userId        = ses?.user?.id;

  // SSR splash is handled globally – just return nothing while we wait
  if (!userId) return null;

  return (
    /* full-height flex so the map gets its space */
    <div className="flex h-full">
      <FarmManager
        currentUserId={userId}
        mode="edit"
        /* both actions land the user back to the previous page */
        onCancel={() => router.back()}
        onSaved={() => router.back()}
      />
    </div>
  );
}
