import { HandlerContext, ToolResponse, ValidationError, asNumberOrSpecial } from "./types.js";
import {
  RedmineProjectCreate,
  ProjectSearchParams,
  ProjectStatus,
  RedmineIssue, // Assuming RedmineIssue will be imported or defined for allowed_statuses
} from "../lib/types/index.js";
import { PROJECT_STATUS } from "../lib/types/projects/types.js";
import * as formatters from "../formatters/index.js";

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
    limit:
      typeof args.limit === "number"
        ? Math.min(Math.max(1, args.limit), 100)
        : 10,
  };

  if (typeof args.offset === "number") {
    params.offset = args.offset;
  }

  if (
    typeof args.status === "number" &&
    PROJECT_STATUS.includes(args.status as ProjectStatus)
  ) {
    params.status = args.status as ProjectStatus;
  }

  if (typeof args.include === "string" && args.include.length > 0) {
    if (!validateIncludeValues(args.include)) {
      throw new ValidationError(
        "Invalid include value. Must be comma-separated list of: " +
        VALID_INCLUDE_VALUES.join(", ")
      );
    }
    params.include = args.include;
  }

  return params;
}

// Assuming formatters.formatAllowedStatuses exists or will be created
// For the purpose of this example, formatAllowedStatusesFn is typed as Function.
// A more specific type should be used, like: typeof formatters.formatAllowedStatuses
export function createProjectsHandlers(
  context: HandlerContext,
  // This is the dependency injection point mentioned in the reference for testing
  formatAllowedStatusesFn: (statuses: NonNullable<RedmineIssue['allowed_statuses']>) => string = formatters.formatAllowedStatuses
) {
  const { client } = context;

  return {
    list_projects: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        const searchParams = extractSearchParams(args);
        const projects = await client.projects.getProjects(searchParams);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjects(projects),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    show_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!args.id || typeof args.id !== 'string' && typeof args.id !== 'number') {
          throw new ValidationError("id is required and must be a string or number");
        }
        const id = asNumberOrSpecial(args.id);
        const include = typeof args.include === 'string' ? args.include : undefined;
        if (include && !validateIncludeValues(include)) {
          throw new ValidationError(
            "Invalid include value. Must be comma-separated list of: " +
            VALID_INCLUDE_VALUES.join(", ")
          );
        }
        const { project } = await client.projects.getProject(id, include ? { include } : undefined);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProject(project),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    create_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!isRedmineProjectCreate(args)) {
          throw new ValidationError("Invalid project create parameters: name and identifier are required.");
        }
        const { project } = await client.projects.createProject(args);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjectResult(project, "created"),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    update_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!args.id || typeof args.id !== 'string' && typeof args.id !== 'number') {
          throw new ValidationError("id is required and must be a string or number for updating a project");
        }
        const id = asNumberOrSpecial(args.id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = args;
        // Ensure at least one updatable field is present besides id
        if (Object.keys(updateData).length === 0) {
            throw new ValidationError("No update data provided for the project.");
        }
        const { project } = await client.projects.updateProject(id, updateData as Partial<RedmineProjectCreate>);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjectResult(project, "updated"),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    archive_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!args.id || typeof args.id !== 'string' && typeof args.id !== 'number') {
          throw new ValidationError("id is required and must be a string or number");
        }
        const id = asNumberOrSpecial(args.id);
        await client.projects.archiveProject(id);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjectArchiveStatus(id, true),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    unarchive_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!args.id || typeof args.id !== 'string' && typeof args.id !== 'number') {
          throw new ValidationError("id is required and must be a string or number");
        }
        const id = asNumberOrSpecial(args.id);
        await client.projects.unarchiveProject(id);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjectArchiveStatus(id, false),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    delete_project: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      try {
        if (!args.id || typeof args.id !== 'string' && typeof args.id !== 'number') {
          throw new ValidationError("id is required and must be a string or number");
        }
        const id = asNumberOrSpecial(args.id);
        await client.projects.deleteProject(id);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatProjectDeleted(id),
            }
          ],
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) {
           return { content: [{ type: "text", text: `Input Error: ${message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },

    // New handler for listing project statuses
    list_project_statuses: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const projectId = args.project_id;
        const trackerId = args.tracker_id;

        if (typeof projectId !== 'number') {
          throw new ValidationError("Input Error: project_id is required and must be a number.");
        }
        if (typeof trackerId !== 'number') {
          throw new ValidationError("Input Error: tracker_id is required and must be a number.");
        }

        // 2. Get a representative issue from the project and tracker
        // We fetch issues with any status to ensure we find one if any exist.
        const issuesResponse = await client.issues.getIssues({
          project_id: projectId,
          tracker_id: trackerId,
          limit: 1,
          status_id: '*' // Get issues with any status
        });

        // Type assertion to ensure issues is an array
        const issues = Array.isArray(issuesResponse.issues) ? issuesResponse.issues : [];
        
        if (!issues || issues.length === 0) {
          return {
            content: [{ type: "text", text: `No issues found for project_id ${projectId} and tracker_id ${trackerId}. Cannot determine allowed statuses.` }],
            isError: false, // This is not an API error, but a "not found" scenario.
          };
        }

        const representativeIssue = issues[0];

        // 3. Get the issue details including allowed_statuses
        const issueDetailResponse = await client.issues.getIssue(representativeIssue.id, { include: "allowed_statuses" });
        
        const allowedStatuses = issueDetailResponse.issue.allowed_statuses;

        if (!allowedStatuses || allowedStatuses.length === 0) {
          return {
            content: [{ type: "text", text: `No allowed statuses found for tracker_id ${trackerId} in project_id ${projectId}. It might be that the workflow is not configured or the representative issue has no available transitions.` }],
            isError: false,
          };
        }
        
        // 4. Format and return allowed_statuses using the injected or default formatter
        // The formatAllowedStatusesFn is injected for testability.
        return {
          content: [{ type: "text", text: formatAllowedStatusesFn(allowedStatuses) }],
          isError: false,
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof ValidationError) { // Catch validation errors specifically
           return { content: [{ type: "text", text: message }], isError: true };
        }
        // General API or other unexpected errors
        return { content: [{ type: "text", text: `API Error: ${message}` }], isError: true };
      }
    },
  };
}
