'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { AIType } from '@prisma/client';
import { trpc } from '@/lib/trpc/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

// Form data type
interface FormData {
  // Step 1
  name: string;
  description: string;
  aiType: AIType | '';
  // Step 2
  domain: string;
  // Step 3
  makesDecisions: boolean;
  processesPersonalData: boolean;
  profilesUsers: boolean;
  endUsers: string[];
  // Step 4
  markets: string[];
}

const TOTAL_STEPS = 5;

const STEP_LABELS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

export function ClassificationWizard() {
  const router = useRouter();
  const t = useTranslations('systems.wizard');
  const tCommon = useTranslations('common');

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    aiType: '',
    domain: '',
    makesDecisions: false,
    processesPersonalData: false,
    profilesUsers: false,
    endUsers: [],
    markets: [],
  });

  const createSystemMutation = trpc.system.create.useMutation({
    onSuccess: (system) => {
      router.push(`/systems/${system.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const step1Schema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(10),
    aiType: z.nativeEnum(AIType),
  });

  const step2Schema = z.object({
    domain: z.string().min(1),
  });

  const step3Schema = z.object({
    endUsers: z.array(z.string()).min(1),
  });

  const step4Schema = z.object({
    markets: z.array(z.string()).min(1),
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      if (step === 1) {
        step1Schema.parse({ name: formData.name, description: formData.description, aiType: formData.aiType });
      } else if (step === 2) {
        step2Schema.parse({ domain: formData.domain });
      } else if (step === 3) {
        step3Schema.parse({ endUsers: formData.endUsers });
      } else if (step === 4) {
        step4Schema.parse({ markets: formData.markets });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      createSystemMutation.mutate({
        name: formData.name,
        description: formData.description,
        aiType: formData.aiType as AIType,
        domain: formData.domain,
        makesDecisions: formData.makesDecisions,
        processesPersonalData: formData.processesPersonalData,
        profilesUsers: formData.profilesUsers,
        endUsers: formData.endUsers,
        markets: formData.markets,
      });
    }
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value) ? array.filter((v) => v !== value) : [...array, value];
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step === currentStep
                  ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : step < currentStep
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-700 border border-slate-600 text-slate-500'
              }`}
            >
              {step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
            </div>
            {step < TOTAL_STEPS && (
              <div className={`h-px w-8 transition-all ${step < currentStep ? 'bg-emerald-500/50' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
        <div className="ms-auto text-sm text-slate-500">
          {currentStep} / {TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-slate-700">
        <div
          className="h-1 rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-600/60">
        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">
            {currentStep === 1 && t('step1.title')}
            {currentStep === 2 && t('step2.title')}
            {currentStep === 3 && t('step3.title')}
            {currentStep === 4 && t('step4.title')}
            {currentStep === 5 && t('step5.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {currentStep === 1 && t('step1.description')}
            {currentStep === 2 && t('step2.description')}
            {currentStep === 3 && t('step3.description')}
            {currentStep === 4 && t('step4.description')}
            {currentStep === 5 && t('step5.description')}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 text-sm font-medium">{t('step1.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('step1.namePlaceholder')}
                  className="bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                <p className="text-xs text-slate-500">{t('step1.nameDescription')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300 text-sm font-medium">{t('step1.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('step1.descriptionPlaceholder')}
                  rows={4}
                  className="bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                />
                {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
                <p className="text-xs text-slate-500">{t('step1.descriptionDescription')}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-medium">{t('step1.aiTypeLabel')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ML_MODEL', 'LLM', 'RULE_BASED', 'HYBRID'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, aiType: type })}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-start transition-all ${
                        formData.aiType === type
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                          : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.aiType === type ? 'border-emerald-500' : 'border-slate-600'
                      }`}>
                        {formData.aiType === type && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </div>
                      <span className="text-sm font-medium">
                        {type === 'ML_MODEL' && t('step1.mlModel')}
                        {type === 'LLM' && t('step1.llm')}
                        {type === 'RULE_BASED' && t('step1.ruleBased')}
                        {type === 'HYBRID' && t('step1.hybrid')}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.aiType && <p className="text-sm text-red-400">{errors.aiType}</p>}
                <p className="text-xs text-slate-500">{t('step1.aiTypeDescription')}</p>
              </div>
            </div>
          )}

          {/* Step 2: Use Case */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-slate-300 text-sm font-medium">{t('step2.domainLabel')}</Label>
                <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
                  <SelectTrigger id="domain" className="bg-slate-700/50 border-slate-600/60 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <SelectValue placeholder={t('step2.domainPlaceholder')} className="text-slate-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="HR" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.hr')}</SelectItem>
                    <SelectItem value="FINANCE" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.finance')}</SelectItem>
                    <SelectItem value="HEALTHCARE" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.healthcare')}</SelectItem>
                    <SelectItem value="EDUCATION" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.education')}</SelectItem>
                    <SelectItem value="SECURITY" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.security')}</SelectItem>
                    <SelectItem value="CONTENT" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.content')}</SelectItem>
                    <SelectItem value="CHATBOT" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.chatbot')}</SelectItem>
                    <SelectItem value="RECOMMENDATIONS" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.recommendations')}</SelectItem>
                    <SelectItem value="OTHER" className="text-slate-300 focus:bg-slate-800 focus:text-white">{t('step2.other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.domain && <p className="text-sm text-red-400">{errors.domain}</p>}
                <p className="text-xs text-slate-500">{t('step2.domainDescription')}</p>
              </div>
            </div>
          )}

          {/* Step 3: Data & Impact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                {[
                  { key: 'makesDecisions', label: t('step3.decisionsLabel'), desc: t('step3.decisionsDescription') },
                  { key: 'processesPersonalData', label: t('step3.personalDataLabel'), desc: t('step3.personalDataDescription') },
                  { key: 'profilesUsers', label: t('step3.profilesLabel'), desc: t('step3.profilesDescription') },
                ].map(({ key, label, desc }) => {
                  const checked = formData[key as keyof Pick<FormData, 'makesDecisions' | 'processesPersonalData' | 'profilesUsers'>] as boolean;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, [key]: !checked })}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-start transition-all ${
                        checked
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                          : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                        checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                      }`}>
                        {checked && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${checked ? 'text-emerald-400' : 'text-slate-300'}`}>{label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-medium">{t('step3.endUsersLabel')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['B2C', 'B2B', 'EMPLOYEES', 'GOVERNMENT'] as const).map((type) => {
                    const checked = formData.endUsers.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, endUsers: toggleArrayValue(formData.endUsers, type) })}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-start transition-all ${
                          checked
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                            : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                          checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {type === 'B2C' && t('step3.b2c')}
                          {type === 'B2B' && t('step3.b2b')}
                          {type === 'EMPLOYEES' && t('step3.employees')}
                          {type === 'GOVERNMENT' && t('step3.government')}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.endUsers && <p className="text-sm text-red-400">{errors.endUsers}</p>}
                <p className="text-xs text-slate-500">{t('step3.endUsersDescription')}</p>
              </div>
            </div>
          )}

          {/* Step 4: Markets */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-medium">{t('step4.marketsLabel')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['EU', 'US', 'UAE', 'OTHER'] as const).map((market) => {
                    const checked = formData.markets.includes(market);
                    return (
                      <button
                        key={market}
                        type="button"
                        onClick={() => setFormData({ ...formData, markets: toggleArrayValue(formData.markets, market) })}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-start transition-all ${
                          checked
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                            : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                          checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {market === 'EU' && t('step4.eu')}
                          {market === 'US' && t('step4.us')}
                          {market === 'UAE' && t('step4.uae')}
                          {market === 'OTHER' && t('step4.other')}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.markets && <p className="text-sm text-red-400">{errors.markets}</p>}
                <p className="text-xs text-slate-500">{t('step4.marketsDescription')}</p>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 divide-y divide-slate-700/40">
                {[
                  { label: t('step1.name'), value: formData.name },
                  { label: t('step1.description'), value: formData.description },
                  { label: t('step1.aiTypeLabel'), value: formData.aiType },
                  { label: t('step2.domainLabel'), value: formData.domain },
                  { label: t('step3.endUsersLabel'), value: formData.endUsers.join(', ') },
                  { label: t('step4.marketsLabel'), value: formData.markets.join(', ') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-4 px-4 py-3">
                    <div className="w-40 flex-shrink-0 text-xs font-medium text-slate-500 pt-0.5">{label}</div>
                    <div className="text-sm text-slate-300">{value}</div>
                  </div>
                ))}

                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-slate-500 mb-2">{t('step3.title')}</div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'makesDecisions', label: t('step3.decisionsLabel') },
                      { key: 'processesPersonalData', label: t('step3.personalDataLabel') },
                      { key: 'profilesUsers', label: t('step3.profilesLabel') },
                    ].map(({ key, label }) => {
                      const active = formData[key as keyof Pick<FormData, 'makesDecisions' | 'processesPersonalData' | 'profilesUsers'>] as boolean;
                      return (
                        <div key={key} className="flex items-center gap-1.5 text-sm">
                          {active
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            : <Circle className="h-4 w-4 text-slate-600" />
                          }
                          <span className={active ? 'text-slate-300' : 'text-slate-600'}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || createSystemMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="me-1 h-4 w-4" />
              {tCommon('previous')}
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
              >
                {tCommon('next')}
                <ArrowRight className="ms-1 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createSystemMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSystemMutation.isPending ? t('step5.submitting') : t('step5.submitButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
