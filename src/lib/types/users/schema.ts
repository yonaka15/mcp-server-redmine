import { z } from "zod";

// バリデーション関数
export function validateUserIncludes(include: string): boolean {
  const USER_INCLUDES = ['memberships', 'groups'] as const;
  const includes = include.split(',');
  return includes.every(inc => USER_INCLUDES.includes(inc as any));
}

// カスタムフィールドのスキーマ
const RedmineCustomFieldSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
});

// メンバーシップのスキーマ
const RedmineMembershipSchema = z.object({
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  roles: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })),
});

// グループのスキーマ
const RedmineGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// ユーザークエリパラメータのスキーマ
export const UserQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  status: z.union([
    z.literal(1),  // active
    z.literal(2),  // registered
    z.literal(3),  // locked
  ]).optional(),
  name: z.string().optional(),
  group_id: z.number().int().optional(),
});

// 詳細表示用パラメータのスキーマ
export const UserShowParamsSchema = z.object({
  include: z.string()
    .transform(str => str.split(",").filter(Boolean))
    .refine(
      arr => arr.every(inc => ['memberships', 'groups'].includes(inc)),
      { message: "Invalid include value. Allowed values: memberships, groups" }
    )
    .optional(),
});

// 完全なユーザーオブジェクトのスキーマ（管理者向け）
export const RedmineUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  mail: z.string(),
  created_on: z.string(),
  updated_on: z.string().optional(),
  last_login_on: z.string().optional(),
  passwd_changed_on: z.string().optional(),
  api_key: z.string().optional(),
  status: z.number().optional(),
  avatar_url: z.union([z.string(), z.null()]).optional(),
  custom_fields: z.array(RedmineCustomFieldSchema).optional(),
  memberships: z.array(RedmineMembershipSchema).optional(),
  groups: z.array(RedmineGroupSchema).optional(),
});

// 制限されたユーザーオブジェクトのスキーマ（一般ユーザー向け）
export const RedmineUserLimitedSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  mail: z.string().optional(),
  created_on: z.string(),
  last_login_on: z.string().optional(),
});

// レスポンススキーマ
export const RedmineUserResponseSchema = z.object({
  user: RedmineUserSchema,
});

export const RedmineUsersResponseSchema = z.object({
  users: z.array(RedmineUserSchema),
  total_count: z.number(),
  offset: z.number(),
  limit: z.number(),
});