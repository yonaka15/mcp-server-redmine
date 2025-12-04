import { BaseClient } from "./base.js";
import {
  RedmineIssueCategory,
  RedmineIssueCategoriesResponse,
  RedmineIssueCategoryCreate,
  RedmineIssueCategoryUpdate,
} from "../types/index.js";
import { RedmineIssueCategorySchema } from "../types/issue_categories/schema.js";

export class IssueCategoriesClient extends BaseClient {
  /**
   * Get list of issue categories for a project
   * GET /projects/:project_id/issue_categories.json
   */
  async getIssueCategories(
    projectId: number | string
  ): Promise<RedmineIssueCategoriesResponse> {
    return await this.performRequest<RedmineIssueCategoriesResponse>(
      `projects/${projectId}/issue_categories.json`
    );
  }

  /**
   * Get a single issue category by ID
   * GET /issue_categories/:id.json
   */
  async getIssueCategory(id: number): Promise<{ issue_category: RedmineIssueCategory }> {
    const response = await this.performRequest<{ issue_category: RedmineIssueCategory }>(
      `issue_categories/${id}.json`
    );
    return {
      issue_category: RedmineIssueCategorySchema.parse(response.issue_category),
    };
  }

  /**
   * Create a new issue category for a project
   * POST /projects/:project_id/issue_categories.json
   */
  async createIssueCategory(
    projectId: number | string,
    issueCategory: RedmineIssueCategoryCreate
  ): Promise<{ issue_category: RedmineIssueCategory }> {
    const response = await this.performRequest<{ issue_category: RedmineIssueCategory }>(
      `projects/${projectId}/issue_categories.json`,
      {
        method: "POST",
        body: JSON.stringify({ issue_category: issueCategory }),
      }
    );
    return {
      issue_category: RedmineIssueCategorySchema.parse(response.issue_category),
    };
  }

  /**
   * Update an issue category
   * PUT /issue_categories/:id.json
   */
  async updateIssueCategory(
    id: number,
    issueCategory: RedmineIssueCategoryUpdate
  ): Promise<{ issue_category: RedmineIssueCategory }> {
    const response = await this.performRequest<{ issue_category: RedmineIssueCategory }>(
      `issue_categories/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ issue_category: issueCategory }),
      }
    );
    return {
      issue_category: RedmineIssueCategorySchema.parse(response.issue_category),
    };
  }

  /**
   * Delete an issue category
   * DELETE /issue_categories/:id.json
   * @param reassignToId Optional category ID to reassign issues to before deletion
   */
  async deleteIssueCategory(id: number, reassignToId?: number): Promise<void> {
    const query = reassignToId ? `?reassign_to_id=${reassignToId}` : "";
    await this.performRequest(`issue_categories/${id}.json${query}`, {
      method: "DELETE",
    });
  }
}
