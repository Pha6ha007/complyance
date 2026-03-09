'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { Plus, AlertCircle, Building2, ShieldAlert, Lock } from 'lucide-react';
import { VendorRisk } from '@prisma/client';
import { formatDistance } from 'date-fns';

function getRiskBadgeVariant(riskLevel: VendorRisk | null) {
  if (!riskLevel) return 'outline';

  switch (riskLevel) {
    case 'CRITICAL':
      return 'destructive';
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getRiskBadgeClass(riskLevel: VendorRisk | null) {
  if (!riskLevel) return '';

  switch (riskLevel) {
    case 'CRITICAL':
      return 'bg-red-600 hover:bg-red-700';
    case 'HIGH':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'MEDIUM':
      return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    case 'LOW':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return '';
  }
}

export default function VendorsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');

  const [riskLevelFilter, setRiskLevelFilter] = useState<VendorRisk | 'ALL'>(
    'ALL'
  );

  // Fetch vendors
  const { data, isLoading, error } = trpc.vendor.list.useQuery(
    riskLevelFilter !== 'ALL' ? { riskLevel: riskLevelFilter } : {}
  );
  const { data: countData } = trpc.vendor.getCount.useQuery();

  if (isLoading) {
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

  const vendors = data?.vendors || [];
  const isFree = countData?.limit === 0;
  const canCreate = countData?.canCreate ?? false;
  const limitReached = !canCreate && !isFree && countData?.limit !== null;

  // Free plan upgrade message
  if (isFree) {
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
          <p className="mt-2 text-sm text-muted-foreground">
            {t('upgradeMessage')}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/pricing`}>{t('upgradeToPlan')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
          {countData && countData.limit !== null && (
            <p className="mt-1 text-sm text-muted-foreground">
              {countData.count} / {countData.limit} {t('vendorsUsed')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {limitReached && (
            <Link
              href={`/${locale}/pricing`}
              className="text-sm text-primary hover:underline"
            >
              {t('upgradeToPlan')}
            </Link>
          )}
          <Button asChild={canCreate} disabled={!canCreate}>
            {canCreate ? (
              <Link href={`/${locale}/vendors/new`}>
                <Plus className="me-2 h-4 w-4" />
                {t('addVendor')}
              </Link>
            ) : (
              <span>
                <Plus className="me-2 h-4 w-4" />
                {t('addVendor')}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Limit Reached Warning */}
      {limitReached && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-800">
                {t('limitReached')}
              </div>
              <div className="mt-1 text-sm text-yellow-700">
                {t('limitReachedMessage')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {vendors.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('filterByRisk')}:
            </span>
            <Select
              value={riskLevelFilter}
              onValueChange={(value) =>
                setRiskLevelFilter(value as VendorRisk | 'ALL')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('allRiskLevels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allRiskLevels')}</SelectItem>
                <SelectItem value="CRITICAL">{t('riskLevels.critical')}</SelectItem>
                <SelectItem value="HIGH">{t('riskLevels.high')}</SelectItem>
                <SelectItem value="MEDIUM">{t('riskLevels.medium')}</SelectItem>
                <SelectItem value="LOW">{t('riskLevels.low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Vendors table */}
      {vendors.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('noVendors')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('noVendorsDescription')}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/vendors/new`}>
              <Plus className="me-2 h-4 w-4" />
              {t('addFirstVendor')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.riskScore')}</TableHead>
                <TableHead>{t('table.riskLevel')}</TableHead>
                <TableHead>{t('table.linkedSystems')}</TableHead>
                <TableHead>{t('table.lastAssessed')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <Link
                      href={`/${locale}/vendors/${vendor.id}`}
                      className="font-medium hover:underline"
                    >
                      {vendor.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`vendorTypes.${vendor.vendorType.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vendor.riskScore !== null ? (
                      <span className="font-medium">{vendor.riskScore}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.riskLevel ? (
                      <Badge className={getRiskBadgeClass(vendor.riskLevel)}>
                        {t(`riskLevels.${vendor.riskLevel.toLowerCase()}`)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t('notAssessed')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor._count.systemLinks > 0 ? (
                      <span className="text-sm">
                        {vendor._count.systemLinks} {t('systems')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('noLinkedSystems')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vendor.lastAssessedAt ? (
                      formatDistance(
                        new Date(vendor.lastAssessedAt),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )
                    ) : (
                      <span className="text-muted-foreground">{t('never')}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Warning for high-risk vendors */}
      {vendors.some(
        (v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH'
      ) && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-orange-800">
                {t('highRiskWarning')}
              </div>
              <div className="mt-1 text-sm text-orange-700">
                {t('highRiskWarningDescription')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
