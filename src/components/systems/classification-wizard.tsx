'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { AIType } from '@prisma/client';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      // Redirect to the system detail page
      router.push(`/systems/${system.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  // Progress percentage
  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Validation schemas for each step
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

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      if (step === 1) {
        step1Schema.parse({
          name: formData.name,
          description: formData.description,
          aiType: formData.aiType,
        });
      } else if (step === 2) {
        step2Schema.parse({
          domain: formData.domain,
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
    return array.includes(value)
      ? array.filter((v) => v !== value)
      : [...array, value];
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {t('title')} - {currentStep} / {TOTAL_STEPS}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && t('step1.title')}
            {currentStep === 2 && t('step2.title')}
            {currentStep === 3 && t('step3.title')}
            {currentStep === 4 && t('step4.title')}
            {currentStep === 5 && t('step5.title')}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && t('step1.description')}
            {currentStep === 2 && t('step2.description')}
            {currentStep === 3 && t('step3.description')}
            {currentStep === 4 && t('step4.description')}
            {currentStep === 5 && t('step5.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('step1.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('step1.namePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step1.nameDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('step1.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t('step1.descriptionPlaceholder')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step1.descriptionDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('step1.aiTypeLabel')}</Label>
                <RadioGroup
                  value={formData.aiType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, aiType: value as AIType })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ML_MODEL" id="ml_model" />
                    <Label htmlFor="ml_model" className="font-normal cursor-pointer">
                      {t('step1.mlModel')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LLM" id="llm" />
                    <Label htmlFor="llm" className="font-normal cursor-pointer">
                      {t('step1.llm')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RULE_BASED" id="rule_based" />
                    <Label htmlFor="rule_based" className="font-normal cursor-pointer">
                      {t('step1.ruleBased')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HYBRID" id="hybrid" />
                    <Label htmlFor="hybrid" className="font-normal cursor-pointer">
                      {t('step1.hybrid')}
                    </Label>
                  </div>
                </RadioGroup>
                {errors.aiType && (
                  <p className="text-sm text-destructive">{errors.aiType}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step1.aiTypeDescription')}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Use Case */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">{t('step2.domainLabel')}</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) =>
                    setFormData({ ...formData, domain: value })
                  }
                >
                  <SelectTrigger id="domain">
                    <SelectValue placeholder={t('step2.domainPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">{t('step2.hr')}</SelectItem>
                    <SelectItem value="FINANCE">{t('step2.finance')}</SelectItem>
                    <SelectItem value="HEALTHCARE">{t('step2.healthcare')}</SelectItem>
                    <SelectItem value="EDUCATION">{t('step2.education')}</SelectItem>
                    <SelectItem value="SECURITY">{t('step2.security')}</SelectItem>
                    <SelectItem value="CONTENT">{t('step2.content')}</SelectItem>
                    <SelectItem value="CHATBOT">{t('step2.chatbot')}</SelectItem>
                    <SelectItem value="RECOMMENDATIONS">
                      {t('step2.recommendations')}
                    </SelectItem>
                    <SelectItem value="OTHER">{t('step2.other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.domain && (
                  <p className="text-sm text-destructive">{errors.domain}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step2.domainDescription')}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Data & Impact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="makesDecisions"
                    checked={formData.makesDecisions}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        makesDecisions: checked === true,
                      })
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="makesDecisions"
                      className="font-semibold cursor-pointer"
                    >
                      {t('step3.decisionsLabel')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('step3.decisionsDescription')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
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
                      className="font-semibold cursor-pointer"
                    >
                      {t('step3.personalDataLabel')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('step3.personalDataDescription')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
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
                      className="font-semibold cursor-pointer"
                    >
                      {t('step3.profilesLabel')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('step3.profilesDescription')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('step3.endUsersLabel')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="b2c"
                      checked={formData.endUsers.includes('B2C')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          endUsers: toggleArrayValue(formData.endUsers, 'B2C'),
                        })
                      }
                    />
                    <Label htmlFor="b2c" className="font-normal cursor-pointer">
                      {t('step3.b2c')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="b2b"
                      checked={formData.endUsers.includes('B2B')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          endUsers: toggleArrayValue(formData.endUsers, 'B2B'),
                        })
                      }
                    />
                    <Label htmlFor="b2b" className="font-normal cursor-pointer">
                      {t('step3.b2b')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="employees"
                      checked={formData.endUsers.includes('EMPLOYEES')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          endUsers: toggleArrayValue(formData.endUsers, 'EMPLOYEES'),
                        })
                      }
                    />
                    <Label htmlFor="employees" className="font-normal cursor-pointer">
                      {t('step3.employees')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="government"
                      checked={formData.endUsers.includes('GOVERNMENT')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          endUsers: toggleArrayValue(formData.endUsers, 'GOVERNMENT'),
                        })
                      }
                    />
                    <Label htmlFor="government" className="font-normal cursor-pointer">
                      {t('step3.government')}
                    </Label>
                  </div>
                </div>
                {errors.endUsers && (
                  <p className="text-sm text-destructive">{errors.endUsers}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step3.endUsersDescription')}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Markets */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('step4.marketsLabel')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eu"
                      checked={formData.markets.includes('EU')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          markets: toggleArrayValue(formData.markets, 'EU'),
                        })
                      }
                    />
                    <Label htmlFor="eu" className="font-normal cursor-pointer">
                      {t('step4.eu')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="us"
                      checked={formData.markets.includes('US')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          markets: toggleArrayValue(formData.markets, 'US'),
                        })
                      }
                    />
                    <Label htmlFor="us" className="font-normal cursor-pointer">
                      {t('step4.us')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uae"
                      checked={formData.markets.includes('UAE')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          markets: toggleArrayValue(formData.markets, 'UAE'),
                        })
                      }
                    />
                    <Label htmlFor="uae" className="font-normal cursor-pointer">
                      {t('step4.uae')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={formData.markets.includes('OTHER')}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          markets: toggleArrayValue(formData.markets, 'OTHER'),
                        })
                      }
                    />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      {t('step4.other')}
                    </Label>
                  </div>
                </div>
                {errors.markets && (
                  <p className="text-sm text-destructive">{errors.markets}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('step4.marketsDescription')}
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h4 className="font-semibold">{t('step1.name')}</h4>
                  <p className="text-sm text-muted-foreground">{formData.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('step1.description')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('step1.aiTypeLabel')}</h4>
                  <p className="text-sm text-muted-foreground">{formData.aiType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('step2.domainLabel')}</h4>
                  <p className="text-sm text-muted-foreground">{formData.domain}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('step3.endUsersLabel')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.endUsers.join(', ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('step4.marketsLabel')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.markets.join(', ')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('step3.title')}</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        formData.makesDecisions
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span>{t('step3.decisionsLabel')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        formData.processesPersonalData
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span>{t('step3.personalDataLabel')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        formData.profilesUsers
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span>{t('step3.profilesLabel')}</span>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || createSystemMutation.isLoading}
            >
              <ArrowLeft className="me-2 h-4 w-4" />
              {tCommon('previous')}
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNext}>
                {tCommon('next')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createSystemMutation.isLoading}
              >
                {createSystemMutation.isLoading
                  ? t('step5.submitting')
                  : t('step5.submitButton')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
