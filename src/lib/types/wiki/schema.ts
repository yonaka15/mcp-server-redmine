import { z } from "zod";

export const RedmineWikiPageSchema = z.object({
  title: z.string(),
  version: z.number().int().optional(),
  created_on: z.string().optional(),
  updated_on: z.string().optional(),
  author: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  text: z.string().optional(),
  comments: z.string().optional(),
  parent: z
    .object({
      title: z.string(),
    })
    .optional(),
  attachments: z
    .array(
      z.object({
        id: z.number(),
        filename: z.string(),
        filesize: z.number(),
        content_type: z.string(),
        description: z.string().optional(),
        content_url: z.string().optional(),
        author: z
          .object({
            id: z.number(),
            name: z.string(),
          })
          .optional(),
        created_on: z.string().optional(),
      })
    )
    .optional(),
});

export const RedmineWikiPageListItemSchema = z.object({
  title: z.string(),
  version: z.number().int().optional(),
});

export const RedmineWikiPageHistoryItemSchema = z.object({
  version: z.number().int(),
  author: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  comments: z.string().optional(),
  updated_on: z.string().optional(),
});

export const RedmineWikiPagesListResponseSchema = z.object({
  wiki_pages: z.array(RedmineWikiPageListItemSchema),
});

export const RedmineWikiPageResponseSchema = z.object({
  wiki_page: RedmineWikiPageSchema,
});

export const RedmineWikiPageHistoryResponseSchema = z.object({
  versions: z.array(RedmineWikiPageHistoryItemSchema),
});

export type RedmineWikiPage = z.infer<typeof RedmineWikiPageSchema>;
export type RedmineWikiPageListItem = z.infer<typeof RedmineWikiPageListItemSchema>;
export type RedmineWikiPageHistoryItem = z.infer<typeof RedmineWikiPageHistoryItemSchema>;
export type RedmineWikiPagesListResponse = z.infer<typeof RedmineWikiPagesListResponseSchema>;
export type RedmineWikiPageResponse = z.infer<typeof RedmineWikiPageResponseSchema>;
export type RedmineWikiPageHistoryResponse = z.infer<typeof RedmineWikiPageHistoryResponseSchema>;
