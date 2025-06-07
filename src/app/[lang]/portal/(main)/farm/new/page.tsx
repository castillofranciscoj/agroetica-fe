/* --------------------------------------------------------------------
   src/app/[lang]/portal/(main)/farm/new/page.tsx
   ------------------------------------------------------------------ */
'use client';

import React             from 'react';
import { useSession }    from 'next-auth/react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useLanguage }   from '@/components/LanguageContext';
import { t }             from '@/i18n';
import FarmManager       from '@/components/FarmManager';

/* ──────────────────────────────────────────────────────────────
   “Create Farm” page – the component itself handles the
   left-form / right-map 50-50 split. This wrapper just makes sure
   the user is logged-in and passes callbacks.
   ─────────────────────────────────────────────────────────── */
export default function NewFarmPage() {
  const { data: ses }    = useSession();
  const router           = useLocaleRouter();
  const { lang }         = useLanguage();

  const userId = ses?.user?.id;            // Keystone user id for CREATE_FARM

  /* show spinner until the session arrives */
  if (!userId) {
    return (
      <div className="p-6 text-gray-500">
        {t[lang].loadingLabel}…
      </div>
    );
  }

  return (
    /* Let FarmManager take the full width; it already has its own flex
       layout (fixed-width form + flex-1 map) and its own “Back” link.  */
    <FarmManager
      currentUserId={userId}
      onCancel={() => router.back()}
      /* after creating a farm go to the fields dashboard (adjust if needed) */
      onSaved={() => router.push('/portal/farm/fields')}
    />
  );
}
