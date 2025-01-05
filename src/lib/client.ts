import {
  RedmineIssue,
  RedmineProject,
  RedmineTimeEntry,
  RedmineApiResponse,
  RedmineErrorResponse,
  IssueQueryParams,
  ProjectQueryParams,
  TimeEntryQueryParams,
  RedmineIssueCreate,
  RedmineIssueUpdate,
  RedmineProjectCreate,
  RedmineTimeEntryCreate,
  RedmineTimeEntryUpdate,
  IssueQuerySchema,
  ProjectQuerySchema,
  TimeEntryQuerySchema,
  RedmineIssueSchema,
  RedmineProjectSchema,
  RedmineTimeEntrySchema,
} from "./types.js";
import config from "./config.js";

/**
 * Redmine API クライアントエラー
 */
export class RedmineApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly errors: string[]
  ) {
    super(`Redmine API error: ${status} ${statusText}\n${errors.join(", ")}`);
    this.name = "RedmineApiError";
  }
}

/**
 * Redmine API クライアント
 */
export class RedmineClient {
  /**
   * Redmine APIにリクエストを送信
   */
  private async performRequest<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = new URL(path, config.redmine.host);
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage: string[];
      try {
        const errorResponse = await response.json() as RedmineErrorResponse;
        errorMessage = errorResponse.errors;
      } catch {
        errorMessage = [await response.text()];
      }
      throw new RedmineApiError(
        response.status,
        response.statusText,
        errorMessage
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * クエリパラメータのエンコード
   */
  private encodeQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {  // null チェックを追加
        if (Array.isArray(value)) {
          if (key === "include") {
            searchParams.set(key, value.join(","));
          } else {
            value.forEach(v => searchParams.append(key, v.toString()));
          }
        } else if (value instanceof Date) {
          searchParams.set(key, value.toISOString().split('T')[0]);
        } else if (typeof value === 'object') {
          // オブジェクトの場合は文字列化
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });
    return searchParams.toString();
  }

  // Issues
  async getIssues(params?: IssueQueryParams): Promise<RedmineApiResponse<RedmineIssue>> {
    const validatedParams = params ? IssueQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    const response = await this.performRequest<RedmineApiResponse<RedmineIssue>>(
      `issues.json${query ? `?${query}` : ""}`
    );
    return response;
  }

  async getIssue(id: number): Promise<{ issue: RedmineIssue }> {
    const response = await this.performRequest<{ issue: RedmineIssue }>(
      `issues/${id}.json`
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

  // Projects
  async getProjects(params?: ProjectQueryParams): Promise<RedmineApiResponse<RedmineProject>> {
    console.log("Search parameters:", params); // デバッグログ追加
    const validatedParams = params ? ProjectQuerySchema.parse(params) : undefined;
    console.log("Validated parameters:", validatedParams); // デバッグログ追加
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    console.log("Encoded query:", query); // デバッグログ追加
    const response = await this.performRequest<RedmineApiResponse<RedmineProject>>(
      `projects.json${query ? `?${query}` : ""}`
    );
    return response;
  }

  async getProject(idOrIdentifier: number | string): Promise<{ project: RedmineProject }> {
    const response = await this.performRequest<{ project: RedmineProject }>(
      `projects/${idOrIdentifier}.json`
    );
    return {
      project: RedmineProjectSchema.parse(response.project),
    };
  }

  async createProject(project: RedmineProjectCreate): Promise<{ project: RedmineProject }> {
    const response = await this.performRequest<{ project: RedmineProject }>(
      "projects.json",
      {
        method: "POST",
        body: JSON.stringify({ project }),
      }
    );
    return {
      project: RedmineProjectSchema.parse(response.project),
    };
  }

  async updateProject(
    idOrIdentifier: number | string,
    project: Partial<RedmineProjectCreate>
  ): Promise<{ project: RedmineProject }> {
    const response = await this.performRequest<{ project: RedmineProject }>(
      `projects/${idOrIdentifier}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ project }),
      }
    );
    return {
      project: RedmineProjectSchema.parse(response.project),
    };
  }

  async archiveProject(idOrIdentifier: number | string): Promise<void> {
    await this.performRequest(
      `projects/${idOrIdentifier}/archive.json`,
      {
        method: "PUT",
      }
    );
  }

  async unarchiveProject(idOrIdentifier: number | string): Promise<void> {
    await this.performRequest(
      `projects/${idOrIdentifier}/unarchive.json`,
      {
        method: "PUT",
      }
    );
  }

  async deleteProject(idOrIdentifier: number | string): Promise<void> {
    await this.performRequest(
      `projects/${idOrIdentifier}.json`,
      {
        method: "DELETE",
      }
    );
  }

  // Time Entries
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

// クライアントのシングルトンインスタンス
export const redmineClient = new RedmineClient();