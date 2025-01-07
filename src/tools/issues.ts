import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Issue search tool
 */
export const ISSUE_SEARCH_TOOL: Tool = {
  name: "search_issues",
  description: 
    "Search for Redmine issues.\n" +
    "- Filter by issue ID, project ID, status, assignee, etc.\n" +
    "- Full text search with keywords\n" +
    "- Retrieve up to 100 issues",
  inputSchema: {
    type: "object",
    properties: {
      status_id: {
        type: "string",
        description: "Status ('open', 'closed', '*', or specific ID)",
        default: "open",
        enum: ["open", "closed", "*"]
      },
      project_id: {
        type: ["string", "number"],
        description: "Project ID (optional)"
      },
      assigned_to_id: {
        type: ["string", "number"],
        description: "Assignee ID (optional)"
      },
      limit: {
        type: "number",
        description: "Number of results (1-100)",
        minimum: 1,
        maximum: 100,
        default: 25
      },
      offset: {
        type: "number",
        description: "Number of results to skip",
        minimum: 0,
        default: 0
      },
      sort: {
        type: "string",
        description: "Sort field (e.g., 'updated_on:desc')",
        pattern: "^[a-z_]+(:(asc|desc))?$"
      }
    }
  }
};

/**
 * Issue creation tool
 */
export const ISSUE_CREATE_TOOL: Tool = {
  name: "create_issue",
  description:
    "Create a new issue.\n" +
    "- Project ID and subject are required\n" +
    "- Can specify tracker, status, priority\n" +
    "- Supports custom field values",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "Project ID"
      },
      subject: {
        type: "string",
        description: "Issue subject"
      },
      description: {
        type: "string",
        description: "Issue description"
      },
      tracker_id: {
        type: "number",
        description: "Tracker ID"
      },
      status_id: {
        type: "number",
        description: "Status ID"
      },
      priority_id: {
        type: "number",
        description: "Priority ID"
      },
      assigned_to_id: {
        type: "number",
        description: "Assignee ID"
      },
      category_id: {
        type: "number",
        description: "Category ID"
      },
      fixed_version_id: {
        type: "number",
        description: "Target version ID"
      },
      parent_issue_id: {
        type: "number",
        description: "Parent issue ID"
      },
      start_date: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)"
      },
      due_date: {
        type: "string",
        description: "Due date (YYYY-MM-DD format)"
      },
      estimated_hours: {
        type: "number",
        description: "Estimated hours"
      },
      done_ratio: {
        type: "number",
        description: "Completion percentage (0-100)"
      }
    },
    required: ["project_id", "subject"]
  }
};

/**
 * Issue update tool
 */
export const ISSUE_UPDATE_TOOL: Tool = {
  name: "update_issue",
  description:
    "Update an existing issue.\n" +
    "- Issue ID is required\n" +
    "- Only specify fields to be updated\n" +
    "- Can add comments",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue ID to update"
      },
      subject: {
        type: "string",
        description: "Issue subject"
      },
      description: {
        type: "string",
        description: "Issue description"
      },
      status_id: {
        type: "number",
        description: "Status ID"
      },
      priority_id: {
        type: "number",
        description: "Priority ID"
      },
      assigned_to_id: {
        type: "number",
        description: "Assignee ID"
      },
      category_id: {
        type: "number",
        description: "Category ID"
      },
      fixed_version_id: {
        type: "number",
        description: "Target version ID"
      },
      notes: {
        type: "string",
        description: "Comment for the update"
      },
      private_notes: {
        type: "boolean",
        description: "Make comment private"
      }
    },
    required: ["id"]
  }
};

/**
 * Issue deletion tool
 */
export const ISSUE_DELETE_TOOL: Tool = {
  name: "delete_issue",
  description:
    "Delete an issue.\n" +
    "- Specify issue ID\n" +
    "- This action cannot be undone",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue ID to delete"
      }
    },
    required: ["id"]
  }
};