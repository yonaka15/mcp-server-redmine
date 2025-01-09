import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List projects tool
export const PROJECT_LIST_TOOL: Tool = {
  name: "list_projects",
  description:
    "List all accessible projects. " +
    "Shows both public projects and authorized private projects. " +
    "Includes trackers, categories, modules and custom fields. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      include: {
        type: "string",
        description:
          "Additional data to include as comma separated values\n" +
          "- trackers: list project trackers\n" +
          "- categories: list project categories\n" +
          "- modules: list project modules. Since 2.6.0\n" +
          "- time tracking: list time activities. Since 3.4.0",
        pattern: "^(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields)(,(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields))*$"
      },
      status: {
        type: "number",
        description:
          "Filter projects by status\n" +
          "- 1: active projects. Default\n" +
          "- 5: archived projects\n" +
          "- 9: closed projects",
        enum: [1, 5, 9]
      },
      limit: {
        type: "number",
        description: "Maximum projects to return, from 1 to 100",
        minimum: 1,
        maximum: 100,
        default: 25
      },
      offset: {
        type: "number",
        description: "Number of projects to skip",
        minimum: 0,
        default: 0
      },
    }
  }
};

// Show project tool
export const PROJECT_SHOW_TOOL: Tool = {
  name: "show_project",
  description:
    "Get detailed project information. " +
    "Specify using project ID or key. " +
    "Supports retrieving additional data. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID as number or project key as text"
      },
      include: {
        type: "string",
        description:
          "Additional data to include as comma separated values\n" +
          "- trackers: list project trackers\n" +
          "- categories: list project categories\n" +
          "- modules: list project modules. Since 2.6.0\n" +
          "- time tracking: list time activities. Since 3.4.0",
        pattern: "^(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields)(,(trackers|issue_categories|enabled_modules|time_entry_activities|issue_custom_fields))*$"
      }
    },
    required: ["id"]
  }
};

// Create project tool
export const PROJECT_CREATE_TOOL: Tool = {
  name: "create_project",
  description:
    "Create a new project. " +
    "Provide name and key. " +
    "Configure optional settings like modules and trackers. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the project"
      },
      identifier: {
        type: "string",
        description: "Project key for URLs. Start with letter or number",
        pattern: "^[a-z0-9][a-z0-9_-]*$"
      },
      description: {
        type: "string",
        description: "Project description"
      },
      homepage: {
        type: "string",
        description: "Project website URL"
      },
      is_public: {
        type: "boolean",
        description: "Set true to make project public",
        default: true
      },
      parent_id: {
        type: "number",
        description: "Create as subproject under this ID"
      },
      inherit_members: {
        type: "boolean",
        description: "Set true to inherit parent members",
        default: false
      },
      tracker_ids: {
        type: "array",
        description: "List of enabled tracker IDs",
        items: {
          type: "number"
        }
      },
      enabled_module_names: {
        type: "array",
        description: "List of enabled modules",
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
      }
    },
    required: ["name", "identifier"]
  }
};

// Update project tool
export const PROJECT_UPDATE_TOOL: Tool = {
  name: "update_project",
  description:
    "Update project settings. " +
    "Specify ID or key to identify project. " +
    "Only specified fields will be changed. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID as number or key as text"
      },
      name: {
        type: "string",
        description: "New project name"
      },
      identifier: {
        type: "string",
        description: "New project key for URLs. Start with letter or number",
        pattern: "^[a-z0-9][a-z0-9_-]*$"
      },
      description: {
        type: "string",
        description: "New project description"
      },
      homepage: {
        type: "string",
        description: "New project website URL"
      },
      is_public: {
        type: "boolean",
        description: "Change project visibility"
      },
      parent_id: {
        type: "number",
        description: "Move under new parent ID"
      },
      inherit_members: {
        type: "boolean",
        description: "Change member inheritance setting"
      },
      tracker_ids: {
        type: "array",
        description: "New list of enabled tracker IDs",
        items: {
          type: "number"
        }
      },
      enabled_module_names: {
        type: "array",
        description: "New list of enabled modules",
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
      }
    },
    required: ["id"]
  }
};

// Archive project tool 
export const PROJECT_ARCHIVE_TOOL: Tool = {
  name: "archive_project",
  description: 
    "Archive a project. " +
    "Project becomes read only. " +
    "Available since Redmine 5.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID as number or key as text"
      }
    },
    required: ["id"]
  }
};

// Unarchive project tool
export const PROJECT_UNARCHIVE_TOOL: Tool = {
  name: "unarchive_project",
  description:
    "Restore an archived project. " +
    "Project becomes editable again. " +
    "Available since Redmine 5.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID as number or key as text"
      }
    },
    required: ["id"]
  }
};

// Delete project tool
export const PROJECT_DELETE_TOOL: Tool = {
  name: "delete_project",
  description:
    "Delete project permanently. " +
    "Deletes all project data and subprojects. " +
    "This action cannot be undone. " +
    "Available since Redmine 1.0",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID as number or key as text"
      }
    },
    required: ["id"]
  }
};