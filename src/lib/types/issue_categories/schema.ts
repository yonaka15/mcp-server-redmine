import { z } from "zod";

export const RedmineIssueCategorySchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  name: z.string(),
  assigned_to: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
});

export const RedmineIssueCategoriesResponseSchema = z.object({
  issue_categories: z.array(RedmineIssueCategorySchema),
});
