import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List issue statuses tool
export const ISSUE_STATUS_LIST_TOOL: Tool = {
  name: "list_issue_statuses",
  description:
    "Get list of all issue statuses. " +
    "Returns status ID, name, and whether it represents a closed state. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {},
  },
};
