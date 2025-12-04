import {
  HandlerContext,
  ToolResponse,
  ValidationError,
  asNumber,
} from "./types.js";
import * as formatters from "../formatters/index.js";

/**
 * Creates handlers for role-related operations
 */
export function createRolesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists all roles
     */
    list_roles: async (): Promise<ToolResponse> => {
      try {
        const response = await client.roles.getRoles();

        return {
          content: [
            {
              type: "text",
              text: formatters.formatRoles(response.roles),
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
     * Shows a specific role with permissions
     */
    show_role: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.roles.getRole(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatRole(response.role),
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
