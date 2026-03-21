'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { FileText, Download, Calendar, AlertCircle, FileCheck2, Clock, Archive } from 'lucide-react';

function getTypeBadgeClasses(type: string): string {
  switch (type) {
    case 'CLASSIFICATION_REPORT':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'COMPLIANCE_ROADMAP':
      return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    case 'ANNEX_IV_DOCUMENTATION':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'FINAL':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'DRAFT':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'ARCHIVED':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'FINAL':
      return <FileCheck2 className="h-3 w-3 me-1" />;
    case 'DRAFT':
      return <Clock className="h-3 w-3 me-1" />;
    case 'ARCHIVED':
      return <Archive className="h-3 w-3 me-1" />;
    default:
      return null;
  }
}

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { data: documents, isLoading } = trpc.document.listAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

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

  const hasDocuments = documents && documents.length > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {hasDocuments ? (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.document')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.type')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.status')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.generated')}</div>
            <div />
          </div>

          {/* Rows */}
          {documents.map((doc, idx) => (
            <div
              key={doc.id}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-4 items-center hover:bg-slate-700/20 transition-colors ${idx !== documents.length - 1 ? 'border-b border-slate-700/30' : ''}`}
            >
              {/* Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700/60 border border-slate-600/50">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{doc.title}</div>
                  {doc.systemId && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">ID: {doc.systemId}</div>
                  )}
                </div>
              </div>

              {/* Type */}
              <div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getTypeBadgeClasses(doc.type)}`}>
                  {getDocumentTypeName(doc.type)}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(doc.status)}`}>
                  {getStatusIcon(doc.status)}
                  {doc.status}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {new Date(doc.generatedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>

              {/* Action */}
              <div className="flex items-center justify-end">
                {doc.status === 'FINAL' && doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {tCommon('download')}
                  </a>
                ) : doc.status === 'DRAFT' ? (
                  <span className="text-xs text-amber-400 animate-pulse">{t('processing')}</span>
                ) : doc.status === 'ARCHIVED' ? (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {t('failed')}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{t('noReports')}</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('noReportsDescription')}</p>
          <button
            onClick={() => router.push('/systems')}
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors"
          >
            {t('goToSystems')}
          </button>
        </div>
      )}
    </div>
  );
}
