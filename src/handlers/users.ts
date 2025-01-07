import { HandlerContext, ToolResponse, asNumber, extractPaginationParams } from "./types.js";
import * as formatters from "../formatters/index.js";
import type { UserListParams, UserShowParams } from "../lib/types/index.js";

export function createUsersHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    search_users: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      // パラメータを型変換
      const validatedArgs = extractPaginationParams(args) as UserListParams;
      const users = await client.users.getUsers(validatedArgs);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatUsers(users),
          },
        ],
        isError: false,
      };
    },

    get_user: async (args: Record<string, unknown>): Promise<ToolResponse> => {
      const id = asNumber(args.id);
      // include パラメータの処理
      const params: UserShowParams = {
        include: typeof args.include === 'string' ? args.include : undefined,
      };
      const result = await client.users.getUser(id, params);
      return {
        content: [
          {
            type: "text",
            text: formatters.formatUser(result.user),
          },
        ],
        isError: false,
      };
    },
  };
}