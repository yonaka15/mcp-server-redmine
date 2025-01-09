// Base User Information
export interface RedmineUser {
  // Basic fields (always available)
  id: number;
  firstname: string;
  lastname: string;
  created_on: string;
  
  // Fields available based on permissions
  login?: string;
  mail?: string;
  last_login_on?: string | null;
  passwd_changed_on?: string;
  api_key?: string;
  status?: number;
  avatar_url?: string;
  updated_on?: string;
  admin?: boolean;
  
  // Optional associations
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  memberships?: Array<{
    id?: number;
    project: {
      id: number;
      name: string;
    };
    roles: Array<{
      id: number;
      name: string;
    }>;
  }>;
  groups?: Array<{
    id: number;
    name: string;
  }>;
}

// User List Response
export interface RedmineUserList {
  users: RedmineUser[];
  total_count: number;
  offset?: number;
  limit?: number;
}

// Redmine API User Response
export interface RedmineUsersResponse {
  users: RedmineUser[];
  total_count: number;
  offset?: number;
  limit?: number;
}

// Redmine API Single User Response
export interface RedmineUserResponse {
  user: RedmineUser;
}

// User List Parameters
export interface UserListParams {
  status?: number; // 1=active, 2=registered, 3=locked
  name?: string; // Filter: login name, first name, last name, email
  group_id?: number; // Filter: group ID
  offset?: number; // Pagination: number to skip
  limit?: number; // Pagination: page size (max: 100)
}

// Single User Parameters
export interface UserShowParams {
  include?: string; // Optional: 'memberships' and/or 'groups' (comma separated)
}

// User Creation Parameters
export interface RedmineUserCreate {
  login: string;
  password?: string;
  firstname: string;
  lastname: string;
  mail: string;
  auth_source_id?: number;
  mail_notification?: string;
  must_change_passwd?: boolean;
  generate_password?: boolean;
  status?: number;
  custom_fields?: Record<string, unknown>;
  send_information?: boolean;
}

// User Update Parameters
export interface RedmineUserUpdate {
  login?: string;
  firstname?: string;
  lastname?: string;
  mail?: string;
  password?: string;
  auth_source_id?: number;
  mail_notification?: string;
  must_change_passwd?: boolean;
  admin?: boolean;
  status?: number;
  custom_fields?: Record<string, unknown>;
}