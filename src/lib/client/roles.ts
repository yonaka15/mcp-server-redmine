import { BaseClient } from "./base.js";
import { RedmineRole, RedmineRolesResponse } from "../types/index.js";
import { RedmineRoleSchema } from "../types/roles/schema.js";

export class RolesClient extends BaseClient {
  /**
   * Get list of all roles
   * GET /roles.json
   */
  async getRoles(): Promise<RedmineRolesResponse> {
    return await this.performRequest<RedmineRolesResponse>("roles.json");
  }

  /**
   * Get a single role by ID with permissions
   * GET /roles/:id.json
   * Available since Redmine 2.2.0
   */
  async getRole(id: number): Promise<{ role: RedmineRole }> {
    const response = await this.performRequest<{ role: RedmineRole }>(
      `roles/${id}.json`
    );
    return {
      role: RedmineRoleSchema.parse(response.role),
    };
  }
}
