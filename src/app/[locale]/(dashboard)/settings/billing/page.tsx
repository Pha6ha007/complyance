import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db/client';
import { PLAN_LIMITS, getEffectiveSystemLimit } from '@/server/services/billing/paddle';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function BillingPage() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organization: {
        include: {
          aiSystems: true,
          vendors: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const organization = user.organization;
  const currentPlan = organization.plan;
  const limits = PLAN_LIMITS[currentPlan];
  const systemCount = organization.aiSystems.length;
  const vendorCount = organization.vendors.length;
  const effectiveSystemLimit = getEffectiveSystemLimit(currentPlan, organization.bonusSystems);

  const t = useTranslations('settings.billing');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentPlan')}</CardTitle>
          <CardDescription>{t('planDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currentPlan}</span>
                <Badge variant={currentPlan === 'FREE' ? 'secondary' : 'default'}>
                  {currentPlan === 'FREE' ? t('free') : t('paid')}
                </Badge>
              </div>
              {currentPlan === 'FREE' ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('freeDescription')}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('paidDescription', { plan: currentPlan })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {currentPlan === 'FREE' ? (
                <Button asChild>
                  <Link href="/pricing">{t('upgrade')}</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/pricing">{t('changePlan')}</Link>
                  </Button>
                  {organization.paddleCustomerId && (
                    <Button variant="ghost" asChild>
                      <a
                        href={`https://vendors.paddle.com/subscriptions/customers/manage/${organization.paddleCustomerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('manageBilling')}
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Systems */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('usage.systems')}</span>
              <span className="text-sm text-muted-foreground">
                {systemCount} / {effectiveSystemLimit}
                {organization.bonusSystems > 0 && (
                  <Badge variant="secondary" className="ms-2">
                    +{organization.bonusSystems} {t('usage.bonus')}
                  </Badge>
                )}
              </span>
            </div>
            <Progress
              value={(systemCount / effectiveSystemLimit) * 100}
              className="h-2"
            />
            {systemCount >= effectiveSystemLimit && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('usage.systemsLimitReached')}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Vendors */}
          {limits.vendors > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('usage.vendors')}</span>
                <span className="text-sm text-muted-foreground">
                  {vendorCount} /{' '}
                  {limits.vendors === 999999 ? t('usage.unlimited') : limits.vendors}
                </span>
              </div>
              {limits.vendors !== 999999 && (
                <>
                  <Progress
                    value={(vendorCount / limits.vendors) * 100}
                    className="h-2"
                  />
                  {vendorCount >= limits.vendors && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{t('usage.vendorsLimitReached')}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          )}

          {/* Team members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('usage.teamMembers')}</span>
              <span className="text-sm text-muted-foreground">
                1 /{' '}
                {limits.teamMembers === 999999 ? t('usage.unlimited') : limits.teamMembers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t('features.title')}</CardTitle>
          <CardDescription>{t('features.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium">{t('features.regulations')}</dt>
              <dd className="text-sm text-muted-foreground">
                {typeof limits.regulations === 'string'
                  ? t('features.allRegulations')
                  : limits.regulations.length + ' ' + t('features.regulationCount')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">{t('features.documents')}</dt>
              <dd className="text-sm text-muted-foreground">
                {limits.documents ? t('features.enabled') : t('features.disabled')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">{t('features.evidenceVault')}</dt>
              <dd className="text-sm text-muted-foreground">
                {limits.evidenceVault ? t('features.enabled') : t('features.disabled')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">{t('features.biasTesting')}</dt>
              <dd className="text-sm text-muted-foreground">
                {limits.biasTesting === 999999
                  ? t('features.unlimited')
                  : limits.biasTesting === 0
                  ? t('features.disabled')
                  : limits.biasTesting + ' / ' + t('features.month')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">{t('features.cicdAPI')}</dt>
              <dd className="text-sm text-muted-foreground">
                {limits.cicdAPI ? t('features.enabled') : t('features.disabled')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">{t('features.alerts')}</dt>
              <dd className="text-sm text-muted-foreground">
                {limits.regulatoryAlerts === 'REALTIME'
                  ? t('features.realtime')
                  : limits.regulatoryAlerts === 'EMAIL_WEEKLY'
                  ? t('features.weekly')
                  : t('features.disabled')}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Upgrade CTA for free users */}
      {currentPlan === 'FREE' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{t('upgrade.title')}</CardTitle>
            <CardDescription>{t('upgrade.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/pricing">{t('upgrade.cta')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
