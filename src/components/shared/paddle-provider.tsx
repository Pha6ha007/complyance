'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Paddle.js Provider
 * Loads and initializes Paddle.js only if NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is set
 */
export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  useEffect(() => {
    // Initialize Paddle after script loads
    if (paddleToken && typeof window !== 'undefined' && window.Paddle) {
      try {
        window.Paddle.Initialize({
          token: paddleToken,
          eventCallback: (data) => {
            // Optional: log Paddle events for debugging
            console.log('[Paddle]', data.name, data);
          },
        });
        console.log('[Paddle] Initialized successfully');
      } catch (error) {
        console.error('[Paddle] Initialization error:', error);
      }
    }
  }, [paddleToken]);

  // Only render Paddle script if token is configured
  if (!paddleToken) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('[Paddle] Script loaded');
        }}
        onError={(error) => {
          console.error('[Paddle] Script load error:', error);
        }}
      />
      {children}
    </>
  );
}

// Paddle.js type declarations
declare global {
  interface Window {
    Paddle?: {
      Checkout: {
        open: (options: {
          items: Array<{ priceId: string; quantity: number }>;
          customer?: { id?: string; email?: string };
          customData?: Record<string, any>;
          successCallback?: (data: any) => void;
          closeCallback?: () => void;
        }) => void;
      };
      Environment: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Initialize: (options: {
        token: string;
        eventCallback?: (data: any) => void;
      }) => void;
    };
  }
}
