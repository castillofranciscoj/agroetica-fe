'use client';

import { useState }       from 'react';
import MessageTemplate    from '@/components/MessageTemplate';
import MessageDelivery    from '@/components/MessageDelivery';
import MessageStatus      from '@/components/MessageStatus';
import { useLanguage }    from '@/components/LanguageContext';
import { t }              from '@/i18n';

type SubTab = 'templates' | 'deliveries' | 'stats';

export default function MessagesPanel() {
  const { lang } = useLanguage();
  const [subTab, setSubTab] = useState<SubTab>('templates');

  const Btn = ({ id, label }: { id: SubTab; label: string }) => (
    <button
      onClick={() => setSubTab(id)}
      className={`px-4 py-2 rounded-t-md border-b-2
        ${subTab === id
          ? 'border-green-600 text-green-700 font-semibold'
          : 'border-transparent hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* sub‑tabs */}
      <div className="flex border-b gap-1 mb-4">
        <Btn id="templates"  label={t[lang].templatesSubTabLabel} />
        <Btn id="deliveries" label={t[lang].deliveriesSubTabLabel} />
        <Btn id="stats"      label={t[lang].statsSubTabLabel} />
      </div>

      {/* content (scrollable) */}
      <div className="flex-1 overflow-auto">
        {subTab === 'templates'  && <MessageTemplate />}
        {subTab === 'deliveries' && <MessageDelivery />}
        {subTab === 'stats'      && <MessageStatus   />}
      </div>
    </div>
  );
}
