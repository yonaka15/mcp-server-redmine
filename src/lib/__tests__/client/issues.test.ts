import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { IssuesClient } from "../../client/issues.js";
import { mockResponse, mockErrorResponse } from "../helpers/mocks.js";
import * as fixtures from "../helpers/fixtures.js";
import config from "../../config.js";
import { RedmineApiError } from "../../client/base.js";
import { IssueListParams, IssueShowParams } from "../../types/index.js";

describe("IssuesClient", () => {
  let client: IssuesClient;
  const mockFetch = jest.spyOn(global, "fetch");

  beforeEach(() => {
    client = new IssuesClient();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getIssues", () => {
    it("fetches issues without parameters", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const result = await client.getIssues();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        new URL("/issues.json", config.redmine.host),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Accept": "application/json"
          })
        })
      );
      expect(result).toEqual(fixtures.issueListResponse);
    });

    it("fetches issues with parameters", async () => {
      // Arrange
      const params: IssueListParams = {
        offset: 0,
        limit: 50,
        project_id: 1,
        status_id: "open" as const,
        sort: "updated_on:desc"
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const result = await client.getIssues(params);

      // Assert
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expectedUrl.search = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(Object)
      );
      expect(result).toEqual(fixtures.issueListResponse);
    });

    it("validates include parameter", async () => {
      // Arrange
      const params: IssueListParams = {
        include: "attachments,relations"
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const result = await client.getIssues(params);

      // Assert
      expect(result).toEqual(fixtures.issueListResponse);
    });

    it("throws error for invalid include parameter", async () => {
      // Arrange
      const params = {
        include: "invalid,parameter"
      };

      // Act & Assert
      await expect(client.getIssues(params as IssueListParams))
        .rejects
        .toThrow("Invalid include parameter for issue list");
    });

    it("handles API error", async () => {
      // Arrange
      const errorStatus = 404;
      const errorMessages = ["Resource not found"];
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(errorStatus, errorMessages)
      );

      // Act & Assert
      await expect(client.getIssues())
        .rejects
        .toThrow(RedmineApiError);
      await expect(client.getIssues())
        .rejects
        .toMatchObject({
          status: errorStatus,
          errors: errorMessages
        });
    });
  });

  describe("getIssue", () => {
    const issueId = 4326;

    it("fetches a single issue", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.singleIssueResponse)
      );

      // Act
      const result = await client.getIssue(issueId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        new URL(`/issues/${issueId}.json`, config.redmine.host),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Accept": "application/json"
          })
        })
      );
      expect(result).toEqual(fixtures.singleIssueResponse);
    });

    it("fetches issue with include parameters", async () => {
      // Arrange
      const params: IssueShowParams = {
        include: "children,attachments,journals"
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.singleIssueResponse)
      );

      // Act
      const result = await client.getIssue(issueId, params);

      // Assert
      const expectedUrl = new URL(`/issues/${issueId}.json`, config.redmine.host);
      expectedUrl.search = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(Object)
      );
      expect(result).toEqual(fixtures.singleIssueResponse);
    });

    it("validates allowed include parameters", async () => {
      // Arrange
      const params: IssueShowParams = {
        include: "children,attachments,relations,changesets,journals,watchers,allowed_statuses"
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse(fixtures.singleIssueResponse)
      );

      // Act
      const result = await client.getIssue(issueId, params);

      // Assert
      expect(result).toEqual(fixtures.singleIssueResponse);
    });

    it("throws error for invalid include parameter", async () => {
      // Arrange
      const params = {
        include: "invalid,parameter"
      };

      // Act & Assert
      await expect(client.getIssue(issueId, params as IssueShowParams))
        .rejects
        .toThrow("Invalid include parameter for single issue");
    });

    it("validates issue schema", async () => {
      // Arrange
      const invalidIssueResponse = {
        issue: {
          ...fixtures.singleIssueResponse.issue,
          id: "invalid" // IDが文字列（無効）
        }
      };
      mockFetch.mockResolvedValueOnce(
        mockResponse(invalidIssueResponse)
      );

      // Act & Assert
      await expect(client.getIssue(issueId))
        .rejects
        .toThrow();
    });

    it("handles API error", async () => {
      // Arrange
      const errorStatus = 404;
      const errorMessages = ["Issue not found"];
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(errorStatus, errorMessages)
      );

      // Act & Assert
      await expect(client.getIssue(issueId))
        .rejects
        .toThrow(RedmineApiError);
      await expect(client.getIssue(issueId))
        .rejects
        .toMatchObject({
          status: errorStatus,
          errors: errorMessages
        });
    });
  });
});