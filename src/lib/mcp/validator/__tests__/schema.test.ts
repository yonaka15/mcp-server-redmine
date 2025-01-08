import { schema } from '../schema.js';
import {
  validPingRequest,
  validProgressNotification,
  validEmptyResult,
  validToolsResult,
  validLoggingNotification
} from './fixtures.js';

describe('MCP Schemas', () => {
  describe('request validation', () => {
    it('should validate a valid request', () => {
      expect(() => schema.request.parse(validPingRequest))
        .not.toThrow();
    });

    it('should throw on missing method', () => {
      const invalidRequest = { ...validPingRequest } as any;
      delete invalidRequest.method;
      expect(() => schema.request.parse(invalidRequest))
        .toThrow();
    });
  });

  describe('notification validation', () => {
    it('should validate a valid notification', () => {
      expect(() => schema.notification.parse(validProgressNotification))
        .not.toThrow();
    });

    it('should validate a logging notification', () => {
      expect(() => schema.notification.parse(validLoggingNotification))
        .not.toThrow();
    });
  });

  describe('result validation', () => {
    it('should validate an empty result', () => {
      expect(() => schema.serverResult.parse(validEmptyResult))
        .not.toThrow();
    });

    it('should validate a tools result', () => {
      expect(() => schema.serverResult.parse(validToolsResult))
        .not.toThrow();
    });

    it('should reject invalid result', () => {
      const invalidResult = {
        invalid: true
      };
      expect(() => schema.serverResult.parse(invalidResult))
        .toThrow();
    });
  });
});