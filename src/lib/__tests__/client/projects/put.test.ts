import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import type { Mock } from "jest-mock";
import { ProjectsClient } from "../../../client/projects.js";
import { mockErrorResponse } from "../../helpers/mocks.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { RedmineProjectCreate } from "../../../types/index.js";

describe("Projects API (PUT)", () => {
  let client: ProjectsClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new ProjectsClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /projects/:id.json (updateProject)", () => {
    it("resolves without error on Redmine's real 204 No Content response", async () => {
      // Arrange — Redmine does not echo back the updated project on a
      // successful PUT, it returns an empty 204 body.
      const projectIdToUpdate = 3;
      const updateData: Partial<RedmineProjectCreate> = {
        name: "Updated Project Name",
        description: "Updated via PUT",
      };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 204 }))
      );

      // Act & Assert — must not throw trying to parse a body that isn't there
      await expect(client.updateProject(projectIdToUpdate, updateData)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/projects/${projectIdToUpdate}.json`),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "X-Redmine-API-Key": config.redmine.apiKey,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ project: updateData }),
        })
      );
    });

    it("handles error when updating a non-existent project", async () => {
      const projectIdToUpdate = 99999;
      const updateData: Partial<RedmineProjectCreate> = { name: "Nobody's project" };
      mockFetch.mockImplementationOnce(() => mockErrorResponse(404, ["Project not found"]));

      await expect(client.updateProject(projectIdToUpdate, updateData)).rejects.toThrow(RedmineApiError);
    });
  });
});
