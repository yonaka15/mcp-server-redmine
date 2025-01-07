import type { RedmineClient } from "../lib/client/index.js";
import type { Config } from "../lib/config.js";

/**
 * Response content type for each tool
 */
export type ToolResponse = {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
};

/**
 * Handler context containing required dependencies
 */
export interface HandlerContext {
  client: RedmineClient;
  config: Config;
}

/**
 * Extract and validate pagination parameters
 */
export function extractPaginationParams(args: Record<string, unknown>): PaginationParams {
  const params: PaginationParams = {
    limit: 25,  // Set default value explicitly
    offset: 0
  };

  // Validate limit
  if ('limit' in args) {
    const limit = Number(args.limit);
    if (!isNaN(limit) && limit > 0 && limit <= 100) {
      params.limit = limit;
    }
  }

  // Validate offset
  if ('offset' in args) {
    const offset = Number(args.offset);
    if (!isNaN(offset) && offset >= 0) {
      params.offset = offset;
    }
  }

  return params;
}

/**
 * Convert value to number, throw error if invalid
 */
export function asNumber(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number value: ${value}`);
  }
  return num;
}

/**
 * Convert value to string or number, throw error if invalid
 */
export function asStringOrNumber(value: unknown): string | number {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  throw new Error(`Value must be string or number: ${value}`);
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}