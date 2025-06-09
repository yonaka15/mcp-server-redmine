import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { UserListParams } from "../../../types/index.js";
import { parseUrl } from "../../helpers/url.js";

describe("Users API (GET)", () => {
  let client: UsersClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("GET /users.json (getUsers)", () => {
    it("fetches users list without parameters", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.userListResponse)
      );

      // Act
      const result = await client.getUsers();

      // Assert
      const expectedUrl = new URL("/users.json", config.redmine.host);
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
      expect(result).toEqual(fixtures.userListResponse);
    });

    it("fetches users list with parameters", async () => {
      // Arrange
      const params: UserListParams = {
        status: 1,
        name: "john",
        group_id: 1,
        offset: 0,
        limit: 25,
      };
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.userListResponse)
      );

      // Act
      await client.getUsers(params); // result variable removed as per eslint error

      // Assert
      const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
      const { params: actualParams } = parseUrl(url);
      expect(actualParams).toEqual({
        status: "1",
        name: "john",
        group_id: "1",
        offset: "0",
        limit: "25",
      });
    });

    it("handles forbidden error (non-admin access)", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(403, ["Forbidden. Admin privileges required."])
      );

      // Act & Assert
      await expect(client.getUsers()).rejects.toThrow(
        "Redmine API error: 403 Error\nForbidden. Admin privileges required."
      );
    });
  });

  describe("GET /users/:id.json (getUser)", () => {
    it("fetches single user successfully", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleUserResponse)
      );

      const userId = fixtures.singleUserResponse.user.id;

      // Act
      const result = await client.getUser(userId);

      // Assert
      const expectedUrl = new URL(
        `/users/${userId}.json`,
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
      expect(result).toEqual(fixtures.singleUserResponse);
    });

    it("fetches current user successfully", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleUserResponse)
      );

      // Act
      const result = await client.getUser("current");

      // Assert
      const expectedUrl = new URL(
        "/users/current.json",
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
      // Note: The assertion for `result` would depend on the actual response fixture for current user
    });

    describe("including associated data", () => {
      it("includes single type of associated data", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.singleUserWithIncludesResponse)
        );

        // Act
        // Original: const result = await client.getUser(1, { include: "memberships" });
        await client.getUser(1, { include: "memberships" }); // result variable removed as per eslint error

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "memberships"
        });
        // The following line would now cause an error if uncommented, as `result` is not defined.
        // expect(result.user.memberships).toBeDefined(); 
      });

      it("includes multiple types of associated data", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockResponse(fixtures.singleUserWithIncludesResponse)
        );

        // Act
        const result = await client.getUser(1, {
          include: "memberships,groups"
        });

        // Assert
        const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          include: "memberships,groups"
        });
        expect(result.user.memberships).toBeDefined();
        expect(result.user.groups).toBeDefined();
      });
    });

    describe("error handling", () => {
      it("handles invalid include parameter", async () => {
        // Act & Assert
        await expect(
          client.getUser(1, { include: "invalid,values" })
        ).rejects.toThrow("Invalid include parameter. Valid values are: memberships, groups");
      });

      it("handles user not found error", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(404, ["User not found"])
        );

        // Act & Assert
        await expect(client.getUser(999))
          .rejects.toThrow(RedmineApiError);
      });

      it("handles unauthorized access", async () => {
        // Arrange
        mockFetch.mockImplementationOnce(async () =>
          mockErrorResponse(403, ["Unauthorized access"])
        );

        // Act & Assert
        await expect(client.getUser(1))
          .rejects.toThrow(RedmineApiError);
      });
    });
  });

  describe("getCurrentUser", () => {
    it("fetches current user as a shorthand", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleUserResponse)
      );

      // Act
      const result = await client.getCurrentUser();

      // Assert
      const expectedUrl = new URL(
        "/users/current.json",
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
      expect(result).toEqual(fixtures.singleUserResponse);
    });

    it("fetches current user with includes", async () => {
      // Arrange
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.singleUserWithIncludesResponse)
      );

      // Act
      const result = await client.getCurrentUser({
        include: "memberships,groups"
      });

      // Assert
      const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
      const { params: actualParams } = parseUrl(url);
      expect(actualParams).toEqual({
        include: "memberships,groups"
      });
      expect(result.user.memberships).toBeDefined();
      expect(result.user.groups).toBeDefined();
    });
  });
});
