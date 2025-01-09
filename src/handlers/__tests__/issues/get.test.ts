import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { RedmineClient } from "../../../lib/client/index.js";
import { mockResponse, mockErrorResponse } from "../../../lib/__tests__/helpers/mocks.js";
import * as fixtures from "../../../lib/__tests__/helpers/fixtures.js";
import config from "../../../lib/config.js";
import { parseUrl } from "../../../lib/__tests__/helpers/url.js";
import { createIssuesHandlers } from "../../issues.js";
import { IssueListParams } from "../../../lib/types/index.js";
import type { ToolResponse } from "../../../handlers/types.js";

type ToolResponseContent = {
  type: string;
  text: string;
};

const assertMcpResponse = (response: ToolResponse) => {
  // Validate structure
  expect(response).toEqual({
    content: expect.any(Array),
    isError: expect.any(Boolean)
  });

  // Content array must not be empty
  expect(response.content.length).toBeGreaterThan(0);

  // Each content item must comply with MCP protocol
  response.content.forEach((item: ToolResponseContent) => {
    expect(item).toEqual({
      type: "text",  // MCPプロトコルに準拠した"text"
      text: expect.any(String)
    });
    // Text must not be empty
    expect(item.text.length).toBeGreaterThan(0);
  });
};

const DEFAULT_PAGINATION = {
  offset: "0",
  limit: "25"
};

describe("Issues Handler (GET) - MCP Response", () => {
  let client: RedmineClient;
  let mockFetch: Mock;
  let handlers: ReturnType<typeof createIssuesHandlers>;

  beforeEach(() => {
    client = new RedmineClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
    handlers = createIssuesHandlers({ client, config });
  });

  describe("GET /issues.json (list_issues)", () => {
    beforeEach(() => {
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.issueListResponse)
      );
    });

    it("returns valid MCP response for successful fetch", async () => {
      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(false);
      expect(response.content[0].type).toBe("text");  // MCPプロトコルに準拠した"text"
      expect(response.content[0].text).toContain(fixtures.issueListResponse.issues[0].subject);
    });

    describe("filtering", () => {
      it("returns valid MCP response with filter parameters", async () => {
        // Arrange
        const params: IssueListParams = {
          project_id: 1,
          status_id: "open",
          sort: "updated_on:desc"
        };

        // Act
        const response = await handlers.list_issues(params);

        // Assert
        assertMcpResponse(response);
        expect(response.isError).toBe(false);

        const [url] = mockFetch.mock.calls[0] as [string];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          ...DEFAULT_PAGINATION,
          project_id: "1",
          status_id: "open",
          sort: "updated_on:desc"
        });
      });
    });

    it("returns valid MCP error response for API error", async () => {
      // Arrange
      mockFetch.mockReset();
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(400, ["Invalid query parameters"])
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].type).toBe("text");  // MCPプロトコルに準拠した"text"
      expect(response.content[0].text).toContain("Invalid query parameters");
    });

    it("returns valid MCP error response for invalid parameters", async () => {
      // Arrange
      const params: IssueListParams = {
        limit: -1 // Invalid value
      };

      // Act
      const response = await handlers.list_issues(params);

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(true);
      expect(response.content[0].type).toBe("text");  // MCPプロトコルに準拠した"text"
      expect(response.content[0].text).toMatch(/limit|invalid/i);
    });
  });
});