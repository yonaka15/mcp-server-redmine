import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { RedmineClient } from "../../../lib/client/index.js";
import { 
  mockResponse, 
  mockErrorResponse,
  mockNetworkError
} from "../../../lib/__tests__/helpers/mocks.js";
import * as fixtures from "../../../lib/__tests__/helpers/fixtures.js";
import { parseUrl } from "../../../lib/__tests__/helpers/url.js";
import { createIssuesHandlers } from "../../issues.js";
import { assertMcpToolResponse } from "../../../lib/__tests__/helpers/mcp.js";
import config from "../../../lib/config.js";
import type { IssueListParams } from "../../../lib/types/issues/types.js";

describe('list_issues', () => {
  let client: RedmineClient;
  let mockFetch: Mock;
  let handlers: ReturnType<typeof createIssuesHandlers>;

  beforeEach(() => {
    client = new RedmineClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
    handlers = createIssuesHandlers({ 
      client, 
      config,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    });
  });

  describe('MCP Response Format', () => {
    it('returns valid MCP response for successful fetch', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(false);
      expect(response.content[0]).toEqual({
        type: "text",
        text: expect.stringContaining("<?xml")
      });
    });

    it('validates XML structure in response', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const response = await handlers.list_issues({});
      const xml = response.content[0].text;

      // Assert
      expect(xml).toMatch(/<issues.*?>/);
      expect(xml).toMatch(/<\/issues>/);
      expect(xml).toMatch(/total_count="\d+"/);
      expect(xml).toMatch(/limit="\d+"/);
      expect(xml).toMatch(/offset="\d+"/);
    });

    it('returns valid MCP error response for API error', async () => {
      // Arrange
      const errorMessage = "Invalid query parameters";
      mockFetch.mockImplementationOnce(() => 
        mockErrorResponse(400, [errorMessage])
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0]).toEqual({
        type: "text",
        text: expect.stringContaining(errorMessage)
      });
    });

    it('returns valid MCP error response for network error', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockNetworkError("Network error")
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0]).toEqual({
        type: "text",
        text: expect.stringContaining("Network error")
      });
    });
  });

  describe('Parameter Handling', () => {
    const DEFAULT_PAGINATION = {
      offset: "0",
      limit: "25"
    };

    it('handles pagination parameters correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const response = await handlers.list_issues({
        offset: 10,
        limit: 50
      });

      // Assert
      assertMcpToolResponse(response);
      const [url] = mockFetch.mock.calls[0] as [string];
      const { params } = parseUrl(url);
      expect(params).toEqual({
        ...DEFAULT_PAGINATION,
        offset: "10",
        limit: "50"
      });
    });

    it('applies filters correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      const filters: IssueListParams = {
        project_id: 1,
        status_id: "open",
        assigned_to_id: "me"
      };

      // Act
      const response = await handlers.list_issues(filters);

      // Assert
      assertMcpToolResponse(response);
      const [url] = mockFetch.mock.calls[0] as [string];
      const { params } = parseUrl(url);
      expect(params).toEqual({
        ...DEFAULT_PAGINATION,
        project_id: "1",
        status_id: "open",
        assigned_to_id: "me"
      });
    });

    it('handles invalid parameters correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const response = await handlers.list_issues({
        offset: -1,  // Invalid offset
        limit: 101   // Invalid limit
      });

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toMatch(/invalid.*(offset|limit)/i);
    });
  });

  describe('Response Content', () => {
    it('includes all required issue fields in XML', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      const xml = response.content[0].text;
      
      // 必須フィールドの存在確認
      expect(xml).toMatch(/<id>\d+<\/id>/);
      expect(xml).toMatch(/<subject>.+<\/subject>/);
      expect(xml).toMatch(/<project>.+<\/project>/);
      expect(xml).toMatch(/<status>.+<\/status>/);
      expect(xml).toMatch(/<priority>.+<\/priority>/);
    });

    it('handles empty result set correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockResponse({
          issues: [],
          total_count: 0,
          offset: 0,
          limit: 25
        })
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      const xml = response.content[0].text;
      expect(xml).toMatch(/^<\?xml/);
      expect(xml).toMatch(/type="array"/);
      expect(xml).toMatch(/total_count="0"/);
      expect(xml).toMatch(/<issues.*\/>/);
    });

    it('escapes special XML characters in text fields', async () => {
      // Arrange
      const issueWithSpecialChars = {
        ...fixtures.issueListResponse,
        issues: [{
          ...fixtures.issueListResponse.issues[0],
          subject: 'Test & Demo < > " \' Issue',
          description: 'Contains & < > " \' special chars'
        }]
      };

      mockFetch.mockImplementationOnce(() => 
        mockResponse(issueWithSpecialChars)
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      const xml = response.content[0].text;
      expect(xml).toMatch(/&amp;/);
      expect(xml).toMatch(/&lt;/);
      expect(xml).toMatch(/&gt;/);
      expect(xml).toMatch(/&quot;/);
      expect(xml).toMatch(/&apos;/);
    });
  });

  describe('Error Handling', () => {
    it('handles network errors correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockNetworkError("Network error")
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toMatch(/network error/i);
    });

    it('handles API errors correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockErrorResponse(500, ["Internal server error"])
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toMatch(/internal server error/i);
    });

    it('handles rate limiting correctly', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        mockErrorResponse(429, ["Too many requests"])
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpToolResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toMatch(/too many requests/i);
    });
  });
});