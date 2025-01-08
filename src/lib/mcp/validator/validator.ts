import { z } from 'zod';
import { schema, type MCPServerRequest, type MCPServerNotification, type MCPServerResult } from './schema.js';
import { MCPValidationError, MCPProtocolError, ErrorCodes } from './errors.js';

export interface ValidatorOptions {
  /**
   * Enable strict validation mode
   * @default false
   */
  strict?: boolean;

  /**
   * Enable development mode with detailed error messages
   * @default false
   */
  dev?: boolean;
}

export class MCPValidator {
  private readonly strict: boolean;
  private readonly dev: boolean;

  constructor(options: ValidatorOptions = {}) {
    this.strict = options.strict ?? false;
    this.dev = options.dev ?? false;
  }

  private formatError(error: z.ZodError): MCPValidationError {
    const firstError = error.errors[0];
    const path = firstError.path.length > 0 ? firstError.path : ['method'];
    const message = firstError.message;
    return new MCPValidationError(path, message, undefined);
  }

  validateServerRequest(data: unknown): asserts data is MCPServerRequest {
    try {
      if (typeof data !== 'object' || data === null) {
        throw new MCPProtocolError(
          'Invalid message type, expected object',
          ErrorCodes.InvalidRequest
        );
      }

      const result = schema.serverRequest.safeParse(data);
      if (!result.success) {
        throw this.formatError(result.error);
      }
    } catch (error) {
      if (error instanceof MCPProtocolError || error instanceof MCPValidationError) {
        throw error;
      }
      throw new MCPProtocolError(
        'Invalid server request',
        ErrorCodes.InvalidRequest
      );
    }
  }

  validateServerNotification(data: unknown): asserts data is MCPServerNotification {
    try {
      if (typeof data !== 'object' || data === null) {
        throw new MCPProtocolError(
          'Invalid message type, expected object',
          ErrorCodes.InvalidRequest
        );
      }

      const result = schema.serverNotification.safeParse(data);
      if (!result.success) {
        throw this.formatError(result.error);
      }
    } catch (error) {
      if (error instanceof MCPProtocolError || error instanceof MCPValidationError) {
        throw error;
      }
      throw new MCPProtocolError(
        'Invalid server notification',
        ErrorCodes.InvalidRequest
      );
    }
  }

  validateServerResult(data: unknown): asserts data is MCPServerResult {
    try {
      if (typeof data !== 'object' || data === null) {
        throw new MCPProtocolError(
          'Invalid message type, expected object',
          ErrorCodes.InvalidRequest
        );
      }

      const result = schema.serverResult.safeParse(data);
      if (!result.success) {
        throw this.formatError(result.error);
      }
    } catch (error) {
      if (error instanceof MCPProtocolError || error instanceof MCPValidationError) {
        throw error;
      }
      throw new MCPProtocolError(
        'Invalid server result',
        ErrorCodes.InvalidRequest
      );
    }
  }
}

// Export a default validator instance
export const validator = new MCPValidator();