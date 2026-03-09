import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tag?: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: '/en/blog',
        fr: '/fr/blog',
        de: '/de/blog',
        pt: '/pt/blog',
        ar: '/ar/blog',
        pl: '/pl/blog',
        it: '/it/blog',
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
      locale: locale,
      url: `/${locale}/blog`,
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedTag = resolvedSearchParams?.tag;

  setRequestLocale(locale);
  const t = await getTranslations('blog');

  let posts = getAllPosts(locale);

  // Filter by tag if specified
  if (selectedTag) {
    posts = posts.filter((post) =>
      post.frontmatter.tags.includes(selectedTag)
    );
  }

  const allTags = getAllTags(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <Link
                    href={`/${locale}/blog`}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      !selectedTag
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('allPosts')}
                  </Link>
                  {allTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/${locale}/blog?tag=${tag}`}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            {posts.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <p className="text-gray-600">{t('noPosts')}</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      {/* Image placeholder or actual image */}
                      <div className="aspect-video w-full bg-gradient-to-br from-blue-500 to-blue-700" />

                      <div className="p-6">
                        {/* Tags */}
                        <div className="mb-3 flex flex-wrap gap-2">
                          {post.frontmatter.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600">
                          {post.frontmatter.title}
                        </h2>

                        {/* Description */}
                        <p className="mb-4 line-clamp-3 text-gray-600">
                          {post.frontmatter.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.frontmatter.date}>
                              {new Date(
                                post.frontmatter.date
                              ).toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readingTime}</span>
                          </div>
                        </div>

                        {/* Read More */}
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                          <span>{t('readMore')}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
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
                  href={`/${locale}/free-classifier`}
                  className="block w-full rounded-lg bg-white px-4 py-2 text-center font-semibold text-green-700 transition-colors hover:bg-green-50"
                >
                  {t('sidebar.classifier.cta')}
                </Link>
              </div>

              {/* About */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  {t('sidebar.about.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('sidebar.about.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
