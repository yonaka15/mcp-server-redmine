import {
  HandlerContext,
  ToolResponse,
  ValidationError,
  asNumber,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import type { RedmineIssueCategoryCreate, RedmineIssueCategoryUpdate } from "../lib/types/index.js";

/**
 * Creates handlers for issue category-related operations
 */
export function createIssueCategoriesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists issue categories for a project
     */
    list_issue_categories: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }

        const projectId = String(argsObj.project_id);
        const response = await client.issueCategories.getIssueCategories(projectId);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueCategories(response.issue_categories),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Shows a specific issue category
     */
    show_issue_category: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.issueCategories.getIssueCategory(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueCategory(response.issue_category),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Creates a new issue category
     */
    create_issue_category: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }
        if (!("name" in argsObj)) {
          throw new ValidationError("name is required");
        }

        const projectId = String(argsObj.project_id);
        const categoryData: RedmineIssueCategoryCreate = {
          name: String(argsObj.name),
        };

        if ("assigned_to_id" in argsObj) {
          categoryData.assigned_to_id = asNumber(argsObj.assigned_to_id);
        }

        const response = await client.issueCategories.createIssueCategory(projectId, categoryData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueCategoryResult(response.issue_category, "created"),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Updates an issue category
     */
    update_issue_category: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const categoryData: RedmineIssueCategoryUpdate = {};

        if ("name" in argsObj) {
          categoryData.name = String(argsObj.name);
        }
        if ("assigned_to_id" in argsObj) {
          categoryData.assigned_to_id = asNumber(argsObj.assigned_to_id);
        }

        const response = await client.issueCategories.updateIssueCategory(id, categoryData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueCategoryResult(response.issue_category, "updated"),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Deletes an issue category
     */
    delete_issue_category: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const reassignToId = "reassign_to_id" in argsObj ? asNumber(argsObj.reassign_to_id) : undefined;

        await client.issueCategories.deleteIssueCategory(id, reassignToId);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueCategoryDeleted(id),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },
  };
}
