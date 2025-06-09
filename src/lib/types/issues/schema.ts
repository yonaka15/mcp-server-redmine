import { z } from "zod";

// チケット一覧取得時のincludeパラメータのバリデーション
export function validateListIssueIncludes(include: string): boolean {
  const LIST_ISSUE_INCLUDES = ['attachments', 'relations'] as const;
  type ListIssueInclude = typeof LIST_ISSUE_INCLUDES[number]; // 'attachments' | 'relations'
  const includes = include.split(',');
  return includes.every(inc => LIST_ISSUE_INCLUDES.includes(inc as ListIssueInclude));
}

export function validateShowIssueIncludes(include: string): boolean {
  const SHOW_ISSUE_INCLUDES = [
    'children',
    'attachments',
    'relations',
    'changesets',
    'journals',
    'watchers',
    'allowed_statuses'
  ] as const;
  type ShowIssueInclude = typeof SHOW_ISSUE_INCLUDES[number];
  const includes = include.split(',');
  return includes.every(inc => SHOW_ISSUE_INCLUDES.includes(inc as ShowIssueInclude));
}

// 基本クエリスキーマ
const baseQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  include: z.string().transform(str => str.split(",").filter(Boolean)).optional(),
  issue_id: z.union([z.number().int(), z.string()]).optional(),
  project_id: z.union([z.number().int(), z.string()]).optional(),
  subproject_id: z.string().optional(),
  tracker_id: z.number().int().optional(),
  status_id: z.union([
    z.literal("open"),
    z.literal("closed"),
    z.literal("*"),
    z.number().int()
  ]).optional(),
  assigned_to_id: z.union([z.number().int(), z.literal("me")]).optional(),
  parent_id: z.number().int().optional(),
  created_on: z.string().optional(),
  updated_on: z.string().optional(),
});

// カスタムフィールドを含むクエリスキーマの拡張
export const IssueQuerySchema = baseQuerySchema.catchall(z.union([z.string(), z.number()]));

const RedmineRelationSchema = z.object({
  id: z.number(),
  issue_id: z.number(),
  issue_to_id: z.number(),
  relation_type: z.string(),
  delay: z.number().nullable(),
});

export const RedmineIssueSchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  tracker: z.object({
    id: z.number(),
    name: z.string(),
  }),
  status: z.object({
    id: z.number(),
    name: z.string(),
    is_closed: z.boolean().optional(),
  }),
  priority: z.object({
    id: z.number(),
    name: z.string(),
  }),
  author: z.object({
    id: z.number(),
    name: z.string(),
  }),
  assigned_to: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  subject: z.string(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().nullable(),
  done_ratio: z.number(),
  estimated_hours: z.number().nullable(),
  spent_hours: z.number().optional(),
  total_estimated_hours: z.number().nullable(),
  total_spent_hours: z.number().optional(),
  custom_fields: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
    })
  ).optional(),
  created_on: z.string(),
  updated_on: z.string(),
  closed_on: z.string().nullable(),
  notes: z.string().optional(),
  private_notes: z.boolean().optional(),
  is_private: z.boolean().optional(),
  watcher_user_ids: z.array(z.number()).optional(),
  relations: z.array(RedmineRelationSchema).optional(),
  parent: z.object({
    id: z.number(),
  }).optional(),
});
