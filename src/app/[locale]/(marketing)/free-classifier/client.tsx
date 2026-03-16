'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart,
  Users,
  Sparkles,
} from 'lucide-react';

// Types
type AIType = 'ML_MODEL' | 'LLM' | 'RULE_BASED' | 'HYBRID';
type DecisionImpact = 'YES' | 'NO' | 'PARTIAL';
type RiskLevel = 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL';

interface FormData {
  // Step 1
  description: string;
  aiType: AIType | '';
  // Step 2
  domain: string;
  makesDecisions: DecisionImpact | '';
  // Step 3
  processesPersonalData: boolean;
  profilesUsers: boolean;
  endUsers: string[];
  // Step 4
  markets: string[];
}

interface ClassificationResult {
  riskLevel: RiskLevel;
  reasoning: string;
  annexIIICategory: string | null;
  obligations: string[];
}

const TOTAL_STEPS = 5;

export function FreeClassifierClient() {
  const t = useTranslations('freeClassifier');
  const tCommon = useTranslations('common');
  const tClassification = useTranslations('classification');

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const [formData, setFormData] = useState<FormData>({
    description: '',
    aiType: '',
    domain: '',
    makesDecisions: '',
    processesPersonalData: false,
    profilesUsers: false,
    endUsers: [],
    markets: [],
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Validation schemas
  const step1Schema = z.object({
    description: z.string().min(20, t('validation.descriptionMin')),
    aiType: z.enum(['ML_MODEL', 'LLM', 'RULE_BASED', 'HYBRID'], {
      errorMap: () => ({ message: t('validation.aiTypeRequired') }),
    }),
  });

  const step2Schema = z.object({
    domain: z.string().min(1, t('validation.domainRequired')),
    makesDecisions: z.enum(['YES', 'NO', 'PARTIAL'], {
      errorMap: () => ({ message: t('validation.decisionsRequired') }),
    }),
  });

  const step3Schema = z.object({
    endUsers: z.array(z.string()).min(1, t('validation.endUsersRequired')),
  });

  const step4Schema = z.object({
    markets: z.array(z.string()).min(1, t('validation.marketsRequired')),
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      if (step === 1) {
        step1Schema.parse({
          description: formData.description,
          aiType: formData.aiType,
        });
      } else if (step === 2) {
        step2Schema.parse({
          domain: formData.domain,
          makesDecisions: formData.makesDecisions,
        });
      } else if (step === 3) {
        step3Schema.parse({
          endUsers: formData.endUsers,
        });
      } else if (step === 4) {
        step4Schema.parse({
          markets: formData.markets,
        });
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
      if (currentStep === 4) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/public/v1/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          aiType: formData.aiType,
          domain: formData.domain,
          makesDecisions:
            formData.makesDecisions === 'YES' ||
            formData.makesDecisions === 'PARTIAL',
          processesPersonalData: formData.processesPersonalData,
          profilesUsers: formData.profilesUsers,
          endUsers: formData.endUsers,
          markets: formData.markets,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setErrors({ submit: t('errors.rateLimited') });
        } else {
          setErrors({ submit: data.error || t('errors.generic') });
        }
        return;
      }

      const data = await response.json();
      setResult(data);
      setCurrentStep(5);
    } catch {
      setErrors({ submit: t('errors.generic') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter((v) => v !== value)
      : [...array, value];
  };

  const getRiskLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case 'UNACCEPTABLE':
        return <AlertCircle className="h-8 w-8" />;
      case 'HIGH':
        return <AlertTriangle className="h-8 w-8" />;
      case 'LIMITED':
        return <Shield className="h-8 w-8" />;
      case 'MINIMAL':
        return <CheckCircle className="h-8 w-8" />;
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'UNACCEPTABLE':
        return 'bg-black text-white';
      case 'HIGH':
        return 'bg-red-600 text-white';
      case 'LIMITED':
        return 'bg-yellow-500 text-black';
      case 'MINIMAL':
        return 'bg-green-600 text-white';
    }
  };

  const startOver = () => {
    setCurrentStep(1);
    setResult(null);
    setFormData({
      description: '',
      aiType: '',
      domain: '',
      makesDecisions: '',
      processesPersonalData: false,
      profilesUsers: false,
      endUsers: [],
      markets: [],
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_350px_at_50%_55%,rgba(16,185,129,0.13),transparent)] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 font-mono">
            <Sparkles className="h-4 w-4" />
            {t('badge')}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Free AI Act<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Risk Classifier
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Progress Bar (hidden on results) */}
        {currentStep < 5 && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm font-medium text-white/80">
              <span>
                {t('stepIndicator', { current: currentStep, total: 4 })}
              </span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Card className="shadow-[0_30px_80px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.12)]" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && t('steps.step1.title')}
              {currentStep === 2 && t('steps.step2.title')}
              {currentStep === 3 && t('steps.step3.title')}
              {currentStep === 4 && t('steps.step4.title')}
              {currentStep === 5 && t('steps.results.title')}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && t('steps.step1.description')}
              {currentStep === 2 && t('steps.step2.description')}
              {currentStep === 3 && t('steps.step3.description')}
              {currentStep === 4 && t('steps.step4.description')}
              {currentStep === 5 && t('steps.results.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Describe Your AI System */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">{t('fields.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={t('fields.descriptionPlaceholder')}
                    rows={5}
                    className="resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('fields.descriptionHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.aiType')}</Label>
                  <RadioGroup
                    value={formData.aiType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, aiType: value as AIType })
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(['ML_MODEL', 'LLM', 'RULE_BASED', 'HYBRID'] as const).map(
                        (type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50"
                          >
                            <RadioGroupItem value={type} id={type} />
                            <Label
                              htmlFor={type}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {t(`aiTypes.${type}`)}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                  {errors.aiType && (
                    <p className="text-sm text-destructive">{errors.aiType}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: How Is It Used */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="domain">{t('fields.domain')}</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) =>
                      setFormData({ ...formData, domain: value })
                    }
                  >
                    <SelectTrigger id="domain">
                      <SelectValue placeholder={t('fields.domainPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'HR',
                        'FINANCE',
                        'HEALTHCARE',
                        'EDUCATION',
                        'SECURITY',
                        'CHATBOT',
                        'RECOMMENDATIONS',
                        'OTHER',
                      ].map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {t(`domains.${domain}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.domain && (
                    <p className="text-sm text-destructive">{errors.domain}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.makesDecisions')}</Label>
                  <RadioGroup
                    value={formData.makesDecisions}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        makesDecisions: value as DecisionImpact,
                      })
                    }
                  >
                    <div className="space-y-2">
                      {(['YES', 'NO', 'PARTIAL'] as const).map((option) => (
                        <div
                          key={option}
                          className="flex items-start space-x-2 rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <RadioGroupItem
                            value={option}
                            id={option}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={option}
                              className="cursor-pointer font-medium"
                            >
                              {t(`decisions.${option}.label`)}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {t(`decisions.${option}.description`)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {errors.makesDecisions && (
                    <p className="text-sm text-destructive">
                      {errors.makesDecisions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Data & Users */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    {t('fields.dataProcessing')}
                  </Label>

                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <Checkbox
                      id="processesPersonalData"
                      checked={formData.processesPersonalData}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          processesPersonalData: checked === true,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="processesPersonalData"
                        className="cursor-pointer font-medium"
                      >
                        {t('fields.processesPersonalData')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('fields.processesPersonalDataHelp')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <Checkbox
                      id="profilesUsers"
                      checked={formData.profilesUsers}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          profilesUsers: checked === true,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="profilesUsers"
                        className="cursor-pointer font-medium"
                      >
                        {t('fields.profilesUsers')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('fields.profilesUsersHelp')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {t('fields.endUsers')}
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['B2C', 'B2B', 'EMPLOYEES', 'GOVERNMENT'].map((user) => (
                      <div
                        key={user}
                        className="flex items-center space-x-2 rounded-lg border p-3"
                      >
                        <Checkbox
                          id={user}
                          checked={formData.endUsers.includes(user)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              endUsers: toggleArrayValue(formData.endUsers, user),
                            })
                          }
                        />
                        <Label
                          htmlFor={user}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {t(`endUsers.${user}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.endUsers && (
                    <p className="text-sm text-destructive">{errors.endUsers}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Markets */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {t('fields.markets')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('fields.marketsHelp')}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['EU', 'US', 'UAE', 'OTHER'].map((market) => (
                      <div
                        key={market}
                        className="flex items-center space-x-2 rounded-lg border p-3"
                      >
                        <Checkbox
                          id={market}
                          checked={formData.markets.includes(market)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              markets: toggleArrayValue(formData.markets, market),
                            })
                          }
                        />
                        <Label
                          htmlFor={market}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {t(`markets.${market}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.markets && (
                    <p className="text-sm text-destructive">{errors.markets}</p>
                  )}
                </div>

                {!formData.markets.includes('EU') &&
                  formData.markets.length > 0 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-sm text-yellow-800">
                        {t('noEUWarning')}
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Step 5: Results */}
            {currentStep === 5 && result && (
              <div className="space-y-8">
                {/* Risk Level Badge */}
                <div className="text-center">
                  <div
                    className={`mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full ${getRiskLevelColor(result.riskLevel)}`}
                  >
                    {getRiskLevelIcon(result.riskLevel)}
                  </div>
                  <Badge
                    className={`mb-2 px-4 py-2 text-lg ${getRiskLevelColor(result.riskLevel)}`}
                  >
                    {tClassification(result.riskLevel.toLowerCase())}
                  </Badge>
                  {result.annexIIICategory && (
                    <p className="text-sm text-muted-foreground">
                      {t('results.annexCategory', {
                        category: result.annexIIICategory,
                      })}
                    </p>
                  )}
                </div>

                {/* Reasoning */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="mb-2 font-semibold">{t('results.why')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.reasoning}
                  </p>
                </div>

                {/* Obligations */}
                {result.obligations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">{t('results.obligations')}</h3>
                    <ul className="space-y-2">
                      {result.obligations.map((obligation, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deep Compliance Scan */}
                <DeepScanSection
                  description={formData.description}
                  domain={formData.domain}
                  riskLevel={result.riskLevel}
                />

                {/* CTA Section */}
                <div className="rounded-xl bg-[#0F172A] p-8">
                  <h3 className="mb-2 text-2xl font-extrabold text-white">
                    {t('cta.title')}
                  </h3>
                  <p className="mb-5 text-sm text-white/60">
                    {t('cta.description')}
                  </p>

                  <ul className="mb-6 space-y-2">
                    {[
                      { icon: FileText, text: t('cta.features.reports') },
                      { icon: BarChart, text: t('cta.features.gapAnalysis') },
                      { icon: Users, text: t('cta.features.vendorRisk') },
                      { icon: Shield, text: t('cta.features.badge') },
                    ].map(({ icon: Icon, text }, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-white/80"
                      >
                        <Icon className="h-4 w-4 text-emerald-400" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/auth/register" className="flex-1">
                      <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)]"
                        size="lg"
                        data-ph-capture="free-classifier-signup-cta"
                      >
                        {t('cta.button')}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={startOver}
                      className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white"
                    >
                      {t('cta.startOver')}
                    </Button>
                  </div>

                  <p className="mt-4 text-center text-xs text-white/40">
                    {t('cta.noCard')}
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t('results.disclaimer')}
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.submit && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="me-2 h-4 w-4" />
                  {tCommon('previous')}
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    t('analyzing')
                  ) : currentStep === 4 ? (
                    t('classify')
                  ) : (
                    <>
                      {tCommon('next')}
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Content */}
        <div className="mt-12 space-y-8 text-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              {t('seo.whatIsTitle')}
            </h2>
            <p className="mx-auto max-w-2xl text-white/60">
              {t('seo.whatIsContent')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: t('seo.benefits.free.title'),
                description: t('seo.benefits.free.description'),
              },
              {
                title: t('seo.benefits.fast.title'),
                description: t('seo.benefits.fast.description'),
              },
              {
                title: t('seo.benefits.accurate.title'),
                description: t('seo.benefits.accurate.description'),
              },
            ].map((benefit, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-2 font-semibold text-white">{benefit.title}</h3>
                <p className="text-sm text-white/55">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Deep Scan Section ----------

interface DeepScanResult {
  riskLevel: string;
  detectedRisks: Array<{
    category: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    article: string;
  }>;
  complianceGaps: Array<{
    article: string;
    requirement: string;
    status: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  complianceScore: number;
  confidence: number;
  disclaimer: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500',
  HIGH: 'text-red-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-emerald-400',
};

function DeepScanSection({
  description,
  domain,
  riskLevel,
}: {
  description: string;
  domain: string;
  riskLevel: RiskLevel;
}) {
  const t = useTranslations('freeClassifier.deepScan');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<DeepScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    if (!description || description.length < 10) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/public/v1/deep-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, domain, riskLevel }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.result);
      } else {
        setError(t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">{t('title')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
        </div>
        {!scanResult && (
          <Button
            onClick={runScan}
            disabled={loading || description.length < 10}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading ? t('scanning') : t('runScan')}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {scanResult && (
        <div className="space-y-5">
          {/* Detected Risks */}
          {scanResult.detectedRisks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{t('detectedIssues')}</p>
              <div className="space-y-2">
                {scanResult.detectedRisks.map((risk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${SEVERITY_COLORS[risk.severity]}`} />
                    <div className="flex-1">
                      <span className="text-slate-700">{risk.description}</span>
                      <span className="text-slate-400 ms-2 text-xs">({risk.article})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Gaps */}
          {scanResult.complianceGaps.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                {t('requiredActions')} ({t('gaps', { count: scanResult.complianceGaps.length })})
              </p>
              <div className="space-y-1.5">
                {scanResult.complianceGaps.map((gap, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`font-mono text-xs ${SEVERITY_COLORS[gap.priority]}`}>✗</span>
                    <span className="text-slate-500 font-mono text-xs min-w-[5rem]">{gap.article}</span>
                    <span className="text-slate-700">{gap.requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scanResult.complianceGaps.length === 0 && (
            <p className="text-sm text-emerald-600">{t('noGaps')}</p>
          )}

          {/* CTA */}
          {scanResult.complianceGaps.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <Link href="/auth/register">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  size="sm"
                  data-ph-capture="deep-scan-signup-cta"
                >
                  {t('fixAllGaps')} →
                </Button>
              </Link>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground">{scanResult.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
