'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-4">
              <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>

            {/* Error Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t('global.title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t('global.description')}
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-start">
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-slate-500 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={reset}
                variant="default"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 me-2" />
                {t('global.tryAgain')}
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 me-2" />
                  {t('global.goToDashboard')}
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {t('global.helpText')}{' '}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                {t('global.contactSupport')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
