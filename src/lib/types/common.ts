import {
  type Tool,
  TextContentSchema,
  ImageContentSchema,
  EmbeddedResourceSchema,
} from "@modelcontextprotocol/sdk/types.js";

// アップロードファイルの型定義
export interface RedmineUpload {
  token: string;
  filename: string;
  content_type: string;
  description?: string;
}

// APIレスポンスの型
export interface RedmineApiResponse<T> {
  offset?: number;
  limit?: number;
  total_count?: number;
  [key: string]: T | T[] | number | undefined;
}

export interface RedmineErrorResponse {
  errors: string[];
}

// SDKからの再エクスポート
export {
  Tool,
  TextContentSchema,
  ImageContentSchema,
  EmbeddedResourceSchema,
};