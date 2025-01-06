// 一覧取得用の有効なinclude値
const LIST_ISSUE_INCLUDES = ['attachments', 'relations'] as const;
type ListIssueInclude = typeof LIST_ISSUE_INCLUDES[number];

// 単一チケット取得用の有効なinclude値
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

// Query params
export interface IssueListParams {
  offset?: number;
  limit?: number;
  sort?: string;
  include?: string;
  issue_id?: number | string;
  project_id?: number | string;
  subproject_id?: string;
  tracker_id?: number;
  status_id?: "open" | "closed" | "*" | number;
  assigned_to_id?: number | "me";
  parent_id?: number;
  created_on?: string;
  updated_on?: string;
  [key: `cf_${number}`]: string;
}

export interface IssueShowParams {
  include?: string;
}

// Resource types
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
    is_closed?: boolean;
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
  due_date?: string | null;
  done_ratio: number;
  estimated_hours?: number | null;
  total_estimated_hours?: number | null;
  spent_hours?: number;
  total_spent_hours?: number;
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
  created_on: string;
  updated_on: string;
  closed_on?: string | null;
  notes?: string;
  private_notes?: boolean;
  is_private?: boolean;
  watcher_user_ids?: number[];
  relations?: {
    id: number,
    issue_id: number,
    issue_to_id: number,
    relation_type: string,
    delay: number | null,
  }[];
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