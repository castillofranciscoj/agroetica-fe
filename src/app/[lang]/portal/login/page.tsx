// src/app/[lang]/portal/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import Logo                from '@/components/Logo';
import PasswordInput       from '@/components/PasswordInput';
import LanguagePicker      from '@/components/LanguagePicker';
import PasswordStrengthBar from '@/components/PasswordStrengthBar';
import TermsCheckbox       from '@/components/TermsCheckbox';
import LoginHeroVideo      from '@/components/LoginHeroVideo';
import AuthFooterSwitch    from '@/components/AuthFooterSwitch';

import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

/* -------------------------------------------------------------
   Map Next-Auth error codes → i18n keys
---------------------------------------------------------------- */
const ERR: Record<string, string> = {
  CredentialsSignin: 'credentialsErrorSignin',
  OAuthSignin       : 'oauthErrorSignin',
  OAuthCallback     : 'oauthErrorCallback',
  OAuthCreateAccount: 'oauthErrorCreateAccount',
  EmailCreateAccount: 'emailErrorCreateAccount',
  EmailSignin       : 'emailErrorSignin',
  default           : 'oauthErrorDefault',
};

export default function LoginPage() {
  /* ----------  URL params ----------------------------------- */
  const sp        = useSearchParams();
  const nextParam = sp.get('next') ?? '/portal';

  /* ----------  Locale helpers ------------------------------- */
  const pathname      = usePathname();          // e.g. /en/portal/login
  const { lang }      = useLanguage();          // may be undefined 1st render

  /** Fallback to locale in URL (or "en") while context hydrates */
  const safeLang =
    lang ||
    (() => {
      const m = pathname.match(/^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/);
      return m ? m[1] : 'en';
    })();

  /** Ensure path has locale prefix */
  const ensureLocale = (p: string) =>
    /^\/(en|it|es|fr|pt|de|da|nl|pl|gr)\//.test(p)
      ? p
      : `/${safeLang}${p.startsWith('/') ? '' : '/'}${p}`;

  /** Absolute URL for Next-Auth cookie verification */
  const makeCallbackUrl = (p: string) => {
    const path = ensureLocale(p);
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${path}`;
  };

  const callbackUrl = makeCallbackUrl(nextParam);
  const router      = useRouter();

  /* ----------  Form / UI state ------------------------------ */
  const [mode, setMode]     = useState<'login' | 'register'>('login');
  const [email, setEmail]   = useState('');
  const [pw,    setPw]      = useState('');
  const [pw2,   setPw2]     = useState('');

  /* register-only */
  const [first, setFirst]   = useState('');
  const [last,  setLast]    = useState('');
  const [farm,  setFarm]    = useState('');
  const [country, setCountry] = useState('');
  const [terms, setTerms]     = useState(false);
  const [policy, setPolicy]   = useState(false);

  /* local error banner */
  const [localError, setLocalError] = useState<string | null>(null);

  /* ----------  submit: login -------------------------------- */
  const doLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const res = await signIn('credentials', {
      redirect   : false,     // ⬅️ stay on page
      callbackUrl,
      email,
      password: pw,
    });

    if (res?.error) {
      setLocalError('CredentialsSignin');
      return;
    }
    /* success */
    router.replace(callbackUrl);
  };

  /* ----------  submit: register ----------------------------- */
  const doRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (pw !== pw2) {
      setLocalError('pwMismatch');
      return;
    }
    if (!terms || !policy) {
      setLocalError('acceptTerms');
      return;
    }

    const rq = await fetch('/api/auth/register', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        email,
        password      : pw,
        name          : `${first} ${last}`.trim(),
        givenName     : first,
        familyName    : last,
        farmName      : farm,
        country,
        acceptedTerms : terms,
        acceptedPrivacy: policy,
      }),
    });

    if (!rq.ok) {
      setLocalError('registerFailed');
      return;
    }

    const res = await signIn('credentials', {
      redirect   : false,
      callbackUrl,
      email,
      password   : pw,
    });

    if (res?.error) {
      setLocalError('CredentialsSignin');
      return;
    }
    router.replace(callbackUrl);
  };

  /* ----------  banner message ------------------------------- */
  const banner =
    localError &&
    (t[safeLang][ERR[localError] ?? ERR.default] ||
      t[safeLang].loginFailed ||
      'Error');

  /* ----------  UI ------------------------------------------- */
  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row">
      {/* -------- LEFT column (form) -------- */}
      <div className="relative flex flex-col items-center justify-center md:w-1/2 px-6 py-10">
        {/* language picker */}
        <div className="absolute top-4 right-4 z-[70]">
          <LanguagePicker />
        </div>

        {/* logo */}
        <div className="mb-8">
          <div className="block md:hidden">
            <Logo width={240} />
          </div>
          <div className="hidden md:block">
            <Logo width={380} />
          </div>
        </div>

        {/* card */}
        <div className="w-full max-w-md bg-white shadow rounded-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">
            {mode === 'login'
              ? t[safeLang].loginLabel
              : t[safeLang].registerHeroTitle ??
                'Register your account—free forever!'}
          </h1>

          {banner && (
            <div className="rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
              {banner}{' '}
              {localError === 'CredentialsSignin' && (
                <Link
                  href={`/${safeLang}/auth/forgot-password`}
                  className="underline underline-offset-2"
                >
                  {t[safeLang].forgotPwLink}
                </Link>
              )}
            </div>
          )}

          <form
            onSubmit={mode === 'login' ? doLogin : doRegister}
            className="space-y-4"
          >
            {/* register-only: first & last name */}
            {mode === 'register' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={t[safeLang].firstNamePH ?? 'First name'}
                  value={first}
                  onChange={e => setFirst(e.target.value)}
                  className="border p-3 w-1/2 rounded"
                />
                <input
                  type="text"
                  required
                  placeholder={t[safeLang].lastNamePH ?? 'Last name'}
                  value={last}
                  onChange={e => setLast(e.target.value)}
                  className="border p-3 w-1/2 rounded"
                />
              </div>
            )}

            <input
              type="email"
              required
              placeholder={t[safeLang].emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border p-3 w-full rounded"
            />

            <PasswordInput
              required
              placeholder={t[safeLang].passwordPlaceholder}
              value={pw}
              onChange={e => setPw(e.target.value)}
            />

            {/* forgot password link (login mode only) */}
            {mode === 'login' && (
              <Link
                href={`/${safeLang}/auth/forgot-password`}
                className="block text-center text-sm text-gray-600 hover:text-gray-800 underline-offset-4 hover:underline transition"
              >
                {t[safeLang].forgotPwLink}
              </Link>
            )}

            {/* strength bar + confirm pw only in register mode */}
            {mode === 'register' && <PasswordStrengthBar value={pw} />}
            {mode === 'register' && (
              <PasswordInput
                required
                placeholder={t[safeLang].confirmPwPH ?? 'Confirm password'}
                value={pw2}
                onChange={e => setPw2(e.target.value)}
              />
            )}

            {mode === 'register' && (
              <>
                <input
                  type="text"
                  required
                  placeholder={t[safeLang].farmNamePH ?? 'Farm name'}
                  value={farm}
                  onChange={e => setFarm(e.target.value)}
                  className="border p-3 w-full rounded"
                />
                <input
                  type="text"
                  required
                  placeholder={t[safeLang].countryPH ?? 'Country'}
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="border p-3 w-full rounded"
                />

                <TermsCheckbox
                  checked={terms}
                  onChange={setTerms}
                  label={t[safeLang].iAgree}
                  linkHref="/legal"
                  linkLabel={t[safeLang].termsLabel ?? 'Terms & Conditions'}
                />
                <TermsCheckbox
                  checked={policy}
                  onChange={setPolicy}
                  label={t[safeLang].iAgree}
                  linkHref="/privacy"
                  linkLabel={t[safeLang].privacyLabel ?? 'Privacy Policy'}
                />
              </>
            )}

            <button
              type="submit"
              className="group w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition transform duration-200 hover:scale-105 active:scale-100"
            >
              <span>
                {mode === 'login'
                  ? t[safeLang].loginButton
                  : t[safeLang].registerButton}
              </span>
              <ArrowRight
                size={30}
                className="ml-0 w-0 opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:w-5 group-hover:opacity-100"
              />
            </button>
          </form>

          <AuthFooterSwitch mode={mode} setMode={setMode} />
        </div>
      </div>

      {/* -------- RIGHT column (hero video) -------- */}
      <LoginHeroVideo
        title={t[safeLang].heroMainTitle}
        subtitle={t[safeLang].heroMainSubtitle}
      />
    </div>
  );
}
