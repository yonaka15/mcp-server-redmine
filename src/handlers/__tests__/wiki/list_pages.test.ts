import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { handleListWikiPages } from "../../wiki.js";
import { WikiClient } from "../../../lib/client/wiki.js";
import { assertMcpToolResponse } from "../../../lib/__tests__/helpers/mcp.js";

jest.mock("../../../lib/client/wiki.js");

describe("handleListWikiPages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns formatted wiki pages list and JSON", async () => {
    const mockList = [{ title: "Home", version: 3 }];

    jest
      .spyOn(WikiClient.prototype, "listWikiPages")
      .mockResolvedValue({ wiki_pages: mockList } as any);

    const result = await handleListWikiPages({ project_id: 1 });

    assertMcpToolResponse(result);

    const textItem = result.content[0];
    expect(textItem.type).toBe("text");
    expect(textItem.text).toContain("Wiki Pages:");
    expect(textItem.text).toContain("Home");
  });
});
