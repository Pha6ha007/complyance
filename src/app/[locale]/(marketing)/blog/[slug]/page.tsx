import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const locales = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const posts = getAllPosts(locale);
    posts.forEach((post) => {
      params.push({
        locale,
        slug: post.slug,
      });
    });
  }

  return params;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.frontmatter.locale !== locale) {
    return {
      title: 'Post Not Found',
    };
  }

  const { frontmatter } = post;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';
  const canonicalUrl = `${baseUrl}/${locale}/blog/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    authors: [{ name: frontmatter.author }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `/en/blog/${slug}`,
        fr: `/fr/blog/${slug}`,
        de: `/de/blog/${slug}`,
        pt: `/pt/blog/${slug}`,
        ar: `/ar/blog/${slug}`,
        pl: `/pl/blog/${slug}`,
        it: `/it/blog/${slug}`,
      },
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
      locale: locale,
      url: canonicalUrl,
      images: frontmatter.image
        ? [
            {
              url: frontmatter.image,
              alt: frontmatter.imageAlt || frontmatter.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.image ? [frontmatter.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);

  if (!post || post.frontmatter.locale !== locale) {
    notFound();
  }

  const t = await getTranslations('blog');
  const { frontmatter, content, readingTime } = post;

  // Get related posts
  const relatedPosts = getRelatedPosts(
    slug,
    frontmatter.tags,
    locale,
    3
  );

  // Schema.org Article markup
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: frontmatter.image || '',
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    author: {
      '@type': 'Person',
      name: frontmatter.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Complyance',
      logo: {
        '@type': 'ImageObject',
        url: 'https://complyance.io/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://complyance.io/${locale}/blog/${slug}`,
    },
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Back to Blog */}
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToBlog')}
            </Link>

            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-700 px-3 py-1 text-xs font-medium text-blue-50"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {frontmatter.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{frontmatter.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={frontmatter.date}>
                  {new Date(frontmatter.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg prose-blue max-w-none rounded-lg bg-white p-8 shadow-sm lg:p-12">
                <MDXRemote
                  source={content}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeHighlight],
                    },
                  }}
                />
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    {t('relatedArticles')}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
                      >
                        <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
                          {relatedPost.frontmatter.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                          {relatedPost.frontmatter.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                          <span>{t('readMore')}</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Free Classifier CTA */}
                <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-700 p-6 text-white shadow-lg">
                  <h3 className="mb-3 text-lg font-bold">
                    {t('sidebar.classifier.title')}
                  </h3>
                  <p className="mb-4 text-sm text-green-50">
                    {t('sidebar.classifier.description')}
                  </p>
                  <Link
                    href="/free-classifier"
                    className="block w-full rounded-lg bg-white px-4 py-2 text-center font-semibold text-green-700 transition-colors hover:bg-green-50"
                  >
                    {t('sidebar.classifier.cta')}
                  </Link>
                </div>

                {/* Table of Contents (could be generated from headings) */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    {t('sidebar.toc.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('sidebar.toc.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
