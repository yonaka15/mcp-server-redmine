import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Time entry search tool
 */
export const TIME_ENTRY_SEARCH_TOOL: Tool = {
  name: "search_time_entries",
  description:
    "Search for time entries.\n" +
    "- Filter by user ID, project ID, and date\n" +
    "- Search within a date range\n" +
    "- Retrieve up to 100 entries",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "number",
        description: "User ID (me: your own entries)"
      },
      project_id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      },
      spent_on: {
        type: "string",
        description: "Specific date (YYYY-MM-DD format)"
      },
      from: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)"
      },
      to: {
        type: "string",
        description: "End date (YYYY-MM-DD format)"
      },
      limit: {
        type: "number",
        description: "Number of results (1-100)",
        default: 10
      }
    }
  }
};

/**
 * Time entry details tool
 */
export const TIME_ENTRY_GET_TOOL: Tool = {
  name: "get_time_entry",
  description:
    "Get detailed time entry information.\n" +
    "- Retrieve a single time entry by ID",
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
    "- Either project ID or issue ID is required\n" +
    "- Hours and activity ID are required\n" +
    "- Supports custom field values",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "Project ID"
      },
      issue_id: {
        type: "number",
        description: "Issue ID"
      },
      spent_on: {
        type: "string",
        description: "Date (YYYY-MM-DD format)"
      },
      hours: {
        type: "number",
        description: "Hours spent"
      },
      activity_id: {
        type: "number",
        description: "Activity ID"
      },
      comments: {
        type: "string",
        description: "Comments"
      },
      user_id: {
        type: "number",
        description: "User ID (admin only)"
      },
      custom_field_values: {
        type: "object",
        description: "Custom field values (key: custom field ID)"
      }
    },
    required: ["hours", "activity_id"]
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
    "- Cannot change project",
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
        description: "Date (YYYY-MM-DD format)"
      },
      hours: {
        type: "number",
        description: "Hours spent"
      },
      activity_id: {
        type: "number",
        description: "Activity ID"
      },
      comments: {
        type: "string",
        description: "Comments"
      },
      custom_field_values: {
        type: "object",
        description: "Custom field values (key: custom field ID)"
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
    "- This action cannot be undone",
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