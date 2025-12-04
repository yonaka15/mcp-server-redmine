import { BaseClient } from "./base.js";
import {
  RedmineIssuePrioritiesResponse,
  RedmineTimeEntryActivitiesResponse,
  RedmineDocumentCategoriesResponse,
} from "../types/index.js";

export class EnumerationsClient extends BaseClient {
  /**
   * Get list of issue priorities
   * GET /enumerations/issue_priorities.json
   */
  async getIssuePriorities(): Promise<RedmineIssuePrioritiesResponse> {
    return await this.performRequest<RedmineIssuePrioritiesResponse>(
      "enumerations/issue_priorities.json"
    );
  }

  /**
   * Get list of time entry activities
   * GET /enumerations/time_entry_activities.json
   */
  async getTimeEntryActivities(): Promise<RedmineTimeEntryActivitiesResponse> {
    return await this.performRequest<RedmineTimeEntryActivitiesResponse>(
      "enumerations/time_entry_activities.json"
    );
  }

  /**
   * Get list of document categories
   * GET /enumerations/document_categories.json
   */
  async getDocumentCategories(): Promise<RedmineDocumentCategoriesResponse> {
    return await this.performRequest<RedmineDocumentCategoriesResponse>(
      "enumerations/document_categories.json"
    );
  }
}
