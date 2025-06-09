import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { TimeEntriesClient } from "../../../../client/time_entries.js";
import { mockResponse, mockErrorResponse } from "../../../helpers/mocks.js";
import * as fixtures from "../../../helpers/fixtures.js";
import config from "../../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { TimeEntryQueryParams } from "../../../../types/time_entries/schema.js";
import { parseUrl } from "../../../helpers/url.js";

describe("Time Entries API (GET)", () => {
  let client: TimeEntriesClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new TimeEntriesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("GET /time_entries.json (getTimeEntries)", () => {
    it("fetches time entries without parameters", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.timeEntryListResponse)
      );

      // Act
      const result = await client.getTimeEntries();

      // Assert
      const expectedUrl = new URL("/time_entries.json", config.redmine.host);
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
      expect(result).toEqual(fixtures.timeEntryListResponse);
    });

    describe("filtering", () => {
      it("filters by project and user", async () => {
        // Arrange
        const params: TimeEntryQueryParams = {
          project_id: 1,
          user_id: 1
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.timeEntryListResponse)
        );

        // Act
        await client.getTimeEntries(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          project_id: "1",
          user_id: "1"
        });
      });

      it("filters by date range", async () => {
        // Arrange
        const params: TimeEntryQueryParams = {
          from: "2025-01-01",
          to: "2025-01-31"
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.timeEntryListResponse)
        );

        // Act
        await client.getTimeEntries(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          from: "2025-01-01",
          to: "2025-01-31"
        });
      });

      it("applies pagination", async () => {
        // Arrange
        const params: TimeEntryQueryParams = {
          offset: 25,
          limit: 50
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.timeEntryListResponse)
        );

        // Act
        await client.getTimeEntries(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          offset: "25",
          limit: "50"
        });
      });
    });

    it("handles error", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(400, ["Invalid query parameters"])
      );

      // Act & Assert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(client.getTimeEntries({ invalid_param: "value" } as any))
        .rejects.toThrow(RedmineApiError);
    });
  });

  describe("GET /time_entries/:id.json (getTimeEntry)", () => {
    const timeEntryId = fixtures.singleTimeEntryResponse.time_entry.id;

    it("fetches a single time entry", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleTimeEntryResponse)
      );

      // Act
      const result = await client.getTimeEntry(timeEntryId);

      // Assert
      const expectedUrl = new URL(
        `/time_entries/${timeEntryId}.json`,
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
      expect(result).toEqual(fixtures.singleTimeEntryResponse);
    });

    it("handles error", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(404, ["Time entry not found"])
      );

      // Act & Assert
      await expect(client.getTimeEntry(99999)).rejects.toThrow(RedmineApiError);
    });
  });
});
