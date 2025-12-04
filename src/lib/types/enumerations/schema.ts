import { z } from "zod";

export const RedmineEnumerationSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_default: z.boolean(),
});

export const RedmineIssuePrioritiesResponseSchema = z.object({
  issue_priorities: z.array(RedmineEnumerationSchema),
});

export const RedmineTimeEntryActivitiesResponseSchema = z.object({
  time_entry_activities: z.array(RedmineEnumerationSchema),
});

export const RedmineDocumentCategoriesResponseSchema = z.object({
  document_categories: z.array(RedmineEnumerationSchema),
});
