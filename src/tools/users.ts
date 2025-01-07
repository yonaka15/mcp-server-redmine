import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// ユーザー一覧の取得
export const USER_SEARCH_TOOL: Tool = {
  name: "search_users",
  description: "Search for users",
  inputSchema: {
    type: "object",
    properties: {
      status: { type: "number", description: "User status (1: active, 2: registered, 3: locked)" },
      name: { type: "string", description: "Search users by their name or login" },
      group_id: { type: "number", description: "Filter by group membership" },
      offset: { type: "number", description: "Number of items to skip" },
      limit: { type: "number", description: "Number of items per page (max: 100)" }
    }
  }
};

// ユーザー詳細の取得
export const USER_GET_TOOL: Tool = {
  name: "get_user",
  description: "Get user details",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "User ID" },
      include: { type: "string", description: "Additional data to include (memberships,groups)" }
    },
    required: ["id"]
  }
};