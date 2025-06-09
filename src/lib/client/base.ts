import { RedmineErrorResponse } from "../types/common.js";
import config from "../config.js";

/**
 * Redmine API エラーを表すカスタムエラー
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
 * Redmine API クライアントの基底クラス
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
    
    // デフォルトオプションの設定
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // タイムアウト設定
      signal: AbortSignal.timeout(30000), // 30秒
    };

    // オプションのマージ（指定があれば上書き）
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

      // エラーレスポンスのハンドリング
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
          // JSONでない場合はレスポンステキストをそのまま使用
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
      // ネットワークエラーなどのハンドリング
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
  protected encodeQueryParams(params: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean> | Date | Record<string, unknown> | null | undefined>): string {
    const searchParams = new URLSearchParams();

    // nullやundefinedの値は除外
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 配列の場合はカンマ区切りの文字列に変換
          searchParams.set(key, value.join(','));
        } else if (value instanceof Date) {
          // Dateの場合はYYYY-MM-DD形式に変換
          searchParams.set(key, value.toISOString().split('T')[0]);
        } else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !Array.isArray(value)) { 
          // オブジェクトの場合はJSON文字列に変換 (DateとArrayは既に処理済み)
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }
}
