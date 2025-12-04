import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List issue categories tool
export const ISSUE_CATEGORY_LIST_TOOL: Tool = {
  name: "list_issue_categories",
  description:
    "Get list of issue categories for a project. " +
    "Returns category ID, name, and default assignee. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Project ID as number or project identifier as text",
      },
    },
    required: ["project_id"],
  },
};

// Show issue category tool
export const ISSUE_CATEGORY_SHOW_TOOL: Tool = {
  name: "show_issue_category",
  description:
    "Get details of a specific issue category. " +
    "Returns complete category information. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue category ID",
      },
    },
    required: ["id"],
  },
};

// Create issue category tool
export const ISSUE_CATEGORY_CREATE_TOOL: Tool = {
  name: "create_issue_category",
  description:
    "Create a new issue category for a project. " +
    "Requires project ID and category name. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Project ID as number or project identifier as text",
      },
      name: {
        type: "string",
        description: "Category name",
      },
      assigned_to_id: {
        type: "number",
        description: "Default assignee user ID for issues in this category",
      },
    },
    required: ["project_id", "name"],
  },
};

// Update issue category tool
export const ISSUE_CATEGORY_UPDATE_TOOL: Tool = {
  name: "update_issue_category",
  description:
    "Update an existing issue category. " +
    "Only specified fields will be changed. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue category ID to update",
      },
      name: {
        type: "string",
        description: "New category name",
      },
      assigned_to_id: {
        type: "number",
        description: "New default assignee user ID",
      },
    },
    required: ["id"],
  },
};

// Delete issue category tool
export const ISSUE_CATEGORY_DELETE_TOOL: Tool = {
  name: "delete_issue_category",
  description:
    "Delete an issue category. " +
    "Optionally reassign issues to another category. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Issue category ID to delete",
      },
      reassign_to_id: {
        type: "number",
        description: "Category ID to reassign issues to before deletion",
      },
    },
    required: ["id"],
  },
};
