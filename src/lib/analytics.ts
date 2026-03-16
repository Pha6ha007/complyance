/**
 * Analytics tracking utilities
 *
 * Provides a unified interface for tracking events across the app.
 * Works with PostHog when available, fails silently if not.
 */

// Conditional PostHog import
let posthog: any = null;
try {
  posthog = require('posthog-js').default;
} catch (e) {
  // PostHog not available
}

/**
 * Track a custom event
 */
export function track(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return; // Server-side, skip

  if (posthog) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Identify a user
 */
export function identify(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  if (posthog) {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset tracking (on logout)
 */
export function reset() {
  if (typeof window === 'undefined') return;

  if (posthog) {
    posthog.reset();
  }
}

/**
 * Pre-defined event tracking functions
 */

export const analytics = {
  // AI System events
  systemCreated: (systemId: string, systemName: string, aiType: string, domain: string) => {
    track('system_created', {
      system_id: systemId,
      system_name: systemName,
      ai_type: aiType,
      domain,
    });
  },

  systemClassified: (
    systemId: string,
    riskLevel: string,
    confidenceScore?: number,
    annexIIICategory?: string
  ) => {
    track('system_classified', {
      system_id: systemId,
      risk_level: riskLevel,
      confidence_score: confidenceScore,
      annex_iii_category: annexIIICategory,
    });
  },

  systemDeleted: (systemId: string) => {
    track('system_deleted', { system_id: systemId });
  },

  // Document events
  documentGenerated: (
    documentType: string,
    systemId: string,
    locale: string
  ) => {
    track('document_generated', {
      document_type: documentType,
      system_id: systemId,
      locale,
    });
  },

  documentDownloaded: (documentId: string, documentType: string) => {
    track('document_downloaded', {
      document_id: documentId,
      document_type: documentType,
    });
  },

  // Vendor events
  vendorAdded: (vendorId: string, vendorName: string, vendorType: string) => {
    track('vendor_added', {
      vendor_id: vendorId,
      vendor_name: vendorName,
      vendor_type: vendorType,
    });
  },

  vendorAssessed: (vendorId: string, riskLevel: string, riskScore: number) => {
    track('vendor_assessed', {
      vendor_id: vendorId,
      risk_level: riskLevel,
      risk_score: riskScore,
    });
  },

  // Evidence events
  evidenceUploaded: (
    evidenceId: string,
    evidenceType: string,
    article?: string
  ) => {
    track('evidence_uploaded', {
      evidence_id: evidenceId,
      evidence_type: evidenceType,
      article,
    });
  },

  // Billing events
  planUpgraded: (
    fromPlan: string,
    toPlan: string,
    subscriptionId: string
  ) => {
    track('plan_upgraded', {
      from_plan: fromPlan,
      to_plan: toPlan,
      subscription_id: subscriptionId,
    });
  },

  planDowngraded: (
    fromPlan: string,
    toPlan: string,
    subscriptionId: string
  ) => {
    track('plan_downgraded', {
      from_plan: fromPlan,
      to_plan: toPlan,
      subscription_id: subscriptionId,
    });
  },

  subscriptionCancelled: (plan: string, subscriptionId: string) => {
    track('subscription_cancelled', {
      plan,
      subscription_id: subscriptionId,
    });
  },

  // Free classifier (public tool)
  freeClassifierUsed: (domain: string, aiType: string, resultRiskLevel: string) => {
    track('free_classifier_used', {
      domain,
      ai_type: aiType,
      result_risk_level: resultRiskLevel,
    });
  },

  // Regulatory intelligence
  regulatoryUpdateViewed: (updateId: string, regulation: string) => {
    track('regulatory_update_viewed', {
      update_id: updateId,
      regulation,
    });
  },

  // Referral events
  referralLinkCopied: (referralCode: string) => {
    track('referral_link_copied', { referral_code: referralCode });
  },

  referralCodeUsed: (referralCode: string) => {
    track('referral_code_used', { referral_code: referralCode });
  },

  // User events
  userSignedUp: (userId: string, email: string, locale: string, plan: string) => {
    identify(userId, {
      email,
      locale,
      plan,
      signed_up_at: new Date().toISOString(),
    });
    track('user_signed_up', { locale, plan });
  },

  userLoggedIn: (userId: string) => {
    track('user_logged_in', { user_id: userId });
  },

  userLoggedOut: () => {
    track('user_logged_out');
    reset();
  },
};
