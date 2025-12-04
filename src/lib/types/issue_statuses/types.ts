/**
 * Issue Status type definition
 */
export interface RedmineIssueStatus {
  id: number;
  name: string;
  is_closed: boolean;
}

export interface RedmineIssueStatusesResponse {
  issue_statuses: RedmineIssueStatus[];
}
