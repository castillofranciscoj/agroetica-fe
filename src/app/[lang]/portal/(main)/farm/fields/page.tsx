/* ──────────────────────────────────────────────────────────────
   src/app/[lang]/portal/(main)/farm/fields/page.tsx
   ─────────────────────────────────────────────────────────── */
'use client';
export const dynamic = 'force-dynamic';

import React          from 'react';
import { useSession } from 'next-auth/react';

import YourFields     from '@/components/YourFields';

/**
 * “Fields” dashboard – full-width list of the user’s fields.
 * All heading / buttons are rendered inside <YourFields/>.
 */
export default function FieldsPage() {
  const { data: ses } = useSession();
  const userId        = ses?.user?.id;

  /* unauthenticated (or still fetching session) → nothing;
     your global layout usually handles a splash / skeleton */
  if (!userId) return null;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <YourFields userId={userId} />
    </div>
  );
}
