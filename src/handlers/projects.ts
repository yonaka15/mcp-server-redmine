import { HandlerContext, ToolResponse, asStringOrNumber } from "./types.js";
import * as formatters from "../formatters/index.js";
import {
  RedmineProjectCreate,
  ProjectSearchParams,
  ProjectStatus,
} from "../lib/types/index.js";
import { PROJECT_STATUS } from "../lib/types/projects/types.js"; // Import as value

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

  // Extract project name from query parameter
  if (typeof args.query === "string") {
    params.name = args.query;
  }

  // Validate and set status parameter
  if (
    typeof args.status === "number" &&
    PROJECT_STATUS.includes(args.status as ProjectStatus)
  ) {
    params.status = args.status as ProjectStatus;
  }

  // Set include parameter for additional information
  if (typeof args.include === "string" && args.include.length > 0) {
    params.include = args.include; // Keep as string
  }

  return params;
}

export function createProjectsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    search_projects: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const searchParams = extractSearchParams(args);
      const projects = await client.projects.getProjects(searchParams);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatProjects(projects),
          },
        ],
        isError: false,
      };
    },

    get_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asStringOrNumber(args.id);
      const result = await client.projects.getProject(id);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatProject(result.project),
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
            text: formatters.formatProjectResult(result.project, "created"),
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
            text: formatters.formatProjectResult(result.project, "updated"),
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
            text: formatters.formatProjectArchiveStatus(id, true),
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
            text: formatters.formatProjectArchiveStatus(id, false),
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
            text: formatters.formatProjectDeleted(id),
          },
        ],
        isError: false,
      };
    },
  };
}
