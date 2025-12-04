/**
 * Tracker type definition
 */
export interface RedmineTracker {
  id: number;
  name: string;
  default_status?: {
    id: number;
    name: string;
  };
  description?: string;
  enabled_standard_fields?: string[];
}

export interface RedmineTrackersResponse {
  trackers: RedmineTracker[];
}
