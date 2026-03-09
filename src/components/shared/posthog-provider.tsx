'use client';

/**
 * PostHog Analytics Provider
 *
 * NOTE: Requires posthog-js package
 * Install: pnpm add posthog-js
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Conditional PostHog initialization
let posthog: any = null;
let PostHogProvider: any = null;

try {
  const posthogModule = require('posthog-js');
  const posthogReactModule = require('posthog-js/react');

  posthog = posthogModule.default;
  PostHogProvider = posthogReactModule.PostHogProvider;
} catch (e) {
  console.warn('PostHog package not found. Install with: pnpm add posthog-js');
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  useEffect(() => {
    // Only initialize if PostHog is available and key is provided
    if (posthog && POSTHOG_KEY) {
      if (typeof window !== 'undefined') {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          loaded: (ph: any) => {
            // Enable debug mode in development
            if (process.env.NODE_ENV === 'development') {
              ph.debug();
            }
          },
          capture_pageview: false, // We'll do this manually
          capture_pageleave: true,
          autocapture: true,

          // Session recording
          session_recording: {
            maskAllInputs: true, // Mask all input fields for privacy
            maskTextSelector: '.ph-no-capture', // Custom class to exclude elements
          },

          // Privacy settings
          respect_dnt: true,
          opt_out_capturing_by_default: false,
        });

        console.log('✓ PostHog initialized');
      }
    }
  }, [POSTHOG_KEY, POSTHOG_HOST]);

  // If PostHog is not available or no key, render children without provider
  if (!PostHogProvider || !POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

/**
 * Hook to track page views
 */
export function usePostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (posthog && pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }

      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);
}

/**
 * Helper to identify user in PostHog
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (posthog) {
    posthog.identify(userId, traits);
  }
}

/**
 * Helper to track custom events
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (posthog) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Helper to reset PostHog (on logout)
 */
export function resetPostHog() {
  if (posthog) {
    posthog.reset();
  }
}
