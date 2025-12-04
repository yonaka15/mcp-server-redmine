import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List issue priorities tool
export const ENUMERATION_ISSUE_PRIORITIES_TOOL: Tool = {
  name: "list_issue_priorities",
  description:
    "Get list of issue priorities. " +
    "Returns priority ID, name, and default flag. " +
    "Available since Redmine 2.2",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

// List time entry activities tool
export const ENUMERATION_TIME_ENTRY_ACTIVITIES_TOOL: Tool = {
  name: "list_time_entry_activities",
  description:
    "Get list of time entry activities. " +
    "Returns activity ID, name, and default flag. " +
    "Available since Redmine 2.2",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

// List document categories tool
export const ENUMERATION_DOCUMENT_CATEGORIES_TOOL: Tool = {
  name: "list_document_categories",
  description:
    "Get list of document categories. " +
    "Returns category ID, name, and default flag. " +
    "Available since Redmine 2.2",
  inputSchema: {
    type: "object",
    properties: {},
  },
};
