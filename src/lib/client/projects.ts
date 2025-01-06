import { BaseClient } from "./base.js";
import {
  RedmineApiResponse,
  RedmineProject,
  RedmineProjectCreate,
} from "../types/index.js";
import {
  ProjectQueryParams,
  ProjectQuerySchema,
  RedmineProjectSchema,
} from "../types/projects/schema.js";

export class ProjectsClient extends BaseClient {
  async getProjects(params?: ProjectQueryParams): Promise<RedmineApiResponse<RedmineProject>> {
    const validatedParams = params ? ProjectQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
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
}