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
import { createUsersHandlers } from "./users.js";

// Create handler context
const context: HandlerContext = {
  client: redmineClient,
  config: config,
};

// Create resource handlers
const issuesHandlers = createIssuesHandlers(context);
const projectsHandlers = createProjectsHandlers(context);
const timeEntriesHandlers = createTimeEntriesHandlers(context);
const usersHandlers = createUsersHandlers(context);

// Create handler map
const handlers = {
  ...issuesHandlers,
  ...projectsHandlers,
  ...timeEntriesHandlers,
  ...usersHandlers,
};

// Available tools list
const TOOLS: Tool[] = [
  // Issue-related tools
  tools.ISSUE_LIST_TOOL,
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

  // Time entry tools
  tools.TIME_ENTRY_LIST_TOOL,
  tools.TIME_ENTRY_SHOW_TOOL,
  tools.TIME_ENTRY_CREATE_TOOL,
  tools.TIME_ENTRY_UPDATE_TOOL,
  tools.TIME_ENTRY_DELETE_TOOL,

  // User-related tools
  tools.USER_LIST_TOOL,
  tools.USER_SHOW_TOOL,
  tools.USER_CREATE_TOOL,
  tools.USER_UPDATE_TOOL,
  tools.USER_DELETE_TOOL,
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
  tools: TOOLS,
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args || typeof args !== "object") {
      throw new Error("No arguments provided");
    }

    // Execute handler
    if (name in handlers) {
      return await handlers[name as keyof typeof handlers](args);
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
