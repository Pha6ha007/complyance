'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{t('dashboard.title')}</CardTitle>
              <CardDescription className="mt-1.5">
                {t('dashboard.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Error Details (dev only):
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Suggested Actions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t('dashboard.suggestions.title')}
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>{t('dashboard.suggestions.refresh')}</li>
              <li>{t('dashboard.suggestions.checkConnection')}</li>
              <li>{t('dashboard.suggestions.tryLater')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              variant="default"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 me-2" />
              {t('dashboard.tryAgain')}
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('dashboard.backToDashboard')}
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-4 border-t">
            {t('dashboard.persistentIssue')}{' '}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              {t('dashboard.contactSupport')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
