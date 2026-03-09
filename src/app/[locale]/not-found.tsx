import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">
                404
              </h1>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-2">
                {t('notFound.title')}
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400">
              {t('notFound.description')}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 me-2" />
                  {t('notFound.goToDashboard')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {t('notFound.goToHome')}
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {t('notFound.helpText')}{' '}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                {t('notFound.contactSupport')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
