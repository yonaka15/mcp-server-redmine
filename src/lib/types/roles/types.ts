/**
 * Role type definitions
 */
export interface RedmineRole {
  id: number;
  name: string;
  assignable?: boolean;
  issues_visibility?: string;
  time_entries_visibility?: string;
  users_visibility?: string;
  permissions?: string[];
}

export interface RedmineRolesResponse {
  roles: RedmineRole[];
}
