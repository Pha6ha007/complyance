'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Key, Copy, RefreshCw, Trash2, Lock, Code, CheckCircle, Shield } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function SDKClient() {
  const t = useTranslations('sdk');
  const utils = trpc.useContext();

  const [showFullKey, setShowFullKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keyData, isLoading } = trpc.system.getApiKey.useQuery();

  const generateMutation = trpc.system.generateApiKey.useMutation({
    onSuccess: (data) => {
      setShowFullKey(data.apiKey);
      utils.system.getApiKey.invalidate();
    },
  });

  const revokeMutation = trpc.system.revokeApiKey.useMutation({
    onSuccess: () => {
      setShowFullKey(null);
      utils.system.getApiKey.invalidate();
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading...</div>;
  }

  // Plan gate
  const sdkPlans = ['PROFESSIONAL', 'SCALE', 'ENTERPRISE'];
  if (keyData && !sdkPlans.includes(keyData.plan)) {
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

  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Key className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('apiKey.title')}</h2>
            <p className="text-sm text-slate-400">{t('apiKey.description')}</p>
          </div>
        </div>

        {/* Show newly generated key */}
        {showFullKey && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-400 font-medium mb-2">{t('apiKey.saveWarning')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm text-emerald-400 font-mono">
                {showFullKey}
              </code>
              <button
                onClick={() => handleCopy(showFullKey)}
                className="rounded-lg border border-slate-600 bg-slate-700 p-2 text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Current key status */}
        {keyData?.hasKey && !showFullKey && (
          <div className="mb-4 flex items-center gap-3">
            <code className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-400 font-mono">
              {keyData.maskedKey}
            </code>
            <button
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isLoading}
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
              title={t('apiKey.revoke')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Generate / Regenerate button */}
        <button
          onClick={() => {
            setShowFullKey(null);
            generateMutation.mutate();
          }}
          disabled={generateMutation.isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${generateMutation.isLoading ? 'animate-spin' : ''}`} />
          {keyData?.hasKey ? t('apiKey.regenerate') : t('apiKey.generate')}
        </button>
      </div>

      {/* Integration Guide */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Code className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">{t('guide.title')}</h2>
        </div>

        {/* Step 1: Install */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-200 mb-2">{t('guide.step1')}</h3>
            <div className="rounded-lg bg-slate-900 p-3">
              <code className="text-sm text-emerald-400 font-mono">pip install complyance</code>
            </div>
          </div>

          {/* Step 2: Usage */}
          <div>
            <h3 className="text-sm font-medium text-slate-200 mb-2">{t('guide.step2')}</h3>
            <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono">{`from complyance import Guard

guard = Guard(
    api_key="cmp_...",
    system_id="your-system-id"
)

@guard.protect
async def call_ai(prompt: str):
    return await openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

# Every call is automatically logged
# as compliance evidence (Article 12)`}</pre>
            </div>
          </div>

          {/* Step 3: What gets logged */}
          <div>
            <h3 className="text-sm font-medium text-slate-200 mb-2">{t('guide.step3')}</h3>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {t('guide.logged.metadata')}
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {t('guide.logged.tokens')}
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {t('guide.logged.pii')}
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {t('guide.logged.errors')}
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-red-400 shrink-0" />
                {t('guide.logged.noContent')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported providers */}
      <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-6">
        <h2 className="text-sm font-semibold text-white mb-3">{t('providers.title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['OpenAI', 'Anthropic', 'Google AI', 'Hugging Face'].map((name) => (
            <div
              key={name}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-center"
            >
              <p className="text-sm font-medium text-slate-300">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
