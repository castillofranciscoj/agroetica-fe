// ────────────────────────────────────────────────────────────────
// src/app/portal/(main)/admin/page.tsx
// ────────────────────────────────────────────────────────────────
'use client';

export const dynamic = 'force-dynamic';


import { useState }       from 'react';
import ProductSyncCard    from '@/components/ProductSyncCard';
import PartnersPanel      from '@/components/PartnersPanel';
import CampaignsPanel     from '@/components/CampaignsPanel';
import MessagesPanel     from '@/components/MessagesPanel';

import { useLanguage }    from '@/components/LanguageContext';
import { t }              from '@/i18n';

type TabKey = 'sync' | 'partners' | 'campaigns' | 'messages';

export default function AdminPage() {
  const { lang }      = useLanguage();
  const [tab, setTab] = useState<TabKey>('sync');

  /* helper for tab button */
  const TabBtn = ({
    id, label,
  }: { id: TabKey; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-t-md border-b-2
        ${tab === id
          ? 'border-green-600 text-green-700 font-semibold'
          : 'border-transparent hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Admin</h1>

      {/* ── tabs header ───────────────────────────────────────── */}
      <div className="flex border-b gap-1 mb-6">
        <TabBtn id="sync"      label={t[lang].syncTabLabel      ?? 'Sync'} />
        <TabBtn id="partners"  label={t[lang].partnersTabLabel  ?? 'Partners'} />
        <TabBtn id="campaigns" label={t[lang].campaignsTabLabel ?? 'Campaigns'} />
        <TabBtn id="messages"  label={t[lang].messageTabLabel   ?? 'Messages'} />
      </div>

      {/* ── tab content (fills the rest of the height) ────────── */}
      <div className="flex-1 overflow-auto">
        {tab === 'sync'      && <ProductSyncCard   />}
        {tab === 'partners'  && <PartnersPanel     />}
        {tab === 'campaigns' && <CampaignsPanel    />}
        {tab === 'messages'  && <MessagesPanel     />}
      </div>
    </div>
  );
}
