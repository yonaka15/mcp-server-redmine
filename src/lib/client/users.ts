import { BaseClient } from "./base.js";
import {
  RedmineApiResponse,
  RedmineUser,
  UserListParams,
  UserShowParams,
  RedmineUserResponse,
  RedmineUsersResponse,
} from "../types/index.js";
import {
  UserQuerySchema,
  UserShowParamsSchema,
  RedmineUserSchema,
  validateUserIncludes,
} from "../types/users/schema.js";

export class UsersClient extends BaseClient {
  /**
   * ユーザー一覧の取得
   * 管理者権限が必要
   */
  async getUsers(params?: UserListParams): Promise<RedmineUsersResponse> {
    // パラメータのバリデーション
    const validatedParams = params ? UserQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    
    const response = await this.performRequest<RedmineUsersResponse>(
      `users.json${query ? `?${query}` : ""}`
    );
    
    return {
      users: response.users.map((user: RedmineUser) => RedmineUserSchema.parse(user)),
      total_count: response.total_count,
      offset: response.offset,
      limit: response.limit,
    };
  }

  /**
   * 単一ユーザーの詳細取得
   * アクセス権限に応じて返される情報が変化
   */
  async getUser(id: number | "current", params?: UserShowParams): Promise<RedmineUserResponse> {
    // includeパラメータのバリデーション
    if (params?.include && !validateUserIncludes(params.include)) {
      throw new Error(
        "Invalid include parameter. Valid values are: memberships, groups"
      );
    }

    const validatedParams = params ? UserShowParamsSchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";

    const response = await this.performRequest<RedmineUserResponse>(
      `users/${id}.json${query ? `?${query}` : ""}`
    );

    return {
      user: RedmineUserSchema.parse(response.user),
    };
  }

  /**
   * 現在のユーザー情報の取得（ショートカット）
   */
  async getCurrentUser(params?: UserShowParams): Promise<RedmineUserResponse> {
    return this.getUser("current", params);
  }
}