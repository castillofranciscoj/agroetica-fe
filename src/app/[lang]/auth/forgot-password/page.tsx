'use client';

import { useState, FormEvent } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Logo from '@/components/Logo';
import LanguagePicker from '@/components/LanguagePicker';
import { ArrowRight } from 'lucide-react';

export default function ForgotPwPage() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true); // always succeed → prevents address probing
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      <div className="absolute top-4 right-4 z-50"><LanguagePicker /></div>

      <Logo width={260} className="mb-8" />

      <div className="w-full max-w-md bg-white shadow rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {t[lang].forgotPwHeading ?? 'Forgot your password?'}
        </h1>

        {sent ? (
          <p className="text-center text-green-700">
            {t[lang].forgotPwSent ??
              'If the address exists, a reset link is on its way.'}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              placeholder={t[lang].emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border p-3 w-full rounded"
            />
            <button
              type="submit"
              className="group w-full flex justify-center items-center
                         bg-green-600 hover:bg-green-700 text-white font-semibold
                         px-6 py-3 rounded-lg shadow transition transform duration-200
                         hover:scale-105"
            >
              {t[lang].sendResetLink ?? 'Send reset link'}
              <ArrowRight
                size={26}
                className="ml-0 opacity-0 group-hover:opacity-100 group-hover:ml-1 transition-all"
              />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
