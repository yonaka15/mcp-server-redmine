import { z } from "zod";

export const RedmineVersionSchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(["open", "locked", "closed"]),
  due_date: z.string().nullable().optional(),
  sharing: z.enum(["none", "descendants", "hierarchy", "tree", "system"]),
  wiki_page_title: z.string().optional(),
  estimated_hours: z.number().optional(),
  spent_hours: z.number().optional(),
  created_on: z.string(),
  updated_on: z.string(),
});

export const RedmineVersionsResponseSchema = z.object({
  versions: z.array(RedmineVersionSchema),
  total_count: z.number(),
});
