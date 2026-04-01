'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, ExternalLink, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { BadgeLevel } from '@prisma/client';
import { trpc } from '@/lib/trpc/client';

const BADGE_LABELS: Record<BadgeLevel, string> = {
  [BadgeLevel.NONE]: 'Not Verified',
  [BadgeLevel.AWARE]: 'AI Act Aware',
  [BadgeLevel.READY]: 'AI Act Ready',
  [BadgeLevel.COMPLIANT]: 'AI Act Compliant',
};

function BadgeLevelIcon({ level }: { level: BadgeLevel }) {
  switch (level) {
    case BadgeLevel.COMPLIANT:
      return <CheckCircle className="h-6 w-6 text-emerald-500" />;
    case BadgeLevel.READY:
      return <Shield className="h-6 w-6 text-amber-500" />;
    case BadgeLevel.AWARE:
      return <Shield className="h-6 w-6 text-blue-500" />;
    default:
      return <Shield className="h-6 w-6 text-gray-400" />;
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-4 w-4 me-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 me-2" />
          {label}
        </>
      )}
    </Button>
  );
}

export default function BadgeSettingsPage() {
  const t = useTranslations('badge');
  const { data: badgeData, isLoading } = trpc.badge.getMyBadge.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">{t('loading')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t('errorLoading')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    orgId,
    badgeLevel,
    badgeEnabled,
    verifiedAt,
    nextLevel,
    nextLevelRequirements,
    htmlCode,
    markdownCode,
  } = badgeData;

  const badgeSvgUrl = `https://complyance.app/api/public/v1/badge/${orgId}/svg`;
  const verifyUrl = `https://complyance.app/verify/${orgId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Current Badge Level */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentLevel')}</CardTitle>
          <CardDescription>{t('currentLevelDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <BadgeLevelIcon level={badgeLevel} />
            <div>
              <h3 className="text-xl font-semibold">{BADGE_LABELS[badgeLevel]}</h3>
              {verifiedAt && (
                <p className="text-sm text-muted-foreground">
                  {t('lastVerified')}: {new Date(verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Badge Preview */}
          {badgeEnabled && badgeLevel !== BadgeLevel.NONE && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">{t('preview')}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badgeSvgUrl}
                alt={BADGE_LABELS[badgeLevel]}
                width={180}
                height={60}
                className="border rounded"
              />
            </div>
          )}

          {!badgeEnabled && (
            <Alert>
              <AlertDescription>{t('badgeDisabled')}</AlertDescription>
            </Alert>
          )}

          {badgeLevel === BadgeLevel.NONE && (
            <Alert>
              <AlertDescription>{t('noBadgeYet')}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Next Level */}
      {nextLevel && nextLevelRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t('earnNextLevel')}
              <Badge variant="outline">{BADGE_LABELS[nextLevel]}</Badge>
            </CardTitle>
            <CardDescription>{t('earnNextLevelDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextLevelRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Embed Codes */}
      {badgeEnabled && badgeLevel !== BadgeLevel.NONE && (
        <Card>
          <CardHeader>
            <CardTitle>{t('embedCode')}</CardTitle>
            <CardDescription>{t('embedCodeDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html">
              <TabsList>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="space-y-4">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    <code>{htmlCode}</code>
                  </pre>
                </div>
                <CopyButton text={htmlCode} label={t('copyHTML')} />
              </TabsContent>
              <TabsContent value="markdown" className="space-y-4">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    <code>{markdownCode}</code>
                  </pre>
                </div>
                <CopyButton text={markdownCode} label={t('copyMarkdown')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Verification Link */}
      {badgeEnabled && badgeLevel !== BadgeLevel.NONE && (
        <Card>
          <CardHeader>
            <CardTitle>{t('verificationLink')}</CardTitle>
            <CardDescription>{t('verificationLinkDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm">{verifyUrl}</code>
              <CopyButton text={verifyUrl} label={t('copy')} />
            </div>
            <Button asChild variant="outline">
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                {t('viewVerificationPage')}
                <ExternalLink className="h-4 w-4 ms-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Badge Levels Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>{t('levels.title')}</CardTitle>
          <CardDescription>{t('levels.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">{t('levels.aware.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('levels.aware.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">{t('levels.ready.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('levels.ready.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-medium">{t('levels.compliant.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('levels.compliant.description')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
