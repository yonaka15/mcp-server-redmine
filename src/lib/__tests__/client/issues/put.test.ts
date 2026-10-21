import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { IssuesClient } from '../../../client/issues.js';
import { mockErrorResponse } from '../../helpers/mocks.js';
import config from '../../../config.js';
import { RedmineApiError } from '../../../client/base.js';
import { RedmineIssueUpdate } from '../../../types/index.js';

describe("Issues API (PUT)", () => {
  let client: IssuesClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new IssuesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /issues/:id.json (updateIssue)", () => {
    it("resolves without error on Redmine's real 204 No Content response", async () => {
      // Arrange — Redmine does not echo back the updated issue on a
      // successful PUT, it returns an empty 204 body.
      const issueIdToUpdate = 42;
      const updateData: RedmineIssueUpdate = {
        subject: "Updated Test Issue Subject",
        notes: "Adding a note during update.",
      };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 204 }))
      );

      // Act & Assert — must not throw trying to parse a body that isn't there
      await expect(client.updateIssue(issueIdToUpdate, updateData)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/issues/${issueIdToUpdate}.json`),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ issue: updateData }),
        })
      );
    });

    it("handles error when updating a non-existent issue", async () => {
      // Arrange
      const issueIdToUpdate = 99999;
      const updateData: RedmineIssueUpdate = {
        subject: "Attempting to update non-existent issue",
      };
      mockFetch.mockImplementationOnce(() => mockErrorResponse(404, ["Issue not found"]));

      // Act & Assert
      await expect(client.updateIssue(issueIdToUpdate, updateData)).rejects.toThrow(RedmineApiError);
    });
  });
});
