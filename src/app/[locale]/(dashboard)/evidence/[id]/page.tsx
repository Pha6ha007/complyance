'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import {
  ArrowLeft,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  FileText,
  Camera,
  Terminal,
  FlaskConical,
  ExternalLink,
  Loader2,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

function getTypeIcon(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return <FileText className="h-5 w-5" />;
    case 'SCREENSHOT':
      return <Camera className="h-5 w-5" />;
    case 'LOG':
      return <Terminal className="h-5 w-5" />;
    case 'TEST_RESULT':
      return <FlaskConical className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SCREENSHOT':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'LOG':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'TEST_RESULT':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return '';
  }
}

export default function EvidenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const evidenceId = params.id as string;

  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    article: string;
  }>({ title: '', description: '', article: '' });

  const utils = trpc.useUtils();

  // Fetch evidence
  const {
    data: evidence,
    isLoading,
    error,
    refetch,
  } = trpc.evidence.getById.useQuery({ id: evidenceId });

  // Fetch article options for edit form
  const { data: articleOptions } = trpc.evidence.getArticleOptions.useQuery();

  // Verify integrity mutation
  const verifyMutation = trpc.evidence.verifyIntegrity.useMutation();

  // Delete mutation
  const deleteMutation = trpc.evidence.delete.useMutation({
    onSuccess: () => {
      router.push(`/${locale}/evidence`);
    },
  });

  // Update mutation
  const updateMutation = trpc.evidence.update.useMutation({
    onSuccess: () => {
      utils.evidence.getById.invalidate({ id: evidenceId });
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    if (evidence) {
      setEditForm({
        title: evidence.title,
        description: evidence.description || '',
        article: evidence.article || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    await updateMutation.mutateAsync({
      id: evidenceId,
      title: editForm.title,
      description: editForm.description || null,
      article: editForm.article || null,
    });
  };

  const handleVerifyIntegrity = async () => {
    await verifyMutation.mutateAsync({ id: evidenceId });
  };

  const handleDelete = () => {
    if (confirm(t('deleteConfirm'))) {
      deleteMutation.mutate({ id: evidenceId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{tCommon('error')}</div>
          <div className="text-sm text-muted-foreground">
            {error?.message || t('evidenceNotFound')}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/${locale}/evidence`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToEvidence')}
          </Button>
        </div>
      </div>
    );
  }

  // Get integrity status
  const integrityResult = verifyMutation.data;
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

        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{evidence.title}</h1>
              <Badge className={getTypeBadgeClass(evidence.evidenceType)}>
                {getTypeIcon(evidence.evidenceType)}
                <span className="ms-1">
                  {t(`types.${evidence.evidenceType.toLowerCase()}`)}
                </span>
              </Badge>
            </div>
            {evidence.article && (
              <p className="mt-1 text-muted-foreground">{evidence.article}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="me-2 h-4 w-4" />
              {tCommon('edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {tCommon('delete')}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('editEvidence')}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t('form.title')}</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('form.description')}</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-article">{t('form.relatedArticle')}</Label>
              <Select
                value={editForm.article}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, article: value }))
                }
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
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : null}
                {tCommon('save')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">{t('details')}</h2>
          <dl className="mt-4 space-y-4">
            {evidence.description && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('form.description')}
                </dt>
                <dd className="mt-1 text-sm">{evidence.description}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.linkedSystem')}
              </dt>
              <dd className="mt-1">
                {evidence.system ? (
                  <Link
                    href={`/${locale}/systems/${evidence.system.id}`}
                    className="flex items-center gap-1 text-sm hover:underline"
                  >
                    {evidence.system.name}
                    {evidence.system.riskLevel && (
                      <Badge variant="outline" className="ms-2 text-xs">
                        {evidence.system.riskLevel}
                      </Badge>
                    )}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('noLinkedSystem')}
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.relatedArticle')}
              </dt>
              <dd className="mt-1 text-sm">
                {evidence.article || (
                  <span className="text-muted-foreground">{t('noArticle')}</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('createdAt')}
              </dt>
              <dd className="mt-1 text-sm">
                {format(new Date(evidence.createdAt), 'PPp')}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Integrity Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('integrity.title')}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyIntegrity}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="me-2 h-4 w-4" />
              )}
              {t('integrity.verify')}
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Hash display */}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('integrity.hash')}
              </dt>
              <dd className="mt-1">
                {evidence.integrityHash ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                    {evidence.integrityHash}
                  </code>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('integrity.noHash')}
                  </span>
                )}
              </dd>
            </div>

            {/* Verification result */}
            {integrityResult && (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-3">
                  {integrityResult.status === 'VERIFIED' ? (
                    <>
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium text-green-700">
                          {t('integrity.verified')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('integrity.verifiedDescription')}
                        </div>
                      </div>
                    </>
                  ) : integrityResult.status === 'TAMPERED' ? (
                    <>
                      <ShieldAlert className="h-8 w-8 text-red-600" />
                      <div>
                        <div className="font-medium text-red-700">
                          {t('integrity.tampered')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('integrity.tamperedDescription')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldQuestion className="h-8 w-8 text-yellow-600" />
                      <div>
                        <div className="font-medium text-yellow-700">
                          {t('integrity.noHash')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('integrity.noHashDescription')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!integrityResult && evidence.integrityHash && (
              <p className="text-sm text-muted-foreground">
                {t('integrity.clickToVerify')}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* File Preview Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('file.title')}</h2>
          {evidence.fileUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="me-2 h-4 w-4" />
                {t('file.download')}
              </a>
            </Button>
          )}
        </div>

        <div className="mt-4">
          {evidence.fileUrl ? (
            <div className="space-y-4">
              {/* Show image preview for screenshots */}
              {evidence.evidenceType === 'SCREENSHOT' && (
                <div className="rounded-md border overflow-hidden bg-muted">
                  <div className="p-8 text-center text-muted-foreground">
                    <Camera className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-sm">{t('file.imagePreviewPlaceholder')}</p>
                  </div>
                </div>
              )}

              {/* File info */}
              <div className="flex items-center gap-3 rounded-md border p-4">
                {getTypeIcon(evidence.evidenceType)}
                <div className="flex-1">
                  <div className="font-medium">
                    {evidence.fileUrl.split('/').pop()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('file.storedSecurely')}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={evidence.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4 text-muted-foreground">
                {t('file.noFile')}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Legal Disclaimer */}
      <div className="rounded-md border border-muted bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
