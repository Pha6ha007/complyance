'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  Building2,
  FileEdit,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';

// Known vendors database from CLAUDE.md
const KNOWN_VENDORS = [
  {
    name: 'OpenAI',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false, // API data opt-out available
    dataProcessingLocation: 'US',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: null, // Unknown
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'Anthropic',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false, // No training on API data
    dataProcessingLocation: 'US',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: null,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'Google (Vertex AI)',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false, // Configurable
    dataProcessingLocation: 'GLOBAL', // US/EU options
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: true,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'AWS Bedrock',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false,
    dataProcessingLocation: 'GLOBAL', // US/EU options
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: true,
    usesSubprocessors: false,
    subprocessorsDocumented: false,
  },
  {
    name: 'Hugging Face',
    vendorType: 'MODEL_HOST' as const,
    dataUsedForTraining: null, // Depends on model
    dataProcessingLocation: 'EU',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: true,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'Mistral AI',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false, // Configurable
    dataProcessingLocation: 'EU',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: true,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'Cohere',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: false, // Opt-out available
    dataProcessingLocation: 'US',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: null,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
  {
    name: 'Stability AI',
    vendorType: 'API_PROVIDER' as const,
    dataUsedForTraining: null, // Varies
    dataProcessingLocation: 'US',
    hasDPA: true,
    hasModelCard: true,
    supportsAIAct: null,
    usesSubprocessors: true,
    subprocessorsDocumented: false,
  },
  {
    name: 'Midjourney',
    vendorType: 'SAAS_WITH_AI' as const,
    dataUsedForTraining: true, // Yes (ToS)
    dataProcessingLocation: 'US',
    hasDPA: false,
    hasModelCard: false,
    supportsAIAct: false,
    usesSubprocessors: true,
    subprocessorsDocumented: false,
  },
  {
    name: 'Jasper',
    vendorType: 'SAAS_WITH_AI' as const,
    dataUsedForTraining: null, // Varies
    dataProcessingLocation: 'US',
    hasDPA: true,
    hasModelCard: false,
    supportsAIAct: null,
    usesSubprocessors: true,
    subprocessorsDocumented: true,
  },
];

type VendorType = 'API_PROVIDER' | 'SAAS_WITH_AI' | 'MODEL_HOST';
type BoolOrNull = boolean | null;

interface VendorFormData {
  name: string;
  vendorType: VendorType;
  dataUsedForTraining: BoolOrNull;
  dataProcessingLocation: string | null;
  hasDPA: boolean;
  hasModelCard: boolean;
  supportsAIAct: BoolOrNull;
  usesSubprocessors: boolean;
  subprocessorsDocumented: boolean;
}

const emptyForm: VendorFormData = {
  name: '',
  vendorType: 'API_PROVIDER',
  dataUsedForTraining: null,
  dataProcessingLocation: null,
  hasDPA: false,
  hasModelCard: false,
  supportsAIAct: null,
  usesSubprocessors: false,
  subprocessorsDocumented: false,
};

export default function NewVendorPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');

  const [mode, setMode] = useState<'select' | 'custom' | null>(null);
  const [selectedKnownVendor, setSelectedKnownVendor] = useState<string>('');
  const [formData, setFormData] = useState<VendorFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = trpc.useUtils();

  // Check plan limits
  const { data: countData, isLoading: isLoadingCount } =
    trpc.vendor.getCount.useQuery();

  // Create and assess vendor
  const createMutation = trpc.vendor.create.useMutation();
  const assessMutation = trpc.vendor.assess.useMutation();

  const isSubmitting = createMutation.isPending || assessMutation.isPending;

  const handleKnownVendorSelect = (vendorName: string) => {
    const vendor = KNOWN_VENDORS.find((v) => v.name === vendorName);
    if (vendor) {
      setSelectedKnownVendor(vendorName);
      setFormData({
        ...vendor,
        dataProcessingLocation: vendor.dataProcessingLocation,
      });
    }
  };

  const updateFormField = <K extends keyof VendorFormData>(
    field: K,
    value: VendorFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Create vendor
      const vendor = await createMutation.mutateAsync({
        name: formData.name,
        vendorType: formData.vendorType,
        dataUsedForTraining: formData.dataUsedForTraining,
        dataProcessingLocation: formData.dataProcessingLocation,
        hasDPA: formData.hasDPA,
        hasModelCard: formData.hasModelCard,
        supportsAIAct: formData.supportsAIAct,
        usesSubprocessors: formData.usesSubprocessors,
        subprocessorsDocumented: formData.subprocessorsDocumented,
      });

      // Assess the vendor
      await assessMutation.mutateAsync({
        id: vendor.id,
        runAIAnalysis: true,
      });

      // Invalidate queries
      utils.vendor.list.invalidate();
      utils.vendor.getCount.invalidate();

      // Redirect to vendor detail
      router.push(`/${locale}/vendors/${vendor.id}`);
    } catch (error) {
      console.error('Failed to create vendor:', error);
    }
  };

  // Loading state
  if (isLoadingCount) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <div className="mt-4 text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  const isFree = countData?.limit === 0;
  const canCreate = countData?.canCreate ?? false;

  // Free plan - show upgrade message
  if (isFree) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/vendors`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToVendors')}
          </Button>
        </div>

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

  // Limit reached - show upgrade message
  if (!canCreate) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/vendors`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToVendors')}
          </Button>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600" />
          <h3 className="mt-4 text-lg font-semibold text-yellow-800">
            {t('limitReached')}
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            {t('limitReachedMessage')}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/pricing`}>{t('upgradeToPlan')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/vendors`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToVendors')}
          </Button>

          <h1 className="mt-4 text-3xl font-bold">{t('addVendor')}</h1>
          <p className="mt-1 text-muted-foreground">{t('addVendorSubtitle')}</p>
        </div>

        {/* Mode selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer p-6 hover:border-primary transition-colors"
            onClick={() => setMode('select')}
          >
            <Building2 className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">
              {t('selectKnownVendor')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('selectKnownVendorDescription')}
            </p>
          </Card>

          <Card
            className="cursor-pointer p-6 hover:border-primary transition-colors"
            onClick={() => setMode('custom')}
          >
            <FileEdit className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">
              {t('addCustomVendor')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('addCustomVendorDescription')}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
          <ArrowLeft className="me-2 h-4 w-4" />
          {tCommon('back')}
        </Button>

        <h1 className="mt-4 text-3xl font-bold">
          {mode === 'select' ? t('selectKnownVendor') : t('addCustomVendor')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {mode === 'select'
            ? t('selectKnownVendorDescription')
            : t('addCustomVendorDescription')}
        </p>
      </div>

      {/* Error message */}
      {(createMutation.error || assessMutation.error) && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-red-800">
                {tCommon('error')}
              </div>
              <div className="mt-1 text-sm text-red-700">
                {createMutation.error?.message ||
                  assessMutation.error?.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Known vendor selector (only in select mode) */}
          {mode === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="knownVendor">{t('form.selectVendor')}</Label>
              <Select
                value={selectedKnownVendor}
                onValueChange={handleKnownVendorSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectVendorPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {KNOWN_VENDORS.map((vendor) => (
                    <SelectItem key={vendor.name} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('form.selectVendorHelp')}
              </p>
            </div>
          )}

          {/* Vendor name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder={t('form.namePlaceholder')}
              disabled={mode === 'select' && selectedKnownVendor !== ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Vendor type */}
          <div className="space-y-2">
            <Label>{t('form.vendorType')}</Label>
            <RadioGroup
              value={formData.vendorType}
              onValueChange={(value) =>
                updateFormField('vendorType', value as VendorType)
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="API_PROVIDER" id="api_provider" />
                <Label htmlFor="api_provider" className="font-normal">
                  {t('vendorTypes.api_provider')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SAAS_WITH_AI" id="saas_with_ai" />
                <Label htmlFor="saas_with_ai" className="font-normal">
                  {t('vendorTypes.saas_with_ai')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MODEL_HOST" id="model_host" />
                <Label htmlFor="model_host" className="font-normal">
                  {t('vendorTypes.model_host')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Data used for training */}
          <div className="space-y-2">
            <Label>{t('form.dataUsedForTraining')}</Label>
            <RadioGroup
              value={
                formData.dataUsedForTraining === null
                  ? 'unknown'
                  : formData.dataUsedForTraining
                  ? 'yes'
                  : 'no'
              }
              onValueChange={(value) =>
                updateFormField(
                  'dataUsedForTraining',
                  value === 'unknown' ? null : value === 'yes'
                )
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="training_yes" />
                <Label htmlFor="training_yes" className="font-normal">
                  {tCommon('yes')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="training_no" />
                <Label htmlFor="training_no" className="font-normal">
                  {tCommon('no')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="training_unknown" />
                <Label htmlFor="training_unknown" className="font-normal">
                  {t('form.unknown')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Data processing location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t('form.dataProcessingLocation')}</Label>
            <Select
              value={formData.dataProcessingLocation || ''}
              onValueChange={(value) =>
                updateFormField(
                  'dataProcessingLocation',
                  value === '' ? null : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectLocation')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EU">{t('form.locations.eu')}</SelectItem>
                <SelectItem value="US">{t('form.locations.us')}</SelectItem>
                <SelectItem value="GLOBAL">{t('form.locations.global')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Has DPA */}
          <div className="space-y-2">
            <Label>{t('form.hasDPA')}</Label>
            <RadioGroup
              value={formData.hasDPA ? 'yes' : 'no'}
              onValueChange={(value) =>
                updateFormField('hasDPA', value === 'yes')
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="dpa_yes" />
                <Label htmlFor="dpa_yes" className="font-normal">
                  {tCommon('yes')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="dpa_no" />
                <Label htmlFor="dpa_no" className="font-normal">
                  {tCommon('no')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Has Model Card */}
          <div className="space-y-2">
            <Label>{t('form.hasModelCard')}</Label>
            <RadioGroup
              value={formData.hasModelCard ? 'yes' : 'no'}
              onValueChange={(value) =>
                updateFormField('hasModelCard', value === 'yes')
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="modelcard_yes" />
                <Label htmlFor="modelcard_yes" className="font-normal">
                  {tCommon('yes')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="modelcard_no" />
                <Label htmlFor="modelcard_no" className="font-normal">
                  {tCommon('no')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Supports AI Act */}
          <div className="space-y-2">
            <Label>{t('form.supportsAIAct')}</Label>
            <RadioGroup
              value={
                formData.supportsAIAct === null
                  ? 'unknown'
                  : formData.supportsAIAct
                  ? 'yes'
                  : 'no'
              }
              onValueChange={(value) =>
                updateFormField(
                  'supportsAIAct',
                  value === 'unknown' ? null : value === 'yes'
                )
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="aiact_yes" />
                <Label htmlFor="aiact_yes" className="font-normal">
                  {tCommon('yes')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="aiact_no" />
                <Label htmlFor="aiact_no" className="font-normal">
                  {tCommon('no')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="aiact_unknown" />
                <Label htmlFor="aiact_unknown" className="font-normal">
                  {t('form.unknown')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Uses Subprocessors */}
          <div className="space-y-2">
            <Label>{t('form.usesSubprocessors')}</Label>
            <RadioGroup
              value={formData.usesSubprocessors ? 'yes' : 'no'}
              onValueChange={(value) =>
                updateFormField('usesSubprocessors', value === 'yes')
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="subprocessors_yes" />
                <Label htmlFor="subprocessors_yes" className="font-normal">
                  {tCommon('yes')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="subprocessors_no" />
                <Label htmlFor="subprocessors_no" className="font-normal">
                  {tCommon('no')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subprocessors Documented (only if uses subprocessors) */}
          {formData.usesSubprocessors && (
            <div className="space-y-2 ps-4 border-s-2 border-muted">
              <Label>{t('form.subprocessorsDocumented')}</Label>
              <RadioGroup
                value={formData.subprocessorsDocumented ? 'yes' : 'no'}
                onValueChange={(value) =>
                  updateFormField('subprocessorsDocumented', value === 'yes')
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="subdoc_yes" />
                  <Label htmlFor="subdoc_yes" className="font-normal">
                    {tCommon('yes')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="subdoc_no" />
                  <Label htmlFor="subdoc_no" className="font-normal">
                    {tCommon('no')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/vendors`)}
            disabled={isSubmitting}
          >
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
