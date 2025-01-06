import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { IssuesClient } from "../../../client/issues.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { RedmineIssueCreate } from "../../../types/index.js";
import { parseUrl } from "../../helpers/url.js";

describe("Issues API (POST)", () => {
  let client: IssuesClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new IssuesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("POST /issues.json (createIssue)", () => {
    // 実データを作成する可能性があるためスキップ
    it.skip("creates an issue with required fields", async () => {
      // This test is skipped because it might create actual data
    });

    it.skip("creates an issue with optional fields", async () => {
      // This test is skipped because it might create actual data
    });

    it("returns validation error when subject is missing", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(422, ["Subject cannot be blank"])
      );

      // Act & Assert
      await expect(client.createIssue(fixtures.issueCreateData.invalidIssue as RedmineIssueCreate))
        .rejects
        .toThrow(RedmineApiError);

      // Verify request
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expect(url).toBe(expectedUrl.toString());
      expect(init).toMatchObject({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Redmine-API-Key": config.redmine.apiKey,
        }),
        body: JSON.stringify({ issue: fixtures.issueCreateData.invalidIssue }),
      });
    });

    it("returns not found error when project does not exist", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(404, ["Project not found"])
      );

      // Act & Assert
      await expect(client.createIssue(fixtures.issueCreateData.nonExistentProject))
        .rejects
        .toThrow(RedmineApiError);

      // Verify request
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expect(url).toBe(expectedUrl.toString());
      expect(init).toMatchObject({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Redmine-API-Key": config.redmine.apiKey,
        }),
        body: JSON.stringify({ issue: fixtures.issueCreateData.nonExistentProject }),
      });
    });

    it("returns forbidden error when user lacks permission", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(403, ["You are not authorized to create issues"])
      );

      // Act & Assert
      await expect(client.createIssue(fixtures.issueCreateData.normalIssue))
        .rejects
        .toThrow(RedmineApiError);

      // Verify request
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expect(url).toBe(expectedUrl.toString());
      expect(init).toMatchObject({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Redmine-API-Key": config.redmine.apiKey,
        }),
        body: JSON.stringify({ issue: fixtures.issueCreateData.normalIssue }),
      });
    });

    it("returns server error when internal error occurs", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(500, ["Internal error"])
      );

      // Act & Assert
      await expect(client.createIssue(fixtures.issueCreateData.normalIssue))
        .rejects
        .toThrow(RedmineApiError);

      // Verify request
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const expectedUrl = new URL("/issues.json", config.redmine.host);
      expect(url).toBe(expectedUrl.toString());
      expect(init).toMatchObject({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Redmine-API-Key": config.redmine.apiKey,
        }),
        body: JSON.stringify({ issue: fixtures.issueCreateData.normalIssue }),
      });
    });
  });
});