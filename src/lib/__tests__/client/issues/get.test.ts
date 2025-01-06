import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { IssuesClient } from "../../../client/issues.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { IssueListParams } from "../../../types/index.js";
import { parseUrl } from "../../helpers/url.js";

describe("Issues API (GET)", () => {
  let client: IssuesClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new IssuesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("GET /issues.json (getIssues)", () => {
    it("fetches issues without parameters", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const result = await client.getIssues();

      // Assert
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            "X-Redmine-API-Key": config.redmine.apiKey,
          }),
        })
      );
      expect(result).toEqual(fixtures.issueListResponse);
    });

    it("fetches issues with parameters", async () => {
      // Arrange
      const params: IssueListParams = {
        offset: 0,
        limit: 25,
        project_id: 20,
        status_id: "open",
        sort: "updated_on:desc",
      };
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.issueListResponse)
      );

      // Act
      const result = await client.getIssues(params);

      // Assert
      const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
      const { base: actualBase, params: actualParams } = parseUrl(url);
      const expectedBase = new URL(
        "/issues.json",
        config.redmine.host
      ).toString();
      const expectedParams = {
        offset: "0",
        limit: "25",
        project_id: "20",
        status_id: "open",
        sort: "updated_on:desc",
      };

      expect(actualBase).toBe(expectedBase);
      expect(actualParams).toEqual(expectedParams);
      expect(mockFetch.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            "X-Redmine-API-Key": config.redmine.apiKey,
          }),
        })
      );
      expect(result).toEqual(fixtures.issueListResponse);
    });

    it("handles API error", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(404, ["Resource not found"])
      );

      // Act & Assert
      await expect(client.getIssues()).rejects.toThrow(RedmineApiError);
    });
  });

  describe("GET /issues/:id.json (getIssue)", () => {
    const issueId = fixtures.singleIssueResponse.issue.id;

    it("fetches a single issue", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleIssueResponse)
      );

      // Act
      const result = await client.getIssue(issueId);

      // Assert
      const expectedUrl = new URL(
        `/issues/${issueId}.json`,
        config.redmine.host
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            "X-Redmine-API-Key": config.redmine.apiKey,
          }),
        })
      );
      expect(result).toEqual(fixtures.singleIssueResponse);
    });

    it("fetches issue with include parameters", async () => {
      // Arrange
      const params = {
        include: "children,attachments",
      };
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleIssueResponse)
      );

      // Act
      const result = await client.getIssue(issueId, params);

      // Assert
      const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
      const { base: actualBase, params: actualParams } = parseUrl(url);
      const expectedBase = new URL(
        `/issues/${issueId}.json`,
        config.redmine.host
      ).toString();

      expect(actualBase).toBe(expectedBase);
      expect(actualParams).toEqual(params);
      expect(mockFetch.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            "X-Redmine-API-Key": config.redmine.apiKey,
          }),
        })
      );
      expect(result).toEqual(fixtures.singleIssueResponse);
    });

    it("handles API error", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(404, ["Issue not found"])
      );

      // Act & Assert
      await expect(client.getIssue(issueId)).rejects.toThrow(RedmineApiError);
    });
  });
});