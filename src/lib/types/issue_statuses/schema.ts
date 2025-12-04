import { z } from "zod";

export const RedmineIssueStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_closed: z.boolean(),
});

export const RedmineIssueStatusesResponseSchema = z.object({
  issue_statuses: z.array(RedmineIssueStatusSchema),
});
