import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BadgeLevel } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBadgeInfo, generateBadgeSVG, BADGE_LABELS } from '@/server/services/badge/generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Shield, ExternalLink } from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{
    locale: string;
    orgId: string;
  }>;
}

export async function generateMetadata({ params }: VerifyPageProps) {
  const { orgId } = await params;
  const t = await getTranslations('badge.verification');
  const badgeInfo = await getBadgeInfo(orgId);

  if (!badgeInfo) {
    return {
      title: t('notFound'),
    };
  }

  return {
    title: `${t('title')} - ${badgeInfo.orgName}`,
    description: t('metaDescription', { orgName: badgeInfo.orgName }),
  };
}

function BadgeLevelIcon({ level }: { level: BadgeLevel }) {
  switch (level) {
    case BadgeLevel.COMPLIANT:
      return <CheckCircle className="h-8 w-8 text-emerald-500" />;
    case BadgeLevel.READY:
      return <Shield className="h-8 w-8 text-amber-500" />;
    case BadgeLevel.AWARE:
      return <Shield className="h-8 w-8 text-blue-500" />;
    default:
      return <AlertTriangle className="h-8 w-8 text-gray-400" />;
  }
}

function BadgeLevelBadge({ level }: { level: BadgeLevel }) {
  const variants: Record<BadgeLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [BadgeLevel.COMPLIANT]: 'default',
    [BadgeLevel.READY]: 'secondary',
    [BadgeLevel.AWARE]: 'outline',
    [BadgeLevel.NONE]: 'secondary',
  };

  const colors: Record<BadgeLevel, string> = {
    [BadgeLevel.COMPLIANT]: 'bg-emerald-500 hover:bg-emerald-600',
    [BadgeLevel.READY]: 'bg-amber-500 hover:bg-amber-600 text-white',
    [BadgeLevel.AWARE]: 'bg-blue-500 hover:bg-blue-600 text-white',
    [BadgeLevel.NONE]: '',
  };

  return (
    <Badge variant={variants[level]} className={colors[level]}>
      {BADGE_LABELS[level]}
    </Badge>
  );
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { orgId } = await params;
  const t = await getTranslations('badge.verification');
  const badgeInfo = await getBadgeInfo(orgId);

  if (!badgeInfo) {
    notFound();
  }

  const { orgName, badgeLevel, verifiedAt, isActive } = badgeInfo;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BadgeLevelIcon level={isActive ? badgeLevel : BadgeLevel.NONE} />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isActive && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('badgeInactiveTitle')}</AlertTitle>
              <AlertDescription>{t('badgeInactiveDescription')}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('organization')}</p>
              <p className="text-lg font-semibold">{orgName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('badgeLevel')}</p>
              <div className="mt-1">
                <BadgeLevelBadge level={isActive ? badgeLevel : BadgeLevel.NONE} />
              </div>
            </div>

            {verifiedAt && isActive && (
              <div>
                <p className="text-sm text-muted-foreground">{t('lastVerified')}</p>
                <p className="font-medium">
                  {new Date(verifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {isActive && (
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">{t('whatThisMeans')}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`levelDescription.${badgeLevel.toLowerCase()}`)}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>{t('verifiedBy')}</span>
            </div>
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                {t('learnMore')}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
