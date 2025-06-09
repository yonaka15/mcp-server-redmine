import { 
  HandlerContext, 
  ToolResponse, 
  asNumber, 
  asNumberOrSpecial,
  extractPaginationParams,
  ValidationError
} from "./types.js";
import type { 
  UserListParams, 
  UserShowParams, 
  RedmineUserCreate,
  RedmineUsersResponse, // Keep this if toUserList uses it, or if it's used by other functions not shown
  RedmineUserList,
  RedmineUserUpdate // Added RedmineUserUpdate
  // RedmineUserResponse // Removed as it was unused, ensure it's not needed by other parts of the code
} from "../lib/types/index.js";
import * as formatters from "../formatters/index.js";

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
    throw new ValidationError("login is required and must be a non-empty string");
  }
  if (typeof v.firstname !== "string" || v.firstname.trim() === "") {
    throw new ValidationError("firstname is required and must be a non-empty string");
  }
  if (typeof v.lastname !== "string" || v.lastname.trim() === "") {
    throw new ValidationError("lastname is required and must be a non-empty string");
  }
  if (typeof v.mail !== "string" || !v.mail.includes("@")) {
    throw new ValidationError("mail is required and must be a valid email address");
  }

  // If password is provided but generate_password is true
  if (v.password && v.generate_password) {
    throw new ValidationError("Cannot specify both password and generate_password");
  }

  // If neither password nor generate_password is provided
  if (!v.password && !v.generate_password) {
    throw new ValidationError("Either password or generate_password must be specified");
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
      throw new ValidationError("Invalid status. Must be 1 (Active), 2 (Registered), or 3 (Locked)");
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

/**
 * Convert RedmineUsersResponse to RedmineUserList
 */
function toUserList(response: RedmineUsersResponse): RedmineUserList {
  return {
    users: response.users.map(user => ({
      ...user,
      id: user.id!, // Ensure id is present
    })),
    total_count: response.total_count,
    offset: response.offset,
    limit: response.limit,
  };
}

export function createUsersHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    list_users: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const params = extractUserListParams(args);
        const response = await client.users.getUsers(params);
        const userList = toUserList(response);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatUsers(userList),
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    show_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        // Handle ID parameter
        const rawId = asNumberOrSpecial(args.id, ["current"]);
        const id = rawId === "current" ? "current" : parseInt(rawId as string, 10);
        
        const params: UserShowParams = {};
        if (typeof args.include === "string") {
          if (!validateInclude(args.include)) {
            throw new ValidationError("Invalid include value. Must be comma-separated list of: memberships, groups");
          }
          params.include = args.include;
        }

        const response = await client.users.getUser(id, params);
        if (!response.user.id) {
          throw new ValidationError("Invalid user response: missing id");
        }

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUser(response.user),
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    create_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        if (!isRedmineUserCreate(args)) {
          // isRedmineUserCreate throws specific validation errors
           throw new ValidationError("Invalid user creation parameters"); // Fallback, should be caught by guard
        }

        const response = await client.users.createUser(args as RedmineUserCreate);
        if (!response.user.id) {
          throw new ValidationError("Invalid user response: missing id");
        }

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUserResult(response.user, "created"),
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    update_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const id = asNumber(args.id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = args; // Mark id as unused

        const response = await client.users.updateUser(id, updateData as RedmineUserUpdate);
        // Assuming updateUser doesn't return the full user object in the same way as create
        // If it does, and you need to format it, adjust accordingly.
        // For now, a simple success message based on the operation succeeding.
        return {
          content: [
            {
              type: "text",
              // If you need to format the user, ensure `response.user` exists and is passed to `formatUserResult`
              // For now, assuming a generic success message is sufficient for update if no user data is returned.
              text: `User with ID ${id} updated successfully.` 
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    delete_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      try {
        const id = asNumber(args.id);
        await client.users.deleteUser(id);
        return {
          content: [
            {
              type: "text",
              text: formatters.formatUserDeleted(id),
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },
  };
}
