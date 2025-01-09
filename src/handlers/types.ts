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
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Extract and validate pagination parameters
 * @throws {ValidationError} if parameters are invalid
 */
export function extractPaginationParams(args: Record<string, unknown>): PaginationParams {
  const params: PaginationParams = {
    limit: 25,  // Set default value explicitly
    offset: 0
  };

  // Validate limit
  if ('limit' in args) {
    const limit = Number(args.limit);
    if (isNaN(limit)) {
      throw new ValidationError(`Invalid limit value: ${args.limit} (must be a number)`);
    }
    if (limit <= 0) {
      throw new ValidationError(`Invalid limit value: ${limit} (must be greater than 0)`);
    }
    if (limit > 100) {
      throw new ValidationError(`Invalid limit value: ${limit} (must not exceed 100)`);
    }
    params.limit = limit;
  }

  // Validate offset
  if ('offset' in args) {
    const offset = Number(args.offset);
    if (isNaN(offset)) {
      throw new ValidationError(`Invalid offset value: ${args.offset} (must be a number)`);
    }
    if (offset < 0) {
      throw new ValidationError(`Invalid offset value: ${offset} (must not be negative)`);
    }
    params.offset = offset;
  }

  return params;
}

/**
 * Convert value to number, throw error if invalid
 */
export function asNumber(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`Invalid number value: ${value}`);
  }
  return num;
}

/**
 * Convert value to string and validate as number if needed
 * @param value The value to convert
 * @param allowSpecial Optional array of special string values to allow (e.g., ["current", "me"])
 * @returns The original string if it's a special value, or converts to string if it's a valid number
 */
export function asNumberOrSpecial(value: unknown, allowSpecial: string[] = []): string {
  if (typeof value === "string") {
    if (allowSpecial.includes(value)) {
      return value;
    }
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`Invalid value: ${value} (must be a number or one of: ${allowSpecial.join(", ")})`);
  }
  return String(num);
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}