import { z } from "zod";

export const TimeEntryQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  user_id: z.number().int().optional(),
  project_id: z.union([z.number().int(), z.string()]).optional(),
  spent_on: z.string().optional(),
  from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

export const RedmineTimeEntrySchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  issue: z.optional(z.object({
    id: z.number(),
  })),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  activity: z.object({
    id: z.number(),
    name: z.string(),
  }),
  hours: z.number(),
  comments: z.string().optional(),
  spent_on: z.string(),
  created_on: z.string(),
  updated_on: z.string(),
  custom_fields: z.optional(z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
    })
  )),
});

// Export the query params type
export type TimeEntryQueryParams = z.infer<typeof TimeEntryQuerySchema>;