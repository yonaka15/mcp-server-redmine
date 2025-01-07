import { HandlerContext, ToolResponse, asStringOrNumber } from "./types.js";
import {
  RedmineProjectCreate,
  ProjectSearchParams,
  ProjectStatus,
} from "../lib/types/index.js";
import { PROJECT_STATUS } from "../lib/types/projects/types.js";

// Valid include values for projects
const VALID_INCLUDE_VALUES = [
  "trackers",
  "issue_categories",
  "enabled_modules",
  "time_entry_activities",
  "issue_custom_fields",
];

/**
 * Type guard for RedmineProjectCreate
 * Validates required fields for project creation
 */
function isRedmineProjectCreate(value: unknown): value is RedmineProjectCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === "string" && typeof v.identifier === "string";
}

/**
 * Validates include parameter values
 * @param include The include string to validate
 * @returns true if valid, false otherwise
 */
function validateIncludeValues(include: string): boolean {
  const values = include.split(",").map(v => v.trim());
  return values.every(v => VALID_INCLUDE_VALUES.includes(v));
}

/**
 * Extract and validate project search parameters
 * @param args Raw input parameters
 * @returns Validated ProjectSearchParams
 */
function extractSearchParams(
  args: Record<string, unknown>
): ProjectSearchParams {
  const params: ProjectSearchParams = {
    // Set default limit
    limit:
      typeof args.limit === "number"
        ? Math.min(Math.max(1, args.limit), 100)
        : 10,
  };

  // Set offset if provided
  if (typeof args.offset === "number") {
    params.offset = args.offset;
  }

  // Validate and set status parameter
  if (
    typeof args.status === "number" &&
    PROJECT_STATUS.includes(args.status as ProjectStatus)
  ) {
    params.status = args.status as ProjectStatus;
  }

  // Validate and set include parameter
  if (typeof args.include === "string" && args.include.length > 0) {
    if (!validateIncludeValues(args.include)) {
      throw new Error("Invalid include value. Must be comma-separated list of: " +
                     VALID_INCLUDE_VALUES.join(", "));
    }
    params.include = args.include;
  }

  return params;
}

export function createProjectsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    list_projects: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const searchParams = extractSearchParams(args);
      const projects = await client.projects.getProjects(searchParams);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects, null, 2),
          },
        ],
        isError: false,
      };
    },

    show_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      const result = await client.projects.getProject(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    create_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      if (!isRedmineProjectCreate(args)) {
        throw new Error("Invalid project create parameters");
      }
      const result = await client.projects.createProject(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    update_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      const { id: _, ...updateData } = args;
      const result = await client.projects.updateProject(id, updateData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    archive_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      await client.projects.archiveProject(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "success", message: `Project #${id} has been archived` }),
          },
        ],
        isError: false,
      };
    },

    unarchive_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      await client.projects.unarchiveProject(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "success", message: `Project #${id} has been unarchived` }),
          },
        ],
        isError: false,
      };
    },

    delete_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      await client.projects.deleteProject(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "success", message: `Project #${id} has been deleted` }),
          },
        ],
        isError: false,
      };
    },
  };
}