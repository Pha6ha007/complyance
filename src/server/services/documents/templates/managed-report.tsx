/**
 * Managed Service Monthly Report PDF Template
 *
 * Premium monthly compliance status report for managed-service clients.
 * Summarizes per-system risk posture, vendor risk, regulatory updates,
 * and prioritized recommendations into a one-document deliverable.
 *
 * Note on DocType:
 *   This template is intentionally not yet wired into the documents.create
 *   pipeline. The Prisma schema's DocType enum does not include
 *   MANAGED_MONTHLY_REPORT yet — adding an enum value to a Postgres enum
 *   via `prisma db push` carries non-trivial risk of column re-creation
 *   on existing Document rows. The enum value should be added by hand
 *   (ALTER TYPE "DocType" ADD VALUE 'MANAGED_MONTHLY_REPORT') before any
 *   caller starts persisting these reports as Document rows.
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  commonStyles,
  PDFHeader,
  PDFFooter,
  Disclaimer,
  formatDate,
  daysUntil,
  getRiskLevelColor,
} from '../pdf';

/**
 * Per-system snapshot for the report.
 */
export interface ManagedReportSystem {
  name: string;
  riskLevel: 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL' | string;
  complianceScore: number;
  gapsTotal: number;
  gapsCompleted: number;
  /**
   * Gaps newly discovered in this reporting period (e.g. month-over-month
   * delta from regulatory updates or re-classification).
   */
  gapsNew: number;
}

/**
 * Per-vendor snapshot for the report.
 */
export interface ManagedReportVendor {
  name: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  /** ISO date string. Rendered through formatDate at the call site. */
  lastAssessed: string;
}

/**
 * A regulatory update relevant to the client's portfolio that landed
 * during the reporting period.
 */
export interface ManagedReportRegulatoryUpdate {
  title: string;
  /** Regulation identifier, e.g. "EU AI Act", "Colorado AI Act". */
  regulation: string;
  /** Plain-text impact summary written by the managed-service team. */
  impact: string;
}

export interface ManagedReportData {
  orgName: string;
  /** Human-readable month label, e.g. "April 2026". */
  reportMonth: string;
  systems: ManagedReportSystem[];
  vendors: ManagedReportVendor[];
  regulatoryUpdates: ManagedReportRegulatoryUpdate[];
  recommendations: string[];
  /**
   * Days until 2 August 2026 EU AI Act high-risk deadline.
   * Pass this in (do not compute it inside the template) so reports
   * generated for the same month always show the same number, even
   * if the report is regenerated days later.
   */
  euAiActDaysRemaining: number;
}

/**
 * Localized strings for the template. The template is locale-agnostic;
 * the caller assembles a translations object from `documents.managedReport.*`
 * (or equivalent namespace) and passes it in.
 */
export interface ManagedReportTranslations {
  title: string;
  subtitle: string;
  countdownSection: string;
  countdownDaysRemaining: string;
  systemsSection: string;
  systemsTableName: string;
  systemsTableRisk: string;
  systemsTableScore: string;
  systemsTableGaps: string;
  systemsTableNew: string;
  vendorsSection: string;
  vendorsTableName: string;
  vendorsTableRisk: string;
  vendorsTableLastAssessed: string;
  regulatoryUpdatesSection: string;
  recommendationsSection: string;
  noVendors: string;
  noRegulatoryUpdates: string;
  noRecommendations: string;
  noSystems: string;
  disclaimer: string;
  generatedFor: string;
}

interface ManagedReportProps {
  data: ManagedReportData;
  /** Locale for date formatting (Intl.DateTimeFormat). Defaults to 'en'. */
  locale?: string;
  translations: ManagedReportTranslations;
}

const styles = StyleSheet.create({
  ...commonStyles,
  // Override page padding so we have room for the footer.
  page: {
    ...commonStyles.page,
    paddingBottom: 70,
  },
  // Hero countdown card — sits at the top of page 1 under the header.
  countdownCard: {
    marginTop: 5,
    marginBottom: 20,
    padding: 14,
    borderRadius: 6,
    border: '1 solid #FCD34D',
    backgroundColor: '#FFFBEB',
  },
  countdownLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countdownNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
  },
  countdownText: {
    fontSize: 10,
    color: '#78350F',
  },
  // Section heading row
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
    paddingBottom: 4,
    borderBottom: '1 solid #E5E7EB',
  },
  // Table column widths — systems table
  colSystemName: { width: '34%' },
  colSystemRisk: { width: '20%' },
  colSystemScore: { width: '16%', textAlign: 'right' },
  colSystemGaps: { width: '15%', textAlign: 'right' },
  colSystemNew: { width: '15%', textAlign: 'right' },
  // Table column widths — vendors table
  colVendorName: { width: '50%' },
  colVendorRisk: { width: '25%' },
  colVendorAssessed: { width: '25%' },
  // Risk badge inside a cell
  cellBadge: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  // Numbered recommendation row
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  recommendationNumber: {
    width: 18,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
  },
  recommendationText: {
    flex: 1,
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.45,
  },
  // Regulatory update card
  updateCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
    border: '1 solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  updateRegulation: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  updateTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  updateImpact: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.45,
  },
  // Empty state row
  emptyState: {
    fontSize: 9,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
  },
});

/**
 * The managed-service monthly report.
 *
 * Layout:
 *   1. PDF header (title, subtitle, date)
 *   2. Countdown card — days until EU AI Act deadline
 *   3. Systems Overview — table of AI systems
 *   4. Vendor Status — table of vendors
 *   5. Regulatory Updates — cards
 *   6. Recommendations — numbered list
 *   7. Disclaimer + footer (generated by Complyance)
 */
export const ManagedReport: React.FC<ManagedReportProps> = ({
  data,
  locale = 'en',
  translations,
}) => {
  const t = translations;
  const generatedFor = `${t.generatedFor}: ${data.orgName} • ${data.reportMonth}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader title={t.title} subtitle={t.subtitle} locale={locale} />

        {/* Section 1: Countdown card */}
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>{t.countdownSection}</Text>
          <View style={styles.countdownNumberRow}>
            <Text style={styles.countdownNumber}>
              {data.euAiActDaysRemaining.toLocaleString('en-US')}
            </Text>
            <Text style={styles.countdownText}>{t.countdownDaysRemaining}</Text>
          </View>
        </View>

        {/* "Generated for {org} — {month}" sub-line */}
        <Text style={[styles.subtitle, { marginBottom: 10 }]}>{generatedFor}</Text>

        {/* Section 2: Systems Overview */}
        <Text style={styles.sectionHeading}>{t.systemsSection}</Text>
        {data.systems.length === 0 ? (
          <Text style={styles.emptyState}>{t.noSystems}</Text>
        ) : (
          <SystemsTable systems={data.systems} translations={t} />
        )}

        {/* Section 3: Vendor Status */}
        <Text style={styles.sectionHeading}>{t.vendorsSection}</Text>
        {data.vendors.length === 0 ? (
          <Text style={styles.emptyState}>{t.noVendors}</Text>
        ) : (
          <VendorsTable vendors={data.vendors} translations={t} locale={locale} />
        )}

        {/* Section 4: Regulatory Updates */}
        <Text style={styles.sectionHeading}>{t.regulatoryUpdatesSection}</Text>
        {data.regulatoryUpdates.length === 0 ? (
          <Text style={styles.emptyState}>{t.noRegulatoryUpdates}</Text>
        ) : (
          data.regulatoryUpdates.map((update, i) => (
            <View key={i} style={styles.updateCard}>
              <Text style={styles.updateRegulation}>{update.regulation}</Text>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateImpact}>{update.impact}</Text>
            </View>
          ))
        )}

        {/* Section 5: Recommendations */}
        <Text style={styles.sectionHeading}>{t.recommendationsSection}</Text>
        {data.recommendations.length === 0 ? (
          <Text style={styles.emptyState}>{t.noRecommendations}</Text>
        ) : (
          data.recommendations.map((rec, i) => (
            <View key={i} style={styles.recommendationRow}>
              <Text style={styles.recommendationNumber}>{i + 1}.</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))
        )}

        {/* Disclaimer banner */}
        <Disclaimer text={t.disclaimer} />

        {/* Footer with page number */}
        <PDFFooter pageNumber={1} totalPages={1} disclaimerText={t.disclaimer} />
      </Page>
    </Document>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

interface SystemsTableProps {
  systems: ManagedReportSystem[];
  translations: ManagedReportTranslations;
}

const SystemsTable: React.FC<SystemsTableProps> = ({ systems, translations }) => {
  const t = translations;
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, styles.colSystemName]}>
          {t.systemsTableName}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colSystemRisk]}>
          {t.systemsTableRisk}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colSystemScore]}>
          {t.systemsTableScore}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colSystemGaps]}>
          {t.systemsTableGaps}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colSystemNew]}>
          {t.systemsTableNew}
        </Text>
      </View>

      {/* Data rows */}
      {systems.map((system, i) => {
        const riskColor = getRiskLevelColor(system.riskLevel);
        return (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colSystemName]}>{system.name}</Text>
            <View style={styles.colSystemRisk}>
              <Text style={[styles.cellBadge, riskColor]}>{system.riskLevel}</Text>
            </View>
            <Text style={[styles.tableCell, styles.colSystemScore]}>
              {system.complianceScore}%
            </Text>
            <Text style={[styles.tableCell, styles.colSystemGaps]}>
              {system.gapsCompleted}/{system.gapsTotal}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colSystemNew,
                system.gapsNew > 0 ? { color: '#B91C1C', fontWeight: 'bold' } : {},
              ]}
            >
              {system.gapsNew > 0 ? `+${system.gapsNew}` : '0'}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

interface VendorsTableProps {
  vendors: ManagedReportVendor[];
  translations: ManagedReportTranslations;
  locale: string;
}

const VendorsTable: React.FC<VendorsTableProps> = ({ vendors, translations, locale }) => {
  const t = translations;

  // Vendor risk color mapping — uses the same palette as system risk
  // (CRITICAL maps to UNACCEPTABLE styling).
  const vendorBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return getRiskLevelColor('UNACCEPTABLE');
      case 'HIGH':
        return getRiskLevelColor('HIGH');
      case 'MEDIUM':
        return getRiskLevelColor('LIMITED');
      case 'LOW':
        return getRiskLevelColor('MINIMAL');
      default:
        return getRiskLevelColor('default');
    }
  };

  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, styles.colVendorName]}>
          {t.vendorsTableName}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colVendorRisk]}>
          {t.vendorsTableRisk}
        </Text>
        <Text style={[styles.tableCellHeader, styles.colVendorAssessed]}>
          {t.vendorsTableLastAssessed}
        </Text>
      </View>

      {/* Data rows */}
      {vendors.map((vendor, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colVendorName]}>{vendor.name}</Text>
          <View style={styles.colVendorRisk}>
            <Text style={[styles.cellBadge, vendorBadgeStyle(vendor.riskLevel)]}>
              {vendor.riskLevel}
            </Text>
          </View>
          <Text style={[styles.tableCell, styles.colVendorAssessed]}>
            {formatDate(new Date(vendor.lastAssessed), locale)}
          </Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Helper: build a default English translations object for the template.
 *
 * Useful for tests, scripts, and one-off PDF generation. Production code
 * should pass a real translations object built from `getTranslations`
 * with the appropriate locale.
 */
export function defaultManagedReportTranslations(): ManagedReportTranslations {
  return {
    title: 'AI Compliance Monthly Report',
    subtitle: 'Generated by Complyance — Managed Service',
    countdownSection: 'EU AI Act high-risk deadline',
    countdownDaysRemaining: 'days remaining (2 August 2026)',
    systemsSection: 'AI Systems Overview',
    systemsTableName: 'System',
    systemsTableRisk: 'Risk',
    systemsTableScore: 'Score',
    systemsTableGaps: 'Gaps',
    systemsTableNew: 'New',
    vendorsSection: 'Vendor Status',
    vendorsTableName: 'Vendor',
    vendorsTableRisk: 'Risk',
    vendorsTableLastAssessed: 'Last assessed',
    regulatoryUpdatesSection: 'Regulatory Updates',
    recommendationsSection: 'Recommendations',
    noVendors: 'No vendors assessed yet.',
    noRegulatoryUpdates: 'No regulatory updates this period.',
    noRecommendations: 'No active recommendations — you are on track.',
    noSystems: 'No AI systems registered yet.',
    disclaimer:
      'This report summarizes the compliance state of the listed AI systems for the reporting period. It is not legal advice. Consult qualified counsel for binding compliance interpretations.',
    generatedFor: 'Prepared for',
  };
}

/**
 * Convenience: compute days until the EU AI Act high-risk deadline.
 * Re-exports the existing `daysUntil` helper with the canonical date
 * baked in, so callers do not have to repeat the constant.
 */
export function getEUAIActDaysRemaining(): number {
  return Math.max(0, daysUntil(new Date('2026-08-02T00:00:00Z')));
}
