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
    
    // デフォルトのリクエストオプション
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // タイムアウトの設定
      signal: AbortSignal.timeout(30000), // 30秒
    };

    // オプションのマージ（ヘッダーは個別にマージ）
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

      // エラーレスポンスの詳細なハンドリング
      if (!response.ok) {
        let errorMessage: string[];
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          try {
            const errorResponse = await response.json() as RedmineErrorResponse;
            errorMessage = errorResponse.errors || ["Unknown error"];
          } catch {
            errorMessage = [`Failed to parse error response: ${await response.text() || "Empty response"}`];
          }
        } else {
          // JSONでない場合はテキストとして読み取り
          errorMessage = [await response.text() || "Unknown error"];
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

      // レスポンスのパース
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
      // ネットワークエラーやタイムアウトの処理
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
  protected encodeQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    // nullやundefinedの値は除外
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 配列の場合はカンマ区切りの文字列として設定
          searchParams.set(key, value.join(','));
        } else if (value instanceof Date) {
          // 日付型の場合はYYYY-MM-DD形式に変換
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