import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, Users, Shield, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('mission.title')}</h2>
          <p className="text-lg text-muted-foreground mb-4">
            {t('mission.p1')}
          </p>
          <p className="text-lg text-muted-foreground">
            {t('mission.p2')}
          </p>
        </div>
      </div>

      {/* Problem */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">{t('problem.title')}</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>{t('problem.p1')}</p>
              <p>{t('problem.p2')}</p>
              <p>{t('problem.p3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('solution.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            {t('solution.subtitle')}
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('solution.automated.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('solution.automated.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('solution.actionable.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('solution.actionable.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('solution.affordable.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('solution.affordable.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Do */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">{t('what.title')}</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('what.classify.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('what.classify.desc')}</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('what.gaps.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('what.gaps.desc')}</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('what.documents.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('what.documents.desc')}</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('what.vendors.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('what.vendors.desc')}</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('what.updates.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('what.updates.desc')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto p-6 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded">
          <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-200">
            {t('disclaimer.title')}
          </h3>
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {t('disclaimer.desc')}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">{t('cta.start')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">{t('cta.pricing')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
