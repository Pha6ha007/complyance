/**
 * Document Generator Service
 * Orchestrates PDF generation for compliance documents
 */
import React from 'react';
import { DocType } from '@prisma/client';
import { renderPDF } from './pdf';
import { ClassificationReportDocument } from './templates/classification-report';
import { RoadmapDocument } from './templates/roadmap';
import { AnnexIVDocument } from './templates/annex-iv';
import { prisma } from '@/server/db/client';
import { uploadPdfToStorage } from './storage';
import type { AISystem, ComplianceGap } from '@prisma/client';

/**
 * Translation keys for documents
 * These will be passed from the router which has access to translation function
 */
export interface DocumentTranslations {
  // Classification Report
  classificationReport: {
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
  // Roadmap
  roadmap: {
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
  // Annex IV
  annexIV: {
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

export interface GenerateDocumentOptions {
  type: DocType;
  systemId: string;
  organizationId: string;
  locale: string;
  translations: DocumentTranslations;
}

export interface GenerateDocumentResult {
  documentId: string;
  fileUrl: string;
}

/**
 * Generate a compliance document PDF
 */
export async function generateDocument(
  options: GenerateDocumentOptions
): Promise<GenerateDocumentResult> {
  const { type, systemId, organizationId, locale, translations } = options;

  // Fetch system data with related data
  const system = await prisma.aiSystem.findFirst({
    where: {
      id: systemId,
      organizationId,
    },
    include: {
      gaps: {
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      },
      organization: true,
    },
  });

  if (!system) {
    throw new Error('AI System not found');
  }

  // Generate appropriate PDF based on type
  let pdfBuffer: Buffer;
  let title: string;

  switch (type) {
    case DocType.CLASSIFICATION_REPORT:
      title = `${translations.classificationReport.title} - ${system.name}`;
      pdfBuffer = await generateClassificationReport(system, locale, translations);
      break;

    case DocType.ROADMAP:
      title = `${translations.roadmap.title} - ${system.name}`;
      pdfBuffer = await generateRoadmap(
        system as AISystem & { gaps: ComplianceGap[] },
        locale,
        translations
      );
      break;

    case DocType.ANNEX_IV:
      title = `${translations.annexIV.title} - ${system.name}`;
      pdfBuffer = await generateAnnexIV(system, locale, translations);
      break;

    default:
      throw new Error(`Unsupported document type: ${type}`);
  }

  // Upload PDF to storage
  const fileName = `${type.toLowerCase()}-${systemId}-${Date.now()}.pdf`;
  const fileUrl = await uploadPdfToStorage(organizationId, fileName, pdfBuffer);

  // Create document record in database
  const document = await prisma.document.create({
    data: {
      type,
      title,
      locale,
      fileUrl,
      status: 'FINAL',
      version: 1,
      systemId,
      organizationId,
    },
  });

  return {
    documentId: document.id,
    fileUrl,
  };
}

/**
 * Generate Classification Report PDF
 */
async function generateClassificationReport(
  system: AISystem & { organization: { name: string }; gaps?: ComplianceGap[] },
  locale: string,
  translations: DocumentTranslations
): Promise<Buffer> {
  const document = React.createElement(ClassificationReportDocument, {
    system,
    organizationName: system.organization.name,
    locale,
    translations: translations.classificationReport,
  });

  return renderPDF(document);
}

/**
 * Generate Compliance Roadmap PDF
 */
async function generateRoadmap(
  system: AISystem & { organization: { name: string }; gaps: ComplianceGap[] },
  locale: string,
  translations: DocumentTranslations
): Promise<Buffer> {
  const document = React.createElement(RoadmapDocument, {
    system,
    organizationName: system.organization.name,
    locale,
    translations: translations.roadmap,
  });

  return renderPDF(document);
}

/**
 * Generate Annex IV Technical Documentation PDF
 */
async function generateAnnexIV(
  system: AISystem & { organization: { name: string } },
  locale: string,
  translations: DocumentTranslations
): Promise<Buffer> {
  const document = React.createElement(AnnexIVDocument, {
    system,
    organizationName: system.organization.name,
    locale,
    translations: translations.annexIV,
  });

  return renderPDF(document);
}

/**
 * List documents for a system
 */
export async function listSystemDocuments(
  systemId: string,
  organizationId: string
) {
  return prisma.document.findMany({
    where: {
      systemId,
      organizationId,
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  documentId: string,
  organizationId: string
): Promise<void> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      organizationId,
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete from database
  // Note: S3 cleanup can be handled separately or via lifecycle policies
  await prisma.document.delete({
    where: { id: documentId },
  });
}
