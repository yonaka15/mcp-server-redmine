import {
  MCPValidationError,
  MCPMissingFieldError,
  MCPInvalidTypeError,
  MCPProtocolError,
  ErrorCodes,
  type PathSegment,
} from '../errors.js';

describe('MCP Validation Errors', () => {
  describe('MCPValidationError', () => {
    it('should create error with path and message', () => {
      const path: PathSegment[] = ['data', 'field'];
      const message = 'Test error';
      const error = new MCPValidationError(path, message);

      expect(error.path).toEqual(path);
      expect(error.message).toBe(message);
      expect(error.name).toBe('MCPValidationError');
      expect(error.code).toBe(ErrorCodes.InvalidParams);
    });

    it('should store optional value', () => {
      const value = { test: 'data' };
      const error = new MCPValidationError([], 'Test', value);

      expect(error.value).toBe(value);
    });
  });

  describe('MCPMissingFieldError', () => {
    it('should create error for missing field', () => {
      const path: PathSegment[] = ['data'];
      const fieldName = 'requiredField';
      const error = new MCPMissingFieldError(path, fieldName);

      expect(error.path).toEqual(path);
      expect(error.message).toContain(fieldName);
      expect(error.name).toBe('MCPMissingFieldError');
      expect(error.code).toBe(ErrorCodes.InvalidParams);
    });
  });

  describe('MCPInvalidTypeError', () => {
    it('should create error for invalid type', () => {
      const path: PathSegment[] = ['data'];
      const expectedType = 'string';
      const value = 123;
      const error = new MCPInvalidTypeError(path, expectedType, value);

      expect(error.path).toEqual(path);
      expect(error.message).toContain(expectedType);
      expect(error.value).toBe(value);
      expect(error.name).toBe('MCPInvalidTypeError');
      expect(error.code).toBe(ErrorCodes.InvalidParams);
    });
  });

  describe('MCPProtocolError', () => {
    it('should create protocol error with default code', () => {
      const message = 'Protocol error';
      const error = new MCPProtocolError(message);

      expect(error.message).toBe(message);
      expect(error.path).toEqual([]);
      expect(error.name).toBe('MCPProtocolError');
      expect(error.code).toBe(ErrorCodes.InvalidRequest);
    });

    it('should create protocol error with custom code', () => {
      const message = 'Parse error';
      const error = new MCPProtocolError(message, ErrorCodes.ParseError);

      expect(error.message).toBe(message);
      expect(error.code).toBe(ErrorCodes.ParseError);
    });
  });
});