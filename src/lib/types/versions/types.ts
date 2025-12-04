/**
 * Version type definitions
 */
export interface RedmineVersion {
  id: number;
  project: {
    id: number;
    name: string;
  };
  name: string;
  description?: string;
  status: "open" | "locked" | "closed";
  due_date?: string | null;
  sharing: "none" | "descendants" | "hierarchy" | "tree" | "system";
  wiki_page_title?: string;
  estimated_hours?: number;
  spent_hours?: number;
  created_on: string;
  updated_on: string;
}

export interface RedmineVersionsResponse {
  versions: RedmineVersion[];
  total_count: number;
}

export interface RedmineVersionCreate {
  name: string;
  status?: "open" | "locked" | "closed";
  sharing?: "none" | "descendants" | "hierarchy" | "tree" | "system";
  due_date?: string;
  description?: string;
  wiki_page_title?: string;
}

export type RedmineVersionUpdate = Partial<RedmineVersionCreate>;
