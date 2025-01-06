// Resource types
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