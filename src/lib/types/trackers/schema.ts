import { z } from "zod";

export const RedmineTrackerSchema = z.object({
  id: z.number(),
  name: z.string(),
  default_status: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  description: z.string().optional(),
  enabled_standard_fields: z.array(z.string()).optional(),
});

export const RedmineTrackersResponseSchema = z.object({
  trackers: z.array(RedmineTrackerSchema),
});
