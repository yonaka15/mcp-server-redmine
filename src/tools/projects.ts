import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List projects tool
export const PROJECT_LIST_TOOL: Tool = {
  name: "list_projects",
  description:
    "List all accessible projects (public and authorized private projects).\n" +
    "- Include additional data (trackers, categories, etc.)\n" +
    "- Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      // Include additional data
      include: {
        type: "string",
        description: "Additional data to include (comma-separated):\n" +
          "- trackers: Project trackers\n" +
          "- issue_categories: Project categories\n" +
          "- enabled_modules: Enabled modules (since 2.6.0)\n" +
          "- time_entry_activities: Time entry activities (since 3.4.0)\n" +
          "- issue_custom_fields: Custom fields (since 4.2.0)",
        pattern: "^(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields)(,(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields))*$",
      },
      // Status filter
      status: {
        type: "number",
        description: "Project status filter:\n" +
          "1: active (default)\n" +
          "5: archived\n" +
          "9: closed",
        enum: [1, 5, 9]
      },
      // Pagination
      limit: {
        type: "number",
        description: "Maximum number of projects to return (1-100)",
        minimum: 1,
        maximum: 100,
        default: 25
      },
      offset: {
        type: "number",
        description: "Number of projects to skip",
        minimum: 0,
        default: 0
      }
    }
  }
};

// Show project tool
export const PROJECT_SHOW_TOOL: Tool = {
  name: "show_project",
  description:
    "Get detailed information about a specific project.\n" +
    "- Retrieve by ID or identifier\n" +
    "- Include additional related data\n" +
    "- Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)"
      },
      include: {
        type: "string",
        description: "Additional data to include (comma-separated):\n" +
          "- trackers: Project trackers\n" +
          "- issue_categories: Project categories\n" +
          "- enabled_modules: Enabled modules (since 2.6.0)\n" +
          "- time_entry_activities: Time entry activities (since 3.4.0)\n" +
          "- issue_custom_fields: Custom fields (since 4.2.0)",
        pattern: "^(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields)(,(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields))*$",
      }
    },
    required: ["id"]
  }
};

// Create project tool
export const PROJECT_CREATE_TOOL: Tool = {
  name: "create_project",
  description:
    "Create a new project.\n" +
    "- Required: name and identifier\n" +
    "- Optional: modules, trackers, custom fields\n" +
    "- Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Project name"
      },
      identifier: {
        type: "string",
        description: "Project identifier (used in URLs)",
        pattern: "^[a-z0-9][a-z0-9_-]*$"
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
        description: "Whether the project is public",
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
      default_version_id: {
        type: "number",
        description: "Default version ID (must be a shared version)"
      },
      default_assigned_to_id: {
        type: "number",
        description: "Default assignee ID (only works for subprojects with inherited members)"
      },
      tracker_ids: {
        type: "array",
        description: "Enabled tracker IDs",
        items: {
          type: "number"
        }
      },
      enabled_module_names: {
        type: "array",
        description: "Enabled module names",
        items: {
          type: "string",
          enum: [
            "boards",
            "calendar",
            "documents",
            "files",
            "gantt",
            "issue_tracking",
            "news",
            "repository",
            "time_tracking",
            "wiki"
          ]
        }
      },
      issue_custom_field_ids: {
        type: "array",
        description: "Enabled issue custom field IDs",
        items: {
          type: "number"
        }
      },
      custom_field_values: {
        type: "object",
        description: "Custom field values (key: field_id, value: field_value)",
        additionalProperties: {
          type: ["string", "array"],
          items: {
            type: "string"
          }
        }
      }
    },
    required: ["name", "identifier"]
  }
};

// Update project tool
export const PROJECT_UPDATE_TOOL: Tool = {
  name: "update_project",
  description:
    "Update an existing project.\n" +
    "- Specify project by ID or identifier\n" +
    "- Only specified fields will be updated\n" +
    "- Available since Redmine 1.0",
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
      identifier: {
        type: "string",
        description: "Project identifier (used in URLs)",
        pattern: "^[a-z0-9][a-z0-9_-]*$"
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
        description: "Whether the project is public"
      },
      parent_id: {
        type: "number",
        description: "Parent project ID"
      },
      inherit_members: {
        type: "boolean",
        description: "Inherit members from parent project"
      },
      default_version_id: {
        type: "number",
        description: "Default version ID (must be a shared version)"
      },
      default_assigned_to_id: {
        type: "number",
        description: "Default assignee ID (only works for subprojects with inherited members)"
      },
      tracker_ids: {
        type: "array",
        description: "Enabled tracker IDs",
        items: {
          type: "number"
        }
      },
      enabled_module_names: {
        type: "array",
        description: "Enabled module names",
        items: {
          type: "string",
          enum: [
            "boards",
            "calendar",
            "documents",
            "files",
            "gantt",
            "issue_tracking",
            "news",
            "repository",
            "time_tracking",
            "wiki"
          ]
        }
      },
      issue_custom_field_ids: {
        type: "array",
        description: "Enabled issue custom field IDs",
        items: {
          type: "number"
        }
      },
      custom_field_values: {
        type: "object",
        description: "Custom field values (key: field_id, value: field_value)",
        additionalProperties: {
          type: ["string", "array"],
          items: {
            type: "string"
          }
        }
      }
    },
    required: ["id"]
  }
};

// Archive project tool (since Redmine 5.0)
export const PROJECT_ARCHIVE_TOOL: Tool = {
  name: "archive_project",
  description:
    "Archive a project.\n" +
    "- Project becomes read-only\n" +
    "- Available since Redmine 5.0",
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

// Unarchive project tool (since Redmine 5.0)
export const PROJECT_UNARCHIVE_TOOL: Tool = {
  name: "unarchive_project",
  description:
    "Unarchive a previously archived project.\n" +
    "- Project becomes editable again\n" +
    "- Available since Redmine 5.0",
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

// Delete project tool
export const PROJECT_DELETE_TOOL: Tool = {
  name: "delete_project",
  description:
    "Permanently delete a project.\n" +
    "- WARNING: This action cannot be undone\n" +
    "- All project data will be deleted\n" +
    "- Subprojects will also be deleted\n" +
    "- Available since Redmine 1.0",
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