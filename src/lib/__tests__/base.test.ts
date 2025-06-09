import { jest, expect, describe, it, beforeEach, afterEach } from '@jest/globals';
import { BaseClient } from '../client/base.js';
import { mockResponse, mockErrorResponse } from './helpers/mocks.js';
import type { Mock } from 'jest-mock';

// Define a more specific type for query parameter values
type QueryParamValue = string | number | boolean | (string | number | boolean)[] | undefined | null;

// テスト用のprotectedメソッドを公開するためのクラス
class TestClient extends BaseClient {
  public async testRequest<T>(path: string, options?: RequestInit): Promise<T> {
    return this.performRequest<T>(path, options);
  }

  public testEncodeParams(params: Record<string, QueryParamValue>): string {
    return this.encodeQueryParams(params);
  }
}

describe('BaseClient', () => {
  let client: TestClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new TestClient();
    mockFetch = jest.spyOn(global, 'fetch') as Mock;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe('performRequest', () => {
    it('performs a successful GET request', async () => {
      // Arrange
      const responseData = { data: 'test' };
      mockFetch.mockImplementationOnce(() => Promise.resolve(mockResponse(responseData)));

      // Act
      const result = await client.testRequest<typeof responseData>('/test');

      // Assert
      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Redmine-API-Key': expect.any(String),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      );
    });

    it('handles API errors', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => Promise.resolve(mockErrorResponse(404, ['Not found'])));

      // Act & Assert
      await expect(client.testRequest('/test')).rejects.toThrow('Redmine API error');
    });
  });

  describe('encodeQueryParams', () => {
    it('encodes query parameters correctly', () => {
      // Arrange
      const params: Record<string, QueryParamValue> = { // Ensure params type matches
        status_id: 'open',
        assigned_to_id: 1,
        include: ['attachments', 'journals']
      };

      // Act
      const encoded = client.testEncodeParams(params);
      const expectedParams = new URLSearchParams();
      expectedParams.set('status_id', 'open');
      expectedParams.set('assigned_to_id', '1');
      expectedParams.set('include', 'attachments,journals');

      // Assert
      expect(encoded).toBe(expectedParams.toString());
    });

    it('handles empty parameters', () => {
      // Act & Assert
      expect(client.testEncodeParams({})).toBe('');
    });

    it('handles null and undefined values', () => {
      // Arrange
      const params: Record<string, QueryParamValue> = { // Ensure params type matches
        status_id: 'open',
        assigned_to_id: undefined,
        project_id: null
      };

      // Act
      const encoded = client.testEncodeParams(params);

      // Assert
      expect(encoded).toBe('status_id=open');
    });
  });
});
