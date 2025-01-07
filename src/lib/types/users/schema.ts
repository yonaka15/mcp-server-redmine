import { z } from "zod";

/**
 * Redmineユーザースキーマ
 * - 管理者権限がない場合は限られたフィールドのみ返される
 * - 自分自身の情報を取得する場合は追加フィールドが返される
 */
export const RedmineUserSchema = z.object({
  // 基本フィールド（非管理者でも取得可能）
  firstname: z.string(),
  lastname: z.string(),
  created_on: z.string(),

  // 一般的なフィールド（オプショナル）
  id: z.number().optional(),
  mail: z.string().optional(),
  status: z.number().optional(),
  last_login_on: z.string().nullable().optional(),
  login: z.string().optional(),
  api_key: z.string().optional(),
  avatar_url: z.string().optional(),
  updated_on: z.string().optional(),
  admin: z.boolean().optional(),
  passwd_changed_on: z.string().optional(),

  // 追加情報（オプショナル）
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