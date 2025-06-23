import { z } from "zod";

// インクルード可能な値のリスト（GET /issues.json）
export function validateListIssueIncludes(include: string): boolean {
  const LIST_ISSUE_INCLUDES = ['attachments', 'relations'] as const;
  const includes = include.split(',');
  return includes.every(inc => LIST_ISSUE_INCLUDES.includes(inc as typeof LIST_ISSUE_INCLUDES[number]));
}

// インクルード可能な値のリスト（GET /issues/:id.json）
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
  const includes = include.split(',');
  return includes.every(inc => SHOW_ISSUE_INCLUDES.includes(inc as typeof SHOW_ISSUE_INCLUDES[number]));
}

// 基本的なクエリパラメータスキーマ
const baseQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  include: z.string().transform(str => str.split(",").filter(Boolean)).optional(), // カンマ区切り文字列を配列に変換
  issue_id: z.union([z.number().int(), z.string()]).optional(),
  project_id: z.union([z.number().int(), z.string()]).optional(),
  subproject_id: z.string().optional(), // e.g., '!*' or project_identifier
  tracker_id: z.number().int().optional(),
  status_id: z.union([
    z.literal("open"),
    z.literal("closed"),
    z.literal("*"), // all
    z.number().int()
  ]).optional(),
  assigned_to_id: z.union([z.number().int(), z.literal("me")]).optional(),
  parent_id: z.number().int().optional(), // Redmine 4.2.0以降 parent_issue_id
  created_on: z.string().optional(), // e.g., ">=2023-01-01", "<=2023-01-31", "><2023-01-01|2023-01-31"
  updated_on: z.string().optional(),
});

// カスタムフィールドを含む可能性のあるクエリパラメータスキーマ
export const IssueQuerySchema = baseQuerySchema.catchall(z.union([z.string(), z.number()]));

const RedmineRelationSchema = z.object({
  id: z.number(),
  issue_id: z.number(),
  issue_to_id: z.number(),
  relation_type: z.string(), // e.g., "relates", "duplicates", "blocks"
  delay: z.number().nullable(), // 遅延日数
});

const AllowedStatusSchema = z.object({
    id: z.number(),
    name: z.string(),
    is_closed: z.boolean().optional(),
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
    is_closed: z.boolean().optional(), // Added based on typical Redmine response
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
  category: z.object({ id: z.number(), name: z.string() }).optional(), // Added for completeness, often present
  subject: z.string(),
  description: z.string().optional().nullable(), // Can be null
  start_date: z.string().optional().nullable(), // YYYY-MM-DD or null
  due_date: z.string().nullable().optional(), // YYYY-MM-DD or null, made optional for consistency with reference doc
  done_ratio: z.number(),
  // is_private: z.boolean().optional(),
  estimated_hours: z.number().nullable().optional(),
  spent_hours: z.number().optional(), // Redmine 3. Spent time for issue
  total_estimated_hours: z.number().nullable().optional(), // Redmine 3. Total estimated hours for issue (including subtasks)
  total_spent_hours: z.number().optional(), // Redmine 3. Total spent hours for issue (including subtasks)
  custom_fields: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      value: z.union([z.string(), z.array(z.string()), z.null()]), // Value can be string, array of strings, or null
    })
  ).optional(),
  created_on: z.string(), // datetime
  updated_on: z.string(), // datetime
  closed_on: z.string().nullable().optional(), // datetime or null
  // Optional fields based on 'include' parameter
  notes: z.string().optional(), // for journals
  private_notes: z.boolean().optional(), // for journals if the user has permission
  is_private: z.boolean().optional(),
  watcher_user_ids: z.array(z.number()).optional(),
  relations: z.array(RedmineRelationSchema).optional(),
  parent: z.object({ // parent issue id
    id: z.number(),
  }).optional(),
  // children: z.array(RedmineIssueSchema).optional(), // Recursive, handle carefully or omit if not directly nesting
  
  // Added based on the reference document for list_project_statuses
  allowed_statuses: z.array(AllowedStatusSchema).optional(),
});
