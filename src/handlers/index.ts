import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { redmineClient } from "../lib/client/index.js";
import config from "../lib/config.js";
import * as tools from "../tools/index.js";
import { HandlerContext, ToolResponse } from "./types.js";
import { createIssuesHandlers } from "./issues.js";
import { createProjectsHandlers } from "./projects.js";
import { createTimeEntriesHandlers } from "./time_entries.js";
import { createUsersHandlers } from "./users.js";

// ハンドラーコンテキストの作成
const context: HandlerContext = {
  client: redmineClient,
  config: config,
};

// 各リソースのハンドラー作成
const issuesHandlers = createIssuesHandlers(context);
const projectsHandlers = createProjectsHandlers(context);
const timeEntriesHandlers = createTimeEntriesHandlers(context);
const usersHandlers = createUsersHandlers(context);

// ハンドラーマップの作成
const handlers = {
  ...issuesHandlers,
  ...projectsHandlers,
  ...timeEntriesHandlers,
  ...usersHandlers,
};

// 利用可能なツール一覧
const TOOLS: Tool[] = [
  // チケット関連
  tools.ISSUE_LIST_TOOL,
  tools.ISSUE_CREATE_TOOL,
  tools.ISSUE_UPDATE_TOOL,
  tools.ISSUE_DELETE_TOOL,
  // プロジェクト関連
  tools.PROJECT_SEARCH_TOOL,
  tools.PROJECT_GET_TOOL,
  tools.PROJECT_CREATE_TOOL,
  tools.PROJECT_UPDATE_TOOL,
  tools.PROJECT_ARCHIVE_TOOL,
  tools.PROJECT_UNARCHIVE_TOOL,
  tools.PROJECT_DELETE_TOOL,
  // 作業時間関連
  tools.TIME_ENTRY_SEARCH_TOOL,
  tools.TIME_ENTRY_GET_TOOL,
  tools.TIME_ENTRY_CREATE_TOOL,
  tools.TIME_ENTRY_UPDATE_TOOL,
  tools.TIME_ENTRY_DELETE_TOOL,
  // ユーザー関連
  tools.USER_SEARCH_TOOL,
  tools.USER_GET_TOOL,
];

// サーバーの初期化
const server = new Server(
  {
    name: config.server.name,
    version: config.server.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧を返すハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// ツール実行ハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args || typeof args !== "object") {
      throw new Error("No arguments provided");
    }

    // ハンドラーの実行
    if (name in handlers) {
      return await handlers[name as keyof typeof handlers](args);
    }

    // 未知のツール名の場合
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    // エラー詳細をログ出力
    console.error("Error in request handler:");
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
      if ("cause" in error && error.cause) {
        console.error("Error cause:", error.cause);
      }
    } else {
      console.error("Unknown error:", String(error));
    }

    // ユーザーへはシンプルなエラーメッセージを返す
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    };
  }
});

// サーバー起動
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// エクスポート
export { server, runServer };

