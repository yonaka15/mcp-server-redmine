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
import { createIssueStatusesHandlers } from "./issue_statuses.js";
import { createTrackersHandlers } from "./trackers.js";
import { createEnumerationsHandlers } from "./enumerations.js";
import { createVersionsHandlers } from "./versions.js";
import { createMembershipsHandlers } from "./memberships.js";
import { createRolesHandlers } from "./roles.js";
import { createIssueCategoriesHandlers } from "./issue_categories.js";
import { createAttachmentsHandlers } from "./attachments.js";
import { formatAllowedStatuses } from "../formatters/projects.js";

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
const projectsHandlers = createProjectsHandlers(context, formatAllowedStatuses);
const timeEntriesHandlers = createTimeEntriesHandlers(context);
const usersHandlers = createUserHandlers(context);
const issueStatusesHandlers = createIssueStatusesHandlers(context);
const trackersHandlers = createTrackersHandlers(context);
const enumerationsHandlers = createEnumerationsHandlers(context);
const versionsHandlers = createVersionsHandlers(context);
const membershipsHandlers = createMembershipsHandlers(context);
const rolesHandlers = createRolesHandlers(context);
const issueCategoriesHandlers = createIssueCategoriesHandlers(context);
const attachmentsHandlers = createAttachmentsHandlers(context);

// Create handler map
const handlers = {
  ...issuesHandlers,
  ...projectsHandlers,
  ...timeEntriesHandlers,
  ...usersHandlers,
  ...issueStatusesHandlers,
  ...trackersHandlers,
  ...enumerationsHandlers,
  ...versionsHandlers,
  ...membershipsHandlers,
  ...rolesHandlers,
  ...issueCategoriesHandlers,
  ...attachmentsHandlers,
};

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
  // Dynamically build the list of tools from the tools module at runtime
  // This ensures that any tool added to tools/index.ts is automatically included.
  tools: Object.values(tools).filter(t => typeof t === 'object' && t !== null && 'name' in t && 'description' in t && 'inputSchema' in t) as Tool[],
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
