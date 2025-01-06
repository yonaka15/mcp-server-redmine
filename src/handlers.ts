import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { redmineClient } from "./lib/client/index.js";
import config from "./lib/config.js";
import * as tools from "./tools/index.js";
import * as formatters from "./formatters/index.js";
import type { RedmineIssueCreate, RedmineProjectCreate, RedmineTimeEntryCreate } from "./lib/types/index.js";

// 型チェックヘルパー
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function asNumber(value: unknown): number {
  if (!isNumber(value)) {
    throw new Error('Expected number value');
  }
  return value;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function asStringOrNumber(value: unknown): string | number {
  if (!isString(value) && !isNumber(value)) {
    throw new Error('Expected string or number value');
  }
  return value;
}

// RedmineIssueCreateの型チェック
function isRedmineIssueCreate(value: unknown): value is RedmineIssueCreate {
  if (typeof value !== 'object' || !value) return false;
  const v = value as Record<string, unknown>;
  return isNumber(v.project_id) && typeof v.subject === 'string';
}

// RedmineProjectCreateの型チェック
function isRedmineProjectCreate(value: unknown): value is RedmineProjectCreate {
  if (typeof value !== 'object' || !value) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.identifier === 'string';
}

// RedmineTimeEntryCreateの型チェック
function isRedmineTimeEntryCreate(value: unknown): value is RedmineTimeEntryCreate {
  if (typeof value !== 'object' || !value) return false;
  const v = value as Record<string, unknown>;
  return isNumber(v.hours) && isNumber(v.activity_id);
}

// パラメータ抽出ヘルパー
function extractPaginationParams(args: Record<string, unknown>) {
  return {
    ...args,
    limit: isNumber(args.limit) ? args.limit : 10,
    offset: isNumber(args.offset) ? args.offset : 0
  };
}

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

    if (!args || typeof args !== 'object') {
      throw new Error("No arguments provided");
    }

    switch (name) {
      // チケット関連のツール
      case "search_issues": {
        const validatedArgs = extractPaginationParams(args);
        const issues = await redmineClient.issues.getIssues(validatedArgs);

        return {
          content: [{
            type: "text",
            text: formatters.formatIssues(issues)
          }],
          isError: false
        };
      }

      case "create_issue": {
        if (!isRedmineIssueCreate(args)) {
          throw new Error("Invalid issue create parameters");
        }
        const result = await redmineClient.issues.createIssue(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueResult(result.issue, "created")
          }],
          isError: false
        };
      }

      case "update_issue": {
        if (!isNumber(args.id)) {
          throw new Error("Issue ID must be a number");
        }
        const { id, ...updateData } = args;
        const result = await redmineClient.issues.updateIssue(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueResult(result.issue, "updated")
          }],
          isError: false
        };
      }

      case "delete_issue": {
        const id = asNumber(args.id);
        await redmineClient.issues.deleteIssue(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatIssueDeleted(id)
          }],
          isError: false
        };
      }

      // プロジェクト関連のツール
      case "search_projects": {
        const validatedArgs = extractPaginationParams(args);
        const projects = await redmineClient.projects.getProjects(validatedArgs);

        return {
          content: [{
            type: "text",
            text: formatters.formatProjects(projects)
          }],
          isError: false
        };
      }

      case "get_project": {
        const id = asStringOrNumber(args.id);
        const result = await redmineClient.projects.getProject(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProject(result.project)
          }],
          isError: false
        };
      }

      case "create_project": {
        if (!isRedmineProjectCreate(args)) {
          throw new Error("Invalid project create parameters");
        }
        const result = await redmineClient.projects.createProject(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectResult(result.project, "created")
          }],
          isError: false
        };
      }

      case "update_project": {
        const id = asStringOrNumber(args.id);
        const { id: _, ...updateData } = args;
        const result = await redmineClient.projects.updateProject(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectResult(result.project, "updated")
          }],
          isError: false
        };
      }

      case "archive_project": {
        const id = asStringOrNumber(args.id);
        await redmineClient.projects.archiveProject(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectArchiveStatus(id, true)
          }],
          isError: false
        };
      }

      case "unarchive_project": {
        const id = asStringOrNumber(args.id);
        await redmineClient.projects.unarchiveProject(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectArchiveStatus(id, false)
          }],
          isError: false
        };
      }

      case "delete_project": {
        const id = asStringOrNumber(args.id);
        await redmineClient.projects.deleteProject(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatProjectDeleted(id)
          }],
          isError: false
        };
      }

      // 作業時間関連のツール
      case "search_time_entries": {
        const validatedArgs = extractPaginationParams(args);
        const entries = await redmineClient.timeEntries.getTimeEntries(validatedArgs);

        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntries(entries)
          }],
          isError: false
        };
      }

      case "get_time_entry": {
        const id = asNumber(args.id);
        const result = await redmineClient.timeEntries.getTimeEntry(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntry(result.time_entry)
          }],
          isError: false
        };
      }

      case "create_time_entry": {
        if (!isRedmineTimeEntryCreate(args)) {
          throw new Error("Invalid time entry create parameters");
        }
        const result = await redmineClient.timeEntries.createTimeEntry(args);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryResult(result.time_entry, "created")
          }],
          isError: false
        };
      }

      case "update_time_entry": {
        const id = asNumber(args.id);
        const { id: _, ...updateData } = args;
        const result = await redmineClient.timeEntries.updateTimeEntry(id, updateData);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryResult(result.time_entry, "updated")
          }],
          isError: false
        };
      }

      case "delete_time_entry": {
        const id = asNumber(args.id);
        await redmineClient.timeEntries.deleteTimeEntry(id);
        return {
          content: [{
            type: "text",
            text: formatters.formatTimeEntryDeleted(id)
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