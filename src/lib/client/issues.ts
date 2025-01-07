import { BaseClient } from "./base.js";
import {
  RedmineApiResponse,
  RedmineIssue,
  IssueListParams,
  IssueShowParams,
  RedmineIssueCreate,
  RedmineIssueUpdate,
} from "../types/index.js";
import {
  IssueQuerySchema,
  RedmineIssueSchema,
  validateListIssueIncludes,
  validateShowIssueIncludes,
} from "../types/issues/schema.js";

export class IssuesClient extends BaseClient {
  /**
   * List issues with pagination and filters
   *
   * @param params Optional parameters for filtering and pagination
   * @returns Promise with paginated issue list
   * @throws Error if include parameter is invalid
   */
  async getIssues(
    params?: IssueListParams
  ): Promise<RedmineApiResponse<RedmineIssue>> {
    // Validate include parameter
    if (params?.include && !validateListIssueIncludes(params.include)) {
      throw new Error(
        "Invalid include parameter for issue list. Valid values are: attachments, relations"
      );
    }

    // Validate and format parameters with default values
    const defaultParams = {
      limit: 25, // Default value
      offset: 0, // Default value
    };

    // Merge with provided params
    const mergedParams = {
      ...defaultParams,
      ...params,
    };

    // Validate merged params
    const validatedParams = IssueQuerySchema.parse(mergedParams);

    const query = this.encodeQueryParams(validatedParams);
    return await this.performRequest<RedmineApiResponse<RedmineIssue>>(
      `issues.json${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get a single issue by ID
   *
   * @param id Issue ID
   * @param params Optional parameters for including related data
   * @returns Promise with single issue
   * @throws Error if include parameter is invalid
   */
  async getIssue(
    id: number,
    params?: IssueShowParams
  ): Promise<{ issue: RedmineIssue }> {
    // Validate include parameter
    if (params?.include && !validateShowIssueIncludes(params.include)) {
      throw new Error(
        "Invalid include parameter for single issue. Valid values are: children, attachments, relations, changesets, journals, watchers, allowed_statuses"
      );
    }

    const query = params ? this.encodeQueryParams(params) : "";
    const response = await this.performRequest<{ issue: RedmineIssue }>(
      `issues/${id}.json${query ? `?${query}` : ""}`
    );
    return {
      issue: RedmineIssueSchema.parse(response.issue),
    };
  }

  /**
   * Create a new issue
   *
   * @param issue Issue creation parameters
   * @returns Promise with created issue
   */
  async createIssue(
    issue: RedmineIssueCreate
  ): Promise<{ issue: RedmineIssue }> {
    const response = await this.performRequest<{ issue: RedmineIssue }>(
      "issues.json",
      {
        method: "POST",
        body: JSON.stringify({ issue }),
      }
    );
    return {
      issue: RedmineIssueSchema.parse(response.issue),
    };
  }

  /**
   * Update an existing issue
   *
   * @param id Issue ID to update
   * @param issue Update parameters
   * @returns Promise with updated issue
   */
  async updateIssue(
    id: number,
    issue: RedmineIssueUpdate
  ): Promise<{ issue: RedmineIssue }> {
    const response = await this.performRequest<{ issue: RedmineIssue }>(
      `issues/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ issue }),
      }
    );
    return {
      issue: RedmineIssueSchema.parse(response.issue),
    };
  }

  /**
   * Delete an issue
   *
   * @param id Issue ID to delete
   * @returns Promise that resolves when the issue is deleted
   */
  async deleteIssue(id: number): Promise<void> {
    await this.performRequest(`issues/${id}.json`, {
      method: "DELETE",
    });
  }

  /**
   * Add a user as a watcher to an issue
   * Available since Redmine 2.3.0
   *
   * @param issueId Issue ID to add watcher to
   * @param userId User ID to add as watcher
   * @returns Promise that resolves when the watcher is added
   */
  async addWatcher(issueId: number, userId: number): Promise<void> {
    await this.performRequest(`issues/${issueId}/watchers.json`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Remove a user from issue watchers
   * Available since Redmine 2.3.0
   *
   * @param issueId Issue ID to remove watcher from
   * @param userId User ID to remove from watchers
   * @returns Promise that resolves when the watcher is removed
   */
  async removeWatcher(issueId: number, userId: number): Promise<void> {
    await this.performRequest(`issues/${issueId}/watchers/${userId}.json`, {
      method: "DELETE",
    });
  }
}

