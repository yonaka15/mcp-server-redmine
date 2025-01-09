import { BaseClient } from "./base.js";
import {
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
   * Get list of users
   * Requires admin privileges
   */
  async getUsers(params?: UserListParams): Promise<RedmineUsersResponse> {
    // Parameter validation
    const validatedParams = params ? UserQuerySchema.parse(params) : undefined;
    const query = validatedParams ? this.encodeQueryParams(validatedParams) : "";
    
    const response = await this.performRequest<RedmineUsersResponse>(
      `users.json${query ? `?${query}` : ""}`
    );

    // Validate and ensure user data has IDs
    const validUsers = response.users.map(user => {
      const parsed = RedmineUserSchema.parse(user);
      if (!parsed.id) {
        throw new Error(`Invalid user data: missing id for user ${parsed.login || 'unknown'}`);
      }
      const validUser: RedmineUser = {
        id: parsed.id,
        firstname: parsed.firstname,
        lastname: parsed.lastname,
        created_on: parsed.created_on,
        status: parsed.status,
        avatar_url: parsed.avatar_url || '',
        ...(parsed.login && { login: parsed.login }),
        ...(parsed.mail && { mail: parsed.mail }),
        ...(parsed.last_login_on && { last_login_on: parsed.last_login_on }),
        ...(parsed.api_key && { api_key: parsed.api_key }),
        ...(parsed.updated_on && { updated_on: parsed.updated_on }),
        ...(parsed.admin && { admin: parsed.admin }),
        ...(parsed.passwd_changed_on && { passwd_changed_on: parsed.passwd_changed_on }),
        ...(parsed.custom_fields && { custom_fields: parsed.custom_fields }),
        ...(parsed.memberships && { memberships: parsed.memberships }),
        ...(parsed.groups && { groups: parsed.groups })
      };
      return validUser;
    });
    
    return {
      users: validUsers,
      total_count: response.total_count,
      offset: response.offset,
      limit: response.limit,
    };
  }

  /**
   * Get user details
   * Returns different information based on access rights
   */
  async getUser(id: number | "current", params?: UserShowParams): Promise<RedmineUserResponse> {
    // Validate include parameter
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

    // Validate and ensure user data has ID
    const parsed = RedmineUserSchema.parse(response.user);
    if (!parsed.id) {
      throw new Error(`Invalid user data: missing id for user ${parsed.login || 'unknown'}`);
    }

    const validUser: RedmineUser = {
      id: parsed.id,
      firstname: parsed.firstname,
      lastname: parsed.lastname,
      created_on: parsed.created_on,
      status: parsed.status,
      avatar_url: parsed.avatar_url || '',
      ...(parsed.login && { login: parsed.login }),
      ...(parsed.mail && { mail: parsed.mail }),
      ...(parsed.last_login_on && { last_login_on: parsed.last_login_on }),
      ...(parsed.api_key && { api_key: parsed.api_key }),
      ...(parsed.updated_on && { updated_on: parsed.updated_on }),
      ...(parsed.admin && { admin: parsed.admin }),
      ...(parsed.passwd_changed_on && { passwd_changed_on: parsed.passwd_changed_on }),
      ...(parsed.custom_fields && { custom_fields: parsed.custom_fields }),
      ...(parsed.memberships && { memberships: parsed.memberships }),
      ...(parsed.groups && { groups: parsed.groups })
    };

    return {
      user: validUser
    };
  }

  /**
   * Get current user information (shortcut method)
   */
  async getCurrentUser(params?: UserShowParams): Promise<RedmineUserResponse> {
    return this.getUser("current", params);
  }

  /**
   * Create a new user
   * Requires admin privileges
   * Returns:
   * - 201 Created: User creation successful
   * - 422 Unprocessable Entity: Validation error
   */
  async createUser(data: RedmineUserCreate): Promise<RedmineUserResponse> {
    const response = await this.performRequest<RedmineUserResponse>(
      "users.json",
      {
        method: "POST",
        body: JSON.stringify({ user: data }),
      }
    );

    // Validate and ensure user data has ID
    const parsed = RedmineUserSchema.parse(response.user);
    if (!parsed.id) {
      throw new Error(`Invalid user data: missing id for user ${parsed.login || 'unknown'}`);
    }

    const validUser: RedmineUser = {
      id: parsed.id,
      firstname: parsed.firstname,
      lastname: parsed.lastname,
      created_on: parsed.created_on,
      status: parsed.status,
      avatar_url: parsed.avatar_url || '',
      ...(parsed.login && { login: parsed.login }),
      ...(parsed.mail && { mail: parsed.mail }),
      ...(parsed.last_login_on && { last_login_on: parsed.last_login_on }),
      ...(parsed.api_key && { api_key: parsed.api_key }),
      ...(parsed.updated_on && { updated_on: parsed.updated_on }),
      ...(parsed.admin && { admin: parsed.admin }),
      ...(parsed.passwd_changed_on && { passwd_changed_on: parsed.passwd_changed_on }),
      ...(parsed.custom_fields && { custom_fields: parsed.custom_fields }),
      ...(parsed.memberships && { memberships: parsed.memberships }),
      ...(parsed.groups && { groups: parsed.groups })
    };

    return {
      user: validUser
    };
  }

  /**
   * Update user information
   * Requires admin privileges
   * Returns:
   * - 200 OK: Update successful
   * - 422 Unprocessable Entity: Validation error
   */
  async updateUser(id: number, data: RedmineUserUpdate): Promise<RedmineUserResponse> {
    const response = await this.performRequest<RedmineUserResponse>(
      `users/${id}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ user: data }),
      }
    );

    // Validate and ensure user data has ID
    const parsed = RedmineUserSchema.parse(response.user);
    if (!parsed.id) {
      throw new Error(`Invalid user data: missing id for user ${parsed.login || 'unknown'}`);
    }

    const validUser: RedmineUser = {
      id: parsed.id,
      firstname: parsed.firstname,
      lastname: parsed.lastname,
      created_on: parsed.created_on,
      status: parsed.status,
      avatar_url: parsed.avatar_url || '',
      ...(parsed.login && { login: parsed.login }),
      ...(parsed.mail && { mail: parsed.mail }),
      ...(parsed.last_login_on && { last_login_on: parsed.last_login_on }),
      ...(parsed.api_key && { api_key: parsed.api_key }),
      ...(parsed.updated_on && { updated_on: parsed.updated_on }),
      ...(parsed.admin && { admin: parsed.admin }),
      ...(parsed.passwd_changed_on && { passwd_changed_on: parsed.passwd_changed_on }),
      ...(parsed.custom_fields && { custom_fields: parsed.custom_fields }),
      ...(parsed.memberships && { memberships: parsed.memberships }),
      ...(parsed.groups && { groups: parsed.groups })
    };

    return {
      user: validUser
    };
  }

  /**
   * Delete a user
   * Requires admin privileges
   * Returns:
   * - 204 No Content: Deletion successful
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
