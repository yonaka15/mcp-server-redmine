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
   * Get a list of issues with pagination and filters
   */
  async getIssues(params?: IssueListParams): Promise<RedmineApiResponse<RedmineIssue>> {
    // Validate include parameter
    if (params?.include && !validateListIssueIncludes(params.include)) {
      throw new Error("Invalid include parameter for issue list. Valid values are: attachments, relations");
    }

    // Validate and format parameters with default values
    const defaultParams = {
      limit: 25,  // Default value
      offset: 0   // Default value
    };

    // Merge with provided params
    const mergedParams = {
      ...defaultParams,
      ...params
    };

    // Validate merged params
    const validatedParams = IssueQuerySchema.parse(mergedParams);

    const query = this.encodeQueryParams(validatedParams);
    const response = await this.performRequest<RedmineApiResponse<RedmineIssue>>(
      `issues.json${query ? `?${query}` : ""}`
    );

    // Enforce response limit using default value if limit is undefined
    const effectiveLimit = defaultParams.limit;
    if (Array.isArray(response.issues) && response.issues.length > effectiveLimit) {
      response.issues = response.issues.slice(0, effectiveLimit);
      response.total_count = Math.min(response.total_count || 0, effectiveLimit);
    }

    return response;
  }

  /**
   * Get a single issue by ID
   */
  async getIssue(id: number, params?: IssueShowParams): Promise<{ issue: RedmineIssue }> {
    // Validate include parameter
    if (params?.include && !validateShowIssueIncludes(params.include)) {
      throw new Error("Invalid include parameter for single issue. Valid values are: children, attachments, relations, changesets, journals, watchers, allowed_statuses");
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
   */
  async createIssue(issue: RedmineIssueCreate): Promise<{ issue: RedmineIssue }> {
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
   */
  async deleteIssue(id: number): Promise<void> {
    await this.performRequest(`issues/${id}.json`, {
      method: "DELETE",
    });
  }
}