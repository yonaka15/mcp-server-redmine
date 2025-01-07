import {
  HandlerContext,
  ToolResponse,
  asNumber,
  asStringOrNumber,
  extractPaginationParams,
} from "./types.js";
import type { RedmineTimeEntryCreate } from "../lib/types/index.js";

/**
 * Validates date format YYYY-MM-DD
 */
function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  return parsedDate.toString() !== "Invalid Date";
}

/**
 * Extract and validate time entry parameters
 */
function extractTimeEntryParams(args: Record<string, unknown>): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // Handle project_id which can be string or number
  if ("project_id" in args) {
    params.project_id = asStringOrNumber(args.project_id);
  }

  // Handle date filters
  if (typeof args.spent_on === "string") {
    if (!isValidDate(args.spent_on)) {
      throw new Error("Invalid date format for spent_on. Use YYYY-MM-DD");
    }
    params.spent_on = args.spent_on;
  }

  if (typeof args.from === "string") {
    if (!isValidDate(args.from)) {
      throw new Error("Invalid date format for from. Use YYYY-MM-DD");
    }
    params.from = args.from;
  }

  if (typeof args.to === "string") {
    if (!isValidDate(args.to)) {
      throw new Error("Invalid date format for to. Use YYYY-MM-DD");
    }
    params.to = args.to;
  }

  // Handle user_id
  if (typeof args.user_id === "number") {
    params.user_id = args.user_id;
  }

  // Add pagination params
  return {
    ...params,
    ...extractPaginationParams(args),
  };
}

/**
 * Type guard for RedmineTimeEntryCreate with improved validation
 */
function isRedmineTimeEntryCreate(value: unknown): value is RedmineTimeEntryCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;

  // Check required hours
  if (typeof v.hours !== "number" || v.hours <= 0) {
    throw new Error("hours must be a positive number");
  }

  // Check project_id or issue_id is provided
  if (!("project_id" in v) && !("issue_id" in v)) {
    throw new Error("Either project_id or issue_id is required");
  }

  // Validate spent_on if provided
  if ("spent_on" in v && typeof v.spent_on === "string") {
    if (!isValidDate(v.spent_on)) {
      throw new Error("Invalid date format for spent_on. Use YYYY-MM-DD");
    }
  }

  // Validate activity_id
  if (!("activity_id" in v)) {
    throw new Error("activity_id is required unless a default activity is defined in Redmine");
  }

  // Validate comments length
  if ("comments" in v && typeof v.comments === "string" && v.comments.length > 255) {
    throw new Error("comments must not exceed 255 characters");
  }

  return true;
}

export function createTimeEntriesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    list_time_entries: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const validatedArgs = extractTimeEntryParams(args);
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

    show_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
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

      // Validate update data
      if ("hours" in updateData && (typeof updateData.hours !== "number" || updateData.hours <= 0)) {
        throw new Error("hours must be a positive number");
      }

      if ("spent_on" in updateData && typeof updateData.spent_on === "string") {
        if (!isValidDate(updateData.spent_on)) {
          throw new Error("Invalid date format for spent_on. Use YYYY-MM-DD");
        }
      }

      if ("comments" in updateData && typeof updateData.comments === "string" && updateData.comments.length > 255) {
        throw new Error("comments must not exceed 255 characters");
      }

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