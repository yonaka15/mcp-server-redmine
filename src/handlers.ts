import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { redmineClient } from "./lib/client.js";
import config from "./lib/config.js";
import * as tools from "./tools/index.js";
import * as formatters from "./formatters/index.js";

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

// 利用可能なツール一覧
const TOOLS: Tool[] = [
  // チケット関連
  tools.ISSUE_SEARCH_TOOL,
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
];

// ツール一覧を返すハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// ツール実行ハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      // チケット関連のツール
      case "search_issues": {
        const issues = await redmineClient.getIssues({
          ...args,
          limit: args.limit || 10
        });

        return {
          content: [{
            type: "text",
            text: formatters.formatIssues(issues)
          }],
          isError: false
        };
      }

      case "create_issue": {
        const result = await redmineClient.createIssue(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueResult(result.issue, "created")
          }],
          isError: false
        };
      }

      case "update_issue": {
        const { id, ...updateData } = args;
        const result = await redmineClient.updateIssue(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueResult(result.issue, "updated")
          }],
          isError: false
        };
      }

      case "delete_issue": {
        await redmineClient.deleteIssue(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueDeleted(args.id)
          }],
          isError: false
        };
      }

      // プロジェクト関連のツール
      case "search_projects": {
        const projects = await redmineClient.getProjects({
          ...args,
          limit: args.limit || 10
        });

        return {
          content: [{
            type: "text",
            text: formatters.formatProjects(projects)
          }],
          isError: false
        };
      }

      case "get_project": {
        const result = await redmineClient.getProject(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProject(result.project)
          }],
          isError: false
        };
      }

      case "create_project": {
        const result = await redmineClient.createProject(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectResult(result.project, "created")
          }],
          isError: false
        };
      }

      case "update_project": {
        const { id, ...updateData } = args;
        const result = await redmineClient.updateProject(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectResult(result.project, "updated")
          }],
          isError: false
        };
      }

      case "archive_project": {
        await redmineClient.archiveProject(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectArchiveStatus(args.id, true)
          }],
          isError: false
        };
      }

      case "unarchive_project": {
        await redmineClient.unarchiveProject(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectArchiveStatus(args.id, false)
          }],
          isError: false
        };
      }

      case "delete_project": {
        await redmineClient.deleteProject(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectDeleted(args.id)
          }],
          isError: false
        };
      }

      // 作業時間関連のツール
      case "search_time_entries": {
        const entries = await redmineClient.getTimeEntries({
          ...args,
          limit: args.limit || 10
        });

        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntries(entries)
          }],
          isError: false
        };
      }

      case "get_time_entry": {
        const result = await redmineClient.getTimeEntry(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntry(result.time_entry)
          }],
          isError: false
        };
      }

      case "create_time_entry": {
        const result = await redmineClient.createTimeEntry(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryResult(result.time_entry, "created")
          }],
          isError: false
        };
      }

      case "update_time_entry": {
        const { id, ...updateData } = args;
        const result = await redmineClient.updateTimeEntry(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryResult(result.time_entry, "updated")
          }],
          isError: false
        };
      }

      case "delete_time_entry": {
        await redmineClient.deleteTimeEntry(args.id);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryDeleted(args.id)
          }],
          isError: false
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
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
  console.error("Redmine MCP Server running on stdio");
}

// エクスポート
export { server, runServer };