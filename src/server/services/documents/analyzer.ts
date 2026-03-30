import { callLLM } from '@/server/ai/client';
import { DOCUMENT_ANALYSIS_PROMPT } from '@/server/ai/prompts/document-analysis';
import {
  documentAnalysisResultSchema,
  type DocumentAnalysisResult,
} from '@/server/ai/schemas/document-analysis-result';
import { prisma } from '@/server/db/client';
import { extractTextFromFile } from './text-extractor';

interface AnalyzeDocumentsInput {
  systemId: string;
  documentIds: string[];
}

/**
 * Analyzes uploaded documents using LLM via OpenRouter to extract AI-relevant information
 */
export async function analyzeDocuments({
  systemId,
  documentIds,
}: AnalyzeDocumentsInput): Promise<DocumentAnalysisResult> {
  // Fetch documents from database
  const documents = await prisma.systemDocument.findMany({
    where: {
      id: { in: documentIds },
      systemId,
    },
  });

  if (documents.length === 0) {
    throw new Error('No documents found for analysis');
  }

  // Mark documents as analyzing
  await prisma.systemDocument.updateMany({
    where: { id: { in: documentIds } },
    data: { analysisStatus: 'ANALYZING' },
  });

  try {
    // Extract text from all documents
    const extractedTexts = await Promise.all(
      documents.map(async (doc) => ({
        fileName: doc.fileName,
        text: await extractTextFromFile(doc.fileUrl, doc.fileType),
      }))
    );

    // Combine all extracted text with file markers
    const combinedText = extractedTexts
      .map(
        ({ fileName, text }) =>
          `=== Document: ${fileName} ===\n\n${text}\n\n=== End of ${fileName} ===\n\n`
      )
      .join('');

    // Call LLM via OpenRouter
    const response = await callLLM({
      system: DOCUMENT_ANALYSIS_PROMPT,
      userMessage: `Please analyze the following product documentation and extract AI compliance information:\n\n${combinedText}`,
      maxTokens: 4096,
      temperature: 0, // Deterministic for consistency
    });

    // Parse and validate the response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    const rawResult = JSON.parse(jsonMatch[0]);
    const analysisResult = documentAnalysisResultSchema.parse(rawResult);

    // Save analysis results to database
    await Promise.all(
      documents.map((doc) =>
        prisma.systemDocument.update({
          where: { id: doc.id },
          data: {
            analysisStatus: 'COMPLETED',
            analysisResult: analysisResult as any,
            detectedRisks: analysisResult.detectedRisks as any,
            analyzedAt: new Date(),
          },
        })
      )
    );

    return analysisResult;
  } catch (error) {
    // Mark documents as failed
    await prisma.systemDocument.updateMany({
      where: { id: { in: documentIds } },
      data: { analysisStatus: 'FAILED' },
    });

    throw error;
  }
}

/**
 * Gets the combined analysis results from all documents for a system
 */
export async function getSystemDocumentAnalysis(
  systemId: string
): Promise<DocumentAnalysisResult | null> {
  const documents = await prisma.systemDocument.findMany({
    where: {
      systemId,
      analysisStatus: 'COMPLETED',
    },
    orderBy: { analyzedAt: 'desc' },
  });

  if (documents.length === 0) {
    return null;
  }

  // Return the most recent complete analysis
  // In the future, this could merge results from multiple documents
  const latestDoc = documents[0];

  if (!latestDoc.analysisResult) {
    return null;
  }

  return documentAnalysisResultSchema.parse(latestDoc.analysisResult);
}
