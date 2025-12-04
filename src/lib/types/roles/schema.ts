import { z } from "zod";

export const RedmineRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  assignable: z.boolean().optional(),
  issues_visibility: z.string().optional(),
  time_entries_visibility: z.string().optional(),
  users_visibility: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const RedmineRolesResponseSchema = z.object({
  roles: z.array(RedmineRoleSchema),
});
