// src/app/[lang]/blog/page.tsx   (now “News” index)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';

import { GET_POSTS } from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Footer from '@/components/Footer';

export default function NewsIndexPage() {
  const { lang } = useLanguage();
  const { data, loading, error } = useQuery(GET_POSTS);
  const posts = data?.posts ?? [];

  /* rotating topics in “Let’s talk about …” */
  const topics: string[] = t[lang].topics;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % topics.length), 5_000);
    return () => clearInterval(iv);
  }, [topics.length]);

  if (loading) return <p className="p-6">{t[lang].loadingLabel}</p>;
  if (error)   return <p className="p-6 text-red-600">{t[lang].notFoundLabel}: {error.message}</p>;

  return (
    <div className="flex flex-col min-h-screen pt-13">
      {/* ——— HERO (full-width image, text overlay) ——— */}
      <section className="relative h-[45vh] overflow-hidden flex flex-col justify-center">
        <Image
          src="/img/AdobeStock_1336213290_2000.jpeg"
          alt="News hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* hero text */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-left">
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-sm text-orange-400 uppercase tracking-widest mb-2"
          >
            {t[lang].trendsLabel}
          </motion.p>

          <motion.h1
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0,    opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            {t[lang].blogPageTitle}
          </motion.h1>

          <p className="text-lg text-gray-200 inline-flex items-center">
            {t[lang].talkAboutLabel}&nbsp;
            <span className="relative inline-block h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={topics[idx]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, color: '#84CC16' }}
                  exit   ={ { opacity: 0, y: -10 } }
                  transition={{
                    opacity: { duration: 0.4, ease: 'easeInOut' },
                    y:       { duration: 0.4, ease: 'easeInOut' },
                    color:   { duration: 0.2, ease: 'easeIn' },
                  }}
                  className="block leading-6 whitespace-nowrap"
                >
                  {topics[idx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </p>
        </div>
      </section>

      {/* ——— MAIN CONTENT ——————————————————————— */}
      <main className="flex-grow px-6 py-16 max-w-4xl mx-auto space-y-12">
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post: any) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {post.coverImage?.url && (
                <Image
                  src={post.coverImage.url}
                  alt={post.title}
                  width={640}
                  height={320}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-700 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ——— FOOTER ——————————————————————————— */}
      <Footer />
    </div>
  );
}
