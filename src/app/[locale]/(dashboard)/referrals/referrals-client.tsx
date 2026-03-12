'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Gift, Users, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ReferralsClient() {
  const t = useTranslations('referrals');
  const tCommon = useTranslations('common');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch referral code and stats
  const { data: codeData, isLoading: codeLoading } = trpc.referral.getMyCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referral.getStats.useQuery();

  const referralCode = codeData?.code || '';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/login?ref=${referralCode}`
    : '';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success(t('copied'), {
        description: t('yourCode'),
      });
    } catch (error) {
      toast.error(tCommon('error'), {
        description: 'Failed to copy code',
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success(t('copied'), {
        description: t('yourLink'),
      });
    } catch (error) {
      toast.error(tCommon('error'), {
        description: 'Failed to copy link',
      });
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 dark:text-slate-500">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t('subtitle')}</p>
      </div>

      {/* Referral Code/Link Card */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {t('shareTitle')}
          </CardTitle>
          <CardDescription className="dark:text-slate-400">{t('shareDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('yourLink')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-3 py-2 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 me-2" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 me-2" />
                    {t('copyLink')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('yourCode')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-3 py-2 text-sm font-mono"
              />
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4 me-2" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 me-2" />
                    {t('copyCode')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('stats.totalInvited')}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalInvited || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('stats.totalConverted')}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalConverted || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400 dark:text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('stats.totalPending')}
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats?.totalPending || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-400 dark:text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('stats.totalBonusSystems')}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  +{stats?.totalBonusSystems || 0}
                </p>
              </div>
              <Gift className="h-8 w-8 text-blue-400 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">{t('howItWorks.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('howItWorks.step1Title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('howItWorks.step1Description')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('howItWorks.step2Title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('howItWorks.step2Description')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('howItWorks.step3Title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('howItWorks.step3Description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">{t('benefits.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('benefits.forReferrer')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('benefits.forReferrerReward')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('benefits.forReferred')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('benefits.forReferredReward')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">{t('recent.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-start px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t('recent.name')}
                    </th>
                    <th className="text-start px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t('recent.plan')}
                    </th>
                    <th className="text-start px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t('recent.status')}
                    </th>
                    <th className="text-start px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t('recent.reward')}
                    </th>
                    <th className="text-start px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t('recent.date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b dark:border-slate-700 last:border-b-0">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-200">
                        {referral.referredName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                          {referral.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            referral.status === 'GRANTED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : referral.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {t(`status.${referral.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {t('reward.systems', { count: referral.amount })}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500">
                        {formatDistanceToNow(new Date(referral.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('recent.empty')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">{t('terms.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>{t('terms.item1')}</li>
            <li>{t('terms.item2')}</li>
            <li>{t('terms.item3')}</li>
            <li>{t('terms.item4')}</li>
            <li>{t('terms.item5')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
