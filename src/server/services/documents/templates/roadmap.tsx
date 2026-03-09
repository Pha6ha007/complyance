/**
 * Compliance Roadmap PDF Template
 * Step-by-step plan to EU AI Act compliance
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  commonStyles,
  PDFHeader,
  Disclaimer,
  formatDate,
  formatDateShort,
  daysUntil,
  getPriorityColor,
} from '../pdf';
import type { AISystem, ComplianceGap } from '@prisma/client';
import { EU_AI_ACT_DEADLINE } from '@/lib/constants';

interface RoadmapProps {
  system: AISystem & {
    gaps: ComplianceGap[];
  };
  organizationName: string;
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    systemName: string;
    deadline: string;
    daysRemaining: string;
    overview: string;
    totalGaps: string;
    criticalGaps: string;
    highGaps: string;
    timeline: string;
    phase: string;
    article: string;
    requirement: string;
    priority: string;
    dueDate: string;
    status: string;
    disclaimer: string;
    generatedFor: string;
    notStarted: string;
    inProgress: string;
    completed: string;
    immediate: string;
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
}

const styles = StyleSheet.create({
  ...commonStyles,
  deadlineBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    border: '1 solid #FCD34D',
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 3,
  },
  daysText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#78350F',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
    border: '1 solid #E5E7EB',
  },
  statLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  phaseSection: {
    marginBottom: 15,
  },
  phaseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    borderBottom: '1 solid #D1D5DB',
    paddingBottom: 4,
  },
  gapItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FFFFFF',
    border: '1 solid #E5E7EB',
    borderRadius: 3,
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  gapArticle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  priorityBadge: {
    padding: '3 8',
    borderRadius: 3,
    fontSize: 7,
    fontWeight: 'bold',
  },
  gapRequirement: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 5,
  },
  gapMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  metaText: {
    fontSize: 8,
    color: '#6B7280',
  },
  statusBadge: {
    fontSize: 7,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

/**
 * Group gaps by phase based on priority and due date
 */
function groupGapsByPhase(
  gaps: ComplianceGap[],
  t: RoadmapProps['translations']
): { phase: string; gaps: ComplianceGap[] }[] {
  const now = new Date();
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const immediate: ComplianceGap[] = [];
  const shortTerm: ComplianceGap[] = [];
  const mediumTerm: ComplianceGap[] = [];
  const longTerm: ComplianceGap[] = [];

  gaps.forEach((gap) => {
    // Critical gaps go to immediate
    if (gap.priority === 'CRITICAL') {
      immediate.push(gap);
      return;
    }

    // High priority with due date within 3 months
    if (gap.priority === 'HIGH') {
      if (gap.dueDate && gap.dueDate < threeMonths) {
        immediate.push(gap);
      } else {
        shortTerm.push(gap);
      }
      return;
    }

    // Medium priority
    if (gap.priority === 'MEDIUM') {
      if (gap.dueDate && gap.dueDate < sixMonths) {
        shortTerm.push(gap);
      } else {
        mediumTerm.push(gap);
      }
      return;
    }

    // Low priority
    longTerm.push(gap);
  });

  return [
    { phase: t.immediate, gaps: immediate },
    { phase: t.shortTerm, gaps: shortTerm },
    { phase: t.mediumTerm, gaps: mediumTerm },
    { phase: t.longTerm, gaps: longTerm },
  ].filter((group) => group.gaps.length > 0);
}

export const RoadmapDocument: React.FC<RoadmapProps> = ({
  system,
  organizationName,
  locale,
  translations: t,
}) => {
  const daysToDeadline = daysUntil(EU_AI_ACT_DEADLINE);
  const phaseGroups = groupGapsByPhase(system.gaps, t);

  const criticalCount = system.gaps.filter((g) => g.priority === 'CRITICAL').length;
  const highCount = system.gaps.filter((g) => g.priority === 'HIGH').length;
  const completedCount = system.gaps.filter((g) => g.status === 'COMPLETED').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader
          title={t.title}
          subtitle={`${t.generatedFor} ${organizationName} • ${system.name}`}
          locale={locale}
        />

        {/* Disclaimer */}
        <Disclaimer text={t.disclaimer} />

        {/* Deadline Warning */}
        <View style={styles.deadlineBox}>
          <Text style={styles.deadlineText}>{t.deadline}</Text>
          <Text style={styles.deadlineText}>
            {formatDate(EU_AI_ACT_DEADLINE, locale)}
          </Text>
          <Text style={styles.daysText}>
            {daysToDeadline} {t.daysRemaining}
          </Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.overview}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.totalGaps}</Text>
              <Text style={styles.statValue}>{system.gaps.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.criticalGaps}</Text>
              <Text style={styles.statValue}>{criticalCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.highGaps}</Text>
              <Text style={styles.statValue}>{highCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.completed}</Text>
              <Text style={styles.statValue}>{completedCount}</Text>
            </View>
          </View>
        </View>

        {/* Timeline by Phase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.timeline}</Text>

          {phaseGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.phaseSection}>
              <Text style={styles.phaseTitle}>
                {t.phase} {groupIndex + 1}: {group.phase}
              </Text>

              {group.gaps.map((gap, gapIndex) => {
                const priorityColor = getPriorityColor(gap.priority);
                const statusText =
                  gap.status === 'COMPLETED'
                    ? t.completed
                    : gap.status === 'IN_PROGRESS'
                    ? t.inProgress
                    : t.notStarted;

                return (
                  <View key={gapIndex} style={styles.gapItem}>
                    <View style={styles.gapHeader}>
                      <Text style={styles.gapArticle}>{gap.article}</Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: priorityColor.backgroundColor,
                            color: priorityColor.color,
                          },
                        ]}
                      >
                        <Text>{gap.priority}</Text>
                      </View>
                    </View>

                    <Text style={styles.gapRequirement}>{gap.requirement}</Text>

                    <View style={styles.gapMeta}>
                      <Text style={styles.metaText}>
                        {t.dueDate}:{' '}
                        {gap.dueDate ? formatDateShort(gap.dueDate) : '—'}
                      </Text>
                      <Text style={styles.statusBadge}>
                        {t.status}: {statusText}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
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
            Page 1 • Generated by Complyance.io • {formatDate(new Date(), locale)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
