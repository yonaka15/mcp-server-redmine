import { z } from "zod";

export const RedmineUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  mail: z.string(),
  created_on: z.string(),
  last_login_on: z.string().nullable(),
  passwd_changed_on: z.string().optional(),
  api_key: z.string().optional(),
  status: z.number(),
  avatar_url: z.string(),
  updated_on: z.string().optional(),
  admin: z.boolean().optional(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  memberships: z
    .array(
      z.object({
        id: z.number().optional(),
        project: z.object({
          id: z.number(),
          name: z.string(),
        }),
        roles: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
      })
    )
    .optional(),
  groups: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
});

// ユーザー一覧クエリパラメータのスキーマ
export const UserQuerySchema = z.object({
  status: z.number().optional(),
  name: z.string().optional(),
  group_id: z.number().optional(),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

// ユーザー詳細取得パラメータのスキーマ
export const UserShowParamsSchema = z.object({
  include: z.string().optional(),
});

// includeパラメータのバリデーション
export function validateUserIncludes(include: string): boolean {
  const validIncludes = ["memberships", "groups"];
  const includes = include.split(",").map((i) => i.trim());
  return includes.every((i) => validIncludes.includes(i));
}

// レスポンス型定義
export interface RedmineUserResponse {
  user: z.infer<typeof RedmineUserSchema>;
}

export interface RedmineUsersResponse {
  users: z.infer<typeof RedmineUserSchema>[];
  total_count: number;
  offset?: number;
  limit?: number;
}

