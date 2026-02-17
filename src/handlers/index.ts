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
import { HandlerContext } from "./types.js";
import { createIssuesHandlers } from "./issues.js";
import { createProjectsHandlers } from "./projects.js";
import { createTimeEntriesHandlers } from "./time_entries.js";
import { createUserHandlers } from "./users.js";
import {
  handleCreateOrUpdateWikiPage,
  handleGetWikiPage,
  handleListWikiAttachments,
  handleListWikiHistory,
  handleListWikiPages,
} from "./wiki.js";
import { formatAllowedStatuses } from "../formatters/projects.js"; // Import the new formatter

// Create handler context
const context: HandlerContext = {
  client: redmineClient,
  config: config,
  logger: {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
  },
};

// Create resource handlers
const issuesHandlers = createIssuesHandlers(context);
// Pass the formatter function to createProjectsHandlers
const projectsHandlers = createProjectsHandlers(context, formatAllowedStatuses);
const timeEntriesHandlers = createTimeEntriesHandlers(context);
const usersHandlers = createUserHandlers(context);

// Create handler map
const handlers = {
  ...issuesHandlers,
  ...projectsHandlers,
  ...timeEntriesHandlers,
  ...usersHandlers,
};

// Available tools list
// The PROJECT_LIST_STATUSES_TOOL will be added in the tools/index.ts modification step
const TOOLS: Tool[] = [
  // Issue-related tools
  tools.ISSUE_LIST_TOOL,
  tools.ISSUE_GET_TOOL,
  tools.ISSUE_CREATE_TOOL,
  tools.ISSUE_UPDATE_TOOL,
  tools.ISSUE_DELETE_TOOL,
  tools.ISSUE_ADD_WATCHER_TOOL,
  tools.ISSUE_REMOVE_WATCHER_TOOL,

  // Project-related tools
  tools.PROJECT_LIST_TOOL,
  tools.PROJECT_SHOW_TOOL,
  tools.PROJECT_CREATE_TOOL,
  tools.PROJECT_UPDATE_TOOL,
  tools.PROJECT_ARCHIVE_TOOL,
  tools.PROJECT_UNARCHIVE_TOOL,
  tools.PROJECT_DELETE_TOOL,
  tools.PROJECT_LIST_STATUSES_TOOL, // New tool for listing project statuses

  // Time entry tools
  tools.TIME_ENTRY_LIST_TOOL,
  tools.TIME_ENTRY_SHOW_TOOL,
  tools.TIME_ENTRY_CREATE_FOR_ISSUE_TOOL,
  tools.TIME_ENTRY_CREATE_FOR_PROJECT_TOOL,
  tools.TIME_ENTRY_UPDATE_TOOL,
  tools.TIME_ENTRY_DELETE_TOOL,

  // User-related tools
  tools.USER_LIST_TOOL,
  tools.USER_SHOW_TOOL,
  tools.USER_CREATE_TOOL,
  tools.USER_UPDATE_TOOL,
  tools.USER_DELETE_TOOL,

  // Wiki-related tools
  tools.WIKI_LIST_PAGES_TOOL,
  tools.WIKI_GET_PAGE_TOOL,
  tools.WIKI_LIST_HISTORY_TOOL,
  tools.WIKI_LIST_ATTACHMENTS_TOOL,
  tools.WIKI_CREATE_OR_UPDATE_PAGE_TOOL,
];

// Initialize server
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

// Tools list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  // Use the statically defined TOOLS array so that tools/list always returns
  // a consistent set of Tool definitions, independent of how the tools
  // module is compiled or imported.
  tools: TOOLS,
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args || typeof args !== "object") {
      // Even if args is null or undefined, pass it as an empty object for handlers that might not expect args.
      // Specific handlers should validate their own arguments.
    }

    // Execute handler
    // Ensure args is always an object, even if empty.
    const handlerArgs = args || {};
    if (name in handlers) {
      return await handlers[name as keyof typeof handlers](handlerArgs);
    }

    // Wiki-related tools are handled separately because their handlers have
    // strongly typed parameter objects rather than generic Records.
    if (
      name === "wiki_list_pages" ||
      name === "wiki_get_page" ||
      name === "wiki_list_history" ||
      name === "wiki_list_attachments" ||
      name === "wiki_create_or_update_page"
    ) {
      const wikiArgs = (args || {}) as Record<string, unknown>;
      const project_id = wikiArgs.project_id as string | number;

      if (!project_id) {
        return {
          content: [
            {
              type: "text",
              text: "project_id is required for wiki tools",
            },
          ],
          isError: true,
        };
      }

      switch (name) {
        case "wiki_list_pages":
          return await handleListWikiPages({ project_id });
        case "wiki_get_page": {
          const title = wikiArgs.title as string;
          const version = wikiArgs.version as number | undefined;
          if (!title) {
            return {
              content: [
                {
                  type: "text",
                  text: "title is required for wiki_get_page",
                },
              ],
              isError: true,
            };
          }
          return await handleGetWikiPage({ project_id, title, version });
        }
        case "wiki_list_history": {
          const title = wikiArgs.title as string;
          if (!title) {
            return {
              content: [
                {
                  type: "text",
                  text: "title is required for wiki_list_history",
                },
              ],
              isError: true,
            };
          }
          return await handleListWikiHistory({ project_id, title });
        }
        case "wiki_list_attachments": {
          const title = wikiArgs.title as string;
          const version = wikiArgs.version as number | undefined;
          if (!title) {
            return {
              content: [
                {
                  type: "text",
                  text: "title is required for wiki_list_attachments",
                },
              ],
              isError: true,
            };
          }
          return await handleListWikiAttachments({ project_id, title, version });
        }
        case "wiki_create_or_update_page": {
          const title = wikiArgs.title as string;
          const text = wikiArgs.text as string;
          const comments = wikiArgs.comments as string | undefined;
          const parent_title = wikiArgs.parent_title as string | undefined;

          if (!title || !text) {
            return {
              content: [
                {
                  type: "text",
                  text: "title and text are required for wiki_create_or_update_page",
                },
              ],
              isError: true,
            };
          }

          return await handleCreateOrUpdateWikiPage({
            project_id,
            title,
            text,
            comments,
            parent_title,
          });
        }
      }
    }

    // Unknown tool
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    // Log error details
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

    // Return simple error message to user
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

// Start server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Exports
export { server, runServer };
