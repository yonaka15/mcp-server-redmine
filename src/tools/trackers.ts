import { Tool } from "@modelcontextprotocol/sdk/types.js";

// List trackers tool
export const TRACKER_LIST_TOOL: Tool = {
  name: "list_trackers",
  description:
    "Get list of all trackers. " +
    "Returns tracker ID, name, default status, and enabled fields. " +
    "Description available since 4.2.0, enabled_standard_fields since 5.0.0. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {},
  },
};
