import {
  HandlerContext,
  ToolResponse,
  asNumber,
  extractPaginationParams,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import type {
  RedmineIssueCreate,
  IssueListParams,
} from "../lib/types/index.js";

/**
 * Type guard for RedmineIssueCreate
 * Validates that the provided value has the required properties for creating an issue
 */
function isRedmineIssueCreate(value: unknown): value is RedmineIssueCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;
  return typeof v.project_id === "number" && typeof v.subject === "string";
}

/**
 * Creates handlers for issue-related operations
 * @param context Handler context containing the Redmine client and config
 * @returns Object containing all issue-related handlers
 */
export function createIssuesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists issues with pagination and filters
     * Supports filtering by project, tracker, status, assignee, and custom fields
     */
    list_issues: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      // Extract pagination parameters first
      const { limit, offset } = extractPaginationParams(args);

      // Create validated parameters object
      const params: IssueListParams = {
        limit,
        offset,
      };

      // Handle known parameters safely
      if (args.sort) params.sort = String(args.sort);
      if (args.include) params.include = String(args.include);
      if (args.project_id)
        params.project_id =
          typeof args.project_id === "number"
            ? args.project_id
            : String(args.project_id);
      if (args.issue_id)
        params.issue_id =
          typeof args.issue_id === "number"
            ? args.issue_id
            : String(args.issue_id);
      if (args.subproject_id) params.subproject_id = String(args.subproject_id);
      if (args.project_id)
        params.project_id =
          typeof args.project_id === "number"
            ? args.project_id
            : String(args.project_id);
      if (args.issue_id)
        params.issue_id =
          typeof args.issue_id === "number"
            ? args.issue_id
            : String(args.issue_id);
      if (args.tracker_id) params.tracker_id = Number(args.tracker_id);

      // Handle status_id special values
      if (args.status_id) {
        params.status_id = ["open", "closed", "*"].includes(
          String(args.status_id)
        )
          ? (String(args.status_id) as "open" | "closed" | "*")
          : Number(args.status_id);
      }

      // Handle assigned_to_id special value
      if (args.assigned_to_id) {
        params.assigned_to_id =
          args.assigned_to_id === "me" ? "me" : Number(args.assigned_to_id);
      }

      // Handle date filters
      if (args.created_on) params.created_on = String(args.created_on);
      if (args.updated_on) params.updated_on = String(args.updated_on);

      // Handle custom fields (cf_X parameters)
      for (const [key, value] of Object.entries(args)) {
        if (key.startsWith("cf_")) {
          params[key as `cf_${number}`] = String(value);
        }
      }

      const issues = await client.issues.getIssues(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issues, null, 2),
          },
        ],
        isError: false,
      };
    },

    /**
     * Creates a new issue
     * Requires project_id and subject at minimum
     */
    create_issue: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      if (!isRedmineIssueCreate(args)) {
        throw new Error(
          "Invalid issue create parameters: project_id and subject are required"
        );
      }
      const result = await client.issues.createIssue(args);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatIssueResult(result.issue, "created"),
          },
        ],
        isError: false,
      };
    },

    /**
     * Updates an existing issue
     * All update fields are optional except the issue id
     */
    update_issue: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      const { id: _, ...updateData } = args;
      const result = await client.issues.updateIssue(id, updateData);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatIssueResult(result.issue, "updated"),
          },
        ],
        isError: false,
      };
    },

    /**
     * Deletes an existing issue
     * This action cannot be undone
     */
    delete_issue: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      await client.issues.deleteIssue(id);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatIssueDeleted(id),
          },
        ],
        isError: false,
      };
    },

    /**
     * Adds a user as a watcher to an issue
     * Available since Redmine 2.3.0
     */
    add_issue_watcher: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const issue_id = asNumber(args.issue_id);
      const user_id = asNumber(args.user_id);
      await client.issues.addWatcher(issue_id, user_id);
      return {
        content: [
          {
            type: "text",
            text: `User #${user_id} added as a watcher to issue #${issue_id}`,
          },
        ],
        isError: false,
      };
    },

    /**
     * Removes a user from issue watchers
     * Available since Redmine 2.3.0
     */
    remove_issue_watcher: async (
      args: Record<string, unknown>
    ): Promise<ToolResponse> => {
      const issue_id = asNumber(args.issue_id);
      const user_id = asNumber(args.user_id);
      await client.issues.removeWatcher(issue_id, user_id);
      return {
        content: [
          {
            type: "text",
            text: `User #${user_id} removed from watchers of issue #${issue_id}`,
          },
        ],
        isError: false,
      };
    },
  };
}
