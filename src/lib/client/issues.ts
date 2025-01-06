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
  async getIssues(params?: IssueListParams): Promise<RedmineApiResponse<RedmineIssue>> {
    // includeパラメータのバリデーション
    if (params?.include && !validateListIssueIncludes(params.include)) {
      throw new Error("Invalid include parameter for issue list. Valid values are: attachments, relations");
    }

    const validatedParams = params ? IssueQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    const response = await this.performRequest<RedmineApiResponse<RedmineIssue>>(
      `issues.json${query ? `?${query}` : ""}`
    );
    return response;
  }

  async getIssue(id: number, params?: IssueShowParams): Promise<{ issue: RedmineIssue }> {
    // includeパラメータのバリデーション
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

  async deleteIssue(id: number): Promise<void> {
    await this.performRequest(`issues/${id}.json`, {
      method: "DELETE",
    });
  }
}