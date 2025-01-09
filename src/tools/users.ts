import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List users tool
export const USER_LIST_TOOL: Tool = {
  name: "list_users",
  description:
    "List all users in the system. " +
    "Shows active and locked accounts. " +
    "Admin privileges required. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "number",
        description:
          "Filter users by status\n" +
          "- 1: Active users\n" +
          "- 2: Registered users\n" +
          "- 3: Locked users",
        enum: [1, 2, 3],
      },
      name: {
        type: "string",
        description:
          "Filter by login, firstname, lastname and mail. " +
          "When using space, matches firstname and lastname",
      },
      group_id: {
        type: "number",
        description: "Show only users who belong to this group",
      },
      offset: {
        type: "number",
        description: "Number of users to skip",
        minimum: 0,
        default: 0,
      },
      limit: {
        type: "number",
        description: "Number of users per page, from 1 to 100",
        minimum: 1,
        maximum: 100,
        default: 25,
      },
    },
  },
};

// Show user tool
export const USER_SHOW_TOOL: Tool = {
  name: "show_user",
  description:
    "Get details of a specific user. " +
    "Use 'current' to get your own info. " +
    "Returned fields depend on privileges. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "User ID as number or 'current' for own details",
      },
      include: {
        type: "string",
        description:
          "Additional data to include as comma separated values\n" +
          "- memberships: list project memberships and roles\n" +
          "- groups: list group memberships. Since 2.1",
        pattern: "^(memberships|groups)(,(memberships|groups))*$",
      },
    },
    required: ["id"],
  },
};

// Create user tool
export const USER_CREATE_TOOL: Tool = {
  name: "create_user",
  description:
    "Create a new user account. " +
    "Admin privileges required. " +
    "Returns success or validation error status. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      login: {
        type: "string",
        description: "User login name",
      },
      firstname: {
        type: "string",
        description: "User first name",
      },
      lastname: {
        type: "string",
        description: "User last name",
      },
      mail: {
        type: "string",
        description: "User email address",
        format: "email",
      },
      password: {
        type: "string",
        description: "User password. Optional if generate password is enabled",
      },
      auth_source_id: {
        type: "number",
        description: "Authentication mode ID",
      },
      mail_notification: {
        type: "string",
        description: "Email notification preferences",
        enum: [
          "all",
          "selected",
          "only_my_events",
          "only_assigned",
          "only_owner",
          "none",
        ],
      },
      must_change_passwd: {
        type: "boolean",
        description: "Force password change at next login",
        default: false,
      },
      generate_password: {
        type: "boolean",
        description: "Generate random password",
        default: false,
      },
      send_information: {
        type: "boolean",
        description: "Send account information to the user",
        default: false,
      },
    },
    required: ["login", "firstname", "lastname", "mail"],
  },
};

// Update user tool
export const USER_UPDATE_TOOL: Tool = {
  name: "update_user",
  description:
    "Update an existing user. " +
    "Admin privileges required. " +
    "Returns success or validation error status. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of user to update",
      },
      login: {
        type: "string",
        description: "User login name",
      },
      firstname: {
        type: "string",
        description: "User first name",
      },
      lastname: {
        type: "string",
        description: "User last name",
      },
      mail: {
        type: "string",
        description: "User email address",
        format: "email",
      },
      password: {
        type: "string",
        description: "New password",
      },
      auth_source_id: {
        type: "number",
        description: "Authentication mode ID",
      },
      mail_notification: {
        type: "string",
        description: "Email notification preferences",
        enum: [
          "all",
          "selected",
          "only_my_events",
          "only_assigned",
          "only_owner",
          "none",
        ],
      },
      must_change_passwd: {
        type: "boolean",
        description: "Force password change at next login",
      },
      admin: {
        type: "boolean",
        description: "Grant admin privileges",
      },
    },
    required: ["id"],
  },
};

// Delete user tool
export const USER_DELETE_TOOL: Tool = {
  name: "delete_user",
  description:
    "Delete a user permanently. " +
    "Admin privileges required. " +
    "This action cannot be undone. " +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID of user to delete",
      },
    },
    required: ["id"],
  },
};