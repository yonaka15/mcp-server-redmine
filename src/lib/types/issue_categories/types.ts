/**
 * Issue Category type definitions
 */
export interface RedmineIssueCategory {
  id: number;
  project: {
    id: number;
    name: string;
  };
  name: string;
  assigned_to?: {
    id: number;
    name: string;
  };
}

export interface RedmineIssueCategoriesResponse {
  issue_categories: RedmineIssueCategory[];
}

export interface RedmineIssueCategoryCreate {
  name: string;
  assigned_to_id?: number;
}

export type RedmineIssueCategoryUpdate = Partial<RedmineIssueCategoryCreate>;
