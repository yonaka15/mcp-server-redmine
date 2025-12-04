import { HandlerContext, ToolResponse } from "./types.js";
import * as formatters from "../formatters/index.js";

/**
 * Creates handlers for enumeration-related operations
 */
export function createEnumerationsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists all issue priorities
     */
    list_issue_priorities: async (): Promise<ToolResponse> => {
      try {
        const response = await client.enumerations.getIssuePriorities();
        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssuePriorities(response.issue_priorities),
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
     * Lists all time entry activities
     */
    list_time_entry_activities: async (): Promise<ToolResponse> => {
      try {
        const response = await client.enumerations.getTimeEntryActivities();
        return {
          content: [
            {
              type: "text",
              text: formatters.formatTimeEntryActivities(response.time_entry_activities),
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
     * Lists all document categories
     */
    list_document_categories: async (): Promise<ToolResponse> => {
      try {
        const response = await client.enumerations.getDocumentCategories();
        return {
          content: [
            {
              type: "text",
              text: formatters.formatDocumentCategories(response.document_categories),
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
