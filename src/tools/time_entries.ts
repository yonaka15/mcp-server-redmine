import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List time entries tool
export const TIME_ENTRY_LIST_TOOL: Tool = {
  name: "list_time_entries",
  description:
    "List and search logged time records. " +
    "Filter by user, project and date range. " +
    "Returns up to 100 entries per request. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "number",
        description: "Filter by user. Use me to show your own entries"
      },
      project_id: {
        type: "string",
        description: "Project ID as number or project key as text"
      },
      spent_on: {
        type: "string",
        description: "Show entries for specific date in YYYY-MM-DD format"
      },
      from: {
        type: "string",
        description: "Show entries from this date in YYYY-MM-DD format",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      to: {
        type: "string",
        description: "Show entries until this date in YYYY-MM-DD format", 
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      offset: {
        type: "number",
        description: "Number of entries to skip",
        minimum: 0,
        default: 0
      },
      limit: {
        type: "number",
        description: "Maximum entries to return, from 1 to 100",
        minimum: 1,
        maximum: 100,
        default: 25
      }
    }
  }
};

// Get time entry tool
export const TIME_ENTRY_SHOW_TOOL: Tool = {
  name: "show_time_entry",
  description:
    "Get details of a time record. " +
    "Returns complete information. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of the time record to show"
      }
    },
    required: ["id"]
  }
};

// Create time entry tool
export const TIME_ENTRY_CREATE_TOOL: Tool = {
  name: "create_time_entry",
  description:
    "Record spent time on projects or issues. " +
    "Hours and project or issue ID required. " +
    "Activity type ID required if no default exists. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Project ID as number or project key as text"
      },
      issue_id: {
        type: "number",
        description: "Issue ID to log time against"
      },
      spent_on: {
        type: "string",
        description: "Date in YYYY-MM-DD format. Defaults to today",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      hours: {
        type: "number",
        description: "Number of hours spent. Can use decimals",
        minimum: 0,
        exclusiveMinimum: 0
      },
      activity_id: {
        type: "number",
        description: "Activity type ID. Required if no default exists"
      },
      comments: {
        type: "string",
        description: "Optional comments up to 255 characters",
        maxLength: 255
      },
      user_id: {
        type: "number",
        description: "Log time for this user ID. Requires admin rights"
      }
    },
    required: ["hours"],
    oneOf: [
      { required: ["project_id"] },
      { required: ["issue_id"] }
    ]
  }
};

// Update time entry tool
export const TIME_ENTRY_UPDATE_TOOL: Tool = {
  name: "update_time_entry",
  description:
    "Update an existing time record. " +
    "Modify hours, activity and comments. " +
    "Cannot change project after creation. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of time record to update"
      },
      issue_id: {
        type: "number",
        description: "Change linked issue ID"
      },
      spent_on: {
        type: "string",
        description: "New date in YYYY-MM-DD format",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      hours: {
        type: "number",
        description: "New number of hours. Can use decimals",
        minimum: 0,
        exclusiveMinimum: 0
      },
      activity_id: {
        type: "number",
        description: "New activity type ID"
      },
      comments: {
        type: "string",
        description: "New comments up to 255 characters",
        maxLength: 255
      }
    },
    required: ["id"]
  }
};

// Delete time entry tool
export const TIME_ENTRY_DELETE_TOOL: Tool = {
  name: "delete_time_entry",
  description:
    "Delete a time record permanently. " +
    "This action cannot be undone. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of time record to delete"
      }
    },
    required: ["id"]
  }
};