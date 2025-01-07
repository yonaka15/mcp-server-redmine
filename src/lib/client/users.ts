import { BaseClient } from "./base.js";
import {
  RedmineApiResponse,
  RedmineUser,
  UserListParams,
  UserShowParams,
  RedmineUserResponse,
  RedmineUsersResponse,
  RedmineUserCreate,
  RedmineUserUpdate,
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

    const parsedUsers = response.users.map(user => RedmineUserSchema.parse(user));
    
    return {
      users: parsedUsers,
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

  /**
   * ユーザーの作成
   * 管理者権限が必要
   * Returns:
   * - 201 Created: ユーザー作成成功
   * - 422 Unprocessable Entity: バリデーションエラー
   */
  async createUser(data: RedmineUserCreate): Promise<RedmineUserResponse> {
    const response = await this.performRequest<RedmineUserResponse>(
      "users.json",
      {
        method: "POST",
        body: JSON.stringify({ user: data }),
      }
    );

    return {
      user: RedmineUserSchema.parse(response.user),
    };
  }

  /**
   * ユーザーの更新
   * 管理者権限が必要
   * Returns:
   * - 200 OK: 更新成功
   * - 422 Unprocessable Entity: バリデーションエラー
   */
  async updateUser(id: number, data: RedmineUserUpdate): Promise<RedmineUserResponse> {
    const response = await this.performRequest<RedmineUserResponse>(
      `users/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ user: data }),
      }
    );

    return {
      user: RedmineUserSchema.parse(response.user),
    };
  }

  /**
   * ユーザーの削除
   * 管理者権限が必要
   * Returns:
   * - 204 No Content: 削除成功
   */
  async deleteUser(id: number): Promise<void> {
    await this.performRequest(
      `users/${id}.json`,
      {
        method: "DELETE",
      }
    );
  }
}