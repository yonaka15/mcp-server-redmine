import { BaseClient } from "./base.js";
import {
  RedmineMembership,
  RedmineMembershipsResponse,
  RedmineMembershipCreate,
  RedmineMembershipUpdate,
} from "../types/index.js";
import { RedmineMembershipSchema } from "../types/memberships/schema.js";

export class MembershipsClient extends BaseClient {
  /**
   * Get list of memberships for a project
   * GET /projects/:project_id/memberships.json
   */
  async getMemberships(
    projectId: number | string,
    params?: { offset?: number; limit?: number }
  ): Promise<RedmineMembershipsResponse> {
    const query = params ? this.encodeQueryParams(params) : "";
    return await this.performRequest<RedmineMembershipsResponse>(
      `projects/${projectId}/memberships.json${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get a single membership by ID
   * GET /memberships/:id.json
   */
  async getMembership(id: number): Promise<{ membership: RedmineMembership }> {
    const response = await this.performRequest<{ membership: RedmineMembership }>(
      `memberships/${id}.json`
    );
    return {
      membership: RedmineMembershipSchema.parse(response.membership),
    };
  }

  /**
   * Create a new membership for a project
   * POST /projects/:project_id/memberships.json
   */
  async createMembership(
    projectId: number | string,
    membership: RedmineMembershipCreate
  ): Promise<{ membership: RedmineMembership }> {
    const response = await this.performRequest<{ membership: RedmineMembership }>(
      `projects/${projectId}/memberships.json`,
      {
        method: "POST",
        body: JSON.stringify({ membership }),
      }
    );
    return {
      membership: RedmineMembershipSchema.parse(response.membership),
    };
  }

  /**
   * Update a membership (roles only)
   * PUT /memberships/:id.json
   */
  async updateMembership(
    id: number,
    membership: RedmineMembershipUpdate
  ): Promise<void> {
    await this.performRequest(`memberships/${id}.json`, {
      method: "PUT",
      body: JSON.stringify({ membership }),
    });
  }

  /**
   * Delete a membership
   * DELETE /memberships/:id.json
   */
  async deleteMembership(id: number): Promise<void> {
    await this.performRequest(`memberships/${id}.json`, {
      method: "DELETE",
    });
  }
}
