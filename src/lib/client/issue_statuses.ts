import { BaseClient } from "./base.js";
import { RedmineIssueStatusesResponse } from "../types/index.js";

export class IssueStatusesClient extends BaseClient {
  /**
   * Get list of all issue statuses
   * GET /issue_statuses.json
   */
  async getIssueStatuses(): Promise<RedmineIssueStatusesResponse> {
    return await this.performRequest<RedmineIssueStatusesResponse>(
      "issue_statuses.json"
    );
  }
}
