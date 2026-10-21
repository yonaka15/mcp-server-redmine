import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { TimeEntriesClient } from '../../../client/time_entries.js';
import { mockErrorResponse } from '../../helpers/mocks.js';
import config from '../../../config.js';
import { RedmineApiError } from '../../../client/base.js';
import { RedmineTimeEntryUpdate } from '../../../types/index.js';

describe("Time Entries API (PUT)", () => {
  let client: TimeEntriesClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new TimeEntriesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /time_entries/:id.json (updateTimeEntry)", () => {
    it("resolves without error on Redmine's real 204 No Content response", async () => {
      // Arrange — Redmine does not echo back the updated time entry on a
      // successful PUT, it returns an empty 204 body.
      const timeEntryIdToUpdate = 11;
      const updateData: RedmineTimeEntryUpdate = {
        hours: 2.5,
        comments: "Updated comment",
      };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 204 }))
      );

      // Act & Assert — must not throw trying to parse a body that isn't there
      await expect(client.updateTimeEntry(timeEntryIdToUpdate, updateData)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/time_entries/${timeEntryIdToUpdate}.json`),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ time_entry: updateData }),
        })
      );
    });

    it("handles error when updating a non-existent time entry", async () => {
      const timeEntryIdToUpdate = 99999;
      const updateData: RedmineTimeEntryUpdate = { comments: "No such entry" };
      mockFetch.mockImplementationOnce(() => mockErrorResponse(404, ["Time entry not found"]));

      await expect(client.updateTimeEntry(timeEntryIdToUpdate, updateData)).rejects.toThrow(RedmineApiError);
    });
  });
});
