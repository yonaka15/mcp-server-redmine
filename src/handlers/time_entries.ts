import {
  HandlerContext,
  ToolResponse,
  asNumber,
  extractPaginationParams,
} from "./types.js";
import type { RedmineTimeEntryCreate } from "../lib/types/index.js";

// RedmineTimeEntryCreateの型チェック
function isRedmineTimeEntryCreate(value: unknown): value is RedmineTimeEntryCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;
  return typeof v.hours === "number" && typeof v.activity_id === "number";
}

export function createTimeEntriesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    search_time_entries: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const validatedArgs = extractPaginationParams(args);
      const entries = await client.timeEntries.getTimeEntries(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(entries, null, 2),
          },
        ],
        isError: false,
      };
    },

    get_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      const result = await client.timeEntries.getTimeEntry(id);
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

    create_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      if (!isRedmineTimeEntryCreate(args)) {
        throw new Error("Invalid time entry create parameters");
      }
      const result = await client.timeEntries.createTimeEntry(args);
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

    update_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      const { id: _, ...updateData } = args;
      const result = await client.timeEntries.updateTimeEntry(id, updateData);
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

    delete_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      await client.timeEntries.deleteTimeEntry(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "success", message: `Time entry #${id} has been deleted` }),
          },
        ],
        isError: false,
      };
    },
  };
}