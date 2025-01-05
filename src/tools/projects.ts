import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Project search tool
 */
export const PROJECT_SEARCH_TOOL: Tool = {
  name: "search_projects",
  description:
    "Search for Redmine projects.\n" +
    "- Search by name or ID\n" +
    "- Filter by status\n" +
    "- Retrieve up to 100 projects",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search keywords"
      },
      status: {
        type: "number",
        description: "Status (1: active, 5: archived, 9: closed)",
        enum: [1, 5, 9]
      },
      include: {
        type: "string",
        description: "Include additional info (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: ""
      },
      limit: {
        type: "number",
        description: "Number of results (1-100)",
        default: 10
      }
    },
    required: ["query"]
  }
};

/**
 * Project details tool
 */
export const PROJECT_GET_TOOL: Tool = {
  name: "get_project",
  description:
    "Get detailed project information.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- Can include related information like trackers and categories",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      },
      include: {
        type: "string",
        description: "Include additional info (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: ""
      }
    },
    required: ["id"]
  }
};

/**
 * Project creation tool
 */
export const PROJECT_CREATE_TOOL: Tool = {
  name: "create_project",
  description:
    "Create a new project.\n" +
    "- Name and identifier are required\n" +
    "- Can specify parent project\n" +
    "- Configure modules and trackers",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Project name"
      },
      identifier: {
        type: "string",
        description: "Project identifier (alphanumeric and hyphens only)"
      },
      description: {
        type: "string",
        description: "Project description"
      },
      homepage: {
        type: "string",
        description: "Project homepage URL"
      },
      is_public: {
        type: "boolean",
        description: "Make project public",
        default: true
      },
      parent_id: {
        type: "number",
        description: "Parent project ID"
      },
      inherit_members: {
        type: "boolean",
        description: "Inherit members from parent project",
        default: false
      },
      tracker_ids: {
        type: "array",
        items: { type: "number" },
        description: "List of tracker IDs to enable"
      },
      enabled_module_names: {
        type: "array",
        items: { type: "string" },
        description: "List of module names to enable"
      }
    },
    required: ["name", "identifier"]
  }
};

/**
 * Project update tool
 */
export const PROJECT_UPDATE_TOOL: Tool = {
  name: "update_project",
  description:
    "Update an existing project.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- Only specify fields to be updated",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      },
      name: {
        type: "string",
        description: "Project name"
      },
      description: {
        type: "string",
        description: "Project description"
      },
      homepage: {
        type: "string",
        description: "Project homepage URL"
      },
      is_public: {
        type: "boolean",
        description: "Make project public"
      },
      inherit_members: {
        type: "boolean",
        description: "Inherit members from parent project"
      },
      tracker_ids: {
        type: "array",
        items: { type: "number" },
        description: "List of tracker IDs to enable"
      },
      enabled_module_names: {
        type: "array",
        items: { type: "string" },
        description: "List of module names to enable"
      }
    },
    required: ["id"]
  }
};

/**
 * Project archive tool
 */
export const PROJECT_ARCHIVE_TOOL: Tool = {
  name: "archive_project",
  description:
    "Archive a project.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- Archived projects cannot be edited",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      }
    },
    required: ["id"]
  }
};

/**
 * Project unarchive tool
 */
export const PROJECT_UNARCHIVE_TOOL: Tool = {
  name: "unarchive_project",
  description:
    "Restore an archived project.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- Project becomes editable after unarchiving",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      }
    },
    required: ["id"]
  }
};

/**
 * Project deletion tool
 */
export const PROJECT_DELETE_TOOL: Tool = {
  name: "delete_project",
  description:
    "Delete a project.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- This action cannot be undone\n" +
    "- Subprojects will also be deleted",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      }
    },
    required: ["id"]
  }
};