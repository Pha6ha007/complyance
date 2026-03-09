'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { Plus, AlertCircle, Server } from 'lucide-react';
import { RiskLevel } from '@prisma/client';
import { formatDistance } from 'date-fns';

function getRiskBadgeVariant(riskLevel: RiskLevel | null) {
  if (!riskLevel) return 'outline';

  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return 'destructive';
    case 'HIGH':
      return 'destructive';
    case 'LIMITED':
      return 'default';
    case 'MINIMAL':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function SystemsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('systems');
  const tClass = useTranslations('classification');

  // Fetch systems
  const { data, isLoading, error } = trpc.system.list.useQuery({});
  const { data: countData } = trpc.system.getCount.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{t('loading')}</div>
          <div className="text-sm text-muted-foreground">{t('loadingDescription')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{t('error')}</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
        </div>
      </div>
    );
  }

  const systems = data?.systems || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
          {countData && (
            <p className="mt-1 text-sm text-muted-foreground">
              {countData.count} / {countData.limit} {t('systemsUsed')}
            </p>
          )}
        </div>

        <Button asChild>
          <Link href={`/${locale}/systems/new`}>
            <Plus className="me-2 h-4 w-4" />
            {t('addSystem')}
          </Link>
        </Button>
      </div>

      {/* Systems table */}
      {systems.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <Server className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('noSystems')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('noSystemsDescription')}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/systems/new`}>
              <Plus className="me-2 h-4 w-4" />
              {t('addFirstSystem')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.domain')}</TableHead>
                <TableHead>{t('table.riskLevel')}</TableHead>
                <TableHead>{t('table.complianceScore')}</TableHead>
                <TableHead>{t('table.gaps')}</TableHead>
                <TableHead>{t('table.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell>
                    <Link
                      href={`/${locale}/systems/${system.id}`}
                      className="font-medium hover:underline"
                    >
                      {system.name}
                    </Link>
                  </TableCell>
                  <TableCell>{system.domain}</TableCell>
                  <TableCell>
                    {system.riskLevel ? (
                      <Badge variant={getRiskBadgeVariant(system.riskLevel)}>
                        {tClass(system.riskLevel.toLowerCase())}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t('notClassified')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {system.complianceScore !== null ? (
                      <span className="font-medium">{system.complianceScore}%</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {system._count.gaps > 0 ? (
                      <span className="text-sm">
                        {system._count.gaps} {t('open')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('none')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistance(new Date(system.createdAt), new Date(), {
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
