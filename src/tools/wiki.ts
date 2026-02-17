import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const WIKI_LIST_PAGES_TOOL: Tool = {
  name: "wiki_list_pages",
  description: "List wiki pages for a given Redmine project.",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        anyOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "Project ID or identifier",
      },
    },
    required: ["project_id"],
  },
};

export const WIKI_GET_PAGE_TOOL: Tool = {
  name: "wiki_get_page",
  description: "Get a single wiki page (latest or specific version) for a project.",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        anyOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "Project ID or identifier",
      },
      title: {
        type: "string",
        minLength: 1,
        description: "Wiki page title",
      },
      version: {
        type: "integer",
        description:
          "Optional version number. If omitted, latest version is returned.",
      },
    },
    required: ["project_id", "title"],
  },
};

export const WIKI_LIST_HISTORY_TOOL: Tool = {
  name: "wiki_list_history",
  description: "List history (versions) of a wiki page.",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        anyOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "Project ID or identifier",
      },
      title: {
        type: "string",
        minLength: 1,
        description: "Wiki page title",
      },
    },
    required: ["project_id", "title"],
  },
};

export const WIKI_LIST_ATTACHMENTS_TOOL: Tool = {
  name: "wiki_list_attachments",
  description:
    "List attachments of a wiki page (optionally for a specific version).",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        anyOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "Project ID or identifier",
      },
      title: {
        type: "string",
        minLength: 1,
        description: "Wiki page title",
      },
      version: {
        type: "integer",
        description:
          "Optional version number. If omitted, latest version is used.",
      },
    },
    required: ["project_id", "title"],
  },
};

export const WIKI_CREATE_OR_UPDATE_PAGE_TOOL: Tool = {
  name: "wiki_create_or_update_page",
  description:
    "Create a new wiki page or update an existing one. " +
    "Redmine treats this as an upsert operation.",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        anyOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "Project ID or identifier",
      },
      title: {
        type: "string",
        minLength: 1,
        description: "Wiki page title",
      },
      text: {
        type: "string",
        minLength: 1,
        description: "Wiki page content in Textile/Markdown (Redmine format)",
      },
      comments: {
        type: "string",
        description: "Optional edit comment shown in history.",
      },
      parent_title: {
        type: "string",
        description: "Optional parent wiki page title.",
      },
    },
    required: ["project_id", "title", "text"],
  },
};
