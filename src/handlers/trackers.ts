import { HandlerContext, ToolResponse } from "./types.js";
import * as formatters from "../formatters/index.js";

/**
 * Creates handlers for tracker-related operations
 */
export function createTrackersHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists all trackers
     */
    list_trackers: async (): Promise<ToolResponse> => {
      try {
        const response = await client.trackers.getTrackers();
        return {
          content: [
            {
              type: "text",
              text: formatters.formatTrackers(response.trackers),
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
