import { RedmineErrorResponse } from "../types/common.js";
import config from "../config.js";

/**
 * Redmine API エラークラス
 */
export class RedmineApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly errors: string[]
  ) {
    super(`Redmine API error: ${status} ${statusText}
${errors ? errors.join(", ") : "Unknown error"}`);
    this.name = "RedmineApiError";
  }
}

// Define a more specific type for query parameter values
type QueryParamValue = string | number | boolean | Date | (string | number | boolean)[] | undefined | null;

/**
 * Redmine API クライアントベースクラス
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

    // デフォルトオプション
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'X-Redmine-API-Key': config.redmine.apiKey,
        'Content-Type': "application/json",
        Accept: "application/json",
      },
      // タイムアウト設定
      // signal: AbortSignal.timeout(30000), // 30秒 - Temporarily commented out for compatibility
    };

    // リクエストオプションのマージ（引数のoptionsを優先）
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

      // エラーレスポンスの場合の処理
      if (!response.ok) {
        let errorMessages: string[];
        const contentType = response.headers.get("content-type");
        // まずレスポンスボディをテキストとして一度だけ読み込む
        const responseText = await response.text(); // ★ 変更点: 先にtext()で読む

        if (contentType?.includes("application/json")) {
          try {
            // 読み込んだテキストをJSONとしてパース試行
            const errorResponse = JSON.parse(responseText) as RedmineErrorResponse; // ★ 変更点: response.json()ではなくresponseTextをパース
            errorMessages = errorResponse.errors || ["Unknown error"];
          } catch (e) {
            // JSONパースに失敗した場合、テキストをそのままエラーメッセージとする
            errorMessages = [`Failed to parse error response as JSON: ${responseText || "Empty response"}`];
          }
        } else {
          // JSONでない場合はテキストをそのままエラーメッセージとする
          errorMessages = [responseText || "Unknown error"];
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

      // レスポンスのJSONをパース (成功時)
      try {
        // 成功時は、レスポンスボディはまだ消費されていないので response.json() を呼べる
        return await response.json() as T;
      } catch (error) {
        throw new RedmineApiError(
          response.status,
          "Failed to parse response",
          [(error as Error).message]
        );
      }
    } catch (error) {
      // ネットワークエラー等のfetch自体のエラー
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
   * クエリパラメータをエンコードする
   */
  protected encodeQueryParams(params: Record<string, QueryParamValue>): string { // Changed 'any' to 'QueryParamValue'
    const searchParams = new URLSearchParams();

    // nullやundefinedのパラメータを除外
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
