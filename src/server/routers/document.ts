import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '../db/client';
import {
  generateUploadUrl,
  generateDownloadUrl,
  deleteFileFromStorage,
  calculateFileHash,
  getFileFromStorage,
} from '../services/documents/storage';
import {
  analyzeDocuments,
  getSystemDocumentAnalysis,
} from '../services/documents/analyzer';
import {
  generateDocument,
  listSystemDocuments,
  deleteDocument,
  type DocumentTranslations,
} from '../services/documents/generator';
import { PLAN_LIMITS } from '@/lib/constants';
import { DocType } from '@prisma/client';

/**
 * Document upload/analysis tRPC router
 */
export const documentRouter = router({
  /**
   * Get presigned URL for uploading a document
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
        fileName: z.string().min(1).max(255),
        fileType: z.enum(['pdf', 'docx', 'md', 'txt']),
        fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const planLimit = PLAN_LIMITS[ctx.organization.plan].documentUpload;

      if (!planLimit.enabled) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Document upload is not available on your plan. Please upgrade.',
        });
      }

      // Check if system exists and belongs to organization
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
        include: {
          uploadedDocuments: true,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Check document count limit
      if (system.uploadedDocuments.length >= planLimit.maxFiles) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You can upload up to ${planLimit.maxFiles} files per system on your plan.`,
        });
      }

      // Generate presigned upload URL
      const { uploadUrl, fileKey } = await generateUploadUrl(
        ctx.organization.id,
        input.systemId,
        input.fileName,
        input.fileType
      );

      // Create document record in database
      const document = await ctx.prisma.systemDocument.create({
        data: {
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          fileUrl: fileKey,
          systemId: input.systemId,
          organizationId: ctx.organization.id,
          analysisStatus: 'PENDING',
        },
      });

      return {
        uploadUrl,
        documentId: document.id,
      };
    }),

  /**
   * Confirm upload and calculate integrity hash
   */
  confirmUpload: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.systemDocument.findFirst({
        where: {
          id: input.documentId,
          organizationId: ctx.organization.id,
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Download file and calculate hash
      const fileBuffer = await getFileFromStorage(document.fileUrl);
      const integrityHash = calculateFileHash(fileBuffer);

      // Update document with hash
      await ctx.prisma.systemDocument.update({
        where: { id: input.documentId },
        data: { integrityHash },
      });

      return { success: true };
    }),

  /**
   * Trigger document analysis
   */
  analyze: protectedProcedure
    .input(
      z.object({
        documentIds: z.array(z.string()).min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all documents belong to user's organization
      const documents = await ctx.prisma.systemDocument.findMany({
        where: {
          id: { in: input.documentIds },
          organizationId: ctx.organization.id,
        },
      });

      if (documents.length !== input.documentIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some documents were not found',
        });
      }

      // All documents should belong to the same system
      const systemIds = [...new Set(documents.map((d) => d.systemId))];
      if (systemIds.length > 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All documents must belong to the same AI system',
        });
      }

      const systemId = systemIds[0];

      // Run analysis
      const analysisResult = await analyzeDocuments({
        systemId,
        documentIds: input.documentIds,
      });

      return analysisResult;
    }),

  /**
   * Get analysis results for a system
   */
  getAnalysis: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify system belongs to organization
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      return getSystemDocumentAnalysis(input.systemId);
    }),

  /**
   * List all documents for a system
   */
  listForSystem: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.prisma.systemDocument.findMany({
        where: {
          systemId: input.systemId,
          organizationId: ctx.organization.id,
        },
        orderBy: { createdAt: 'desc' },
      });

      return documents;
    }),

  /**
   * Get download URL for a document
   */
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.systemDocument.findFirst({
        where: {
          id: input.documentId,
          organizationId: ctx.organization.id,
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      const downloadUrl = await generateDownloadUrl(document.fileUrl);

      return { downloadUrl };
    }),

  /**
   * Delete a document
   */
  delete: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.systemDocument.findFirst({
        where: {
          id: input.documentId,
          organizationId: ctx.organization.id,
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Delete from storage
      await deleteFileFromStorage(document.fileUrl);

      // Delete from database
      await ctx.prisma.systemDocument.delete({
        where: { id: input.documentId },
      });

      return { success: true };
    }),

  // ============================================
  // PDF GENERATION ENDPOINTS
  // ============================================

  /**
   * Generate a PDF compliance document
   */
  generate: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(DocType),
        systemId: z.string(),
        translations: z.any(), // DocumentTranslations object passed from frontend
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const planLimit = PLAN_LIMITS[ctx.organization.plan];

      if (!planLimit.docGeneration) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Document generation is not available on your plan. Please upgrade to Starter or higher.',
        });
      }

      // Verify system belongs to organization
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Check if system is classified (required for most document types)
      if (!system.riskLevel && input.type !== DocType.ANNEX_IV) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'System must be classified before generating this document type',
        });
      }

      // Generate the document
      const result = await generateDocument({
        type: input.type,
        systemId: input.systemId,
        organizationId: ctx.organization.id,
        locale: ctx.organization.locale,
        translations: input.translations as DocumentTranslations,
      });

      return result;
    }),

  /**
   * List generated PDF documents for a system
   */
  listGenerated: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify system belongs to organization
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      return listSystemDocuments(input.systemId, ctx.organization.id);
    }),

  /**
   * Get download URL for generated PDF
   */
  getGeneratedDownloadUrl: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
          organizationId: ctx.organization.id,
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      if (!document.fileUrl) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Document file not available',
        });
      }

      const downloadUrl = await generateDownloadUrl(document.fileUrl);

      return { downloadUrl };
    }),

  /**
   * Delete a generated PDF document
   */
  deleteGenerated: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await deleteDocument(input.documentId, ctx.organization.id);

      return { success: true };
    }),
});
