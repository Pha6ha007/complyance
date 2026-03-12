'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
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
import { Card } from '@/components/ui/card';
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
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  BookOpen,
  PenTool,
  Gavel,
  Scale,
  FileText,
} from 'lucide-react';
import { ChangeType } from '@prisma/client';
import { format } from 'date-fns';

const REGULATION_OPTIONS = [
  { value: 'EU_AI_ACT', label: 'EU AI Act' },
  { value: 'COLORADO', label: 'Colorado AI Act' },
  { value: 'NYC_LL144', label: 'NYC LL144' },
  { value: 'NIST_RMF', label: 'NIST AI RMF' },
  { value: 'ISO_42001', label: 'ISO 42001' },
  { value: 'UAE_AI', label: 'UAE AI Ethics' },
] as const;

const CHANGE_TYPE_OPTIONS = [
  { value: 'GUIDELINE', label: 'Guideline', icon: BookOpen },
  { value: 'AMENDMENT', label: 'Amendment', icon: PenTool },
  { value: 'ENFORCEMENT', label: 'Enforcement', icon: Gavel },
  { value: 'INTERPRETATION', label: 'Interpretation', icon: Scale },
  { value: 'NEW_LAW', label: 'New Law', icon: FileText },
] as const;

interface UpdateFormData {
  title: string;
  summary: string;
  source: string;
  regulation: string;
  changeType: ChangeType | '';
  impact: string;
  affectedArticles: string;
  publishedAt: string;
}

export default function AdminUpdatesPage() {
  const t = useTranslations('admin.updates');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    title: '',
    summary: '',
    source: '',
    regulation: '',
    changeType: '',
    impact: '',
    affectedArticles: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  // Fetch all updates
  const { data, isLoading, error, refetch } = trpc.intelligence.adminList.useQuery();

  // Create mutation
  const createMutation = trpc.intelligence.create.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = trpc.intelligence.update.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = trpc.intelligence.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      source: '',
      regulation: '',
      changeType: '',
      impact: '',
      affectedArticles: '',
      publishedAt: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.changeType) return;

    const affectedArticles = formData.affectedArticles
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a);

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        title: formData.title,
        summary: formData.summary,
        source: formData.source,
        regulation: formData.regulation as typeof REGULATION_OPTIONS[number]['value'],
        changeType: formData.changeType as ChangeType,
        impact: formData.impact || null,
        affectedArticles,
        publishedAt: new Date(formData.publishedAt),
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title,
        summary: formData.summary,
        source: formData.source,
        regulation: formData.regulation as typeof REGULATION_OPTIONS[number]['value'],
        changeType: formData.changeType as ChangeType,
        impact: formData.impact,
        affectedArticles,
        publishedAt: new Date(formData.publishedAt),
      });
    }
  };

  const handleEdit = (update: any) => {
    setFormData({
      title: update.title,
      summary: update.summary,
      source: update.source,
      regulation: update.regulation,
      changeType: update.changeType,
      impact: update.impact || '',
      affectedArticles: update.affectedArticles.join(', '),
      publishedAt: new Date(update.publishedAt).toISOString().split('T')[0],
    });
    setEditingId(update.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  // Check if user has admin access - if not, show error
  if (error?.data?.code === 'FORBIDDEN') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{t('accessDenied')}</div>
          <div className="text-sm text-muted-foreground">{t('adminOnly')}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  const updates = (data as any)?.updates || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="me-2 h-4 w-4" />
              {t('cancel')}
            </>
          ) : (
            <>
              <Plus className="me-2 h-4 w-4" />
              {t('createNew')}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2">
                <Label htmlFor="title">{t('form.title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  maxLength={500}
                />
              </div>

              {/* Regulation */}
              <div>
                <Label htmlFor="regulation">{t('form.regulation')}</Label>
                <Select
                  value={formData.regulation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, regulation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectRegulation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGULATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Change Type */}
              <div>
                <Label htmlFor="changeType">{t('form.changeType')}</Label>
                <Select
                  value={formData.changeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, changeType: value as ChangeType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANGE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source URL */}
              <div className="md:col-span-2">
                <Label htmlFor="source">{t('form.source')}</Label>
                <Input
                  id="source"
                  type="url"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  required
                  placeholder="https://"
                />
              </div>

              {/* Summary */}
              <div className="md:col-span-2">
                <Label htmlFor="summary">{t('form.summary')}</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>

              {/* Impact */}
              <div className="md:col-span-2">
                <Label htmlFor="impact">{t('form.impact')}</Label>
                <Textarea
                  id="impact"
                  value={formData.impact}
                  onChange={(e) =>
                    setFormData({ ...formData, impact: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {/* Affected Articles */}
              <div>
                <Label htmlFor="affectedArticles">{t('form.affectedArticles')}</Label>
                <Input
                  id="affectedArticles"
                  value={formData.affectedArticles}
                  onChange={(e) =>
                    setFormData({ ...formData, affectedArticles: e.target.value })
                  }
                  placeholder="Article 9, Article 11"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('form.articlesHint')}
                </p>
              </div>

              {/* Published Date */}
              <div>
                <Label htmlFor="publishedAt">{t('form.publishedAt')}</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, publishedAt: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="me-2 h-4 w-4" />
                {editingId ? t('form.update') : t('form.create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.regulation')}</TableHead>
              <TableHead>{t('table.type')}</TableHead>
              <TableHead>{t('table.publishedAt')}</TableHead>
              <TableHead className="text-end">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('noUpdates')}
                </TableCell>
              </TableRow>
            ) : (
              updates.map((update: any) => (
                <TableRow key={update.id}>
                  <TableCell className="max-w-md">
                    <div className="font-medium line-clamp-2">{update.title}</div>
                    {update.affectedArticles.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {update.affectedArticles.join(', ')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {REGULATION_OPTIONS.find((r) => r.value === update.regulation)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {CHANGE_TYPE_OPTIONS.find((c) => c.value === update.changeType)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(update.publishedAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(update)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(update.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
