'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Share2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import { useQuery } from '@apollo/client';
import { GET_JOB_OPENINGS } from '@/graphql/operations';
import Footer from '@/components/Footer';

export default function CareersPage() {
  const { lang } = useLanguage();
  const { data, loading, error } = useQuery(GET_JOB_OPENINGS);

  /* ── Local filter state ───────────────────────── */
  const [deptFilter, setDeptFilter] = useState<'all' | string>('all');
  const [locFilter,  setLocFilter]  = useState<'all' | string>('all');

  /* derive unique dept / locations from query */
  const departments = useMemo(
    () =>
      Array.from(
        new Set((data?.jobOpenings ?? []).map((j: any) => j.department))
      ),
    [data]
  );
  const locations = useMemo(
    () =>
      Array.from(
        new Set((data?.jobOpenings ?? []).map((j: any) => j.location))
      ),
    [data]
  );

  /* filter jobs */
  const filteredJobs = useMemo(() => {
    if (!data?.jobOpenings) return [];
    return data.jobOpenings.filter((job: any) => {
      const deptOK = deptFilter === 'all' || job.department === deptFilter;
      const locOK  = locFilter  === 'all' || job.location   === locFilter;
      return deptOK && locOK;
    });
  }, [data, deptFilter, locFilter]);

  /* small fade helper */
  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, delay },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── HERO BANNER ─────────────────────────────── */}
      <section className="-mx-6 relative h-[45vh] overflow-hidden">
        <Image
          src="/img/agroetica-community-15682913.jpg"
          alt="Agroetica team and community"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.h1
            className="text-white text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl drop-shadow-md"
            {...fadeIn()}
          >
            {t[lang].careersHeading}
          </motion.h1>
          <motion.p
            className="text-white/90 mt-2 text-lg max-w-2xl"
            {...fadeIn(0.2)}
          >
            {t[lang].careersSubtitle}
          </motion.p>
        </div>
      </section>

      {/* ── FILTER BAR ─────────────────────────────── */}
<section className="-mx-6 bg-gray-50">
  {/* inner container keeps 1.5 rem side-padding like the rest of the page */}
  <div className="max-w-6xl mx-auto py-4 px-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
    {/* Department select */}
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium">{t[lang].departmentLabel}:</span>
      <select
        className="border rounded px-3 py-1 text-sm"
        value={deptFilter}
        onChange={(e) => setDeptFilter(e.target.value)}
      >
        <option value="all">{t[lang].allLabel}</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {t[lang][`dept.${d}`] || d}
          </option>
        ))}
      </select>
    </label>

    {/* Location select */}
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium">{t[lang].locationLabel}:</span>
      <select
        className="border rounded px-3 py-1 text-sm"
        value={locFilter}
        onChange={(e) => setLocFilter(e.target.value)}
      >
        <option value="all">{t[lang].allLabel}</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </label>

    {/* Reset button */}
    {(deptFilter !== 'all' || locFilter !== 'all') && (
      <button
        onClick={() => {
          setDeptFilter('all');
          setLocFilter('all');
        }}
        className="text-sm text-green-700 hover:underline"
      >
        {t[lang].resetFilterLabel}
      </button>
    )}
  </div>
</section>


      {/* ── MAIN CONTENT ───────────────────────────── */}
      <main className="flex-1 px-6 py-16 space-y-12">
        {/* Loading / Error */}
        {loading && <p className="text-center">{t[lang].loadingLabel}…</p>}
        {error && <p className="text-center text-red-600">{error.message}</p>}

        {/* Job cards */}
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job: any) => (
            <motion.li
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <Share2
                className="absolute top-4 right-4 w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={t[lang].shareJobLabel}
              />

              <h2 className="text-2xl font-semibold mb-3">{job.title}</h2>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-6">
                <span className="inline-flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-green-600" />
                  {t[lang].departmentLabel}:{' '}
                  {t[lang][`dept.${job.department}`] || job.department}
                </span>
                <span className="inline-flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-green-600" />
                  {job.location}
                </span>
              </div>

              <Link
                href={`/careers/${job.id}`}
                className="mt-auto inline-block bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {t[lang].viewDetailsLabel}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* No positions */}
        {filteredJobs.length === 0 && !loading && (
          <p className="text-center text-gray-600">
            {t[lang].noPositionsLabel}
          </p>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}
