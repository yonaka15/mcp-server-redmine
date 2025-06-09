import { RedmineErrorResponse } from "../types/common.js";
import config from "../config.js";

/**
 * Redmine APIエラークラス
 */
export class RedmineApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly errors: string[]
  ) {
    super(`Redmine API error: ${status} ${statusText}\n${errors ? errors.join(", ") : "Unknown error"}`);
    this.name = "RedmineApiError";
  }
}

// Define a more specific type for query parameter values
type QueryParamValue = string | number | boolean | Date | (string | number | boolean)[] | undefined | null;

/**
 * Redmine API クライアントベース
 */
export class BaseClient {
  /**
   * Redmine APIへのリクエストを実行
   */
  protected async performRequest<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = new URL(path, config.redmine.host);
    
    // デフォルトリクエストオプション
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // タイムアウトの設定
      // signal: AbortSignal.timeout(30000), // 30秒 - Temporarily commented out for compatibility
    };

    // オプションのマージ（引数のoptionsで上書き）
    const requestOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url.toString(), requestOptions);

      // レスポンスステータスがエラーの場合
      if (!response.ok) {
        let errorMessages: string[];
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          try {
            const errorResponse = await response.json() as RedmineErrorResponse;
            errorMessages = errorResponse.errors || ["Unknown error"];
          } catch {
            errorMessages = [`Failed to parse error response: ${await response.text() || "Empty response"}`];
          }
        } else {
          // JSONでない場合はテキストとしてエラーメッセージを取得
          errorMessages = [await response.text() || "Unknown error"];
        }

        throw new RedmineApiError(
          response.status,
          response.statusText,
          errorMessages
        );
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // レスポンスのJSONをパース
      try {
        return await response.json() as T;
      } catch (error) {
        throw new RedmineApiError(
          response.status,
          "Failed to parse response",
          [(error as Error).message]
        );
      }
    } catch (error) {
      // ネットワークエラーやその他のfetchエラー
      if (error instanceof RedmineApiError) {
        throw error;
      }
      throw new RedmineApiError(
        0,
        "Network Error",
        [(error as Error).message]
      );
    }
  }

  /**
   * クエリパラメータのエンコード
   */
  protected encodeQueryParams(params: Record<string, QueryParamValue>): string { // Changed 'any' to 'QueryParamValue'
    const searchParams = new URLSearchParams();

    // nullやundefinedのキーは除外
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 配列の場合はカンマ区切りの文字列として設定
          searchParams.set(key, value.join(','));
        } else if (value instanceof Date) {
          // Date型の場合はYYYY-MM-DD形式に変換
          searchParams.set(key, value.toISOString().split('T')[0]);
        } else if (typeof value === 'object') {
          // オブジェクトの場合はJSON文字列化
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }
}
