import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List issues tool
export const ISSUE_LIST_TOOL: Tool = {
  name: "list_issues",
  description:
    "List and search Redmine issues. " +
    "Provides flexible filtering and sorting options. " +
    "Supports filtering by custom fields using field IDs and patterns. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      // Pagination
      offset: {
        type: "number",
        description: "Number of issues to skip",
        default: 0,
        minimum: 0,
      },
      limit: {
        type: "number",
        description: "Maximum issues to return, from 1 to 100",
        minimum: 1,
        maximum: 100,
        default: 25,
      },
      // Sorting
      sort: {
        type: "string",
        description:
          "Sort field and direction like last.updated:desc or priority:asc",
        pattern: "^[a-z_]+(:(asc|desc))?$",
      },
      // Include additional data
      include: {
        type: "string",
        description:
          "Additional data to include as comma separated values\n" +
          "- attachments: file attachments\n" +
          "- relations: issue relations",
        pattern: "^(attachments|relations)(,(attachments|relations))*$",
      },
      // Basic filters
      issue_id: {
        type: "string",
        description: "Filter by one or more issue IDs as comma separated list",
      },
      project_id: {
        type: "string",
        description: "Filter by project ID as number or key as text",
      },
      subproject_id: {
        type: "string",
        description:
          "Control subproject inclusion. Use !* to exclude subprojects",
      },
      tracker_id: {
        type: "number",
        description: "Filter by tracker ID",
      },
      status_id: {
        type: "string",
        description: "Filter by open, closed, * for any, or specific status ID",
        enum: ["open", "closed", "*"],
      },
      assigned_to_id: {
        type: "string",
        description: "Filter by assignee. Use me for your assignments",
      },
      parent_id: {
        type: "number",
        description: "Filter by parent issue ID",
      },
      // Date filters
      created_on: {
        type: "string",
        description: "Filter by creation date like >=2024-01-01",
        pattern: "^(>=|<=|><)?\\d{4}-\\d{2}-\\d{2}(\\|\\d{4}-\\d{2}-\\d{2})?$",
      },
      updated_on: {
        type: "string",
        description: "Filter by update date like >=2024-01-01T00:00:00Z",
        pattern:
          "^(>=|<=|><)?\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}Z)?(\\|\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}Z)?)?$",
      },
      // Custom fields
      additionalProperties: {
        type: "string",
        pattern: "^cf_\\d+$",
      },
    },
  },
};

// Create issue tool
export const ISSUE_CREATE_TOOL: Tool = {
  name: "create_issue",
  description:
    "Create a new issue. " +
    "Requires project ID and subject fields. " +
    "Returns success or validation error status. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "Project ID where issue will be created",
      },
      tracker_id: {
        type: "number",
        description: "Type of issue determined by tracker ID",
      },
      status_id: {
        type: "number",
        description: "Initial status ID for the issue",
      },
      priority_id: {
        type: "number",
        description: "Priority level ID",
      },
      subject: {
        type: "string",
        description: "Issue title or summary",
      },
      description: {
        type: "string",
        description: "Detailed issue description",
      },
      category_id: {
        type: "number",
        description: "Issue category ID",
      },
      fixed_version_id: {
        type: "number",
        description: "Target version or milestone ID",
      },
      assigned_to_id: {
        type: "number",
        description: "User ID to assign this issue to",
      },
      parent_issue_id: {
        type: "number",
        description: "Parent issue ID for subtasks",
      },
      custom_fields: {
        type: "array",
        description: "List of custom field values",
        items: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Custom field ID",
            },
            value: {
              type: "string",
              description: "Value or list of values for the field as JSON string",
            },
          },
          required: ["id", "value"],
        },
      },
      watcher_user_ids: {
        type: "array",
        description: "List of user IDs to add as watchers",
        items: {
          type: "number",
        },
      },
      is_private: {
        type: "boolean",
        description: "Set true to make issue private",
      },
      estimated_hours: {
        type: "number",
        description: "Estimated time in hours",
      },
      start_date: {
        type: "string",
        description: "Issue start date as YYYY-MM-DD",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      due_date: {
        type: "string",
        description: "Issue due date as YYYY-MM-DD",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
    },
    required: ["project_id", "subject"],
  },
};

// Update issue tool
export const ISSUE_UPDATE_TOOL: Tool = {
  name: "update_issue",
  description:
    "Update an existing issue. " +
    "Modify any issue fields as needed. " +
    "Returns success or validation error status. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of issue to update",
      },
      project_id: {
        type: "number",
        description: "Move issue to this project ID",
      },
      tracker_id: {
        type: "number",
        description: "Change issue type to this tracker ID",
      },
      status_id: {
        type: "number",
        description: "Change status to this ID",
      },
      priority_id: {
        type: "number",
        description: "Change priority level",
      },
      subject: {
        type: "string",
        description: "New issue title or summary",
      },
      description: {
        type: "string",
        description: "New issue description",
      },
      category_id: {
        type: "number",
        description: "Change issue category",
      },
      fixed_version_id: {
        type: "number",
        description: "Change target version or milestone",
      },
      assigned_to_id: {
        type: "number",
        description: "Reassign issue to this user ID",
      },
      parent_issue_id: {
        type: "number",
        description: "Move issue under this parent ID",
      },
      custom_fields: {
        type: "array",
        description: "Update custom field values",
        items: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Custom field ID to update",
            },
            value: {
              type: "string",
              description: "New value or list of values for the field as JSON string",
            },
          },
          required: ["id", "value"],
        },
      },
      notes: {
        type: "string",
        description: "Add a note about the changes",
      },
      private_notes: {
        type: "boolean",
        description: "Set true to make note private",
      },
      is_private: {
        type: "boolean",
        description: "Change issue privacy setting",
      },
      estimated_hours: {
        type: "number",
        description: "Update time estimate in hours",
      },
      start_date: {
        type: "string",
        description: "Change start date as YYYY-MM-DD",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      due_date: {
        type: "string",
        description: "Change due date as YYYY-MM-DD",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
    },
    required: ["id"],
  },
};

// Delete issue tool
export const ISSUE_DELETE_TOOL: Tool = {
  name: "delete_issue",
  description:
    "Delete an issue permanently. " +
    "This action cannot be undone. " +
    "Returns success status on completion. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of issue to delete",
      },
    },
    required: ["id"],
  },
};

// Add issue watcher tool
export const ISSUE_ADD_WATCHER_TOOL: Tool = {
  name: "add_issue_watcher",
  description:
    "Add a user as watcher to an issue. " +
    "Enables user to receive issue updates. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "number",
        description: "Issue ID to add watcher to",
      },
      user_id: {
        type: "number",
        description: "User ID to add as watcher",
      },
    },
    required: ["issue_id", "user_id"],
  },
};

// Remove issue watcher tool
export const ISSUE_REMOVE_WATCHER_TOOL: Tool = {
  name: "remove_issue_watcher",
  description:
    "Remove a user from issue watchers. " +
    "Stops issue update notifications. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "number",
        description: "Issue ID to remove watcher from",
      },
      user_id: {
        type: "number",
        description: "User ID to remove from watchers",
      },
    },
    required: ["issue_id", "user_id"],
  },
};