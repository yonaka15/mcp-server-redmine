import { BaseClient } from "./base.js";
import {
  RedmineVersion,
  RedmineVersionsResponse,
  RedmineVersionCreate,
  RedmineVersionUpdate,
} from "../types/index.js";
import { RedmineVersionSchema } from "../types/versions/schema.js";

export class VersionsClient extends BaseClient {
  /**
   * Get list of versions for a project
   * GET /projects/:project_id/versions.json
   */
  async getVersions(projectId: number | string): Promise<RedmineVersionsResponse> {
    return await this.performRequest<RedmineVersionsResponse>(
      `projects/${projectId}/versions.json`
    );
  }

  /**
   * Get a single version by ID
   * GET /versions/:id.json
   */
  async getVersion(id: number): Promise<{ version: RedmineVersion }> {
    const response = await this.performRequest<{ version: RedmineVersion }>(
      `versions/${id}.json`
    );
    return {
      version: RedmineVersionSchema.parse(response.version),
    };
  }

  /**
   * Create a new version for a project
   * POST /projects/:project_id/versions.json
   */
  async createVersion(
    projectId: number | string,
    version: RedmineVersionCreate
  ): Promise<{ version: RedmineVersion }> {
    const response = await this.performRequest<{ version: RedmineVersion }>(
      `projects/${projectId}/versions.json`,
      {
        method: "POST",
        body: JSON.stringify({ version }),
      }
    );
    return {
      version: RedmineVersionSchema.parse(response.version),
    };
  }

  /**
   * Update a version
   * PUT /versions/:id.json
   */
  async updateVersion(
    id: number,
    version: RedmineVersionUpdate
  ): Promise<{ version: RedmineVersion }> {
    const response = await this.performRequest<{ version: RedmineVersion }>(
      `versions/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ version }),
      }
    );
    return {
      version: RedmineVersionSchema.parse(response.version),
    };
  }

  /**
   * Delete a version
   * DELETE /versions/:id.json
   */
  async deleteVersion(id: number): Promise<void> {
    await this.performRequest(`versions/${id}.json`, {
      method: "DELETE",
    });
  }
}
