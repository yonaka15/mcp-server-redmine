import { z } from "zod";
import {
  type Tool,
  TextContentSchema,
  ImageContentSchema,
  EmbeddedResourceSchema,
} from "@modelcontextprotocol/sdk/types.js";

// クエリパラメータのスキーマ定義
export const IssueQuerySchema = z.object({
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
  cf_x: z.string().optional(),
  created_on: z.string().optional(),
  updated_on: z.string().optional(),
});

export const ProjectQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  include: z.string()
    .transform(str => 
      str.split(",")
        .map(s => s.trim())
        .filter(s => [
          "trackers",
          "issue_categories",
          "enabled_modules",
          "time_entry_activities",
          "issue_custom_fields"
        ].includes(s))
    )
    .optional(),
});

export const TimeEntryQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  user_id: z.number().int().optional(),
  project_id: z.union([z.number().int(), z.string()]).optional(),
  spent_on: z.string().optional(),
  from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

// クエリパラメータの型定義
export type IssueQueryParams = z.infer<typeof IssueQuerySchema>;
export type ProjectQueryParams = z.infer<typeof ProjectQuerySchema>;
export type TimeEntryQueryParams = z.infer<typeof TimeEntryQuerySchema>;

// Issues
export interface RedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  fixed_version?: {
    id: number;
    name: string;
  };
  parent?: {
    id: number;
  };
  subject: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  estimated_hours?: number;
  spent_hours?: number;
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
  created_on: string;
  updated_on: string;
  closed_on?: string;
  notes?: string;
  private_notes?: boolean;
  is_private?: boolean;
  watcher_user_ids?: number[];
}

export interface RedmineIssueCreate {
  project_id: number;
  tracker_id?: number;
  status_id?: number;
  priority_id?: number;
  subject: string;
  description?: string;
  category_id?: number;
  fixed_version_id?: number;
  assigned_to_id?: number;
  parent_issue_id?: number;
  custom_fields?: {
    id: number;
    value: string | string[];
  }[];
  watcher_user_ids?: number[];
  is_private?: boolean;
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
}

export interface RedmineIssueUpdate extends Partial<RedmineIssueCreate> {
  notes?: string;
  private_notes?: boolean;
}

// Projects
export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  homepage?: string;
  status: number;
  parent?: {
    id: number;
    name: string;
  };
  created_on: string;
  updated_on: string;
  is_public: boolean;
  inherit_members?: boolean;
  enabled_modules?: string[];
  trackers?: {
    id: number;
    name: string;
  }[];
  issue_categories?: {
    id: number;
    name: string;
  }[];
  time_entry_activities?: {
    id: number;
    name: string;
    is_default?: boolean;
    active?: boolean;
  }[];
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
  default_version?: {
    id: number;
    name: string;
  };
  default_assignee?: {
    id: number;
    name: string;
  };
}

export interface RedmineProjectCreate {
  name: string;
  identifier: string;
  description?: string;
  homepage?: string;
  is_public?: boolean;
  parent_id?: number;
  inherit_members?: boolean;
  tracker_ids?: number[];
  enabled_module_names?: string[];
  issue_custom_field_ids?: number[];
  custom_field_values?: Record<string, string>;
  default_assigned_to_id?: number;
  default_version_id?: number;
}

// Time Entries
export interface RedmineTimeEntry {
  id: number;
  project: {
    id: number;
    name: string;
  };
  issue?: {
    id: number;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
  hours: number;
  comments?: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
}

export interface RedmineTimeEntryCreate {
  issue_id?: number;
  project_id?: number;
  spent_on?: string;
  hours: number;
  activity_id: number;
  comments?: string;
  user_id?: number;
  custom_field_values?: Record<string, string>;
}

export type RedmineTimeEntryUpdate = Partial<RedmineTimeEntryCreate>;

// APIレスポンスの型
export interface RedmineApiResponse<T> {
  offset?: number;
  limit?: number;
  total_count?: number;
  [key: string]: T | T[] | number | undefined;
}

export interface RedmineErrorResponse {
  errors: string[];
}

// リソース検証スキーマ
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
  }),
  priority: z.object({
    id: z.number(),
    name: z.string(),
  }),
  author: z.object({
    id: z.number(),
    name: z.string(),
  }),
  subject: z.string(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  done_ratio: z.number(),
  estimated_hours: z.number().optional(),
  spent_hours: z.number().optional(),
  custom_fields: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
    })
  ).optional(),
  created_on: z.string(),
  updated_on: z.string(),
  closed_on: z.string().optional(),
  notes: z.string().optional(),
  private_notes: z.boolean().optional(),
  is_private: z.boolean().optional(),
  watcher_user_ids: z.array(z.number()).optional(),
});

export const RedmineProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  identifier: z.string(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  status: z.number(),
  parent: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
  created_on: z.string(),
  updated_on: z.string(),
  is_public: z.boolean(),
  inherit_members: z.boolean().optional(),
  enabled_modules: z.array(z.string()).optional(),
  trackers: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  issue_categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  time_entry_activities: z.array(z.object({
    id: z.number(),
    name: z.string(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })).optional(),
  custom_fields: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.union([z.string(), z.array(z.string())]),
  })).optional(),
  default_version: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
  default_assignee: z.optional(z.object({
    id: z.number(),
    name: z.string(),
  })),
});

export const RedmineTimeEntrySchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  issue: z.optional(z.object({
    id: z.number(),
  })),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  activity: z.object({
    id: z.number(),
    name: z.string(),
  }),
  hours: z.number(),
  comments: z.string().optional(),
  spent_on: z.string(),
  created_on: z.string(),
  updated_on: z.string(),
  custom_fields: z.optional(z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
    })
  )),
});