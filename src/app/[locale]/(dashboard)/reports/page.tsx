'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string;

  // Fetch all generated documents
  const { data: documents, isLoading } = trpc.document.listAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  const hasDocuments = documents && documents.length > 0;

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'CLASSIFICATION_REPORT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLIANCE_ROADMAP':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ANNEX_IV_DOCUMENTATION':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'CLASSIFICATION_REPORT':
        return t('classificationReport');
      case 'COMPLIANCE_ROADMAP':
        return t('complianceRoadmap');
      case 'ANNEX_IV_DOCUMENTATION':
        return t('annexIvDocumentation');
      default:
        return type;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'FINAL':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Documents List */}
      {hasDocuments ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {doc.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={getDocumentTypeColor(doc.type)}>
                        {getDocumentTypeName(doc.type)}
                      </Badge>
                      <Badge className={getDocumentStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      {doc.systemId && (
                        <span className="text-sm text-muted-foreground">
                          System ID: {doc.systemId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(doc.generatedAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {doc.status === 'FINAL' && doc.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="me-2 h-4 w-4" />
                        {tCommon('download')}
                      </a>
                    </Button>
                  )}
                  {doc.status === 'DRAFT' && (
                    <div className="text-sm text-muted-foreground animate-pulse">
                      {t('processing')}
                    </div>
                  )}
                  {doc.status === 'ARCHIVED' && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {t('failed')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
          <div className="mt-4 text-lg font-medium">{t('noReports')}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t('noReportsDescription')}
          </div>
          <Button
            className="mt-6"
            onClick={() => window.location.href = `/${locale}/systems`}
          >
            {t('goToSystems')}
          </Button>
        </Card>
      )}
    </div>
  );
}
