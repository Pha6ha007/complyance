/**
 * Classification Report PDF Template
 * AI System Risk Classification Report under EU AI Act
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
import type { AISystem, ComplianceGap } from '@prisma/client';

interface ClassificationReportProps {
  system: AISystem & {
    gaps?: ComplianceGap[];
  };
  organizationName: string;
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    systemInfo: string;
    systemName: string;
    description: string;
    aiType: string;
    domain: string;
    markets: string;
    classification: string;
    riskLevel: string;
    annexCategory: string;
    reasoning: string;
    exceptionAnalysis: string;
    exceptionApplies: string;
    yes: string;
    no: string;
    exceptionReason: string;
    obligations: string;
    obligationCount: string;
    gapCount: string;
    providerDeployer: string;
    transparency: string;
    disclaimer: string;
    generatedFor: string;
    noException: string;
    notClassified: string;
  };
}

const styles = StyleSheet.create({
  ...commonStyles,
  infoGrid: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: '30%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  infoValue: {
    width: '70%',
    fontSize: 10,
    color: '#111827',
  },
  riskBadge: {
    padding: '5 12',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 10,
  },
  reasoningBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 12,
    border: '1 solid #E5E7EB',
  },
  transparencyList: {
    marginTop: 8,
  },
  transparencyItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 10,
  },
});

export const ClassificationReportDocument: React.FC<ClassificationReportProps> = ({
  system,
  organizationName,
  locale,
  translations: t,
}) => {
  const riskColor = getRiskLevelColor(system.riskLevel || 'MINIMAL');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader
          title={t.title}
          subtitle={`${t.generatedFor} ${organizationName}`}
          locale={locale}
        />

        {/* Disclaimer */}
        <Disclaimer text={t.disclaimer} />

        {/* System Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.systemInfo}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.systemName}</Text>
              <Text style={styles.infoValue}>{system.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.description}</Text>
              <Text style={styles.infoValue}>{system.description}</Text>
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
          </View>
        </View>

        {/* Classification Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.classification}</Text>

          {/* Risk Level Badge */}
          <Text style={styles.label}>{t.riskLevel}</Text>
          <View
            style={[
              styles.riskBadge,
              {
                backgroundColor: riskColor.backgroundColor,
                color: riskColor.color,
              },
            ]}
          >
            <Text>{system.riskLevel || t.notClassified}</Text>
          </View>

          {/* Annex III Category */}
          {system.annexIIICategory && (
            <>
              <Text style={styles.label}>{t.annexCategory}</Text>
              <Text style={styles.value}>{system.annexIIICategory}</Text>
              {system.annexIIISubcategory && (
                <Text style={[styles.value, { fontSize: 9, color: '#6B7280' }]}>
                  {system.annexIIISubcategory}
                </Text>
              )}
            </>
          )}

          {/* Provider or Deployer */}
          {system.providerOrDeployer && (
            <>
              <Text style={styles.label}>{t.providerDeployer}</Text>
              <Text style={styles.value}>{system.providerOrDeployer}</Text>
            </>
          )}

          {/* Classification Reasoning */}
          {system.classificationReasoning && (
            <>
              <Text style={styles.label}>{t.reasoning}</Text>
              <View style={styles.reasoningBox}>
                <Text style={[styles.text, { fontSize: 9 }]}>
                  {system.classificationReasoning}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Exception Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.exceptionAnalysis}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.exceptionApplies}</Text>
            <Text style={styles.infoValue}>
              {system.exceptionApplies ? t.yes : t.no}
            </Text>
          </View>
          {system.exceptionApplies && system.exceptionReason && (
            <>
              <Text style={styles.label}>{t.exceptionReason}</Text>
              <View style={styles.reasoningBox}>
                <Text style={[styles.text, { fontSize: 9 }]}>
                  {system.exceptionReason}
                </Text>
              </View>
            </>
          )}
          {!system.exceptionApplies && (
            <Text style={[styles.text, { fontStyle: 'italic', color: '#6B7280' }]}>
              {t.noException}
            </Text>
          )}
        </View>

        {/* Transparency Obligations (Article 50) */}
        {system.transparencyObligations && system.transparencyObligations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.transparency}</Text>
            <View style={styles.transparencyList}>
              {system.transparencyObligations.map((obligation, index) => (
                <Text key={index} style={styles.transparencyItem}>
                  • {obligation}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Compliance Summary */}
        {system.gaps && system.gaps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.obligations}</Text>
            <Text style={styles.text}>
              {t.obligationCount}: {system.gaps.length}
            </Text>
            <Text style={styles.text}>
              {t.gapCount}:{' '}
              {system.gaps.filter((g) => g.status !== 'COMPLETED').length}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          style={[
            commonStyles.footer,
            { position: 'absolute', bottom: 30, left: 40, right: 40 },
          ]}
        >
          <Text style={{ fontSize: 8, color: '#9CA3AF' }}>
            {t.disclaimer}
          </Text>
          <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 5 }}>
            Page 1 of 1 • Generated by Complyance.io • {formatDate(new Date(), locale)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
