// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function Sidebar() {
  const { lang } = useLanguage();
  return (
    <nav className="w-64 bg-white border-r h-screen sticky top-0">
      <ul className="p-6 space-y-6">
        <li>
          <Link
            href="/"
            className="block text-lg font-semibold hover:text-green-600"
          >
            {t[lang].dashboardTitle}
          </Link>
        </li>
        <li>
          <div className="text-sm font-medium text-gray-500 uppercase">
            {t[lang].farmsSectionTitle}
          </div>
          <ul className="mt-2 space-y-2 pl-4">
            <li>
              <Link
                href="/farms"
                className="hover:text-green-600"
              >
                {t[lang].manageFarms}
              </Link>
            </li>
            <li>
              <Link
                href="/farms/new"
                className="hover:text-green-600"
              >
                + {t[lang].newFarm}
              </Link>
            </li>
          </ul>
        </li>
        {/* you can add more sections here */}
      </ul>
    </nav>
  );
}
