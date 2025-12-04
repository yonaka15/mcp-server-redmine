import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List versions tool
export const VERSION_LIST_TOOL: Tool = {
  name: "list_versions",
  description:
    "Get list of versions for a project. " +
    "Returns version ID, name, status, due date, and sharing settings. " +
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

// Show version tool
export const VERSION_SHOW_TOOL: Tool = {
  name: "show_version",
  description:
    "Get details of a specific version. " +
    "Returns complete version information including estimated and spent hours. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Version ID",
      },
    },
    required: ["id"],
  },
};

// Create version tool
export const VERSION_CREATE_TOOL: Tool = {
  name: "create_version",
  description:
    "Create a new version for a project. " +
    "Requires project ID and version name. " +
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
        description: "Version name",
      },
      status: {
        type: "string",
        description: "Version status: open (default), locked, or closed",
        enum: ["open", "locked", "closed"],
      },
      sharing: {
        type: "string",
        description: "Version sharing: none (default), descendants, hierarchy, tree, or system",
        enum: ["none", "descendants", "hierarchy", "tree", "system"],
      },
      due_date: {
        type: "string",
        description: "Due date in YYYY-MM-DD format",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      description: {
        type: "string",
        description: "Version description",
      },
      wiki_page_title: {
        type: "string",
        description: "Associated wiki page title",
      },
    },
    required: ["project_id", "name"],
  },
};

// Update version tool
export const VERSION_UPDATE_TOOL: Tool = {
  name: "update_version",
  description:
    "Update an existing version. " +
    "Only specified fields will be changed. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Version ID to update",
      },
      name: {
        type: "string",
        description: "New version name",
      },
      status: {
        type: "string",
        description: "Version status: open, locked, or closed",
        enum: ["open", "locked", "closed"],
      },
      sharing: {
        type: "string",
        description: "Version sharing: none, descendants, hierarchy, tree, or system",
        enum: ["none", "descendants", "hierarchy", "tree", "system"],
      },
      due_date: {
        type: "string",
        description: "Due date in YYYY-MM-DD format",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
      description: {
        type: "string",
        description: "Version description",
      },
      wiki_page_title: {
        type: "string",
        description: "Associated wiki page title",
      },
    },
    required: ["id"],
  },
};

// Delete version tool
export const VERSION_DELETE_TOOL: Tool = {
  name: "delete_version",
  description:
    "Delete a version permanently. " +
    "This action cannot be undone. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Version ID to delete",
      },
    },
    required: ["id"],
  },
};
