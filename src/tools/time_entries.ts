import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Time entry list tool
 */
export const TIME_ENTRY_LIST_TOOL: Tool = {
  name: "list_time_entries",
  description:
    "List time entries.\n" +
    "- Filter by user ID, project ID, and date\n" +
    "- Search within a date range\n" +
    "- Retrieve up to 100 entries\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "number",
        description: "User ID (Use 'me' for your own entries)"
      },
      project_id: {
        type: ["string", "number"],
        description: "Project ID (numeric) or identifier (string)\n" +
          "Examples:\n" +
          "- Numeric ID: project_id=123\n" +
          "- String identifier: project_id=my-custom-project"
      },
      spent_on: {
        type: "string",
        description: "Specific date (YYYY-MM-DD format)"
      },
      from: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      to: {
        type: "string",
        description: "End date (YYYY-MM-DD format)",
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
        description: "Number of results (1-100)",
        minimum: 1,
        maximum: 100,
        default: 25
      }
    }
  }
};

/**
 * Time entry details tool
 */
export const TIME_ENTRY_SHOW_TOOL: Tool = {
  name: "show_time_entry",
  description:
    "Get detailed time entry information.\n" +
    "- Retrieve a single time entry by ID\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Time entry ID"
      }
    },
    required: ["id"]
  }
};

/**
 * Time entry creation tool
 */
export const TIME_ENTRY_CREATE_TOOL: Tool = {
  name: "create_time_entry",
  description:
    "Create a new time entry.\n" +
    "- Either project_id or issue_id is required\n" +
    "- hours is required\n" +
    "- activity_id is required unless a default activity is defined\n" +
    "- Returns 201 Created on success\n" +
    "- Returns 422 Unprocessable Entity on validation failure\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: ["string", "number"],
        description: "Project ID (numeric) or identifier (string)"
      },
      issue_id: {
        type: "number",
        description: "Issue ID"
      },
      spent_on: {
        type: "string",
        description: "Date (YYYY-MM-DD format, defaults to current date)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      hours: {
        type: "number",
        description: "Number of spent hours (can include decimals)",
        minimum: 0,
        exclusiveMinimum: true
      },
      activity_id: {
        type: "number",
        description: "Activity ID (required unless a default activity is defined)"
      },
      comments: {
        type: "string",
        description: "Comments (max 255 characters)",
        maxLength: 255
      },
      user_id: {
        type: "number",
        description: "User ID (requires admin privileges)"
      }
    },
    required: ["hours"],
    oneOf: [
      { required: ["project_id"] },
      { required: ["issue_id"] }
    ]
  }
};

/**
 * Time entry update tool
 */
export const TIME_ENTRY_UPDATE_TOOL: Tool = {
  name: "update_time_entry",
  description:
    "Update an existing time entry.\n" +
    "- Update a single time entry by ID\n" +
    "- Only specify fields to be updated\n" +
    "- Cannot change project\n" +
    "- Returns 204 No Content on success\n" +
    "- Returns 422 Unprocessable Entity on validation failure\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Time entry ID"
      },
      issue_id: {
        type: "number",
        description: "Issue ID"
      },
      spent_on: {
        type: "string",
        description: "Date (YYYY-MM-DD format)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
      },
      hours: {
        type: "number",
        description: "Number of spent hours (can include decimals)",
        minimum: 0,
        exclusiveMinimum: true
      },
      activity_id: {
        type: "number",
        description: "Activity ID"
      },
      comments: {
        type: "string",
        description: "Comments (max 255 characters)",
        maxLength: 255
      }
    },
    required: ["id"]
  }
};

/**
 * Time entry deletion tool
 */
export const TIME_ENTRY_DELETE_TOOL: Tool = {
  name: "delete_time_entry",
  description:
    "Delete a time entry.\n" +
    "- Delete a single time entry by ID\n" +
    "- This action cannot be undone\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Time entry ID"
      }
    },
    required: ["id"]
  }
};