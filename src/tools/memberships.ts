import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List memberships tool
export const MEMBERSHIP_LIST_TOOL: Tool = {
  name: "list_memberships",
  description:
    "Get list of project memberships. " +
    "Returns member ID, user/group info, and roles. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Project ID as number or project identifier as text",
      },
      offset: {
        type: "number",
        description: "Number of memberships to skip",
        minimum: 0,
        default: 0,
      },
      limit: {
        type: "number",
        description: "Maximum memberships to return, from 1 to 100",
        minimum: 1,
        maximum: 100,
        default: 25,
      },
    },
    required: ["project_id"],
  },
};

// Show membership tool
export const MEMBERSHIP_SHOW_TOOL: Tool = {
  name: "show_membership",
  description:
    "Get details of a specific membership. " +
    "Returns complete membership information. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Membership ID",
      },
    },
    required: ["id"],
  },
};

// Create membership tool
export const MEMBERSHIP_CREATE_TOOL: Tool = {
  name: "create_membership",
  description:
    "Add a user or group to a project. " +
    "Requires project ID, user ID, and at least one role. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Project ID as number or project identifier as text",
      },
      user_id: {
        type: "number",
        description: "User ID or group ID to add as member",
      },
      role_ids: {
        type: "array",
        description: "List of role IDs to assign",
        items: {
          type: "number",
        },
        minItems: 1,
      },
    },
    required: ["project_id", "user_id", "role_ids"],
  },
};

// Update membership tool
export const MEMBERSHIP_UPDATE_TOOL: Tool = {
  name: "update_membership",
  description:
    "Update membership roles. " +
    "Cannot change the user or project. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Membership ID to update",
      },
      role_ids: {
        type: "array",
        description: "New list of role IDs",
        items: {
          type: "number",
        },
        minItems: 1,
      },
    },
    required: ["id", "role_ids"],
  },
};

// Delete membership tool
export const MEMBERSHIP_DELETE_TOOL: Tool = {
  name: "delete_membership",
  description:
    "Remove a user or group from a project. " +
    "Cannot delete group-inherited memberships. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Membership ID to delete",
      },
    },
    required: ["id"],
  },
};
