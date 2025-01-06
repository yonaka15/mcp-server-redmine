import { BaseClient } from "./base.js";
import {
  RedmineApiResponse,
  RedmineTimeEntry,
  RedmineTimeEntryCreate,
  RedmineTimeEntryUpdate,
} from "../types/index.js";
import {
  TimeEntryQueryParams,
  TimeEntryQuerySchema,
  RedmineTimeEntrySchema,
} from "../types/time_entries/schema.js";

export class TimeEntriesClient extends BaseClient {
  async getTimeEntries(params?: TimeEntryQueryParams): Promise<RedmineApiResponse<RedmineTimeEntry>> {
    const validatedParams = params ? TimeEntryQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    const response = await this.performRequest<RedmineApiResponse<RedmineTimeEntry>>(
      `time_entries.json${query ? `?${query}` : ""}`
    );
    return response;
  }

  async getTimeEntry(id: number): Promise<{ time_entry: RedmineTimeEntry }> {
    const response = await this.performRequest<{ time_entry: RedmineTimeEntry }>(
      `time_entries/${id}.json`
    );
    return {
      time_entry: RedmineTimeEntrySchema.parse(response.time_entry),
    };
  }

  async createTimeEntry(
    timeEntry: RedmineTimeEntryCreate
  ): Promise<{ time_entry: RedmineTimeEntry }> {
    const response = await this.performRequest<{ time_entry: RedmineTimeEntry }>(
      "time_entries.json",
      {
        method: "POST",
        body: JSON.stringify({ time_entry: timeEntry }),
      }
    );
    return {
      time_entry: RedmineTimeEntrySchema.parse(response.time_entry),
    };
  }

  async updateTimeEntry(
    id: number,
    timeEntry: RedmineTimeEntryUpdate
  ): Promise<{ time_entry: RedmineTimeEntry }> {
    const response = await this.performRequest<{ time_entry: RedmineTimeEntry }>(
      `time_entries/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ time_entry: timeEntry }),
      }
    );
    return {
      time_entry: RedmineTimeEntrySchema.parse(response.time_entry),
    };
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await this.performRequest(
      `time_entries/${id}.json`,
      {
        method: "DELETE",
      }
    );
  }
}