'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  FileBox,
  Loader2,
  AlertCircle,
  Lock,
  Upload,
  FileText,
  Camera,
  Terminal,
  FlaskConical,
  X,
} from 'lucide-react';

type EvidenceType = 'DOCUMENT' | 'SCREENSHOT' | 'LOG' | 'TEST_RESULT';

interface FormData {
  title: string;
  description: string;
  evidenceType: EvidenceType;
  article: string;
  systemId: string;
  fileName: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  evidenceType: 'DOCUMENT',
  article: '',
  systemId: '',
  fileName: '',
};

export default function NewEvidencePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const utils = trpc.useUtils();

  // Check access
  const { data: accessData, isLoading: isCheckingAccess } =
    trpc.evidence.checkAccess.useQuery();

  // Fetch available systems
  const { data: systemsData } = trpc.evidence.getAvailableSystems.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  // Fetch article options
  const { data: articleOptions } = trpc.evidence.getArticleOptions.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  // Create mutation
  const createMutation = trpc.evidence.create.useMutation({
    onSuccess: () => {
      utils.evidence.list.invalidate();
      router.push(`/${locale}/evidence`);
    },
  });

  const updateFormField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: t('validation.fileTooLarge') }));
      return;
    }

    // Validate file type
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt', '.docx'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      setErrors((prev) => ({ ...prev, file: t('validation.invalidFileType') }));
      return;
    }

    setDroppedFile(file);
    updateFormField('fileName', file.name);
    setErrors((prev) => ({ ...prev, file: '' }));

    // Auto-populate title if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.slice(0, file.name.lastIndexOf('.'));
      updateFormField('title', nameWithoutExt);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setDroppedFile(null);
    updateFormField('fileName', '');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }

    if (!formData.evidenceType) {
      newErrors.evidenceType = t('validation.typeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        evidenceType: formData.evidenceType,
        article: formData.article || null,
        systemId: formData.systemId || null,
        fileName: formData.fileName || undefined,
        fileSize: droppedFile?.size,
      });
    } catch (error) {
      console.error('Failed to create evidence:', error);
    }
  };

  // Loading state
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <div className="mt-4 text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  // Plan gate
  if (!accessData?.hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/evidence`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToEvidence')}
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

  const systems = systemsData || [];
  const articles = articleOptions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${locale}/evidence`)}
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {t('backToEvidence')}
        </Button>

        <h1 className="mt-4 text-3xl font-bold">{t('addEvidence')}</h1>
        <p className="mt-1 text-muted-foreground">{t('addEvidenceSubtitle')}</p>
      </div>

      {/* Error message */}
      {createMutation.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-red-800">
                {tCommon('error')}
              </div>
              <div className="mt-1 text-sm text-red-700">
                {createMutation.error.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder={t('form.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Evidence Type */}
          <div className="space-y-2">
            <Label>{t('form.evidenceType')} *</Label>
            <RadioGroup
              value={formData.evidenceType}
              onValueChange={(value) =>
                updateFormField('evidenceType', value as EvidenceType)
              }
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              <Label
                htmlFor="type-document"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-4 hover:bg-accent ${
                  formData.evidenceType === 'DOCUMENT' ? 'border-primary bg-accent' : ''
                }`}
              >
                <RadioGroupItem
                  value="DOCUMENT"
                  id="type-document"
                  className="sr-only"
                />
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">{t('types.document')}</span>
              </Label>
              <Label
                htmlFor="type-screenshot"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-4 hover:bg-accent ${
                  formData.evidenceType === 'SCREENSHOT' ? 'border-primary bg-accent' : ''
                }`}
              >
                <RadioGroupItem
                  value="SCREENSHOT"
                  id="type-screenshot"
                  className="sr-only"
                />
                <Camera className="h-6 w-6" />
                <span className="text-sm font-medium">{t('types.screenshot')}</span>
              </Label>
              <Label
                htmlFor="type-log"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-4 hover:bg-accent ${
                  formData.evidenceType === 'LOG' ? 'border-primary bg-accent' : ''
                }`}
              >
                <RadioGroupItem value="LOG" id="type-log" className="sr-only" />
                <Terminal className="h-6 w-6" />
                <span className="text-sm font-medium">{t('types.log')}</span>
              </Label>
              <Label
                htmlFor="type-test"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-4 hover:bg-accent ${
                  formData.evidenceType === 'TEST_RESULT' ? 'border-primary bg-accent' : ''
                }`}
              >
                <RadioGroupItem
                  value="TEST_RESULT"
                  id="type-test"
                  className="sr-only"
                />
                <FlaskConical className="h-6 w-6" />
                <span className="text-sm font-medium">{t('types.testResult')}</span>
              </Label>
            </RadioGroup>
            {errors.evidenceType && (
              <p className="text-sm text-destructive">{errors.evidenceType}</p>
            )}
          </div>

          {/* Linked System */}
          <div className="space-y-2">
            <Label htmlFor="systemId">{t('form.linkedSystem')}</Label>
            <Select
              value={formData.systemId}
              onValueChange={(value) => updateFormField('systemId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectSystem')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('form.noLinkedSystem')}</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('form.linkedSystemHelp')}
            </p>
          </div>

          {/* Related Article */}
          <div className="space-y-2">
            <Label htmlFor="article">{t('form.relatedArticle')}</Label>
            <Select
              value={formData.article}
              onValueChange={(value) => updateFormField('article', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectArticle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('form.noArticle')}</SelectItem>
                {articles.map((article) => (
                  <SelectItem key={article.value} value={article.value}>
                    {article.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('form.relatedArticleHelp')}
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>{t('form.fileUpload')}</Label>
            {droppedFile ? (
              <div className="flex items-center gap-3 rounded-md border p-4">
                <FileBox className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">{droppedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(droppedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="mt-4 text-center">
                  <p className="font-medium">{t('form.dropzone')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('form.dropzoneSupported')}
                  </p>
                </div>
                <label className="mt-4">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx"
                    onChange={handleFileInputChange}
                  />
                  <Button variant="outline" type="button" asChild>
                    <span>{t('form.browseFiles')}</span>
                  </Button>
                </label>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file}</p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/evidence`)}
            disabled={createMutation.isPending}
          >
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
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
