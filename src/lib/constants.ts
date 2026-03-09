import { Plan } from '@prisma/client';

/**
 * Plan limits configuration
 * Based on CLAUDE.md specifications
 */
export const PLAN_LIMITS = {
  [Plan.FREE]: {
    systems: 1,
    regulations: 1, // EU only
    vendors: 0,
    docGeneration: false,
    evidenceVault: false,
    biasTesting: 0,
    cicdApi: false,
    teamMembers: 1,
    complianceBadge: 'AWARE',
    regulatoryAlerts: false,
    incidentRegister: false,
    gdprModule: false,
    documentUpload: { enabled: false, maxFiles: 0 },
  },
  [Plan.STARTER]: {
    systems: 5,
    regulations: 1,
    vendors: 2,
    docGeneration: true,
    evidenceVault: false,
    biasTesting: 0,
    cicdApi: false,
    teamMembers: 1,
    complianceBadge: 'READY',
    regulatoryAlerts: 'EMAIL_WEEKLY',
    incidentRegister: false,
    gdprModule: false,
    documentUpload: { enabled: true, maxFiles: 2 },
  },
  [Plan.PROFESSIONAL]: {
    systems: 20,
    regulations: 999, // All
    vendors: 10,
    docGeneration: true,
    evidenceVault: true,
    biasTesting: 3,
    cicdApi: false,
    teamMembers: 3,
    complianceBadge: 'COMPLIANT',
    regulatoryAlerts: 'REAL_TIME',
    incidentRegister: false,
    gdprModule: false,
    documentUpload: { enabled: true, maxFiles: 5 },
  },
  [Plan.SCALE]: {
    systems: 50,
    regulations: 999, // All
    vendors: 999, // Unlimited
    docGeneration: true,
    evidenceVault: true,
    biasTesting: 999, // Unlimited
    cicdApi: true,
    teamMembers: 10,
    complianceBadge: 'COMPLIANT',
    regulatoryAlerts: 'REAL_TIME',
    incidentRegister: true,
    gdprModule: true,
    documentUpload: { enabled: true, maxFiles: 5 },
  },
  [Plan.ENTERPRISE]: {
    systems: 999, // Unlimited
    regulations: 999, // All
    vendors: 999, // Unlimited
    docGeneration: true,
    evidenceVault: true,
    biasTesting: 999, // Unlimited
    cicdApi: true,
    teamMembers: 999, // Unlimited
    complianceBadge: 'COMPLIANT',
    regulatoryAlerts: 'REAL_TIME',
    incidentRegister: true,
    gdprModule: true,
    documentUpload: { enabled: true, maxFiles: 5 },
  },
} as const;

/**
 * Get effective system limit including bonus systems from referrals
 */
export function getEffectiveSystemLimit(
  plan: Plan,
  bonusSystems: number = 0
): number {
  return PLAN_LIMITS[plan].systems + bonusSystems;
}

/**
 * AI Act deadline
 */
export const EU_AI_ACT_DEADLINE = new Date('2026-08-02');

/**
 * Supported locales
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * RTL locales
 */
export const RTL_LOCALES = ['ar'] as const;

/**
 * Default locale
 */
export const DEFAULT_LOCALE = 'en';
