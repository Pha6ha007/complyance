'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import { FileText, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

interface DocumentUploaderProps {
  systemId: string;
  onUploadComplete?: (documentIds: string[]) => void;
  maxFiles?: number;
}

interface UploadingFile {
  file: File;
  documentId?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploader({
  systemId,
  onUploadComplete,
  maxFiles = 5,
}: DocumentUploaderProps) {
  const t = useTranslations('wizard');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const getUploadUrl = trpc.document.getUploadUrl.useMutation();
  const confirmUpload = trpc.document.confirmUpload.useMutation();

  const uploadFile = useCallback(
    async (file: File) => {
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (!fileType || !['pdf', 'docx', 'md', 'txt'].includes(fileType)) {
        throw new Error('Unsupported file type');
      }

      // Get presigned upload URL
      const { uploadUrl, documentId } = await getUploadUrl.mutateAsync({
        systemId,
        fileName: file.name,
        fileType: fileType as 'pdf' | 'docx' | 'md' | 'txt',
        fileSize: file.size,
      });

      // Upload file to S3/R2
      const xhr = new XMLHttpRequest();

      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, progress } : f
              )
            );
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            // Confirm upload and calculate hash
            await confirmUpload.mutateAsync({ documentId });
            resolve(documentId);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    },
    [systemId, getUploadUrl, confirmUpload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check max files limit
      if (uploadingFiles.length + acceptedFiles.length > maxFiles) {
        alert(t('uploadMaxFilesError', { max: maxFiles }));
        return;
      }

      // Add files to uploading list
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      const results = await Promise.allSettled(
        acceptedFiles.map(async (file, index) => {
          try {
            const documentId = await uploadFile(file);
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? { ...f, documentId, status: 'completed', progress: 100 }
                  : f
              )
            );
            return documentId;
          } catch (error) {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      status: 'error',
                      error:
                        error instanceof Error ? error.message : 'Upload failed',
                    }
                  : f
              )
            );
            throw error;
          }
        })
      );

      // Get successful document IDs
      const documentIds = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<string>).value);

      if (documentIds.length > 0 && onUploadComplete) {
        onUploadComplete(documentIds);
      }
    },
    [uploadingFiles, maxFiles, uploadFile, onUploadComplete, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
  });

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const completedFiles = uploadingFiles.filter((f) => f.status === 'completed');
  const hasCompletedFiles = completedFiles.length > 0;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {isDragActive ? t('uploadDropHere') : t('uploadDropzone')}
          </p>
          <p className="text-xs text-gray-500">{t('uploadSupported')}</p>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadingFiles.map((uploadingFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="mt-2" />
                  )}

                  {uploadingFile.status === 'error' && (
                    <div className="flex items-center gap-1 mt-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs">{uploadingFile.error}</span>
                    </div>
                  )}

                  {uploadingFile.status === 'completed' && (
                    <div className="flex items-center gap-1 mt-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-xs">{t('uploadComplete')}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeFile(uploadingFile.file)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  disabled={uploadingFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {hasCompletedFiles && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {t('uploadedFilesCount', { count: completedFiles.length })}
          </p>
        </div>
      )}
    </div>
  );
}
