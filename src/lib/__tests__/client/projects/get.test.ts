import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import type { Mock } from "jest-mock";
import { ProjectsClient } from "../../../../client/projects.js";
import { mockResponse, mockErrorResponse } from "../../../helpers/mocks.js";
import * as fixtures from "../../../helpers/fixtures.js";
import config from "../../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { ProjectQueryParams } from "../../../../types/index.js";
import { parseUrl } from "../../../helpers/url.js";

describe("Projects API (GET)", () => {
  let client: ProjectsClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new ProjectsClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("GET /projects.json (getProjects)", () => {
    it("fetches projects without parameters", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.projectListResponse)
      );

      // Act
      const result = await client.getProjects();

      // Assert
      const expectedUrl = new URL("/projects.json", config.redmine.host);
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
      expect(result).toEqual(fixtures.projectListResponse);
    });

    describe("filtering and includes", () => {
      it("filters by status", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          status: 1, // Active status
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          status: "1",
        });
      });

      it("filters by is_public flag", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          is_public: true,
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          is_public: "1",
        });
      });

      it("filters by search query", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          name: "test project",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          name: "test project",
        });
      });

      it("combines multiple filters", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          status: 1,
          is_public: true,
          name: "test",
          include: "trackers",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          status: "1",
          is_public: "1",
          name: "test",
          include: "trackers",
        });
      });

      it("includes associated data with single include", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          include: "trackers",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "trackers",
        });
      });

      it("includes multiple associated data", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          include: "trackers,issue_categories,enabled_modules",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "trackers,issue_categories,enabled_modules",
        });
      });

      it("includes all available associated data", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          include:
            "trackers,issue_categories,enabled_modules,time_entry_activities,issue_custom_fields",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include:
            "trackers,issue_categories,enabled_modules,time_entry_activities,issue_custom_fields",
        });
      });

      it("applies pagination", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          offset: 25,
          limit: 50,
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.projectListResponse)
        );

        // Act
        await client.getProjects(params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          offset: "25",
          limit: "50",
        });
      });
    });

    describe("error handling", () => {
      it("handles invalid status value", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(400, ["Invalid status value"])
        );

        // Act & Assert
        await expect(
          client.getProjects({ status: 999 } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        ).rejects.toThrow(RedmineApiError);
      });

      it("handles invalid include parameter", async () => {
        // Arrange
        const params: ProjectQueryParams = {
          include: "invalid_module",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(400, ["Invalid include value"])
        );

        // Act & Assert
        await expect(client.getProjects(params)).rejects.toThrow(
          RedmineApiError
        );
      });

      it("handles server error", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(500, ["Internal server error"])
        );

        // Act & Assert
        await expect(client.getProjects()).rejects.toThrow(RedmineApiError);
      });

      it("handles unauthorized access", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(403, ["Unauthorized access"])
        );

        // Act & Assert
        await expect(client.getProjects()).rejects.toThrow(RedmineApiError);
      });
    });
  });

  describe("GET /projects/:id.json (getProject)", () => {
    const projectId = fixtures.singleProjectResponse.project.id;
    const projectIdentifier = fixtures.singleProjectResponse.project.identifier;

    it("fetches a single project by ID", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleProjectResponse)
      );

      // Act
      const result = await client.getProject(projectId);

      // Assert
      const expectedUrl = new URL(
        `/projects/${projectId}.json`,
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
      expect(result).toEqual(fixtures.singleProjectResponse);
    });

    it("fetches a single project by identifier", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleProjectResponse)
      );

      // Act
      const result = await client.getProject(projectIdentifier);

      // Assert
      const expectedUrl = new URL(
        `/projects/${projectIdentifier}.json`,
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
      expect(result).toEqual(fixtures.singleProjectResponse);
    });

    describe("including associated data", () => {
      it("includes single type of associated data", async () => {
        // Arrange
        const params = { include: "trackers" };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.singleProjectWithIncludesResponse)
        );

        // Act
        await client.getProject(projectId, params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "trackers",
        });
      });

      it("includes multiple types of associated data", async () => {
        // Arrange
        const params = {
          include: "trackers,issue_categories,enabled_modules",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.singleProjectWithIncludesResponse)
        );

        // Act
        await client.getProject(projectId, params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "trackers,issue_categories,enabled_modules",
        });
      });

      it("includes all available associated data", async () => {
        // Arrange
        const params = {
          include:
            "trackers,issue_categories,enabled_modules,time_entry_activities,issue_custom_fields",
        };
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.singleProjectWithIncludesResponse)
        );

        // Act
        await client.getProject(projectId, params);

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include:
            "trackers,issue_categories,enabled_modules,time_entry_activities,issue_custom_fields",
        });
      });
    });

    describe("error handling", () => {
      it("handles invalid ID format", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(404, ["Project not found"])
        );

        // Act & Assert
        await expect(client.getProject("invalid-id")).rejects.toThrow(
          RedmineApiError
        );
      });

      it("handles project not found", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(404, ["Project not found"])
        );

        // Act & Assert
        await expect(client.getProject(99999)).rejects.toThrow(RedmineApiError);
      });

      it("handles server error", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(500, ["Internal server error"])
        );

        // Act & Assert
        await expect(client.getProject(projectId)).rejects.toThrow(
          RedmineApiError
        );
      });

      it("handles unauthorized access", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(403, ["Unauthorized access"])
        );

        // Act & Assert
        await expect(client.getProject(projectId)).rejects.toThrow(
          RedmineApiError
        );
      });
    });
  });
});
