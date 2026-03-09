/**
 * Text extraction utilities for different file types
 * Handles PDF, DOCX, MD, TXT files
 */

import { getFileFromStorage } from './storage';

/**
 * Extracts text content from a file based on its type
 */
export async function extractTextFromFile(
  fileUrl: string,
  fileType: string
): Promise<string> {
  // Download file from storage
  const fileBuffer = await getFileFromStorage(fileUrl);

  switch (fileType.toLowerCase()) {
    case 'txt':
    case 'md':
      return extractTextFromPlainText(fileBuffer);

    case 'pdf':
      return extractTextFromPDF(fileBuffer);

    case 'docx':
      return extractTextFromDOCX(fileBuffer);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Extract text from plain text or markdown files
 */
function extractTextFromPlainText(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Extract text from PDF files
 * Uses pdf-parse library
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading in browser context
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from DOCX files
 * Uses mammoth library
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading in browser context
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(
      `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
