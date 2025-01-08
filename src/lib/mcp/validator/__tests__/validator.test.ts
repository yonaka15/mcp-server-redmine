import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { MCPValidator } from '../validator.js';
import { MCPValidationError, MCPProtocolError } from '../errors.js';
import {
  validPingRequest,
  validProgressNotification,
  validEmptyResult,
  validToolsResult,
  validLoggingNotification
} from './fixtures.js';

describe('MCPValidator', () => {
  let validator: MCPValidator;

  beforeEach(() => {
    validator = new MCPValidator();
  });

  describe('validateServerRequest', () => {
    it('should validate a valid ping request', () => {
      expect(() => validator.validateServerRequest(validPingRequest))
        .not.toThrow();
    });

    it('should throw on missing method', () => {
      const invalidRequest = { ...validPingRequest };
      delete (invalidRequest as any).method;
      
      expect(() => validator.validateServerRequest(invalidRequest))
        .toThrow();
    });

    it('should throw on invalid method type', () => {
      const invalidRequest = {
        ...validPingRequest,
        method: 123
      };
      
      expect(() => validator.validateServerRequest(invalidRequest))
        .toThrow();
    });

    it('should throw detailed error for nested invalid type', () => {
      const invalidRequest = {
        ...validPingRequest,
        params: {
          _meta: 123 // Should be an object
        }
      };
      
      expect(() => validator.validateServerRequest(invalidRequest))
        .toThrow();
    });

    it('should handle array type errors', () => {
      const invalidRequest = {
        method: 'tools/call',
        params: {
          name: 'search_issues',
          arguments: {
            project_ids: 'not-array' // Should be an array of numbers
          }
        }
      };
      
      expect(() => validator.validateServerRequest(invalidRequest))
        .toThrow(MCPValidationError);
    });
  });

  describe('validateServerNotification', () => {
    it('should validate a valid logging notification', () => {
      expect(() => validator.validateServerNotification(validLoggingNotification))
        .not.toThrow();
    });

    it('should validate a valid progress notification', () => {
      expect(() => validator.validateServerNotification(validProgressNotification))
        .not.toThrow();
    });

    it('should throw on missing method', () => {
      const invalidNotification = { ...validLoggingNotification };
      delete (invalidNotification as any).method;
      
      expect(() => validator.validateServerNotification(invalidNotification))
        .toThrow();
    });

    it('should throw on invalid params type', () => {
      const invalidNotification = {
        ...validLoggingNotification,
        params: 'invalid'
      };
      
      expect(() => validator.validateServerNotification(invalidNotification))
        .toThrow();
    });

    it('should handle literal type errors', () => {
      const invalidNotification = {
        ...validProgressNotification,
        method: 'invalid_method' // Should be a valid notification method
      };
      
      expect(() => validator.validateServerNotification(invalidNotification))
        .toThrow();
    });

    it('should handle nested validation errors', () => {
      const invalidNotification = {
        ...validProgressNotification,
        params: {
          progress: "50" // Should be a number
        }
      };
      
      expect(() => validator.validateServerNotification(invalidNotification))
        .toThrow();
    });
  });

  describe('validateServerResult', () => {
    it('should validate an empty result', () => {
      expect(() => validator.validateServerResult(validEmptyResult))
        .not.toThrow();
    });

    it('should validate a tools result', () => {
      expect(() => validator.validateServerResult(validToolsResult))
        .not.toThrow();
    });

    it('should throw on invalid structure', () => {
      const invalidResult = {
        invalid: 'structure'
      };
      
      expect(() => validator.validateServerResult(invalidResult))
        .toThrow();
    });

    it('should handle unrecognized keys', () => {
      const invalidResult = {
        ...validEmptyResult,
        unknownKey: 'value'
      };
      
      expect(() => validator.validateServerResult(invalidResult))
        .toThrow();
    });

    it('should handle nested validation errors', () => {
      const invalidResult = {
        ...validToolsResult,
        tools: [{
          name: 123, // Should be a string
          inputSchema: { type: 'object' }
        }]
      };
      
      expect(() => validator.validateServerResult(invalidResult))
        .toThrow();
    });
  });

  describe('Error handling', () => {
    it('should throw protocol error for non-object values', () => {
      expect(() => validator.validateServerRequest('not an object'))
        .toThrow(MCPProtocolError);
      expect(() => validator.validateServerRequest(null))
        .toThrow(MCPProtocolError);
    });

    it('should throw validation error for invalid data', () => {
      const invalidData = { invalid: 'data' };

      expect(() => validator.validateServerRequest(invalidData))
        .toThrow(MCPValidationError);
    });
  });
});