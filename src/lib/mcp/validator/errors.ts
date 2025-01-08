/**
 * Represents a path segment in an MCP message
 */
export type PathSegment = string | number;

/**
 * Base error class for MCP validation errors
 */
export class MCPValidationError extends Error {
  constructor(
    public readonly path: PathSegment[],
    message: string,
    public readonly value?: unknown,
    public readonly code: number = -32602 // Invalid params
  ) {
    super(message);
    this.name = 'MCPValidationError';
    Object.setPrototypeOf(this, MCPValidationError.prototype);
  }
}

/**
 * Error thrown when a required field is missing in an MCP message
 */
export class MCPMissingFieldError extends MCPValidationError {
  constructor(path: PathSegment[], fieldName: string) {
    super(
      path,
      `Missing required field '${fieldName}'`,
      undefined,
      -32602
    );
    this.name = 'MCPMissingFieldError';
    Object.setPrototypeOf(this, MCPMissingFieldError.prototype);
  }
}

/**
 * Error thrown when a field has an incorrect type in an MCP message
 */
export class MCPInvalidTypeError extends MCPValidationError {
  constructor(path: PathSegment[], expectedType: string, value: unknown) {
    super(
      path,
      `Expected value to be of type '${expectedType}'`,
      value,
      -32602
    );
    this.name = 'MCPInvalidTypeError';
    Object.setPrototypeOf(this, MCPInvalidTypeError.prototype);
  }
}

/**
 * Error thrown when a JSON-RPC protocol error occurs
 */
export class MCPProtocolError extends MCPValidationError {
  constructor(message: string, code: number = -32600) {
    super(
      [],
      message,
      undefined,
      code
    );
    this.name = 'MCPProtocolError';
    Object.setPrototypeOf(this, MCPProtocolError.prototype);
  }
}

// JSON-RPC 2.0 error codes
export const ErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  ServerError: -32000,
} as const;