'use client';

import { useTranslations } from 'next-intl';
import { FileText, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DocumentAnalysisResult } from '@/server/ai/schemas/document-analysis-result';

interface DocumentAnalysisViewerProps {
  analysis: DocumentAnalysisResult;
}

export function DocumentAnalysisViewer({
  analysis,
}: DocumentAnalysisViewerProps) {
  const t = useTranslations('wizard');
  const tCommon = useTranslations('common');

  const confidenceColor =
    analysis.confidence >= 0.8
      ? 'text-green-600'
      : analysis.confidence >= 0.5
        ? 'text-yellow-600'
        : 'text-red-600';

  const highRisks = analysis.detectedRisks.filter((r) => r.severity === 'HIGH');
  const mediumRisks = analysis.detectedRisks.filter(
    (r) => r.severity === 'MEDIUM'
  );
  const lowRisks = analysis.detectedRisks.filter((r) => r.severity === 'LOW');

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('analysisComplete')}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('reviewAndConfirm')}
            </p>
          </div>
          <Badge variant="outline" className={confidenceColor}>
            {Math.round(analysis.confidence * 100)}% {t('confident')}
          </Badge>
        </div>

        {/* Extracted Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {analysis.systemName && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                {t('systemName')}
              </label>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                {analysis.systemName}
                <Badge variant="outline" className="text-xs">
                  {t('extractedFrom')}
                </Badge>
              </p>
            </div>
          )}

          {analysis.aiType && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                {t('aiType')}
              </label>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                {analysis.aiType}
                <Badge variant="outline" className="text-xs">
                  {t('extractedFrom')}
                </Badge>
              </p>
            </div>
          )}

          {analysis.domain && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                {t('domain')}
              </label>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                {analysis.domain}
                <Badge variant="outline" className="text-xs">
                  {t('extractedFrom')}
                </Badge>
              </p>
            </div>
          )}

          {analysis.markets.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                {t('markets')}
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.markets.map((market) => (
                  <Badge key={market} variant="secondary">
                    {market}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  {t('extractedFrom')}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Key Findings */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('keyFindings')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                analysis.makesDecisions ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              {analysis.makesDecisions ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {t('makesDecisions')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {analysis.makesDecisions !== null
                    ? analysis.makesDecisions
                      ? tCommon('yes')
                      : tCommon('no')
                    : t('unknown')}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                analysis.processesPersonalData ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              {analysis.processesPersonalData ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {t('processesPersonalData')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {analysis.processesPersonalData !== null
                    ? analysis.processesPersonalData
                      ? tCommon('yes')
                      : tCommon('no')
                    : t('unknown')}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                analysis.profilesUsers ? 'bg-red-50' : 'bg-gray-50'
              }`}
            >
              {analysis.profilesUsers ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {t('profilesUsers')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {analysis.profilesUsers !== null
                    ? analysis.profilesUsers
                      ? tCommon('yes')
                      : tCommon('no')
                    : t('unknown')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detected Risks */}
      {analysis.detectedRisks.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('detectedRisks')}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('detectedRiskDescription')}
          </p>

          <div className="space-y-4">
            {highRisks.map((risk, index) => (
              <RiskItem key={`high-${index}`} risk={risk} />
            ))}
            {mediumRisks.map((risk, index) => (
              <RiskItem key={`medium-${index}`} risk={risk} />
            ))}
            {lowRisks.map((risk, index) => (
              <RiskItem key={`low-${index}`} risk={risk} />
            ))}
          </div>
        </Card>
      )}

      {analysis.detectedRisks.length === 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">{t('noRisksFound')}</p>
          </div>
        </Card>
      )}

      {/* Extracted Quotes */}
      {analysis.extractedQuotes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('extractedQuotes')}
            </h3>
          </div>

          <div className="space-y-3">
            {analysis.extractedQuotes.slice(0, 5).map((quote, index) => (
              <div
                key={index}
                className="border-s-4 border-blue-500 ps-4 py-2 bg-blue-50"
              >
                <p className="text-sm text-gray-700 italic">"{quote.text}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {quote.sourceFile}
                  </Badge>
                  <p className="text-xs text-gray-500">{quote.relevance}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function RiskItem({
  risk,
}: {
  risk: { category: string; description: string; sourceFile: string; quote: string; severity: string };
}) {
  const severityColor =
    risk.severity === 'HIGH'
      ? 'bg-red-100 border-red-300 text-red-900'
      : risk.severity === 'MEDIUM'
        ? 'bg-yellow-100 border-yellow-300 text-yellow-900'
        : 'bg-blue-100 border-blue-300 text-blue-900';

  return (
    <div className={`border-s-4 p-4 ${severityColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {risk.severity}
            </Badge>
            <h4 className="text-sm font-semibold">{risk.category}</h4>
          </div>
          <p className="text-sm mb-2">{risk.description}</p>
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">
              View evidence from {risk.sourceFile}
            </summary>
            <p className="mt-2 italic">"{risk.quote}"</p>
          </details>
        </div>
      </div>
    </div>
  );
}
