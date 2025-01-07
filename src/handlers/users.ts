import { HandlerContext, ToolResponse, asNumber, asStringOrNumber, extractPaginationParams } from "./types.js";
import type { UserListParams, UserShowParams, RedmineUserCreate } from "../lib/types/index.js";

/**
 * Validate include parameter for user details
 */
function validateInclude(include: string): boolean {
  const validValues = ["memberships", "groups"];
  const values = include.split(",").map(v => v.trim());
  return values.every(v => validValues.includes(v));
}

/**
 * Type guard for user creation parameters
 */
function isRedmineUserCreate(value: unknown): value is RedmineUserCreate {
  if (typeof value !== "object" || !value) return false;
  const v = value as Record<string, unknown>;

  // Check required fields
  if (typeof v.login !== "string" || v.login.trim() === "") {
    throw new Error("login is required and must be a non-empty string");
  }
  if (typeof v.firstname !== "string" || v.firstname.trim() === "") {
    throw new Error("firstname is required and must be a non-empty string");
  }
  if (typeof v.lastname !== "string" || v.lastname.trim() === "") {
    throw new Error("lastname is required and must be a non-empty string");
  }
  if (typeof v.mail !== "string" || !v.mail.includes("@")) {
    throw new Error("mail is required and must be a valid email address");
  }

  // If password is provided but generate_password is true
  if (v.password && v.generate_password) {
    throw new Error("Cannot specify both password and generate_password");
  }

  // If neither password nor generate_password is provided
  if (!v.password && !v.generate_password) {
    throw new Error("Either password or generate_password must be specified");
  }

  return true;
}

/**
 * Extract and validate user list parameters
 */
function extractUserListParams(args: Record<string, unknown>): UserListParams {
  const params: UserListParams = {
    ...extractPaginationParams(args),
  };

  // Status validation
  if (typeof args.status === "number") {
    if (![1, 2, 3].includes(args.status)) {
      throw new Error("Invalid status. Must be 1 (Active), 2 (Registered), or 3 (Locked)");
    }
    params.status = args.status;
  }

  // Name filter
  if (typeof args.name === "string") {
    params.name = args.name;
  }

  // Group filter
  if (typeof args.group_id === "number") {
    params.group_id = args.group_id;
  }

  return params;
}

export function createUsersHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    list_users: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const params = extractUserListParams(args);
      const users = await client.users.getUsers(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(users, null, 2),
          },
        ],
        isError: false,
      };
    },

    show_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = args.id === "current" ? "current" : asNumber(args.id);
      
      const params: UserShowParams = {};
      if (typeof args.include === "string") {
        if (!validateInclude(args.include)) {
          throw new Error("Invalid include value. Must be comma-separated list of: memberships, groups");
        }
        params.include = args.include;
      }

      const result = await client.users.getUser(id, params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    create_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      if (!isRedmineUserCreate(args)) {
        throw new Error("Invalid user creation parameters");
      }

      const result = await client.users.createUser(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    update_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      const { id: _, ...updateData } = args;

      const result = await client.users.updateUser(id, updateData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    },

    delete_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      await client.users.deleteUser(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "success", message: `User #${id} has been deleted` }),
          },
        ],
        isError: false,
      };
    },
  };
}