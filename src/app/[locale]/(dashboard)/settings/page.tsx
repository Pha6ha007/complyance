'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building2,
  Bell,
  CreditCard,
  Globe,
  Shield,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Placeholder data - in real app this would come from tRPC
  const [name, setName] = useState('Pavel');
  const [email, setEmail] = useState('g.pavel336@gmail.com');
  const [organizationName, setOrganizationName] = useState('My Organization');
  const [notifications, setNotifications] = useState(true);

  const handleSaveProfile = () => {
    // TODO: Implement with tRPC
    console.log('Save profile');
  };

  const handleSaveOrganization = () => {
    // TODO: Implement with tRPC
    console.log('Save organization');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('profile')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('profileDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <Button onClick={handleSaveProfile}>{tCommon('save')}</Button>
        </div>
      </Card>

      {/* Organization Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('organization')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('organizationDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="orgName">{t('organizationName')}</Label>
            <Input
              id="orgName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={t('organizationNamePlaceholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('language')}</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">English</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('languageDescription')}
            </p>
          </div>

          <Button onClick={handleSaveOrganization}>{tCommon('save')}</Button>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{t('subscription')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('subscriptionDescription')}
            </p>
          </div>
          <Badge>Free Plan</Badge>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{t('currentPlan')}</span>
              <Badge variant="outline">Free</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('freePlanDescription')}
            </p>
            <Button onClick={() => router.push('/pricing')}>
              {t('upgradePlan')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('notifications')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('notificationsDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t('emailNotifications')}</div>
              <p className="text-sm text-muted-foreground">
                {t('emailNotificationsDescription')}
              </p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? t('enabled') : t('disabled')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('security')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('securityDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button variant="outline">{t('changePassword')}</Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-600">
              {t('dangerZone')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('dangerZoneDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="font-medium text-red-900 mb-2">
              {t('deleteAccount')}
            </div>
            <p className="text-sm text-red-700 mb-4">
              {t('deleteAccountDescription')}
            </p>
            <Button variant="destructive" size="sm">
              {t('deleteAccountButton')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
