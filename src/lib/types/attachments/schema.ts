import { z } from "zod";

/**
 * Schema for Redmine attachment
 */
export const RedmineAttachmentSchema = z.object({
  id: z.number(),
  filename: z.string(),
  filesize: z.number(),
  content_type: z.string(),
  description: z.string().optional(),
  content_url: z.string(),
  thumbnail_url: z.string().optional(),
  author: z.object({
    id: z.number(),
    name: z.string(),
  }),
  created_on: z.string(),
});

/**
 * Schema for upload response
 */
export const RedmineUploadResponseSchema = z.object({
  upload: z.object({
    token: z.string(),
  }),
});

/**
 * Schema for attachment upload (when attaching to issue)
 */
export const RedmineAttachmentUploadSchema = z.object({
  token: z.string(),
  filename: z.string(),
  content_type: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for single attachment response
 */
export const RedmineAttachmentResponseSchema = z.object({
  attachment: RedmineAttachmentSchema,
});

/**
 * Schema for attachment update
 */
export const RedmineAttachmentUpdateSchema = z.object({
  filename: z.string().optional(),
  description: z.string().optional(),
});
