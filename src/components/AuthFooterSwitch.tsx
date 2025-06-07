//src/components/AuthFooterSwitch.tsx

'use client';

import { ArrowRight } from 'lucide-react';
import Link           from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

interface Props {
  mode: 'login' | 'register';
  setMode: (m: 'login' | 'register') => void;
}

export default function AuthFooterSwitch({ mode, setMode }: Props) {
  const { lang } = useLanguage();

  return (
    <div className="text-center space-y-3">
      {mode === 'login' ? (
        <>
          {/* full-width outlined CTA */}
          <button
            type="button"
            onClick={() => setMode('register')}
            className="
              group w-full flex justify-center items-center
              border-2 border-green-600 text-green-700
              font-semibold rounded-lg px-6 py-3
              hover:bg-green-50 transition
            "
          >
            {t[lang].noAccountYet}
            <ArrowRight
              size={26}
              className="ml-1 -mr-1 opacity-70 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setMode('login')}
          className="text-blue-600 hover:underline text-sm"
        >
          {t[lang].haveAccount}
        </button>
      )}
    </div>
  );
}
