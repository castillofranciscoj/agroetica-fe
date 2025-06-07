// src/app/[lang]/portal/(main)/logbook/overview/page.tsx
'use client';

import ExportButtonQDCA from '@/components/ExportButtonQDCA';

export const dynamic = 'force-dynamic';

export default function Page() {
  const thisYear = new Date().getFullYear();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Logbook overview</h1>

      <ExportButtonQDCA initialYear={thisYear} />

      {/* …rest of your page… */}
    </div>
  );
}
