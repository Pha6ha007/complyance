import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    mdxRs: false,
    // Required for instrumentation.ts to work
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  },
});

// Wrap with Sentry if available
// NOTE: Requires @sentry/nextjs package - install with: pnpm add @sentry/nextjs
let config = withNextIntl(withMDX(nextConfig));

try {
  const { withSentryConfig } = require('@sentry/nextjs');
  config = withSentryConfig(
    config,
    {
      // Sentry build-time configuration
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      // Sentry webpack plugin options
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
    }
  );
  console.log('✓ Sentry configured');
} catch (e) {
  // Sentry not installed, use config without it
  console.log('ℹ Sentry not configured (package not found)');
}

export default config;
