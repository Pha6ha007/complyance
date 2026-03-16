'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import {
  Upload,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  ChevronDown,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  preview: Record<string, string>[];
}

function parseCSVClient(text: string): ParsedCSV {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [], preview: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row);
  }

  return { headers, rows, preview: rows.slice(0, 5) };
}

export function BiasTestingClient() {
  const t = useTranslations('bias');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [systemId, setSystemId] = useState<string>('');
  const [labelColumn, setLabelColumn] = useState<string>('');
  const [protectedAttribute, setProtectedAttribute] = useState<string>('');
  const [privilegedValue, setPrivilegedValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  // tRPC
  const { data: accessData, isLoading: accessLoading } = trpc.bias.checkAccess.useQuery();
  const { data: systems } = trpc.bias.getAvailableSystems.useQuery(undefined, {
    enabled: accessData?.hasAccess === true,
  });
  const { data: pastResults } = trpc.bias.getResults.useQuery(
    { systemId, limit: 5 },
    { enabled: !!systemId && accessData?.hasAccess === true }
  );

  const analyzeMutation = trpc.bias.analyze.useMutation({
    onError: (err) => setError(err.message),
  });

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSVClient(text);
      if (parsed.rows.length === 0) {
        setError(t('errors.emptyCSV'));
        return;
      }
      setParsedData(parsed);
      // Auto-detect common column names
      const h = parsed.headers.map((c) => c.toLowerCase());
      if (!labelColumn) {
        const labelCandidates = ['outcome', 'label', 'target', 'result', 'decision'];
        const found = parsed.headers.find((_, i) => labelCandidates.includes(h[i]));
        if (found) setLabelColumn(found);
      }
      if (!protectedAttribute) {
        const attrCandidates = ['gender', 'sex', 'race', 'ethnicity', 'age_group', 'age'];
        const found = parsed.headers.find((_, i) => attrCandidates.includes(h[i]));
        if (found) setProtectedAttribute(found);
      }
    };
    reader.readAsText(file);
  }, [labelColumn, protectedAttribute, t]);

  // Run analysis
  const handleAnalyze = () => {
    if (!parsedData || !systemId || !labelColumn || !protectedAttribute || !privilegedValue) {
      setError(t('errors.missingFields'));
      return;
    }
    setError('');
    analyzeMutation.mutate({
      systemId,
      csvContent: [
        parsedData.headers.join(','),
        ...parsedData.rows.map((r) => parsedData.headers.map((h) => r[h]).join(',')),
      ].join('\n'),
      labelColumn,
      protectedAttribute,
      privilegedValue,
    });
  };

  // Reset
  const handleReset = () => {
    setParsedData(null);
    setFileName('');
    setLabelColumn('');
    setProtectedAttribute('');
    setPrivilegedValue('');
    setError('');
    analyzeMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Plan gate
  if (accessLoading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading...</div>;
  }

  if (!accessData?.hasAccess) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-12 text-center">
        <Lock className="mx-auto h-10 w-10 text-slate-500" />
        <h3 className="mt-4 text-lg font-semibold text-white">{t('planRequired')}</h3>
        <p className="mt-2 text-sm text-slate-400">{t('planRequiredDescription')}</p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          {t('upgradePlan')}
        </Link>
      </div>
    );
  }

  const result = analyzeMutation.data;

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      {!result && (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6 space-y-5">
          {/* System selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('selectSystem')}
            </label>
            <select
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              className="w-full rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
            >
              <option value="">{t('selectSystemPlaceholder')}</option>
              {systems?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.riskLevel ?? 'Unclassified'})
                </option>
              ))}
            </select>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('upload')}
            </label>
            {!parsedData ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-600/60 bg-slate-800/30 px-6 py-10 cursor-pointer hover:border-blue-500/40 transition-colors"
              >
                <Upload className="h-8 w-8 text-slate-500" />
                <p className="mt-2 text-sm text-slate-400">{t('uploadHint')}</p>
                <p className="mt-1 text-xs text-slate-500">CSV, max 5MB</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-600/60 bg-slate-800/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-200">{fileName}</span>
                    <span className="text-xs text-slate-500">
                      ({parsedData.rows.length} {t('rows')}, {parsedData.headers.length} {t('columns')})
                    </span>
                  </div>
                  <button onClick={handleReset} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Preview table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {parsedData.headers.map((h) => (
                          <th key={h} className="px-2 py-1.5 text-start font-medium text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.preview.map((row, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          {parsedData.headers.map((h) => (
                            <td key={h} className="px-2 py-1 text-slate-300">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 5 && (
                    <p className="mt-1 text-xs text-slate-500 text-center">
                      +{parsedData.rows.length - 5} more rows...
                    </p>
                  )}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Column configuration */}
          {parsedData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {t('labelColumn')}
                  <span className="block text-xs font-normal text-slate-500">{t('labelColumnHint')}</span>
                </label>
                <select
                  value={labelColumn}
                  onChange={(e) => setLabelColumn(e.target.value)}
                  className="w-full rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">{t('selectColumn')}</option>
                  {parsedData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {t('protectedAttribute')}
                  <span className="block text-xs font-normal text-slate-500">{t('protectedAttributeHint')}</span>
                </label>
                <select
                  value={protectedAttribute}
                  onChange={(e) => setProtectedAttribute(e.target.value)}
                  className="w-full rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">{t('selectColumn')}</option>
                  {parsedData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {t('privilegedValue')}
                  <span className="block text-xs font-normal text-slate-500">{t('privilegedValueHint')}</span>
                </label>
                <input
                  type="text"
                  value={privilegedValue}
                  onChange={(e) => setPrivilegedValue(e.target.value)}
                  placeholder={t('privilegedValuePlaceholder')}
                  className="w-full rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={!parsedData || !systemId || !labelColumn || !protectedAttribute || !privilegedValue || analyzeMutation.isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {analyzeMutation.isLoading ? t('analyzing') : t('runAnalysis')}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Compliance banner */}
          <div
            className={`rounded-xl border p-5 ${
              result.compliance.overallCompliant
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.compliance.overallCompliant ? (
                <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
              )}
              <div>
                <h3 className="font-semibold text-white">
                  {result.compliance.overallCompliant
                    ? t('results.compliant')
                    : t('results.violation')}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">{result.compliance.thresholdUsed}</p>
              </div>
            </div>
          </div>

          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label={t('results.disparateImpact')}
              value={result.metrics.disparateImpact}
              compliant={result.compliance.disparateImpactCompliant}
              range="0.8 – 1.25"
              t={t}
            />
            <MetricCard
              label={t('results.statisticalParity')}
              value={result.metrics.statisticalParityDifference}
              compliant={result.compliance.statisticalParityCompliant}
              range="|SPD| < 0.1"
              t={t}
            />
          </div>

          {/* Group statistics */}
          <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">{t('results.groupStats')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <GroupCard
                label={t('results.privilegedGroup')}
                stats={result.groupStatistics.privileged}
                t={t}
              />
              <GroupCard
                label={t('results.unprivilegedGroup')}
                stats={result.groupStatistics.unprivileged}
                t={t}
              />
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">{t('results.recommendations')}</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${
                      rec.priority === 'HIGH'
                        ? 'border-red-500/20 bg-red-500/5'
                        : rec.priority === 'MEDIUM'
                          ? 'border-amber-500/20 bg-amber-500/5'
                          : 'border-emerald-500/20 bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          rec.priority === 'HIGH'
                            ? 'bg-red-500/20 text-red-400'
                            : rec.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-xs text-slate-500">{rec.article}</span>
                    </div>
                    <p className="text-sm text-slate-300">{rec.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{rec.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 italic">{result.disclaimer}</p>

          {/* Run another */}
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-600/60 bg-slate-800/40 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            {t('runAnother')}
          </button>
        </div>
      )}

      {/* Past results */}
      {pastResults && pastResults.length > 0 && !result && (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            {t('pastResults')}
          </h3>
          <div className="space-y-2">
            {pastResults.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-slate-200">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {r.analysis && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      r.analysis.compliance.overallCompliant
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {r.analysis.compliance.overallCompliant ? t('results.pass') : t('results.fail')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  compliant,
  range,
  t,
}: {
  label: string;
  value: number;
  compliant: boolean;
  range: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-5">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {compliant ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className={`text-xs ${compliant ? 'text-emerald-400' : 'text-red-400'}`}>
          {t('results.threshold')}: {range}
        </span>
      </div>
    </div>
  );
}

function GroupCard({
  label,
  stats,
  t,
}: {
  label: string;
  stats: { count: number; positiveCount: number; positiveRate: number };
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
      <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('results.sampleSize')}</span>
          <span className="text-white font-medium">{stats.count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('results.positiveOutcomes')}</span>
          <span className="text-white font-medium">{stats.positiveCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('results.positiveRate')}</span>
          <span className="text-white font-medium">{(stats.positiveRate * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
