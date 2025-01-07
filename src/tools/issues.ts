import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List issues tool
export const ISSUE_LIST_TOOL: Tool = {
  name: "list_issues",
  description: 
    "List Redmine issues with filtering and pagination.\n" +
    "- Filter by project, tracker, status, assignee\n" +
    "- Custom field filtering with cf_x parameters\n" +
    "- Sort results by any field\n" +
    "- Include related data (attachments, relations)",
  inputSchema: {
    type: "object",
    properties: {
      // Pagination
      offset: {
        type: "number",
        description: "Number of issues to skip",
        minimum: 0,
      },
      limit: {
        type: "number",
        description: "Issues per page (max: 100)",
        minimum: 1,
        maximum: 100,
        default: 25,
      },
      // Sorting
      sort: {
        type: "string",
        description: "Sort field with optional direction (e.g. updated_on:desc, priority:asc)",
        pattern: "^[a-z_]+(:(asc|desc))?$",
      },
      // Include additional data
      include: {
        type: "string",
        description: "Additional data to include (comma-separated): attachments, relations",
        pattern: "^(attachments|relations)(,(attachments|relations))*$",
      },
      // Basic filters
      issue_id: {
        type: ["string", "number"],
        description: "Single issue ID or comma-separated list",
      },
      project_id: {
        type: ["string", "number"],
        description: "Project ID",
      },
      subproject_id: {
        type: "string",
        description: "Subproject filter ('!*' to exclude subprojects)",
      },
      tracker_id: {
        type: "number",
        description: "Tracker ID",
      },
      status_id: {
        type: ["string", "number"],
        description: "Status filter: 'open', 'closed', '*' or specific ID",
        enum: ["open", "closed", "*"],
      },
      assigned_to_id: {
        type: ["string", "number"],
        description: "Assignee ID or 'me' for current user",
      },
      parent_id: {
        type: "number",
        description: "Parent issue ID",
      },
      // Date filters (ISO format with optional operators)
      created_on: {
        type: "string",
        description: "Filter by creation date (e.g. >=2024-01-01)",
        pattern: "^(>=|<=|><)?\\d{4}-\\d{2}-\\d{2}(\\|\\d{4}-\\d{2}-\\d{2})?$",
      },
      updated_on: {
        type: "string",
        description: "Filter by update date (e.g. >=2024-01-01T00:00:00Z)",
        pattern: "^(>=|<=|><)?\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}Z)?(\\|\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}Z)?)?$",
      },
      // Custom fields (dynamic property names)
      additionalProperties: {
        type: ["string", "number"],
        pattern: "^cf_\\d+$",
      },
    },
  },
};

// Create issue tool
export const ISSUE_CREATE_TOOL: Tool = {
  name: "create_issue",
  description: "Create a new issue",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "Project ID",
      },
      tracker_id: {
        type: "number",
        description: "Tracker ID",
      },
      status_id: {
        type: "number",
        description: "Status ID",
      },
      priority_id: {
        type: "number",
        description: "Priority ID",
      },
      subject: {
        type: "string",
        description: "Issue subject",
      },
      description: {
        type: "string",
        description: "Issue description",
      },
      category_id: {
        type: "number",
        description: "Category ID",
      },
      fixed_version_id: {
        type: "number",
        description: "Target version ID",
      },
      assigned_to_id: {
        type: "number",
        description: "Assignee user ID",
      },
      parent_issue_id: {
        type: "number",
        description: "Parent issue ID",
      },
      custom_fields: {
        type: "array",
        description: "Custom field values",
        items: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Custom field ID",
            },
            value: {
              type: ["string", "array"],
              description: "Custom field value(s)",
              items: {
                type: "string",
              },
            },
          },
          required: ["id", "value"],
        },
      },
      watcher_user_ids: {
        type: "array",
        description: "User IDs to add as watchers",
        items: {
          type: "number",
        },
      },
      is_private: {
        type: "boolean",
        description: "Whether the issue is private",
      },
      estimated_hours: {
        type: "number",
        description: "Estimated hours",
      },
      start_date: {
        type: "string",
        description: "Start date (YYYY-MM-DD)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      due_date: {
        type: "string",
        description: "Due date (YYYY-MM-DD)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
    },
    required: ["project_id", "subject"],
  },
};

// Update issue tool
export const ISSUE_UPDATE_TOOL: Tool = {
  name: "update_issue",
  description: "Update an existing issue",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue ID to update",
      },
      // Same properties as create_issue, but all optional
      project_id: {
        type: "number",
        description: "Project ID",
      },
      tracker_id: {
        type: "number",
        description: "Tracker ID",
      },
      status_id: {
        type: "number",
        description: "Status ID",
      },
      priority_id: {
        type: "number",
        description: "Priority ID",
      },
      subject: {
        type: "string",
        description: "Issue subject",
      },
      description: {
        type: "string",
        description: "Issue description",
      },
      category_id: {
        type: "number",
        description: "Category ID",
      },
      fixed_version_id: {
        type: "number",
        description: "Target version ID",
      },
      assigned_to_id: {
        type: "number",
        description: "Assignee user ID",
      },
      parent_issue_id: {
        type: "number",
        description: "Parent issue ID",
      },
      custom_fields: {
        type: "array",
        description: "Custom field values",
        items: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Custom field ID",
            },
            value: {
              type: ["string", "array"],
              description: "Custom field value(s)",
              items: {
                type: "string",
              },
            },
          },
          required: ["id", "value"],
        },
      },
      notes: {
        type: "string",
        description: "Comments about the update",
      },
      private_notes: {
        type: "boolean",
        description: "Whether the notes are private",
      },
      is_private: {
        type: "boolean",
        description: "Whether the issue is private",
      },
      estimated_hours: {
        type: "number",
        description: "Estimated hours",
      },
      start_date: {
        type: "string",
        description: "Start date (YYYY-MM-DD)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      due_date: {
        type: "string",
        description: "Due date (YYYY-MM-DD)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
    },
    required: ["id"],
  },
};

// Delete issue tool
export const ISSUE_DELETE_TOOL: Tool = {
  name: "delete_issue",
  description: "Delete an issue",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue ID to delete",
      },
    },
    required: ["id"],
  },
};

// Add issue watcher tool
export const ISSUE_ADD_WATCHER_TOOL: Tool = {
  name: "add_issue_watcher",
  description: "Add a user as a watcher to an issue",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "number",
        description: "Issue ID",
      },
      user_id: {
        type: "number",
        description: "User ID to add as a watcher",
      },
    },
    required: ["issue_id", "user_id"],
  },
};

// Remove issue watcher tool
export const ISSUE_REMOVE_WATCHER_TOOL: Tool = {
  name: "remove_issue_watcher",
  description: "Remove a user from issue watchers",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "number",
        description: "Issue ID",
      },
      user_id: {
        type: "number",
        description: "User ID to remove from watchers",
      },
    },
    required: ["issue_id", "user_id"],
  },
};