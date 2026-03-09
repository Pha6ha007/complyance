/**
 * Document storage service for S3/R2
 * Handles file uploads, downloads, and deletion
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

// Initialize S3 client (works with both AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // For Cloudflare R2, uncomment and configure:
  // endpoint: process.env.R2_ENDPOINT,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';
const UPLOAD_URL_EXPIRY = 15 * 60; // 15 minutes
const DOWNLOAD_URL_EXPIRY = 60 * 60; // 1 hour

/**
 * Generates a presigned URL for uploading a file
 */
export async function generateUploadUrl(
  organizationId: string,
  systemId: string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  const fileKey = `documents/${organizationId}/${systemId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: getContentType(fileType),
    ServerSideEncryption: 'AES256', // Encrypt at rest
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: UPLOAD_URL_EXPIRY,
  });

  return { uploadUrl, fileKey };
}

/**
 * Generates a presigned URL for downloading a file
 */
export async function generateDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: DOWNLOAD_URL_EXPIRY,
  });
}

/**
 * Fetches file from storage and returns as Buffer
 */
export async function getFileFromStorage(fileKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('No file body returned from S3');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Deletes a file from storage
 */
export async function deleteFileFromStorage(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
}

/**
 * Calculates SHA-256 hash of file content for integrity verification
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Uploads a generated PDF directly to storage
 * Used for generated compliance documents
 */
export async function uploadPdfToStorage(
  organizationId: string,
  fileName: string,
  pdfBuffer: Buffer
): Promise<string> {
  const fileKey = `generated/${organizationId}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'AES256', // Encrypt at rest
  });

  await s3Client.send(command);

  return fileKey;
}

/**
 * Gets MIME type based on file extension
 */
function getContentType(fileType: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    md: 'text/markdown',
    txt: 'text/plain',
  };

  return contentTypes[fileType.toLowerCase()] || 'application/octet-stream';
}
