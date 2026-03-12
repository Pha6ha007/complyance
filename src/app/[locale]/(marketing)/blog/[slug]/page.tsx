import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Quote,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Custom MDX components for rich article presentation
const mdxComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2
      className="group relative mt-12 mb-4 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900"
      {...props}
    >
      <span className="flex-shrink-0 w-1 h-7 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <span>{children}</span>
    </h2>
  ),

  h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3
      className="mt-8 mb-3 flex items-center gap-2.5 text-lg font-semibold text-gray-800"
      {...props}
    >
      <span className="flex-shrink-0 w-2 h-2 rounded-sm bg-emerald-400 rotate-45 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
      <span>{children}</span>
    </h3>
  ),

  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="relative my-8 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-5 not-italic"
      {...props}
    >
      <Quote className="absolute top-3 end-4 h-10 w-10 text-emerald-200" />
      <div className="absolute start-0 top-0 h-full w-1 rounded-s-xl bg-gradient-to-b from-emerald-400 to-teal-500" />
      <div className="relative text-gray-700 font-medium leading-relaxed [&>p]:m-0 [&>p]:text-gray-700">
        {children}
      </div>
    </blockquote>
  ),

  a: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      className="font-medium text-emerald-600 underline decoration-emerald-300 underline-offset-2 transition-colors hover:text-emerald-700 hover:decoration-emerald-500"
      {...props}
    >
      {children}
    </a>
  ),

  strong: ({ children, ...props }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-bold text-gray-900" {...props}>
      {children}
    </strong>
  ),

  table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-700" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="border-b border-gray-200 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-emerald-700"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td
      className="border-b border-gray-100 px-4 py-3 text-gray-700 [tr:last-child_&]:border-0"
      {...props}
    >
      {children}
    </td>
  ),

  tr: ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
    <tr className="transition-colors hover:bg-emerald-50/50" {...props}>
      {children}
    </tr>
  ),

  ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="my-4 space-y-2 ps-0 list-none" {...props}>
      {children}
    </ul>
  ),

  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className="flex items-start gap-2.5 text-gray-700" {...props}>
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  ),

  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="my-4 space-y-2 ps-0 list-none counter-reset-[item]" {...props}>
      {children}
    </ol>
  ),

  hr: (props: ComponentPropsWithoutRef<'hr'>) => (
    <hr
      className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
      {...props}
    />
  ),

  code: ({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code
          className={`${className} block rounded-xl border border-gray-200 bg-gray-950 p-4 text-sm text-gray-100`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-emerald-50 px-1.5 py-0.5 text-sm font-mono text-emerald-700 border border-emerald-100"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Callout components for use in MDX files
  Callout: ({
    type = 'info',
    children,
  }: {
    type?: 'info' | 'warning' | 'success' | 'tip';
    children: React.ReactNode;
  }) => {
    const styles = {
      info: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        icon: <Info className="h-5 w-5 text-blue-500" />,
        bar: 'bg-blue-400',
      },
      warning: {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        bar: 'bg-amber-400',
      },
      success: {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        bar: 'bg-emerald-400',
      },
      tip: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
        bar: 'bg-purple-400',
      },
    };
    const s = styles[type];
    return (
      <div className={`relative my-8 overflow-hidden rounded-xl border ${s.border} ${s.bg} px-5 py-4`}>
        <div className={`absolute start-0 top-0 h-full w-1 ${s.bar}`} />
        <div className="flex items-start gap-3 ps-1">
          <span className="mt-0.5 flex-shrink-0">{s.icon}</span>
          <div className="text-sm text-gray-700 leading-relaxed [&>p]:m-0">{children}</div>
        </div>
      </div>
    );
  },

  // Key stat highlight
  KeyStat: ({ value, label }: { value: string; label: string }) => (
    <div className="my-6 inline-flex flex-col items-center rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-8 py-5 text-center shadow-sm">
      <span className="text-4xl font-black tracking-tight text-emerald-600">{value}</span>
      <span className="mt-1 text-sm font-medium text-gray-600">{label}</span>
    </div>
  ),
};

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
  const relatedPosts = getRelatedPosts(slug, frontmatter.tags, locale, 3);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero — dark #0F172A */}
        <div className="relative overflow-hidden bg-[#0F172A]">
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
          <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 end-0 w-[300px] h-[300px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 pt-10 pb-14 sm:px-6 lg:px-8">
            {/* Back to Blog */}
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToBlog')}
            </Link>

            {/* Tags */}
            <div className="mb-5 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              {frontmatter.title}
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg text-white/50 leading-relaxed max-w-2xl">
              {frontmatter.description}
            </p>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/35">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{frontmatter.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={frontmatter.date}>
                  {new Date(frontmatter.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Article */}
            <div className="lg:col-span-3">
              <article className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-100 lg:px-14 lg:py-14">
                <div className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-lead:text-gray-500">
                  <MDXRemote
                    source={content}
                    components={mdxComponents}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        rehypePlugins: [rehypeHighlight],
                      },
                    }}
                  />
                </div>
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h2 className="mb-6 text-xl font-bold text-gray-900">
                    {t('relatedArticles')}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                      >
                        <h3 className="mb-2 font-semibold text-gray-900 leading-snug group-hover:text-emerald-600 transition-colors">
                          {relatedPost.frontmatter.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                          {relatedPost.frontmatter.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 transition-all group-hover:gap-2">
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
              <div className="sticky top-8 space-y-4">
                {/* Free Classifier CTA */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-[#0F172A] p-5">
                  <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Free Tool
                      </span>
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

                {/* TOC placeholder */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-2 font-bold text-gray-900">
                    {t('sidebar.toc.title')}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
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
