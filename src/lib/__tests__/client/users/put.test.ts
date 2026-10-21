import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
import { mockErrorResponse } from "../../helpers/mocks.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { RedmineUserUpdate } from "../../../types/index.js";

describe("Users API (PUT)", () => {
  let client: UsersClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /users/:id.json (updateUser)", () => {
    it("resolves without error on Redmine's real 204 No Content response", async () => {
      // Arrange — Redmine does not echo back the updated user on a
      // successful PUT, it returns an empty 204 body.
      const userIdToUpdate = 7;
      const updateData: RedmineUserUpdate = {
        firstname: "Updated",
        lastname: "Name",
      };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 204 }))
      );

      // Act & Assert — must not throw trying to parse a body that isn't there
      await expect(client.updateUser(userIdToUpdate, updateData)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${userIdToUpdate}.json`),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ user: updateData }),
        })
      );
    });

    it("handles error when updating a non-existent user", async () => {
      const userIdToUpdate = 99999;
      const updateData: RedmineUserUpdate = { firstname: "Nobody" };
      mockFetch.mockImplementationOnce(() => mockErrorResponse(404, ["User not found"]));

      await expect(client.updateUser(userIdToUpdate, updateData)).rejects.toThrow(RedmineApiError);
    });
  });
});
