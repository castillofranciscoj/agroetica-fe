// src/app/careers/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import Link                from 'next/link';
import { useLanguage }     from '@/components/LanguageContext';
import { t }               from '@/i18n';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_JOB_OPENING,
  CREATE_JOB_CANDIDATE,
} from '@/graphql/operations';
import {
  Twitter,
  Linkedin,
  Facebook,
  ArrowLeft,
} from 'lucide-react';

/**
 * Next’s generated PageProps (for app-router pages) allows `params`
 * to arrive either synchronously or already wrapped in a Promise.
 * We accept both shapes to satisfy the constraint.
 */


export default function JobPage(  { params }: { params?: Promise<{ id: string }> },
) {

  
  /* ---------------------------------------------------------------- */
  /* 2.  Safe unwrap that satisfies Next’s PageProps constraint        */
  /* ---------------------------------------------------------------- */
  const { id } = React.use(
    params ?? Promise.resolve({ id: '' }),   // params is always a Promise
  ) as { id: string };

const router = useLocaleRouter();
  const { lang }    = useLanguage();

  /* ----- GraphQL ------------------------------------------------ */
  const { data, loading, error } = useQuery(GET_JOB_OPENING, {
    variables: { where: { id } },
  });
  const [apply, { loading: applying }] = useMutation(CREATE_JOB_CANDIDATE);

  /* ----- local form state -------------------------------------- */
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    resume: '',
    desiredPay: '',
    website: '',
    linkedin: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitted , setSubmitted ]   = useState(false);

  /* ----- early states ------------------------------------------ */
  if (loading) return <p className="p-6">{t[lang].loadingLabel}…</p>;
  if (error)   return <p className="p-6 text-red-600">{error.message}</p>;
  const job = data.jobOpening;

  /* ----- handlers ---------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await apply({
        variables: {
          data: { ...form, jobOpening: { connect: { id } } },
        },
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError((err as Error).message);
    }
  };

  /* ----- success screen ---------------------------------------- */
  if (submitted) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">
          {t[lang].applicationSuccessHeading}
        </h1>
        <p>{t[lang].applicationSuccessMessage}</p>
        <button
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => router.push('/careers')}
        >
          {t[lang].backToCareersLabel}
        </button>
      </div>
    );
  }

  /* ----- normal render ----------------------------------------- */
  return (
    <div className="pb-16">
      {/* Back link */}
      <div className="px-6 pt-6">
        <Link
          href="/careers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t[lang].backToCareersLabel}
        </Link>
      </div>

      {/* Banner */}
      <header className="bg-green-50 border-l-4 border-green-600 px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap text-gray-700 space-x-4 text-sm">
            <span>
              <strong>{t[lang].departmentLabel}:</strong>{' '}
              {t[lang][`dept.${job.department}`] || job.department}
            </span>
            <span>
              <strong>{t[lang].locationLabel}:</strong> {job.location}
            </span>
            <span>
              <strong>{t[lang].employmentTypeLabel}:</strong>{' '}
              {t[lang][`employment.${job.employmentType}`] ||
               job.employmentType}
            </span>
            <span>
              <strong>{t[lang].seniorityLabel}:</strong>{' '}
              {t[lang][`seniority.${job.seniority}`] ||
               job.seniority}
            </span>
          </div>
        </div>

        <a
          href="#applyForm"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t[lang].applyNowLabel}
        </a>
      </header>

      {/* Social share */}
      <div className="px-6 mt-4 flex space-x-4">
        <ShareButton
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
            typeof window !== 'undefined' ? window.location.href : '',
          )}&text=${encodeURIComponent(job.title)}`}
          label="Twitter"
        >
          <Twitter className="w-6 h-6" />
        </ShareButton>

        <ShareButton
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            typeof window !== 'undefined' ? window.location.href : '',
          )}&title=${encodeURIComponent(job.title)}`}
          label="LinkedIn"
        >
          <Linkedin className="w-6 h-6" />
        </ShareButton>

        <ShareButton
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            typeof window !== 'undefined' ? window.location.href : '',
          )}`}
          label="Facebook"
        >
          <Facebook className="w-6 h-6" />
        </ShareButton>
      </div>

      {/* Description */}
      <div className="prose max-w-3xl mx-auto px-6 mt-8">
        <h2 className="text-xl font-semibold">
          {t[lang].jobDescriptionHeading}
        </h2>
        <p>{job.description}</p>
      </div>

      {/* Apply Form */}
      <div id="applyForm" className="max-w-3xl mx-auto px-6 mt-12">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold mb-4">
            {t[lang].applyForThisJobLabel}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(
              [
                'name',
                'lastName',
                'email',
                'phone',
                'resume',
                'desiredPay',
                'website',
                'linkedin',
              ] as const
            ).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {t[lang][`${field}Label`]}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border rounded p-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            ))}

            {submitError && <p className="text-red-600">{submitError}</p>}

            <button
              type="submit"
              disabled={applying}
              className="w-full bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {t[lang].applyButtonLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Share button (tiny helper)                                         */
/* ------------------------------------------------------------------ */
function ShareButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="hover:opacity-80"
    >
      {children}
    </a>
  );
}
