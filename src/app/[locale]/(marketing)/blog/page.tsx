import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { Calendar, Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tag?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
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
      locale,
      url: `/${locale}/blog`,
    },
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedTag = resolvedSearchParams?.tag;

  setRequestLocale(locale);
  const t = await getTranslations('blog');

  // Fall back to English posts if no posts exist for the current locale
  let posts = getAllPosts(locale);
  if (posts.length === 0) posts = getAllPosts('en');
  if (selectedTag) {
    posts = posts.filter((post) => post.frontmatter.tags.includes(selectedTag));
  }
  const allTags = getAllTags(locale).length > 0 ? getAllTags(locale) : getAllTags('en');

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          animation: 'gridShift 20s linear infinite',
        }}
      />
      {/* Orbs */}
      <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 end-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 pt-20 pb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          {t('subtitle')}
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl font-dm-sans">
          {t('title')}
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">

          {/* Main */}
          <div className="lg:col-span-3">
            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-white/30 flex-shrink-0" />
                  <Link
                    href="/blog"
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                      !selectedTag
                        ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('allPosts')}
                  </Link>
                  {allTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag}`}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                        selectedTag === tag
                          ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts grid */}
            {posts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-white/40">{t('noPosts')}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      {/* Image placeholder */}
                      <div className="relative aspect-video w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20" />
                        <div className="absolute inset-0 opacity-[0.06]"
                          style={{
                            backgroundImage: `linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)`,
                            backgroundSize: '32px 32px',
                          }}
                        />
                        {/* Decorative orb */}
                        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
                      </div>

                      <div className="p-5">
                        {/* Tags */}
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {post.frontmatter.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h2 className="mb-2.5 text-base font-bold leading-snug text-white/90 transition-colors group-hover:text-white">
                          {post.frontmatter.title}
                        </h2>

                        {/* Description */}
                        <p className="mb-4 line-clamp-2 text-sm text-white/45 leading-relaxed">
                          {post.frontmatter.description}
                        </p>

                        {/* Meta + Read more */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-white/30">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <time dateTime={post.frontmatter.date}>
                                {new Date(post.frontmatter.date).toLocaleDateString(locale, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </time>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {post.readingTime}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-all group-hover:gap-2">
                            {t('readMore')}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
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
            <div className="sticky top-24 space-y-4">
              {/* Free Classifier CTA */}
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Free Tool</span>
                  </div>
                  <h3 className="mb-2 font-bold text-white leading-snug">
                    {t('sidebar.classifier.title')}
                  </h3>
                  <p className="mb-4 text-xs text-white/50 leading-relaxed">
                    {t('sidebar.classifier.description')}
                  </p>
                  <Link
                    href="/free-classifier"
                    className="block w-full rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)]"
                  >
                    {t('sidebar.classifier.cta')}
                  </Link>
                </div>
              </div>

              {/* About */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-2 font-bold text-white/90">
                  {t('sidebar.about.title')}
                </h3>
                <p className="text-xs text-white/45 leading-relaxed">
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
