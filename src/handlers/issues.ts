import { HandlerContext, ToolResponse, asNumber, extractPaginationParams } from "./types.js";
import * as formatters from "../formatters/index.js";
import type { RedmineIssueCreate, IssueListParams } from "../lib/types/index.js";

/**
 * Type guard for RedmineIssueCreate
 */
function isRedmineIssueCreate(value: unknown): value is RedmineIssueCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;
  return typeof v.project_id === "number" && typeof v.subject === "string";
}

/**
 * Create handlers for issue-related operations
 */
export function createIssuesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Search issues with pagination and filters
     */
    search_issues: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      // Extract and validate pagination parameters
      const pagination = extractPaginationParams(args);
      
      // Merge with other parameters
      const params: IssueListParams = {
        ...pagination,
        ...args
      };

      const issues = await client.issues.getIssues(params);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatIssues(issues),
          },
        ],
        isError: false,
      };
    },

    /**
     * Create a new issue
     */
    create_issue: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      if (!isRedmineIssueCreate(args)) {
        throw new Error("Invalid issue create parameters");
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
     * Update an existing issue
     */
    update_issue: async (args: Record<string, unknown>): Promise<ToolResponse> => {
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
     * Delete an issue
     */
    delete_issue: async (args: Record<string, unknown>): Promise<ToolResponse> => {
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
  };
}