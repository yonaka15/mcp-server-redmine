import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { handleCreateOrUpdateWikiPage } from "../../wiki.js";
import { WikiClient } from "../../../lib/client/wiki.js";
import { assertMcpToolResponse } from "../../../lib/__tests__/helpers/mcp.js";

jest.mock("../../../lib/client/wiki.js");

describe("handleCreateOrUpdateWikiPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates or updates a wiki page and returns formatted output", async () => {
    const mockPage = {
      title: "Home",
      version: 2,
      text: "Updated content",
      author: { id: 1, name: "Admin" },
      updated_on: "2025-01-01T00:00:00Z",
    };

    jest
      .spyOn(WikiClient.prototype, "createOrUpdateWikiPage")
      .mockResolvedValue({ wiki_page: mockPage } as any);

    const result = await handleCreateOrUpdateWikiPage({
      project_id: 1,
      title: "Home",
      text: "Updated content",
      comments: "via test",
    });

    assertMcpToolResponse(result);

    const textItem = result.content[0];
    expect(textItem.type).toBe("text");
    expect(textItem.text).toContain("Home");
    expect(textItem.text).toContain("Updated content");

    expect(WikiClient.prototype.createOrUpdateWikiPage).toHaveBeenCalledWith(
      1,
      "Home",
      "Updated content",
      { comments: "via test", parent_title: undefined }
    );
  });
});
