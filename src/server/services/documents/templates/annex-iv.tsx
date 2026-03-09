/**
 * Annex IV Technical Documentation Template
 * EU AI Act Article 11 - Technical Documentation Requirements
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  commonStyles,
  PDFHeader,
  Disclaimer,
  formatDate,
  getRiskLevelColor,
} from '../pdf';
import type { AISystem } from '@prisma/client';

interface AnnexIVProps {
  system: AISystem;
  organizationName: string;
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    section1: string;
    section1Title: string;
    section1Content: string;
    section2: string;
    section2Title: string;
    section2Content: string;
    section3: string;
    section3Title: string;
    section3Content: string;
    section4: string;
    section4Title: string;
    section4Content: string;
    section5: string;
    section5Title: string;
    section5Content: string;
    section6: string;
    section6Title: string;
    section6Content: string;
    systemInfo: string;
    systemName: string;
    description: string;
    aiType: string;
    domain: string;
    markets: string;
    riskLevel: string;
    providerInfo: string;
    organizationName: string;
    generatedDate: string;
    version: string;
    disclaimer: string;
    generatedFor: string;
    intendedPurpose: string;
    technicalSpecs: string;
    dataRequirements: string;
    humanOversight: string;
    accuracy: string;
    robustness: string;
    cybersecurity: string;
    monitoring: string;
    placeholder: string;
  };
}

const localStyles = StyleSheet.create({
  tocSection: {
    marginBottom: 20,
  },
  tocItem: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 9,
    color: '#374151',
  },
  tocNumber: {
    width: 30,
    fontWeight: 'bold',
  },
  tocTitle: {
    flex: 1,
  },
  annexSection: {
    marginBottom: 20,
    pageBreak: 'before',
  },
  annexHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    borderBottom: '2 solid #374151',
    paddingBottom: 5,
  },
  annexSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  annexContent: {
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  placeholderBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
    border: '1 solid #FCD34D',
  },
  placeholderText: {
    fontSize: 9,
    color: '#92400E',
    fontStyle: 'italic',
  },
  infoTable: {
    marginTop: 10,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    paddingTop: 6,
    paddingBottom: 6,
  },
  infoLabel: {
    width: '35%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  infoValue: {
    width: '65%',
    fontSize: 9,
    color: '#111827',
  },
});

const styles = { ...commonStyles, ...localStyles };

export const AnnexIVDocument: React.FC<AnnexIVProps> = ({
  system,
  organizationName,
  locale,
  translations: t,
}) => {
  const riskColor = getRiskLevelColor(system.riskLevel || 'MINIMAL');

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title={t.title}
          subtitle={`${t.generatedFor} ${organizationName}`}
          locale={locale}
        />

        <Disclaimer text={t.disclaimer} />

        {/* System Information Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.systemInfo}</Text>
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.systemName}</Text>
              <Text style={styles.infoValue}>{system.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.riskLevel}</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>
                {system.riskLevel || '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.aiType}</Text>
              <Text style={styles.infoValue}>{system.aiType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.domain}</Text>
              <Text style={styles.infoValue}>{system.domain}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.markets}</Text>
              <Text style={styles.infoValue}>{system.markets.join(', ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.organizationName}</Text>
              <Text style={styles.infoValue}>{organizationName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.generatedDate}</Text>
              <Text style={styles.infoValue}>{formatDate(new Date(), locale)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.version}</Text>
              <Text style={styles.infoValue}>1.0</Text>
            </View>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocSection}>
          <Text style={styles.sectionTitle}>Table of Contents</Text>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>1.</Text>
            <Text style={styles.tocTitle}>{t.section1Title}</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>2.</Text>
            <Text style={styles.tocTitle}>{t.section2Title}</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>3.</Text>
            <Text style={styles.tocTitle}>{t.section3Title}</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>4.</Text>
            <Text style={styles.tocTitle}>{t.section4Title}</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>5.</Text>
            <Text style={styles.tocTitle}>{t.section5Title}</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocNumber}>6.</Text>
            <Text style={styles.tocTitle}>{t.section6Title}</Text>
          </View>
        </View>
      </Page>

      {/* Section 1: General Description */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section1} {t.section1Title}
          </Text>
          <Text style={styles.annexContent}>{t.section1Content}</Text>

          <Text style={styles.annexSubtitle}>{t.intendedPurpose}</Text>
          <Text style={styles.annexContent}>{system.description}</Text>

          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Provide detailed description of intended purpose, use cases,
              and target users.
            </Text>
          </View>
        </View>
      </Page>

      {/* Section 2: Technical Specifications */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section2} {t.section2Title}
          </Text>
          <Text style={styles.annexContent}>{t.section2Content}</Text>

          <Text style={styles.annexSubtitle}>{t.technicalSpecs}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document AI model architecture, algorithms used, development
              methodology, and technical specifications.
            </Text>
          </View>

          <Text style={styles.annexSubtitle}>{t.dataRequirements}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Describe training data, data quality measures, data
              governance, and bias mitigation strategies.
            </Text>
          </View>
        </View>
      </Page>

      {/* Section 3: Risk Management */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section3} {t.section3Title}
          </Text>
          <Text style={styles.annexContent}>{t.section3Content}</Text>

          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document risk assessment methodology, identified risks,
              mitigation measures, and residual risks (Article 9).
            </Text>
          </View>
        </View>
      </Page>

      {/* Section 4: Human Oversight */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section4} {t.section4Title}
          </Text>
          <Text style={styles.annexContent}>{t.section4Content}</Text>

          <Text style={styles.annexSubtitle}>{t.humanOversight}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document human oversight measures, including ability to
              override, stop, or intervene in system decisions (Article 14).
            </Text>
          </View>
        </View>
      </Page>

      {/* Section 5: Accuracy, Robustness, Cybersecurity */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section5} {t.section5Title}
          </Text>
          <Text style={styles.annexContent}>{t.section5Content}</Text>

          <Text style={styles.annexSubtitle}>{t.accuracy}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document accuracy metrics, testing results, and performance
              benchmarks (Article 15).
            </Text>
          </View>

          <Text style={styles.annexSubtitle}>{t.robustness}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document robustness measures, testing against adversarial
              inputs, and error handling.
            </Text>
          </View>

          <Text style={styles.annexSubtitle}>{t.cybersecurity}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document cybersecurity measures, data protection, and
              access controls (Article 15).
            </Text>
          </View>
        </View>
      </Page>

      {/* Section 6: Post-Market Monitoring */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annexSection}>
          <Text style={styles.annexHeader}>
            {t.section6} {t.section6Title}
          </Text>
          <Text style={styles.annexContent}>{t.section6Content}</Text>

          <Text style={styles.annexSubtitle}>{t.monitoring}</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              {t.placeholder}: Document post-market monitoring plan, including ongoing
              performance monitoring, incident reporting, and update procedures (Article
              72).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View
          style={[
            commonStyles.footer,
            { position: 'absolute', bottom: 30, left: 40, right: 40 },
          ]}
        >
          <Text style={{ fontSize: 8, color: '#9CA3AF' }}>{t.disclaimer}</Text>
          <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 5 }}>
            Generated by Complyance.io • {formatDate(new Date(), locale)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
