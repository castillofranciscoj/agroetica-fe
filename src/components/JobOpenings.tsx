'use client';
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_OPENINGS } from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  seniority: string;
}

const JobOpenings: React.FC = () => {
  const { lang } = useLanguage();
  const { data, loading, error } = useQuery<{ jobOpenings: JobOpening[] }>(GET_JOB_OPENINGS);

  return (
    <section className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">{t[lang].openPositionsHeading}</h2>

      {loading && <p>{t[lang].loadingLabel}</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <ul className="space-y-3">
        {data?.jobOpenings.map(job => (
          <li key={job.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold">{job.title}</h3>

            <div className="mt-1 text-sm text-gray-600 space-x-4">
              <span><strong>{t[lang].departmentLabel}:</strong> {job.department}</span>
              <span><strong>{t[lang].locationLabel}:</strong> {job.location}</span>
            </div>

            <div className="mt-2 text-sm text-gray-700 space-x-4">
              <span><strong>{t[lang].employmentTypeLabel}:</strong> {job.employmentType}</span>
              <span><strong>{t[lang].seniorityLabel}:</strong> {job.seniority}</span>
            </div>

            <button
              className="mt-4 inline-block bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
              onClick={() => (window.location.href = `/careers/${job.id}`)}
            >
              {t[lang].applyButtonLabel}
            </button>
          </li>
        ))}
      </ul>

      {!loading && data?.jobOpenings.length === 0 && (
        <p className="text-gray-600">{t[lang].noPositionsLabel}</p>
      )}
    </section>
  );
};

export default JobOpenings;
