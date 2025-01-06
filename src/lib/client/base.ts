import { RedmineErrorResponse } from "../types/common.js";
import config from "../config.js";

/**
 * Redmine API クライアントエラー
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

/**
 * Redmine API クライアント
 */
export class BaseClient {
  /**
   * Redmine APIにリクエストを送信
   */
  protected async performRequest<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = new URL(path, config.redmine.host);
    const response = await fetch(url.toString(), {  // URL.toString()を明示的に呼び出す
      method: 'GET',  // デフォルトメソッドを設定
      ...options,
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage: string[];
      try {
        const errorResponse = await response.json() as RedmineErrorResponse;
        errorMessage = errorResponse.errors || ["Unknown error"];  // errorのフォールバック
      } catch {
        errorMessage = [await response.text() || "Unknown error"];  // テキストのフォールバック
      }
      throw new RedmineApiError(
        response.status,
        response.statusText,
        errorMessage
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * クエリパラメータのエンコード
   */
  protected encodeQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 配列の場合はカンマ区切りの文字列として設定
          searchParams.set(key, value.join(','));
        } else if (value instanceof Date) {
          searchParams.set(key, value.toISOString().split('T')[0]);
        } else if (typeof value === 'object') {
          // オブジェクトの場合は文字列化
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });
    return searchParams.toString();
  }
}