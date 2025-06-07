/* ──────────────────────────────────────────────────────────────
   src/app/[lang]/portal/(main)/farm/page.tsx
   ─────────────────────────────────────────────────────────── */
'use client';
export const dynamic = 'force-dynamic';

import React          from 'react';
import { useSession } from 'next-auth/react';

import YourFarms      from '@/components/YourFarms';

/**
 * “Farms” dashboard -- just shows <YourFarms> full-width.
 * Auth splash / redirect is handled globally, so we can
 * early-return while the session is still loading.
 */
export default function FarmPage() {
  const { data: ses } = useSession();
  const userId        = ses?.user?.id;

  /* not signed-in (or still fetching session) → render nothing;
     your global layout usually shows a spinner / skeleton */
  if (!userId) return null;

  /* <YourFarms> already contains its own heading (“Your Farms”)
     and the “+ Add farm” button, so this wrapper only needs a
     little padding / scroll room */
  return (
    <div className="p-6 h-full overflow-y-auto">
      <YourFarms userId={userId} />
    </div>
  );
}
