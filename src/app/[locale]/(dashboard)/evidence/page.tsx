'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  AlertCircle,
  FileBox,
  Lock,
  FileText,
  Camera,
  Terminal,
  FlaskConical,
  Shield,
} from 'lucide-react';
import { formatDistance } from 'date-fns';

function getTypeBadgeVariant(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return 'default';
    case 'SCREENSHOT':
      return 'secondary';
    case 'LOG':
      return 'outline';
    case 'TEST_RESULT':
      return 'default';
    default:
      return 'outline';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return <FileText className="h-3 w-3 me-1" />;
    case 'SCREENSHOT':
      return <Camera className="h-3 w-3 me-1" />;
    case 'LOG':
      return <Terminal className="h-3 w-3 me-1" />;
    case 'TEST_RESULT':
      return <FlaskConical className="h-3 w-3 me-1" />;
    default:
      return null;
  }
}

export default function EvidencePage() {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [systemFilter, setSystemFilter] = useState<string>('ALL');
  const [articleFilter, setArticleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Check access first
  const { data: accessData, isLoading: isCheckingAccess } =
    trpc.evidence.checkAccess.useQuery();

  // Fetch evidence list
  const { data, isLoading, error } = trpc.evidence.list.useQuery(
    {
      ...(systemFilter !== 'ALL' && { systemId: systemFilter }),
      ...(articleFilter !== 'ALL' && { article: articleFilter }),
      ...(typeFilter !== 'ALL' && {
        evidenceType: typeFilter as 'DOCUMENT' | 'SCREENSHOT' | 'LOG' | 'TEST_RESULT',
      }),
    },
    { enabled: accessData?.hasAccess === true }
  );

  // Fetch available systems for filter
  const { data: systemsData } = trpc.evidence.getAvailableSystems.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  // Fetch article options for filter
  const { data: articleOptions } = trpc.evidence.getArticleOptions.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  // Loading state
  if (isCheckingAccess || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
          <div className="text-sm text-muted-foreground">
            {t('loadingDescription')}
          </div>
        </div>
      </div>
    );
  }

  // Plan gate: show upgrade message for Free/Starter plans
  if (!accessData?.hasAccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {/* Upgrade message */}
        <div className="rounded-lg border p-12 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('upgradeRequired')}</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t('upgradeMessage')}
          </p>
          <Button asChild className="mt-4">
            <Link href="/pricing">{t('upgradeToPlan')}</Link>
          </Button>
        </div>

        {/* Why Evidence Vault matters */}
        <div className="rounded-lg border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">{t('whyEvidenceVault')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('whyEvidenceVaultDescription')}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• {t('benefit1')}</li>
                <li>• {t('benefit2')}</li>
                <li>• {t('benefit3')}</li>
                <li>• {t('benefit4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{tCommon('error')}</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
        </div>
      </div>
    );
  }

  const evidence = data?.evidence || [];
  const systems = systemsData || [];
  const articles = articleOptions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Button asChild>
          <Link href="/evidence/new">
            <Plus className="me-2 h-4 w-4" />
            {t('addEvidence')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      {(evidence.length > 0 || systemFilter !== 'ALL' || articleFilter !== 'ALL' || typeFilter !== 'ALL') && (
        <div className="flex flex-wrap items-center gap-4">
          {/* System filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('filterBySystem')}:</span>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('allSystems')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allSystems')}</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Article filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('filterByArticle')}:</span>
            <Select value={articleFilter} onValueChange={setArticleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('allArticles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allArticles')}</SelectItem>
                {articles.map((article) => (
                  <SelectItem key={article.value} value={article.value}>
                    {article.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('filterByType')}:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                <SelectItem value="DOCUMENT">{t('types.document')}</SelectItem>
                <SelectItem value="SCREENSHOT">{t('types.screenshot')}</SelectItem>
                <SelectItem value="LOG">{t('types.log')}</SelectItem>
                <SelectItem value="TEST_RESULT">{t('types.testResult')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Evidence table */}
      {evidence.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <FileBox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('noEvidence')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('noEvidenceDescription')}
          </p>
          <Button asChild className="mt-4">
            <Link href="/evidence/new">
              <Plus className="me-2 h-4 w-4" />
              {t('addFirstEvidence')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.linkedSystem')}</TableHead>
                <TableHead>{t('table.article')}</TableHead>
                <TableHead>{t('table.integrityHash')}</TableHead>
                <TableHead>{t('table.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evidence.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/evidence/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(item.evidenceType)}>
                      {getTypeIcon(item.evidenceType)}
                      {t(`types.${item.evidenceType.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.system ? (
                      <Link
                        href={`/systems/${item.system.id}`}
                        className="text-sm hover:underline"
                      >
                        {item.system.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.article ? (
                      <span className="text-sm">{item.article}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.integrityHash ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.integrityHash.slice(0, 8)}...
                      </code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistance(new Date(item.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
