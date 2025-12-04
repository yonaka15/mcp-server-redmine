import { HandlerContext, ToolResponse } from "./types.js";
import * as formatters from "../formatters/index.js";

/**
 * Creates handlers for issue status-related operations
 */
export function createIssueStatusesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists all issue statuses
     */
    list_issue_statuses: async (): Promise<ToolResponse> => {
      try {
        const response = await client.issueStatuses.getIssueStatuses();
        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssueStatuses(response.issue_statuses),
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
