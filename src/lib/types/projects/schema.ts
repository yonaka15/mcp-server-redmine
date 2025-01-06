import { z } from "zod";

export const ProjectQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  status: z.union([z.literal(1), z.literal(5), z.literal(9)]).optional(), // 1: active, 5: archived, 9: closed
  include: z.string()
    .transform(str => 
      str.split(",")
        .map(s => s.trim())
        .filter(s => [
          "trackers",
          "issue_categories",
          "enabled_modules",
          "time_entry_activities",
          "issue_custom_fields"
        ].includes(s))
    )
    .optional(),
});

export const RedmineProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  identifier: z.string(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  status: z.number(),
  parent: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
  created_on: z.string(),
  updated_on: z.string(),
  is_public: z.boolean(),
  inherit_members: z.boolean().optional(),
  enabled_modules: z.array(z.string()).optional(),
  trackers: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  issue_categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  time_entry_activities: z.array(z.object({
    id: z.number(),
    name: z.string(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })).optional(),
  custom_fields: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.union([z.string(), z.array(z.string())]),
  })).optional(),
  default_version: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
  default_assignee: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
});

// Export the query params type
export type ProjectQueryParams = z.infer<typeof ProjectQuerySchema>;