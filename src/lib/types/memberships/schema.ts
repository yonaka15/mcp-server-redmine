import { z } from "zod";

export const RedmineMembershipRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  inherited: z.boolean().optional(),
});

export const RedmineMembershipSchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  group: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  roles: z.array(RedmineMembershipRoleSchema),
});

export const RedmineMembershipsResponseSchema = z.object({
  memberships: z.array(RedmineMembershipSchema),
  total_count: z.number(),
  offset: z.number(),
  limit: z.number(),
});
