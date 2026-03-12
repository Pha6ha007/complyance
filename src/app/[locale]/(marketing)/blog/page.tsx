import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';
import { TagCloud } from './tag-cloud';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  'EU AI Act':              { gradient: 'from-emerald-900 via-emerald-800 to-teal-700',    icon: '⚖️' },
  'Colorado AI Act':        { gradient: 'from-blue-900 via-blue-800 to-indigo-700',        icon: '🏔️' },
  'NYC Local Law 144':      { gradient: 'from-violet-900 via-purple-800 to-purple-700',    icon: '🗽' },
  'AI vendor compliance':   { gradient: 'from-orange-900 via-orange-800 to-amber-700',     icon: '🔗' },
  'AI classification':      { gradient: 'from-teal-900 via-teal-800 to-cyan-700',          icon: '🤖' },
  'AI regulation timeline': { gradient: 'from-slate-800 via-slate-700 to-zinc-600',        icon: '📅' },
  'OpenAI':                 { gradient: 'from-gray-900 via-gray-800 to-slate-700',         icon: '🧠' },
  'Anthropic':              { gradient: 'from-amber-900 via-amber-800 to-yellow-700',      icon: '🧬' },
  'biometrics':             { gradient: 'from-red-900 via-red-800 to-rose-700',            icon: '👁️' },
  'employment AI':          { gradient: 'from-indigo-900 via-indigo-800 to-blue-700',      icon: '👔' },
  'credit scoring AI':      { gradient: 'from-green-900 via-green-800 to-emerald-700',     icon: '💳' },
  'SaaS compliance':        { gradient: 'from-cyan-900 via-cyan-800 to-teal-700',          icon: '☁️' },
  'global AI regulation':   { gradient: 'from-rose-900 via-rose-800 to-pink-700',          icon: '🌐' },
  'default':                { gradient: 'from-slate-800 via-slate-700 to-emerald-900',     icon: '📋' },
};

function getPostStyle(tags: string[]): { gradient: string; icon: string } {
  for (const tag of tags) {
    if (CATEGORY_STYLES[tag]) return CATEGORY_STYLES[tag];
  }
  return CATEGORY_STYLES['default'];
}

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
  const allPosts = getAllPosts(locale).length > 0 ? getAllPosts(locale) : getAllPosts('en');
  let posts = allPosts;
  if (selectedTag) {
    posts = posts.filter((post) => post.frontmatter.tags.includes(selectedTag));
  }

  // Build tag counts from all posts
  const tagCountMap: Record<string, number> = {};
  allPosts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      tagCountMap[tag] = (tagCountMap[tag] ?? 0) + 1;
    });
  });
  const tagItems = Object.entries(tagCountMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));

  return (
    <div className="min-h-screen bg-[#0F172A]">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_350px_at_50%_58%,rgba(16,185,129,0.13),transparent)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 font-mono">
            <Sparkles className="h-4 w-4" />
            {t('subtitle')}
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-white">Compliance </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">

          {/* Main */}
          <div className="lg:col-span-3">
            {/* Tag filter */}
            {tagItems.length > 0 && (
              <TagCloud
                tags={tagItems}
                selectedTag={selectedTag}
                allPostsLabel={t('allPosts')}
              />
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
                      {(() => {
                        const style = getPostStyle(post.frontmatter.tags);
                        return (
                          <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                            <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/5" />
                            <div className="absolute -bottom-4 -start-4 w-24 h-24 rounded-full bg-white/5" />
                            <span className="text-5xl relative z-10">{style.icon}</span>
                          </div>
                        );
                      })()}

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
