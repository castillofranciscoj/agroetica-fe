// src/app/news/[slug]/page.tsx          (server component)
import Link  from 'next/link';
import Image from 'next/image';

import { GET_POST_BY_SLUG } from '@/graphql/operations';
import { fetchGraphQL }     from '@/lib/fetch-graphql';
import { getLanguage }      from '@/components/LanguageContext/server';
import { t }                from '@/i18n';
import Footer               from '@/components/Footer';           // ← added


/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Post {
  id:          string;
  title:       string;
  publishedAt: string;
  content:     string;                        // already HTML-rendered
  category?:   { name: string } | null;
  author?:     { name: string } | null;
  coverImage?: { url: string } | null;
  tags?:       { slug: string; name: string }[];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function NewsPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  /* unwrap dynamic segment */
  const { slug } = await params;

  /* locale from cookie / header */
  const lang = await getLanguage();

  /* fetch post */
  const { posts } = await fetchGraphQL<{ posts: Post[] }>(
    GET_POST_BY_SLUG,
    { slug },
  );

  if (!posts?.length) {
    return (
      <p className="p-6 text-red-600">
        {t[lang].notFoundLabel}
      </p>
    );
  }

  const post = posts[0];

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */
  return (
    <div className="flex flex-col min-h-screen pt-13">
      {/* ——— BANNER ——————————————————————————————— */}
      <section className="w-full bg-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* back link */}
          <p className="text-sm text-orange-500 uppercase tracking-widest">
            <Link href="/news">← {t[lang].returnToNewsLabel}</Link>
          </p>

          {/* category pill */}
          {post.category?.name && (
            <span className="inline-block text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              {post.category.name}
            </span>
          )}

          {/* title */}
          <h1 className="text-4xl font-bold">{post.title}</h1>

          {/* meta */}
          <p className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString()}
            {post.author?.name && ` — ${post.author.name}`}
          </p>
        </div>
      </section>

      {/* ——— MAIN ARTICLE ————————————————————————— */}
      <main className="flex-grow px-6 py-16 max-w-3xl mx-auto space-y-8">
        {/* cover image */}
        {post.coverImage?.url && (
          <Image
            src={post.coverImage.url}
            alt={post.title}
            width={1200}
            height={630}
            priority
            className="w-full h-64 object-cover rounded"
          />
        )}

        {/* body (HTML from CMS) */}
        <article
          className="prose prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag.slug}
                className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </main>

      {/* ——— FOOTER ——————————————————————————— */}
      <Footer />
    </div>
  );
}
