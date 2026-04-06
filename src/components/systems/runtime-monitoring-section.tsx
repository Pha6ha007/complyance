'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const TRACEHAWK_PUBLIC_URL =
  process.env.NEXT_PUBLIC_TRACEHAWK_URL ?? 'https://tracehawk.dev';

interface RuntimeMonitoringSectionProps {
  systemId: string;
  tracehawkAgentId: string | null;
  lastTracehawkSync: Date | string | null;
}

type SyncFeedback = {
  synced: boolean;
  syncReason: string | null;
  syncError: string | null;
} | null;

/**
 * Runtime Monitoring section for the AI system detail page.
 *
 * Two states:
 * - Unlinked: form to link a TraceHawk agent. linkTraceHawk also pushes
 *   the current compliance state, so the agent immediately gets context.
 * - Linked: status banner with agent ID + last sync time, plus
 *   Sync now (resyncTraceHawk — uses stored credentials) and Unlink.
 *
 * The TraceHawk API key is never returned to the client. All re-syncs
 * happen on the server using the stored credential.
 */
export function RuntimeMonitoringSection({
  systemId,
  tracehawkAgentId,
  lastTracehawkSync,
}: RuntimeMonitoringSectionProps) {
  const t = useTranslations('tracehawk');
  const tCommon = useTranslations('common');
  const utils = trpc.useUtils();

  const [agentIdInput, setAgentIdInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [feedback, setFeedback] = useState<SyncFeedback>(null);

  const linkMutation = trpc.system.linkTraceHawk.useMutation({
    onSuccess: (result) => {
      setFeedback({
        synced: result.synced,
        syncReason: result.syncReason,
        syncError: result.syncError,
      });
      setAgentIdInput('');
      setApiKeyInput('');
      utils.system.getById.invalidate({ id: systemId });
    },
    onError: () => {
      setFeedback(null);
    },
  });

  const resyncMutation = trpc.system.resyncTraceHawk.useMutation({
    onSuccess: (result) => {
      setFeedback({
        synced: result.synced,
        syncReason: result.syncReason,
        syncError: result.syncError,
      });
      utils.system.getById.invalidate({ id: systemId });
    },
    onError: () => {
      setFeedback(null);
    },
  });

  const unlinkMutation = trpc.system.unlinkTraceHawk.useMutation({
    onSuccess: () => {
      setFeedback(null);
      utils.system.getById.invalidate({ id: systemId });
    },
  });

  const isLinked = tracehawkAgentId !== null;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentIdInput.trim() || !apiKeyInput.trim()) return;
    setFeedback(null);
    linkMutation.mutate({
      systemId,
      tracehawkAgentId: agentIdInput.trim(),
      tracehawkOrgApiKey: apiKeyInput.trim(),
    });
  };

  const handleUnlink = () => {
    if (!confirm(t('unlinkConfirm'))) return;
    unlinkMutation.mutate({ systemId });
  };

  const handleSyncNow = () => {
    setFeedback(null);
    resyncMutation.mutate({ systemId });
  };

  return (
    <div
      id="runtime-monitoring"
      className="rounded-2xl bg-slate-800/60 border border-slate-600/60 overflow-hidden scroll-mt-24"
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-emerald-400" />
          {t('sectionTitle')}
        </h2>
        {isLinked && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('connectedBadge')}
          </span>
        )}
      </div>

      <div className="p-6">
        {!isLinked ? (
          <UnlinkedState
            agentIdInput={agentIdInput}
            setAgentIdInput={setAgentIdInput}
            apiKeyInput={apiKeyInput}
            setApiKeyInput={setApiKeyInput}
            isLinking={linkMutation.isPending}
            linkError={linkMutation.error?.message ?? null}
            feedback={feedback}
            onSubmit={handleLinkSubmit}
            t={t}
            tCommon={tCommon}
          />
        ) : (
          <LinkedState
            tracehawkAgentId={tracehawkAgentId!}
            lastTracehawkSync={lastTracehawkSync}
            isSyncing={resyncMutation.isPending}
            isUnlinking={unlinkMutation.isPending}
            syncError={resyncMutation.error?.message ?? null}
            feedback={feedback}
            onSyncNow={handleSyncNow}
            onUnlink={handleUnlink}
            t={t}
            tCommon={tCommon}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sync feedback banner (used by both states)
// ────────────────────────────────────────────────────────────────────────────

function SyncFeedbackBanner({
  feedback,
  t,
}: {
  feedback: SyncFeedback;
  t: ReturnType<typeof useTranslations>;
}) {
  if (!feedback) return null;

  if (feedback.synced) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>{t('syncSuccess')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div>
        <div className="font-semibold">{t('linkSavedSyncFailedTitle')}</div>
        <div className="mt-0.5 text-amber-300/80">
          {t(`syncReason.${feedback.syncReason ?? 'unknown'}`)}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Unlinked state — explainer + link form
// ────────────────────────────────────────────────────────────────────────────

interface UnlinkedStateProps {
  agentIdInput: string;
  setAgentIdInput: (v: string) => void;
  apiKeyInput: string;
  setApiKeyInput: (v: string) => void;
  isLinking: boolean;
  linkError: string | null;
  feedback: SyncFeedback;
  onSubmit: (e: React.FormEvent) => void;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}

function UnlinkedState({
  agentIdInput,
  setAgentIdInput,
  apiKeyInput,
  setApiKeyInput,
  isLinking,
  linkError,
  feedback,
  onSubmit,
  t,
  tCommon,
}: UnlinkedStateProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-400/20">
          <Activity className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{t('unlinkedHeading')}</h3>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            {t('unlinkedDescription')}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="tracehawk-agent-id"
            className="block text-xs font-medium text-slate-400 mb-1.5"
          >
            {t('agentIdLabel')} <span className="text-red-400">*</span>
          </label>
          <input
            id="tracehawk-agent-id"
            type="text"
            required
            value={agentIdInput}
            onChange={(e) => setAgentIdInput(e.target.value)}
            placeholder="ag_..."
            disabled={isLinking}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="tracehawk-api-key"
            className="block text-xs font-medium text-slate-400 mb-1.5"
          >
            {t('apiKeyLabel')} <span className="text-red-400">*</span>
          </label>
          <input
            id="tracehawk-api-key"
            type="password"
            required
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="th-..."
            disabled={isLinking}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 disabled:opacity-50 font-mono"
          />
          <p className="mt-1 text-xs text-slate-500">{t('apiKeyHint')}</p>
        </div>

        {linkError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{linkError}</span>
          </div>
        )}

        <SyncFeedbackBanner feedback={feedback} t={t} />

        <div className="flex items-center justify-between gap-3 pt-1">
          <a
            href={TRACEHAWK_PUBLIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            {t('noTracehawkAccount')}
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="submit"
            disabled={isLinking || !agentIdInput.trim() || !apiKeyInput.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLinking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {isLinking ? tCommon('loading') : t('connectButton')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Linked state — status + Sync now / Unlink
// ────────────────────────────────────────────────────────────────────────────

interface LinkedStateProps {
  tracehawkAgentId: string;
  lastTracehawkSync: Date | string | null;
  isSyncing: boolean;
  isUnlinking: boolean;
  syncError: string | null;
  feedback: SyncFeedback;
  onSyncNow: () => void;
  onUnlink: () => void;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}

function LinkedState({
  tracehawkAgentId,
  lastTracehawkSync,
  isSyncing,
  isUnlinking,
  syncError,
  feedback,
  onSyncNow,
  onUnlink,
  t,
  tCommon,
}: LinkedStateProps) {
  const lastSyncRelative = lastTracehawkSync
    ? formatDistanceToNow(new Date(lastTracehawkSync), { addSuffix: true })
    : null;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/5 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-emerald-300">
            {t('linkedHeading')}
          </div>
          <div className="mt-1.5 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
            <div>
              <span className="text-slate-500">{t('agentIdLabel')}: </span>
              <span className="font-mono text-slate-300 break-all">{tracehawkAgentId}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('lastSyncLabel')}: </span>
              <span className="text-slate-300">
                {lastSyncRelative ?? t('neverSynced')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {syncError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{syncError}</span>
        </div>
      )}

      <SyncFeedbackBanner feedback={feedback} t={t} />

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onSyncNow}
          disabled={isSyncing || isUnlinking}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? tCommon('loading') : t('syncNowButton')}
        </button>
        <button
          type="button"
          onClick={onUnlink}
          disabled={isSyncing || isUnlinking}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50"
        >
          <Unlink className="h-3.5 w-3.5" />
          {isUnlinking ? tCommon('loading') : t('unlinkButton')}
        </button>
      </div>
    </div>
  );
}
