'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Building2,
  Bell,
  CreditCard,
  Globe,
  Shield,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/lib/toast';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [notifications, setNotifications] = useState(true);

  // Load real data from DB
  const { data: settings, isLoading } = trpc.system.getSettings.useQuery();

  useEffect(() => {
    if (settings) {
      setName(settings.user.name);
      setEmail(settings.user.email);
      setOrganizationName(settings.organization.name);
    }
  }, [settings]);

  const updateProfile = trpc.system.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(tCommon('success'));
    },
    onError: (error) => {
      toast.error(error.message || tCommon('error'));
    },
  });

  const updateOrganization = trpc.system.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success(tCommon('success'));
    },
    onError: (error) => {
      toast.error(error.message || tCommon('error'));
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({ name, email });
  };

  const handleSaveOrganization = () => {
    updateOrganization.mutate({ name: organizationName });
  };

  const planLabel = settings?.organization.plan ?? 'FREE';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('profile')}</h2>
            <p className="text-sm text-slate-400">{t('profileDescription')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-300">{t('name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-300">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {tCommon('save')}
          </button>
        </div>
      </div>

      {/* Organization Settings */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
            <Building2 className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('organization')}</h2>
            <p className="text-sm text-slate-400">{t('organizationDescription')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="orgName" className="text-slate-300">{t('organizationName')}</Label>
            <Input
              id="orgName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={t('organizationNamePlaceholder')}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-300">{t('language')}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-700/30 px-3 py-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-300">English</span>
            </div>
            <p className="text-xs text-slate-500">{t('languageDescription')}</p>
          </div>

          <button
            onClick={handleSaveOrganization}
            disabled={updateOrganization.isPending || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateOrganization.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {tCommon('save')}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
            <CreditCard className="h-5 w-5 text-slate-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">{t('subscription')}</h2>
            <p className="text-sm text-slate-400">{t('subscriptionDescription')}</p>
          </div>
          <span className="inline-flex items-center rounded-md bg-slate-700/50 border border-slate-600/50 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {planLabel}
          </span>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-slate-700/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-white">{t('currentPlan')}</span>
            <span className="inline-flex items-center rounded-md bg-slate-700/50 border border-slate-600/50 px-2 py-0.5 text-xs font-medium text-slate-400">
              {planLabel}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-4">{t('freePlanDescription')}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-colors"
          >
            {t('upgradePlan')}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
            <Bell className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('notifications')}</h2>
            <p className="text-sm text-slate-400">{t('notificationsDescription')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-700/20 p-4">
          <div>
            <div className="font-medium text-white">{t('emailNotifications')}</div>
            <p className="text-sm text-slate-400 mt-0.5">{t('emailNotificationsDescription')}</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              notifications
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {notifications ? t('enabled') : t('disabled')}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
            <Shield className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('security')}</h2>
            <p className="text-sm text-slate-400">{t('securityDescription')}</p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-700/50 border border-slate-600/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
          {t('changePassword')}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-400">{t('dangerZone')}</h2>
            <p className="text-sm text-slate-400">{t('dangerZoneDescription')}</p>
          </div>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <div className="font-medium text-red-300 mb-2">{t('deleteAccount')}</div>
          <p className="text-sm text-slate-400 mb-4">{t('deleteAccountDescription')}</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
            {t('deleteAccountButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
