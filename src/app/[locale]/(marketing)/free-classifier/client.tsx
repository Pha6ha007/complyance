'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
import { Progress } from '@/components/ui/progress';
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
  const params = useParams();
  const locale = params.locale as string;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            {t('badge')}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress Bar (hidden on results) */}
        {currentStep < 5 && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t('stepIndicator', { current: currentStep, total: 4 })}
              </span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <Progress value={(currentStep / 4) * 100} />
          </div>
        )}

        <Card className="shadow-lg">
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
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                          <span>{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Section */}
                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {t('cta.title')}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
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
                        className="flex items-center gap-2 text-sm"
                      >
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={`/${locale}/auth/register`} className="flex-1">
                      <Button
                        className="w-full"
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
                      className="flex-1"
                    >
                      {t('cta.startOver')}
                    </Button>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
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
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {t('seo.whatIsTitle')}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
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
              <div key={index} className="rounded-lg border bg-white p-6">
                <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
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
