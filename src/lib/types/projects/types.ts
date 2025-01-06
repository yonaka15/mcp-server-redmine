// Resource types
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