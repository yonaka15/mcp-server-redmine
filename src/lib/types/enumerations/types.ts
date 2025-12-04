/**
 * Enumeration types (priorities, activities, document categories)
 */
export interface RedmineEnumeration {
  id: number;
  name: string;
  is_default: boolean;
}

export interface RedmineIssuePrioritiesResponse {
  issue_priorities: RedmineEnumeration[];
}

export interface RedmineTimeEntryActivitiesResponse {
  time_entry_activities: RedmineEnumeration[];
}

export interface RedmineDocumentCategoriesResponse {
  document_categories: RedmineEnumeration[];
}
