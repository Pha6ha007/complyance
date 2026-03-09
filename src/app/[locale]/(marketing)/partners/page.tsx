'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, HandshakeIcon, TrendingUp, Users, Award } from 'lucide-react';

export default function PartnersPage() {
  const t = useTranslations('partners');
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    contactName: '',
    email: '',
    type: 'law_firm',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send application');
      }

      setSuccess(true);
      setFormData({
        companyName: '',
        website: '',
        contactName: '',
        email: '',
        type: 'law_firm',
        message: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('benefits.title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('benefits.revenue.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('benefits.revenue.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('benefits.whiteLabel.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('benefits.whiteLabel.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('benefits.support.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('benefits.support.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <HandshakeIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('benefits.training.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('benefits.training.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Ideal Partners */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('ideal.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-xl font-semibold mb-3">{t('ideal.lawFirms.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('ideal.lawFirms.desc')}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-xl font-semibold mb-3">{t('ideal.consultancies.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('ideal.consultancies.desc')}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-xl font-semibold mb-3">{t('ideal.auditors.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('ideal.auditors.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{t('form.title')}</h2>
            <p className="text-muted-foreground">{t('form.subtitle')}</p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {t('form.success')}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">{t('form.companyName')}</Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website">{t('form.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  required
                  placeholder="https://"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactName">{t('form.contactName')}</Label>
                <Input
                  id="contactName"
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">{t('form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">{t('form.type')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="law_firm">{t('form.types.lawFirm')}</SelectItem>
                    <SelectItem value="consultancy">{t('form.types.consultancy')}</SelectItem>
                    <SelectItem value="auditor">{t('form.types.auditor')}</SelectItem>
                    <SelectItem value="other">{t('form.types.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">{t('form.message')}</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  placeholder={t('form.messagePlaceholder')}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('form.sending')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
