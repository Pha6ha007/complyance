'use client';

/**
 * Document Generator Component
 * Allows users to generate compliance PDF documents for an AI system
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { DocType } from '@prisma/client';

interface DocumentGeneratorProps {
  systemId: string;
  isClassified: boolean;
  canGenerateDocs: boolean;
  onGenerate: (type: DocType, translations: any) => Promise<void>;
  documents: Array<{
    id: string;
    type: DocType;
    title: string;
    generatedAt: Date;
  }>;
  onDownload: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentGenerator({
  systemId,
  isClassified,
  canGenerateDocs,
  onGenerate,
  documents,
  onDownload,
  onDelete,
}: DocumentGeneratorProps) {
  const t = useTranslations('documents');
  const tReport = useTranslations('documents.report');
  const tRoadmap = useTranslations('documents.roadmap');
  const tAnnexIV = useTranslations('documents.annexIV');
  const tCommon = useTranslations('common');

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<DocType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleGenerate = async (type: DocType) => {
    setIsGenerating(true);
    setSelectedType(type);

    try {
      // Prepare translations for PDF generation
      const translations = {
        classificationReport: {
          title: tReport('title'),
          subtitle: tReport('subtitle'),
          systemInfo: tReport('systemInfo'),
          systemName: tReport('systemName'),
          description: tReport('description'),
          aiType: tReport('aiType'),
          domain: tReport('domain'),
          markets: tReport('markets'),
          classification: tReport('classification'),
          riskLevel: tReport('riskLevel'),
          annexCategory: tReport('annexCategory'),
          reasoning: tReport('reasoning'),
          exceptionAnalysis: tReport('exceptionAnalysis'),
          exceptionApplies: tReport('exceptionApplies'),
          yes: tCommon('yes'),
          no: tCommon('no'),
          exceptionReason: tReport('exceptionReason'),
          obligations: tReport('obligations'),
          obligationCount: tReport('obligationCount'),
          gapCount: tReport('gapCount'),
          providerDeployer: tReport('providerDeployer'),
          transparency: tReport('transparency'),
          disclaimer: tReport('disclaimer'),
          generatedFor: tReport('generatedFor'),
          noException: tReport('noException'),
          notClassified: tReport('notClassified'),
        },
        roadmap: {
          title: tRoadmap('title'),
          subtitle: tRoadmap('subtitle'),
          systemName: tRoadmap('systemName'),
          deadline: tRoadmap('deadline'),
          daysRemaining: tRoadmap('daysRemaining'),
          overview: tRoadmap('overview'),
          totalGaps: tRoadmap('totalGaps'),
          criticalGaps: tRoadmap('criticalGaps'),
          highGaps: tRoadmap('highGaps'),
          timeline: tRoadmap('timeline'),
          phase: tRoadmap('phase'),
          article: tRoadmap('article'),
          requirement: tRoadmap('requirement'),
          priority: tRoadmap('priority'),
          dueDate: tRoadmap('dueDate'),
          status: tRoadmap('status'),
          disclaimer: tRoadmap('disclaimer'),
          generatedFor: tRoadmap('generatedFor'),
          notStarted: tRoadmap('notStarted'),
          inProgress: tRoadmap('inProgress'),
          completed: tRoadmap('completed'),
          immediate: tRoadmap('immediate'),
          shortTerm: tRoadmap('shortTerm'),
          mediumTerm: tRoadmap('mediumTerm'),
          longTerm: tRoadmap('longTerm'),
        },
        annexIV: {
          title: tAnnexIV('title'),
          subtitle: tAnnexIV('subtitle'),
          section1: tAnnexIV('section1'),
          section1Title: tAnnexIV('section1Title'),
          section1Content: tAnnexIV('section1Content'),
          section2: tAnnexIV('section2'),
          section2Title: tAnnexIV('section2Title'),
          section2Content: tAnnexIV('section2Content'),
          section3: tAnnexIV('section3'),
          section3Title: tAnnexIV('section3Title'),
          section3Content: tAnnexIV('section3Content'),
          section4: tAnnexIV('section4'),
          section4Title: tAnnexIV('section4Title'),
          section4Content: tAnnexIV('section4Content'),
          section5: tAnnexIV('section5'),
          section5Title: tAnnexIV('section5Title'),
          section5Content: tAnnexIV('section5Content'),
          section6: tAnnexIV('section6'),
          section6Title: tAnnexIV('section6Title'),
          section6Content: tAnnexIV('section6Content'),
          systemInfo: tAnnexIV('systemInfo'),
          systemName: tAnnexIV('systemName'),
          description: tAnnexIV('description'),
          aiType: tAnnexIV('aiType'),
          domain: tAnnexIV('domain'),
          markets: tAnnexIV('markets'),
          riskLevel: tAnnexIV('riskLevel'),
          providerInfo: tAnnexIV('providerInfo'),
          organizationName: tAnnexIV('organizationName'),
          generatedDate: tAnnexIV('generatedDate'),
          version: tAnnexIV('version'),
          disclaimer: tAnnexIV('disclaimer'),
          generatedFor: tAnnexIV('generatedFor'),
          intendedPurpose: tAnnexIV('intendedPurpose'),
          technicalSpecs: tAnnexIV('technicalSpecs'),
          dataRequirements: tAnnexIV('dataRequirements'),
          humanOversight: tAnnexIV('humanOversight'),
          accuracy: tAnnexIV('accuracy'),
          robustness: tAnnexIV('robustness'),
          cybersecurity: tAnnexIV('cybersecurity'),
          monitoring: tAnnexIV('monitoring'),
          placeholder: tAnnexIV('placeholder'),
        },
      };

      await onGenerate(type, translations);
      setShowTypeSelector(false);
    } finally {
      setIsGenerating(false);
      setSelectedType(null);
    }
  };

  const getDocumentTypeLabel = (type: DocType): string => {
    switch (type) {
      case DocType.CLASSIFICATION_REPORT:
        return t('classificationReport');
      case DocType.ROADMAP:
        return t('roadmap');
      case DocType.ANNEX_IV:
        return t('annexIV');
      default:
        return type;
    }
  };

  if (!canGenerateDocs) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-medium text-yellow-800">{t('upgradeRequired')}</h3>
        <p className="mt-1 text-sm text-yellow-700">{t('upgradeMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <div className="relative">
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {t('generate')}
              </>
            )}
          </button>

          {/* Type Selector Dropdown */}
          {showTypeSelector && !isGenerating && (
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => handleGenerate(DocType.CLASSIFICATION_REPORT)}
                  disabled={!isClassified}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium">{t('classificationReport')}</div>
                  {!isClassified && (
                    <div className="text-xs text-gray-500">{t('classificationRequired')}</div>
                  )}
                </button>
                <button
                  onClick={() => handleGenerate(DocType.ROADMAP)}
                  disabled={!isClassified}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium">{t('roadmap')}</div>
                  {!isClassified && (
                    <div className="text-xs text-gray-500">{t('classificationRequired')}</div>
                  )}
                </button>
                <button
                  onClick={() => handleGenerate(DocType.ANNEX_IV)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <div className="font-medium">{t('annexIV')}</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noDocuments')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('noDocumentsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{doc.title}</div>
                  <div className="text-xs text-gray-500">
                    {getDocumentTypeLabel(doc.type)} • {t('generatedAt')}{' '}
                    {new Date(doc.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDownload(doc.id)}
                  className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                  title={t('download')}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('deleteConfirm'))) {
                      onDelete(doc.id);
                    }
                  }}
                  className="rounded-md p-2 text-red-600 hover:bg-red-50"
                  title={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
