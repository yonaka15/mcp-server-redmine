import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List users tool
export const USER_LIST_TOOL: Tool = {
  name: "list_users",
  description:
    "List users (requires admin privileges).\n" +
    "Returns a list of users with filtering options.\n" +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "number",
        description: "Filter by user status:\n" +
          "1: Active - User can login and use their account (default)\n" +
          "2: Registered - User has registered but not yet confirmed/activated\n" +
          "3: Locked - User was once active and is now locked",
        enum: [1, 2, 3]
      },
      name: {
        type: "string",
        description: "Filter users on their login, firstname, lastname and mail.\n" +
          "If pattern contains a space, matches firstname against first word\n" +
          "and lastname against second word"
      },
      group_id: {
        type: "number",
        description: "Get only users who are members of the given group"
      },
      offset: {
        type: "number",
        description: "Number of items to skip",
        minimum: 0,
        default: 0
      },
      limit: {
        type: "number",
        description: "Number of items per page (max: 100)",
        minimum: 1,
        maximum: 100,
        default: 25
      }
    }
  }
};

// Show user tool
export const USER_SHOW_TOOL: Tool = {
  name: "show_user",
  description:
    "Get user details.\n" +
    "- Use 'current' as ID to get current user details\n" +
    "- Visible fields depend on user privileges\n" +
    "- Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: ["number", "string"],
        description: "User ID (numeric) or 'current' for current user"
      },
      include: {
        type: "string",
        description: "Additional data to include (comma-separated):\n" +
          "- memberships: user's project memberships and roles\n" +
          "- groups: user's group memberships (since 2.1)",
        pattern: "^(memberships|groups)(,(memberships|groups))*$"
      }
    },
    required: ["id"]
  }
};

// Create user tool
export const USER_CREATE_TOOL: Tool = {
  name: "create_user",
  description:
    "Create a new user (requires admin privileges).\n" +
    "Returns:\n" +
    "- 201 Created: user was created\n" +
    "- 422 Unprocessable Entity: validation failed\n" +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      login: {
        type: "string",
        description: "User login name"
      },
      firstname: {
        type: "string",
        description: "User's first name"
      },
      lastname: {
        type: "string",
        description: "User's last name"
      },
      mail: {
        type: "string",
        description: "User's email address",
        format: "email"
      },
      password: {
        type: "string",
        description: "User's password (optional if generate_password is true)"
      },
      auth_source_id: {
        type: "number",
        description: "Authentication mode ID"
      },
      mail_notification: {
        type: "string",
        description: "Email notification options",
        enum: ["all", "selected", "only_my_events", "only_assigned", "only_owner", "none"]
      },
      must_change_passwd: {
        type: "boolean",
        description: "Force password change on next login",
        default: false
      },
      generate_password: {
        type: "boolean",
        description: "Generate random password",
        default: false
      },
      send_information: {
        type: "boolean",
        description: "Send account information to the user",
        default: false
      },
      custom_fields: {
        type: "object",
        description: "Custom field values (key: field_id, value: field_value)",
        additionalProperties: true
      }
    },
    required: ["login", "firstname", "lastname", "mail"]
  }
};

// Update user tool
export const USER_UPDATE_TOOL: Tool = {
  name: "update_user",
  description:
    "Update an existing user (requires admin privileges).\n" +
    "Returns:\n" +
    "- 200 OK: user was updated\n" +
    "- 422 Unprocessable Entity: validation failed\n" +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "User ID"
      },
      login: {
        type: "string",
        description: "User login name"
      },
      firstname: {
        type: "string",
        description: "User's first name"
      },
      lastname: {
        type: "string",
        description: "User's last name"
      },
      mail: {
        type: "string",
        description: "User's email address",
        format: "email"
      },
      password: {
        type: "string",
        description: "New password"
      },
      auth_source_id: {
        type: "number",
        description: "Authentication mode ID"
      },
      mail_notification: {
        type: "string",
        description: "Email notification options",
        enum: ["all", "selected", "only_my_events", "only_assigned", "only_owner", "none"]
      },
      must_change_passwd: {
        type: "boolean",
        description: "Force password change on next login"
      },
      admin: {
        type: "boolean",
        description: "Give user admin rights"
      },
      custom_fields: {
        type: "object",
        description: "Custom field values (key: field_id, value: field_value)",
        additionalProperties: true
      }
    },
    required: ["id"]
  }
};

// Delete user tool
export const USER_DELETE_TOOL: Tool = {
  name: "delete_user",
  description:
    "Delete a user (requires admin privileges).\n" +
    "- This action cannot be undone\n" +
    "- Returns 204 No Content on success\n" +
    "Available since Redmine 1.1",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "User ID"
      }
    },
    required: ["id"]
  }
};