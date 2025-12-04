import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List roles tool
export const ROLE_LIST_TOOL: Tool = {
  name: "list_roles",
  description:
    "Get list of all roles. " +
    "Returns role ID and name. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

// Show role tool
export const ROLE_SHOW_TOOL: Tool = {
  name: "show_role",
  description:
    "Get details of a specific role including permissions. " +
    "Returns role information with list of granted permissions. " +
    "Available since Redmine 2.2",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Role ID",
      },
    },
    required: ["id"],
  },
};
