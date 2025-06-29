import {
  HandlerContext,
  ToolResponse,
  asNumber,
  asNumberOrSpecial,
  extractPaginationParams,
  ValidationError,
} from "./types.js";
import type { RedmineTimeEntryCreate, RedmineTimeEntryUpdate } from "../lib/types/index.js";
import * as formatters from "../formatters/index.js";

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

  if ("project_id" in args) {
    const projectId = asNumberOrSpecial(args.project_id);
    params.project_id = projectId;
  }

  if (typeof args.spent_on === "string") {
    if (!isValidDate(args.spent_on)) {
      throw new ValidationError("Invalid date format for spent_on. Use YYYY-MM-DD");
    }
    params.spent_on = args.spent_on;
  }

  if (typeof args.from === "string") {
    if (!isValidDate(args.from)) {
      throw new ValidationError("Invalid date format for from. Use YYYY-MM-DD");
    }
    params.from = args.from;
  }

  if (typeof args.to === "string") {
    if (!isValidDate(args.to)) {
      throw new ValidationError("Invalid date format for to. Use YYYY-MM-DD");
    }
    params.to = args.to;
  }

  if (typeof args.user_id === "number") {
    params.user_id = args.user_id;
  }

  return {
    ...params,
    ...extractPaginationParams(args),
  };
}

function validateTimeEntryPayload(payload: Record<string, unknown>) {
  if (typeof payload.hours !== "number" || payload.hours <= 0) {
    throw new ValidationError("hours must be a positive number");
  }

  if ("spent_on" in payload && typeof payload.spent_on === "string" && !isValidDate(payload.spent_on)) {
      throw new ValidationError("Invalid date format for spent_on. Use YYYY-MM-DD");
  }

  if ("comments" in payload && typeof payload.comments === "string" && payload.comments.length > 255) {
    throw new ValidationError("comments must not exceed 255 characters");
  }
}

export function createTimeEntriesHandlers(context: HandlerContext) {
  const { client } = context;

  const create_time_entry_generic = async (args: Record<string, unknown>): Promise<ToolResponse> => {
    try {
      validateTimeEntryPayload(args);

      // HACK: Adjust the interface of the tool to match the type of client.timeEntries.createTimeEntry
      const { issue_id, project_id, hours, activity_id, spent_on, comments } = args;

      const time_entry: RedmineTimeEntryCreate = {
        hours: asNumber(hours),
        activity_id: asNumber(activity_id),
      };

      if (issue_id) {
        time_entry.issue_id = asNumber(issue_id);
      } else if (project_id) {
        time_entry.project_id = asNumber(project_id);
      }

      if (spent_on) {
        time_entry.spent_on = String(spent_on);
      }
      if (comments) {
        time_entry.comments = String(comments);
      }

      const result = await client.timeEntries.createTimeEntry(time_entry);
      return {
        content: [{ type: "text", text: formatters.formatTimeEntryResult(result.time_entry, "created") }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
        isError: true,
      };
    }
  };

  return {
    list_time_entries: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const validatedArgs = extractTimeEntryParams(args);
        const entries = await client.timeEntries.getTimeEntries(validatedArgs);
        return {
          content: [{ type: "text", text: formatters.formatTimeEntries(entries) }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        };
      }
    },

    show_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const id = asNumber(args.id);
        const { time_entry } = await client.timeEntries.getTimeEntry(id);
        return {
          content: [{ type: "text", text: formatters.formatTimeEntry(time_entry) }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        };
      }
    },

    create_time_entry_for_project: create_time_entry_generic,
    create_time_entry_for_issue: create_time_entry_generic,

    update_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const id = asNumber(args.id);
        const { id: _, ...updateData } = args;

        validateTimeEntryPayload(updateData);

        const { time_entry } = await client.timeEntries.updateTimeEntry(id, updateData as RedmineTimeEntryUpdate);
        return {
          content: [{ type: "text", text: formatters.formatTimeEntryResult(time_entry, "updated") }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        };
      }
    },

    delete_time_entry: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const id = asNumber(args.id);
        await client.timeEntries.deleteTimeEntry(id);
        return {
          content: [{ type: "text", text: formatters.formatTimeEntryDeleted(id) }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        };
      }
    },
  };
}
