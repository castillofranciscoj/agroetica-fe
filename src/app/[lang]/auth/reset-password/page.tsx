// src/app/[lang]/auth/reset-password/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthBar from '@/components/PasswordStrengthBar';
import Logo from '@/components/Logo';
import LanguagePicker from '@/components/LanguagePicker';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

/**
 * After a successful password reset we land the user on
 * the locale‑prefixed dashboard route, e.g. `/fr/portal?reset=1`.
 */
export default function ResetPwPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();

  // params from the magic‑link
  const email = sp.get('email') ?? '';
  const token = sp.get('token') ?? '';

  // local state
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (pw !== pw2) {
      setErr(t[lang].pwMismatch ?? 'Passwords do not match');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password: pw }),
    });

    if (res.ok) {
      router.replace(`/${lang}/portal?reset=1`);
    } else {
      const { code, message } = await res.json();
      setErr(
        t[lang][`pwReset_${code}`] ?? message ??
          'Something went wrong, please request a new link.'
      );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* ---- Branding & language switcher ---- */}
      <Logo width={260} className="absolute top-6 left-6" />
      <div className="absolute top-6 right-6">
        <LanguagePicker />
      </div>

      {/* ---- Card ---- */}
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {t[lang].chooseNewPw ?? 'Choose a new password'}
        </h1>

        {err && (
          <div className="rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <PasswordInput
              required
              placeholder={t[lang].passwordPlaceholder}
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
            {/* Password strength indicator */}
            <PasswordStrengthBar password={pw} />
          </div>

          <PasswordInput
            required
            placeholder={t[lang].confirmPwPH ?? 'Confirm password'}
            value={pw2}
            onChange={e => setPw2(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition hover:scale-105"
          >
            {t[lang].resetPwBtn ?? 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
