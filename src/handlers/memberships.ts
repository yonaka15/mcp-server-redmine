import {
  HandlerContext,
  ToolResponse,
  ValidationError,
  asNumber,
  extractPaginationParams,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import type { RedmineMembershipCreate, RedmineMembershipUpdate } from "../lib/types/index.js";

/**
 * Creates handlers for membership-related operations
 */
export function createMembershipsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists memberships for a project
     */
    list_memberships: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }

        const projectId = String(argsObj.project_id);
        const { limit, offset } = extractPaginationParams(argsObj);
        const response = await client.memberships.getMemberships(projectId, { limit, offset });

        return {
          content: [
            {
              type: "text",
              text: formatters.formatMemberships(response.memberships, response.total_count),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Shows a specific membership
     */
    show_membership: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.memberships.getMembership(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatMembership(response.membership),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Creates a new membership
     */
    create_membership: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }
        if (!("user_id" in argsObj)) {
          throw new ValidationError("user_id is required");
        }
        if (!("role_ids" in argsObj) || !Array.isArray(argsObj.role_ids)) {
          throw new ValidationError("role_ids is required and must be an array");
        }

        const projectId = String(argsObj.project_id);
        const membershipData: RedmineMembershipCreate = {
          user_id: asNumber(argsObj.user_id),
          role_ids: (argsObj.role_ids as unknown[]).map((id) => asNumber(id)),
        };

        const response = await client.memberships.createMembership(projectId, membershipData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatMembershipResult(response.membership, "created"),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Updates a membership
     */
    update_membership: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }
        if (!("role_ids" in argsObj) || !Array.isArray(argsObj.role_ids)) {
          throw new ValidationError("role_ids is required and must be an array");
        }

        const id = asNumber(argsObj.id);
        const membershipData: RedmineMembershipUpdate = {
          role_ids: (argsObj.role_ids as unknown[]).map((roleId) => asNumber(roleId)),
        };

        await client.memberships.updateMembership(id, membershipData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatMembershipUpdated(id),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Deletes a membership
     */
    delete_membership: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        await client.memberships.deleteMembership(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatMembershipDeleted(id),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },
  };
}
